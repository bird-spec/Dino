import { EVENTS } from "../core/events.js";

import { NotFoundError, ValidationError } from "../core/errors.js";
import { deepClone } from "../core/utils.js";

export class EraSystem {
  constructor({ state, eventBus, eraCatalog, storyFlags }) {
    this.eventBus = eventBus;
    this.state = state;
    this.eraCatalog = eraCatalog;
    this.storyFlags = storyFlags;
  }

  getCurrent() {
    const current = this.state.read((state) => state.era.current);
    return deepClone(this.eraCatalog[current]);
  }

  getCurrentId() {
    return this.state.read((state) => state.era.current);
  }

  isUnlocked(eraId) {
    return this.state.read((state) => state.era.unlocked.includes(eraId));
  }

  listUnlocked() {
    return this.state.read((state) => [...state.era.unlocked]);
  }

  unlock(eraId, { requiredFlags = {}, reason = "gameplay" } = {}) {
    this.getEra(eraId);

    for (const [key, expected] of Object.entries(requiredFlags)) {
      if (this.storyFlags.get(key) !== expected) {
        throw new ValidationError(
          `Cannot unlock ${eraId}: flag ${key} must equal ${expected}`,
        );
      }
    }

    if (!this.isUnlocked(eraId)) {
      this.state.mutate(
        "era.unlock",

        (state) => {
          state.era.unlocked.push(eraId);
        },

        {
          eventType: EVENTS.ERA_UNLOCKED,

          payload: {
            eraId,
            reason,
          },
        },
      );
    }

    return this.isUnlocked(eraId);
  }
  setCurrent(eraId, { reason = "gameplay" } = {}) {
    this.getEra(eraId);

    if (!this.isUnlocked(eraId)) {
      throw new ValidationError(`Era ${eraId}: is not unlocked.`);
    }

    const previous = this.getCurrentId();

    if (previous === eraId) {
      return this.getCurrent();
    }
    this.state.mutate(
      "era.change",

      (state) => {
        state.era.current = eraId;
      },

      {
        eventType: EVENTS.ERA_CHANGED,

        payload: {
          previous,
          eraId,
          reason,
        },
      },
    );

    return this.getCurrent();
  }

  getEra(eraId) {
    const definition = this.eraCatalog[eraId];

    if (!definition) {
      throw new NotFoundError(`Unknown Era: ${eraId}.`);
    }
    return definition;
  }
}
