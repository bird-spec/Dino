import { EVENTS } from '../core/events.js';
import { ValidationError} from "../core/errors.js";
import {assertNonEmptyString} from "../core/utils.js";

const VALID_PHASES = new Set([
    'idle',
    'charging',
    'arrival',
    'complete',
    ]);
export class HyperspaceSystem {
    constructor({
        state,
        eventBus,
        eraSystem
                }) {
        this.state = state;
        this.eventBus = eventBus;
        this.eraSystem = eraSystem;
        this.hooks = new Map();
    }

    registerHook(name, callback) {
        assertNonEmptyString(name, 'hook name');

        if (
            typeof callback !== 'function'
        ) {
            throw new TypeError(
                'callback must be a function.'
            );
        }
        if (!this.hooks.has(name)) {
            this.hooks.set(name, new Set());
        }

        this.hooks.get(name).add(callback);

        return () => {
            this.hooks.get(name)?.delete(callback);
        };


    }

    getState() {
        return this.state.read(
            (state) => ({
                ...state.hyperspace
            })
        );
    }

    enter ({
        destination = 'unknown',
        source = 'gameplay'
           } = {}
           ) {
        assertNonEmptyString(destination, 'destination');

        if (
            this.getState().active
        ) {
            throw new ValidationError(
                'Already in hyperspace.'
            );
        }

        this.eraSystem.unlock('hyperspace',

            {
                reason:
                'hyperspace_enter'
            }
            );

        this.state.mutate(
            'hyperspace.enter',

            (state) => {
                state.hyperspace.active =
                    true;

                state.hyperspace.phase =
                    'charging';

                state.hyperspace.destination = destination;

                state.hyperspace.transitCount +=
                    1;
            },

            {
                eventType:
                EVENTS.HYPERSPACE_ENTERED,

                payload:{
                    destination,
                    source
                }
            }
        );

        this._runHooks(
            'onEnter',
            {
                destination,
                source
            }
        );

        return this.getState();
    }

    setPhase(phase) {
        assertNonEmptyString(phase, 'phase');

        if (
            !VALID_PHASES.has(phase)
        ) {
            throw new ValidationError(
                `Invalid hyperspace phase: ${phase}.`
            );
        }

        const previous =
            this.getState().phase;

        this.state.mutate(
            'hyperspace.phase',
            (state) => {
                state.hyperspace.phase = phase;
            },

            {
                eventType:
                EVENTS.HYPERSPACE_PHASE_CHANGED,
                payload:{
                    previous,
                    phase
                }
            }
        );

        this._runHooks(
            'onPhaseChange',
            {
                previous,
                phase
            }
        );
        return this.getState();
    }

    exit({
        success = true,
        source = 'gameplay'
         } = {}
         ) {
        if (
            !this.getState().active
        ){
            return this.getState();
        }

        const previous =
            this.getState();

        this.state.mutate(
            'hyperspace.exit',

            (state) => {
                state.hyperspace.active = false;

                state.hyperspace.phase =
                    success
                        ?'complete'
                        : 'idle';
            },
            {
                eventType:
                     EVENTS.HYPERSPACE_EXITED,
                payload:{
                    success,
                    source,
                    previous
                }
            }
        );

        this._runHooks(
            'onExit',
            {
                success,
                source,
                previous
            }
        );
        return this.getState();
    }
    _runHooks(
        name,
        payload
    ) {
        for (
            const callback
            of this.hooks.get(name) ??
                    []
        ) {
            try{
                callback(payload);
            } catch (error) {
                this.eventBus.emit(
                    EVENTS.ERROR,
                    {
                        source:
                        `hyperspace: ${name}`,
                        error
                    }
                );
            }
        }
    }
}