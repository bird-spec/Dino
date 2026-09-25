import {EVENTS } from  '../core/events.js';
import {
    InteractionError,
    NotFoundError,
    ValidationError
} from "../core/errors.js";
import {
    assertPositiveInteger,
    assertNonEmptyString,
    deepClone
} from "../core/utils.js";

export class Interaction {
    constructor({
        state,
        eventBus,
        inventory,
        clock = () => Date.now()
                }) {
        this.state = state;
        this.eventBus = eventBus;
        this.inventory = inventory;
        this.clock = clock;
        this.definitions = new Map();
    }

    register(definition) {
        this._validateDefinition(
            definition,
        );

        if (
            this.definitions.has(
                definition.id
            )
        ) {
            throw new InteractionError(
                `Interaction already registered: ${definition.id}`,
            );
        }
        this.definitions.set(
            definition.id,
            deepClone({
                ...definition,
                condition: undefined,
                handler: undefined
            })
        );

        this.handlers =
            this.handlers ?? new Map();
        this.conditions =
            this.conditions ?? new Map();
        this.handlers.set(
            definition.id,
            definition.handler,
        );
        this.conditions.set(
            definition.id,
            definition.condition,
        );

        if (
            !this.state.read (
                (state) =>
                    Boolean(
                        state.interactions[
                            definition.id
                            ]
                    )
            )
        ){
            this.state.mutate(
                'interaction.register',

                (state) => {
                    state.interactions[
                        definition.id
                        ] = {
                        id: definition.id,
                        uses: 0,
                        lastUsedAt: null
                    };
                },

                {
                    eventType:
                    EVENTS.INTERACTION_REGISTERED,

                    payload: {
                        interactionId:
                        definition.id
                    }
                }
            );
        }
    }

    unregister(interactionId){
        const existed =
            this.definitions.delete(
                interactionId
            );
        this.handlers?.delete(
            interactionId
        );

        this.conditions?.delete(
            interactionId
        );

        return existed;
    }

    get(interactionId){
        if (
            !this.definitions.has(
                interactionId
            )
        ) {
            throw new NotFoundError(
                `Unknown interaction: ${interactionId}`,
            );
        }

        const definition =
            this.definitions.get(
                interactionId
            );
        return {
            ...deepClone(definition),
            handler: undefined,
            condition: undefined,
        };
    }

    canInteract(
        interactionId,
        context = {}
    ) {
        const definition =
            this.get(interactionId);

        const runtime =
            this.state.read(
                (state) =>
                    state.interactions[
                        interactionId
                        ]
            );
        if (!runtime) {
            return {
                ok: false,
                reason:
                'interaction_not_initialized'
            };
        }
        if (
            definition.oneTime &&
            runtime.uses > 0
        ) {
            return {
                ok: false,
                reason: 'already_used'
            };
        }
        const cooldownMs =
            definition.cooldownMs ?? 0;
        if (
            runtime.lastUsedAt &&
            this.clock() -
            runtime.lastUsedAt <
            cooldownMs
        ) {
            return {
                ok: false,
                reason: 'cooldown'
            }
        }

        const requirements =
            definition.requires ?? {};

        for (
            const [itemId, quantity]
            of Object.entries(
                requirements.items ?? {}
        )
        ) {
            if (
                !this.inventory.has(
                    itemId,
                    quantity
                )
            ) {
                return {
                    ok: false,
                    reason: 'missing_item',
                    itemId,
                    quantity
                };
            }
        }

        const flags =
            this.state.read(
                (state) =>
                    state.storyFlags
            );
        for (
            const [key, expected]
            of Object.entries(
                requirements.flags ?? {}
        )
        ) {
            if (
                flags[key] !== expected
            ) {
                return {
                    ok: false,
                    reason: 'missing_story_flag',
                    key,
                    expected
                };
            }
        }

        const requiredQuests =
            requirements.completedQuests
        ?? [];

        const completedQuests =
            this.state.read(
                (state) =>
                    state.quests.completed
            );

        for (
            const questId
            of requiredQuests
        ) {
            if (
                !completedQuests.includes(
                    questId
                )
            ) {
                return {
                    ok: false,
                    reason: 'missing_quest',
                    questId
                };
            }
        }

        const customCondition =
            this.conditions?.get(
                interactionId
            );

        if (
            customCondition &&
            !customCondition({
                state:
                this.state.getSnapshot(),
                inventory:
                this.inventory,
                context
            })
        ) {
            return {
                ok: false,
                reason: 'custom_condition'
            };
        }

        return {
            ok: true
        };
    }

    _validateDefinition(definition) {
        if (
            !definition ||
            typeof definition !== 'object'
        ) {
            throw new ValidationError(
                'Interaction definition must be an object',
            );
        }
        assertNonEmptyString(
            definition.id,
            'interaction id'
        );
        assertNonEmptyString(
            definition.type,
            'interaction type'
        );
        if (
            definition.handler !==
            undefined &&
            typeof definition.handler !==
            'function'
        ) {
            throw new ValidationError(
                'interaction handler must be a function',
            );
        }

        if (
            definition.condition !== undefined &&
            typeof definition.condition !== 'function'
        ) {
            throw new ValidationError(
                'interaction condition must be a function',
            );
        }

        if (
            definition.cooldownMs !==
            undefined &&
            (
                !Number.isInteger(
                    definition.cooldownMs
                ) ||
                definition.cooldownMs < 0
            )
        ) {
            throw new ValidationError(
                'cooldownMs must be a non-negative integer.',
            );
        }

        if (
            definition.oneTime !==
            undefined &&
            typeof definition.oneTime !==
            'boolean'
        ) {
            throw new ValidationError(
                'oneTime must be a boolean.'
            ) ;
        }

        for (
            const [itemId, quantity]
            of Object.entries(
            definition.requires?.items
            ?? {} )
        ){
            assertPositiveInteger(
                quantity,
                `required quantity for  ${itemId}`
            );
        }
    }
        interact(
            interactionId,
            context = {}
        )
        {
            const definition =
                this.get(interactionId);

            const check =
                this.canInteract(
                    interactionId,
                    context
                );

            if(!check.ok) {
                throw new InteractionError(
                    `Interaction ${interactionId} cannot be used.`,
                    check
                );
            }

            const handler =
                this.handlers?.get(
                    interactionId
                );

            if (handler) {
                handler ({
                    state:
                    this.state.getSnapshot(),
                    inventory:
                    this.inventory,
                    context
                });
            }
            const usedAt =
                this.clock()

            this.state.mutate(
                'interaction.use',
                (state) =>{
                    state.interactions[
                        interactionId
                        ].uses +=1;
                    state.interactions[
                        interactionId
                        ].lastUsedAt = usedAt;
                },

                {
                    eventType:
                    EVENTS.INTERACTION_USED,
                    payload:{
                        interactionId,
                        type:
                        definition.type,
                        context
                    }
                }
            );

            return this.state.read(
                (state) =>
                    state.interactions[
                        interactionId
                        ]
            );
        }
}