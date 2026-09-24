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
            state => ({...state.quests.active})
        );
    }
}