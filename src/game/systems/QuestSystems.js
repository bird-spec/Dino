import { EVENTS } from "../core/events.js";
import {
    NotFoundError,
    QuestError
} from "../core/errors.js";
import {deepClone} from "../core/utils.js";

export class QuestSystems {
    constructor({
        state,
        eventBus,
        inventory,
        questCatalog
                }) {
        this.state = state;
        this.eventBus = eventBus;
        this.inventory = inventory;
        this.questCatalog = questCatalog;

        for(const eventName of Object.values(EVENTS)) {
            if (eventName.startsWith('quest')) {
                continue;
            }

            eventBus.on(
                eventName,
                (payload) =>
                    this._handleGameplayEvent(
                        eventName,
                        payload
                    )
            );
        }

    }
    getDefinition(questId) {
        const definition = this.questCatalog[questId];
        if (!definition) {
            throw new NotFoundError(
                `unlike quests: ${questId}.`
            );
        }
        return definition;
    }

    getActive() {
        return this.state.read(
            (state) => ({...state.quests.active})
        );
    }

    getCompleted() {
        return this.state.read(
            (state) => [...state.quests.completed]
        );
    }

    isCompleted(questId) {
        return this.getCompleted()
            .includes(questId);
    }

    isActive(questId) {
        return Boolean(
            this.state.read(
                (state) => state.quests.active [questId]
            )
        );
    }


    start (questId) {
        const definition =
            this.getDefinition(questId);

        if (this.isCompleted(questId)) {
            throw new QuestError(
                `Quest ${questId} had already been completed`
            );
        }

        if (this.isActive(questId)) {
            return this.getState(questId);
        }

        this._checkPrerequisites(definition);

        const objectives = {};

        for(const objective of definition.objectives) {
            objectives[objective.id] = 0;
        }

        this.state.mutate(
            'quest.start',
            (state) => {
                state.quests.active[questId] = {
                    id: questId,
                    startedAt: new Date().toISOString(),
                    objectives
                };
            },

            {
                eventType:
                EVENTS.QUEST_STARTED,

                payload: {
                    questId
                }
            }
        );

        return this.getState(questId);
    }

    getState(questId) {
        const active =
            this.state.read(
                (state) =>
                    state.quests.active[questId]
            );
        if (!active) {
            if (this.isCompleted(questId)) {
                return {
                    id: questId,
                    status: 'completed'
                };
            }

            throw new NotFoundError(
                `quest is not active: ${questId}.`
            );
        }

        return active;
    }

    updateObjective(
        questId,
        objectiveId,
        amount = 1
    ) {
        const definition =
            this.getDefinition(questId);

        const objective =
            definition.objectives.find(
                (candidate) =>
                    candidate.id === objectiveId
            );
        if (!objective) {
            throw new NotFoundError(
                `Unknown objective ${objectiveId} in quest ${questId}.`
            );
        }


        const active =
            this.getState(questId);

        const previous =
            active.objectives[objectiveId] ?? 0;

        const next =
            Math.min(
                objective.target,
                previous + amount
            );
        this.state.mutate(
            'quest.updateObjective',

            (state) => {
                state.quests.active[questId]
                    .objectives[objectiveId] = next;
            },

            {
                eventType:
                EVENTS.QUEST_PROGRESS,
                payload: {
                    questId,
                    objectiveId,
                    previous,
                    progress : next,
                    target: objective.target
                }
            }
        );

        if (this._isComplete(questId)) {
            this.complete(questId);
        }

        return this.isCompleted(questId)
        ? {
            status: 'completed'
            }
        : this.getState(questId);
    }

    complete(questId) {
        const definition =
            this.getDefinition(questId);

        const active =
            this.getState(questId);

        if(!this._isComplete(questId)) {
            throw new QuestError(
                `Quest ${questId} is not complete.`
            );
        }

        this._grantRewards(
            definition.rewards ?? {}
        );

        this.state.mutate(
            'quest.complete',
            (state) => {
                delete state.quests.active[questId];

                state.quests.completed.push(
                    questId
                );
            },

            {
                eventType:
                EVENTS.QUEST_COMPLETED,
                payload: {
                    questId,
                    active
                }
            }
        );

        return {
            id: questId,
            status: 'completed',
            rewards: deepClone(
                definition.rewards ?? {}
            )
        };
    }

