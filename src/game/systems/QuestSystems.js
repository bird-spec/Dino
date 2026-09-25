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
    getDefiniton(questId) {
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
            this.getDefiniton(questId);

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
            this.getDefiniton(questId);

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
    }
}