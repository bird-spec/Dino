import { EVENTS } from './events.js'
import { ValidationError } from './errors.js';
import { deepClone} from "./utils.js";

export const STATE_SCHEMA_VERSION = 1

export function createDefaultState() {
    return {
        schemaVersion: STATE_SCHEMA_VERSION,

        player: {
            id: 'player',
            xp: 0,
            level: 1
        },
        inventory: {
            capacity: 20,
            items: {}
        },
        resources: {
            nodes: {}
        },
        quests: {
            active: {},
            completed: [],
            failed: []
        },
        interactions: {},

        storyFlags:{},

        era:{
            current: 'prehistory',
            unlocked: ['prehistory']
        },
        worldTime: {
            day: 1,
            elapsedSeconds: 0,
        },

        progression: {
            rocket: {
                parts: {},
                fuelCells: 0,
                launchCount: 0,
            }
        },

        dialogue: {
            active: null
        },
        hyperspace: {
            active: false,
            phase: 'idle',
            destination: null,
            transitCount: 0
        },
        world: {
            discoveredNpcs: {},
            custom: {}
        }
    };
}

function validateStateShape(state) {
    if (!state || typeof state !== 'object') {
        throw new ValidationError('Game state must be an object.');
    }
    if(state.schemaVersion !== STATE_SCHEMA_VERSION) {
        throw new ValidationError(`unsupported state schema version: ${state.schemaVersion}`);
    }const requiredObjects = [
    'player',
    'inventory',
    'resources',
    'quests',
    'interactions',
    'storyFlags',
    'era',
    'worldTime',
    'progression',
    'dialogue',
    'hyperspace',
    'world'
    ];
    for (const key of requiredObjects) {
        if(!state[key] || typeof state[key] !== 'object') {
            throw new ValidationError(`Missing or invalid state section: ${key}.`
            );
        }
    }
}
export class GameState {
    constructor({eventBus, initialState = undefined}) {
        this.eventBus = eventBus;
        this.data = createDefaultState();

        if(initialState) {
            this.replace (initialState, {emit: false});
        }
    }
    getSnapshot() {
        return deepClone(this.data);
    }
    read (selector = (state) => state) {
        const result = selector(this.data);
        return deepClone(result);
    }
    mutate(
        label,
        mutator,
        {
            eventType = EVENTS.STATE_CHANGED,
            payload = {}
        } = {}
    ) {
        if (typeof mutator !== 'function') {
            throw new TypeError('Mutator must be a function.');
        }
        const before = deepClone(this.data);
        mutator(this.data);
        validateStateShape(this.data);

        this.eventBus?.emit(eventType,{
            label,
            before,
            state: this.getSnapshot(),
            ...payload
        });
        return this.getSnapshot();
    }
    replace(nextState, {emit = true} = {}) {
        const snapshot = deepClone(nextState);

        validateStateShape(snapshot);
        this.data = snapshot;

        if (emit) {
            this.eventBus?.emit(EVENTS.STATE_CHANGED, {
                label: 'replace',
                state: this.getSnapshot()
            });
        }
        return this.getSnapshot()
    }
}