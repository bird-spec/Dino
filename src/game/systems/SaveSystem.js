import { EVENTS } from '../core/events.js';
import { SaveError } from '../core/errors.js';
import {
    deepClone,
    nowIso
} from "../core/utils.js";
import {
    STATE_SCHEMA_VERSION
} from "../core/GameState.js";

export class MemoryStorageAdapter {
    constructor() {
        this.store = new Map();
    }
    getItem(key) {
        return this.store.get(key) ?? null;
    }
    setItem(key, value) {
        this.store.set(
            key,
            String(value)
        );
    }

    removeItem(key) {
        this.store.delete(key);
    }

    has(key) {
        return this.store.has(key);
    }
}

export class LocalStorageAdapter {
    constructor(prefix = 'dino4d') {
        this.prefix = prefix;

        if (
            typeof localStorage ===
            'undefined'
        ) {
            throw new SaveError(
                'localStorage is not available in this environment.'
            );
        }
    }

    _key(slot) {
        return `${this.prefix}:save:${slot}`;
    }

    getItem(key) {
        return localStorage.getItem(
            key
        );
    }
    setItem(key, value) {
        localStorage.setItem(
            key,
            String(value)
        );
    }
    removeItem(key) {
        localStorage.removeItem(
            key
        );
    }

    has(key) {
        return (
            localStorage.getItem(
                key
            ) !== null
        );
    }
}

export class SaveSystem {
    constructor({
                    state,
                    eventBus,
                    storage,
                    prefix = 'dino4d',
                }) {
        this.eventBus = eventBus;
        this.storage = storage;
        this.prefix = prefix;
        this.state = state;
    }

    save(slot = 'default') {
        this._validateSlot(slot);

        const envelope = {
            schemaVersion:
            STATE_SCHEMA_VERSION,
            savedAt: nowIso(),

            state:
                this.state.getSnapshot()
        };
        try {
            this.storage.setItem(
                this._key(slot),
                JSON.stringify(envelope)
            );
    }

    catch(error) {
                 throw new SaveError(
            `Failed to save slot ${slot},`,
            {
                cause: error
            }
        );
    }
  this.eventBus.emit(
      EVENTS.SAVE_COMPLETED,
      {
        slot,
        savedAt:
          envelope.savedAt
      }
    );

    return deepClone(
      envelope
    );
  }

  load(slot = 'default') {
    this._validateSlot(slot);

    let raw;

    try {
      raw =
        this.storage.getItem(
          this._key(slot)
        );
    } catch (error) {
      throw new SaveError(
        `Failed to read save slot ${slot}.`,
        {
          cause: error
        }
      );
    }

    if (!raw) {
      throw new SaveError(
        `Save slot ${slot} does not exist.`
      );
    }

    let envelope;

    try {
      envelope =
        JSON.parse(raw);
    } catch (error) {
      throw new SaveError(
        `Save slot ${slot} contains invalid JSON.`,
        {
          cause: error
        }
      );
    }

    const migrated =
      this._migrate(envelope);

    this.state.replace(
      migrated.state
    );

    this.eventBus.emit(
      EVENTS.LOAD_COMPLETED,
      {
        slot,
        savedAt:
          migrated.savedAt
      }
    );

    return this.state.getSnapshot();
  }

  has(slot = 'default') {
    this._validateSlot(slot);

    return this.storage.has(
      this._key(slot)
    );
  }

  delete(slot = 'default') {
      this._validateSlot(slot);
      try {
          this.storage.removeItem(
              this._key(slot)
          );
      } catch (error) {
          throw new SaveError(
              `Failed to delete save slot ${slot}.`,
              {
                  cause: error
              }
          );
      }
  }

  _migrate(envelope) {
    if (
      !envelope ||
      typeof envelope !==
        'object'
    ) {
      throw new SaveError(
        'Save data must be an object.'
      );
    }

    if (
      envelope.schemaVersion !==
      STATE_SCHEMA_VERSION
    ) {
      throw new SaveError(
        `Unsupported save version: ${envelope.schemaVersion}.`
      );
    }

    if (
      !envelope.state ||
      typeof envelope.state !==
        'object'
    ) {
      throw new SaveError(
        'Save data is missing state.'
      );
    }

    return envelope;
  }

  _key(slot) {
    return `${this.prefix}:save:${slot}`;
  }

  _validateSlot(slot) {
    if (
      typeof slot !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,40}$/.test(
        slot
      )
    ) {
      throw new SaveError(
        'Save slot must contain only letters, numbers, underscores, and hyphens.'
      );
    }
  }
}


