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
}