    fail (
        questId,
        reason = 'Quest failed'
    ) {
        const active =
            this.getState(questId);

        this.state.mutate(
            'quest.fail',

            (state) => {
                delete state.quests.active[questId];

                state.quests.failed.push(
                    questId
                );
            },
            {
                eventType:
                EVENTS.QUEST_FAILED,
                payload: {
                    questId,
                    reason,
                    active
                }
            }
        );


        return {
            id: questId,
            status: 'failed',
            reason
        };
    }

    _handleGameplayEvent(
        eventName,
        payload
    ) {
        const activeQuests =
            this.state.read(
                (state) =>
                    Object.keys(state.quests.active)
            );

        for (const questId of activeQuests) {
            const definition =
                this.getDefinition(questId);

            for(const objective of definition.objectives) {
                const progress =
                    this.state.read(
                        (state) =>
                            state.quests.active[
                                questId
                                ]?.objectives[
                                    objective.id
                                ] ?? 0
                    );

                if (
                    progress >= objective.target ||
                    objective.trigger !== eventName
                ) {
                    continue;
                }

                if (
                    !this._matches(
                        objective.match ?? {},
                        payload
                    )
                ) {
                    continue;
                }

                const increment =
                    Number.isFinite(
                        payload?.quantity
                    )
                ? payload.quantity : 1;

                this.updateObjective(
                    questId,
                    objective.id,
                    Math.max(1, increment)
                );

                if(!this.isActive(questId)) {
                    break;
                }
            }
        }

    }

    _matches(match, payload) {
        return Object.entries(match)
            .every(
                ([key, expected]) =>
                    payload?.[key] === expected,
            );
    }

    _isComplete(questId) {
        const definition =
            this.getDefiniton(questId);

        const active =
            this.getState(questId);

        return definition.objectives
            .every(
                (objective) =>
                    (active.objectives[
                        objective.id
                            ] ?? 0) >= objective.target
            );
    }
    _checkPrerequisites(definition) {
        const requiredQuests =
            definition.prerequisites?.quests
        ?? [];

        for (const questId of requiredQuests) {
            if (!this.isCompleted(questId)) {
                throw new QuestError(
                    `Quest ${definition.id} requires completed quest ${questId}. `
                );
            }
        }

        const requiredFlags =
            definition.prerequisites?.flags
        ?? {} ;

        const flags = this.state.read(
            (state) => state.storyFlags
        );

        for (
            const [key,expected]
            of Object.entries(requiredFlags)
        ) {
            if (flags[key] !== expected) {
            throw new QuestError(
                `Quest ${definition.id} requires story flag ${key}=${expected}.`
            );
            }
        }
    }
    _grantRewards(rewards) {
        if (rewards.items) {
            const check =
                this.inventory.canAddBundle(
                    rewards.items
                );
            if (!check.ok) {
            throw new QuestError(
                'Not enough inventory for quest rewards,'
            );
        }
        for (
            const [itemId, quantity]
            of Object.entries(rewards.items)
        ) {
            this.inventory.add (
                itemId,
                quantity,
                {
                    source: 'quest_reward'
                }
            );
        }
    }
        if (
            Number.isFinite(rewards.xp) &&
            rewards.xp > 0
        ) {
        this.state.mutate(
            'quest.rewardXP',
            (state) => {
                state.player.xp +=
                    rewards.xp;
                state.player.level =
                    1 +
                    Math.floor(
                        state.player.xp / 100
                    );
            },
            {
                eventType:
                EVENTS.STATE_CHANGED,
                payload: {
                    source: 'quest_reward',
                    xp: rewards.xp
                }
            }
        );}
        if (rewards.storyFlags) {
            for (
                const [key, value]
                of Object.entries(
                    rewards.storyFlags
            )
            ) {
                this.state.mutate(
                    'quest.rewardFlag',
                    (state) => {
                        state.storyFlags[key] = value;
                    },

                    {
                        eventType:
                        EVENTS.STORY_FLAG_CHANGED,
                        payload: {
                            key,
                            value,
                            source: 'quest_reward',
                        }
                    }
                )
            }
        }
    }
}