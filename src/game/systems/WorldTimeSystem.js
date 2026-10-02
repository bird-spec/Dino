import { EVENTS } from '../core/events.js';
import  { ValidationError} from "../core/errors.js";
import { assertPositiveInteger} from "../core/utils.js";

export class WorldTimeSystem{
    constructor ({
        state,
        eventBus,
        secondsPerDay = 600
                 }) {
        this.state = state;
        this.eventBus = eventBus;

        if (
            !Number.isFinite(secondsPerDay) ||
            secondsPerDay <= 0
        ) {
            throw new ValidationError(
                'secondsPerDay must be positive'
            );
        }

        this.secondsPerDay = secondsPerDay;
    }

    get() {
        return this.state.read(
            (state) => ({
                ...state.worldTime
            })
        );
    }

    advance(
        seconds,
        {
            reason = 'gameplay'
        } = {}
    ) {
        assertPositiveInteger(
            seconds, 'seconds'
        );

        const before =
            this.get();

        this.state.mutate(
            'time.advance',
            (state) => {
                state.worldTime.elapsedSeconds += seconds;

                state.worldTime.day =
                    1 + Math.floor (
                        state.worldTime.elapsedSeconds / this.secondsPerDay
                    );
            },
            {
                eventType:
                EVENTS.TIME_ADVANCED,

                payload: {
                    seconds, before, reason

                }
            }
        );
        return this.get();
    }

    setElapsedSeconds(seconds, {
        reason = 'system'
    } = {}
    ) {
        if (
            !Number.isInteger(seconds) || seconds <0
        ) {
            throw new ValidationError(
                'elapsed seconds must be a non-negative integer.'
            );
        }

        this.state.mutate(
            'time.set',
            (state) => {
                state.worldTime.elapsedSeconds = seconds;

                state.worldTime.day =
                    1 + Math.floor ( seconds / this.secondsPerDay);
            },
            { eventType:
                EVENTS.TIME_ADVANCED,
                payload: {
                seconds,
                reason,
                absolute: true
            }
            }
        );
        return this.get();
    }

}