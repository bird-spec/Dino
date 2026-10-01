import { EVENTS} from "../core/events.js";
import {
    assertNonEmptyString
} from "../core/utils.js";

export class StoryFlagSystem {
    constructor({
        state,
        eventBus
                }) {
        this.state = state;
        this.eventBus = eventBus;
    }

    get(
        key,
        defaultValue = false
    ) {
        assertNonEmptyString(
            key, 'flag key'
        );

        return this.state.read(
            (state) => state.storyFlags[key] ?? defaultValue
        );
    }

    has(key) {
        return Boolean(
            this.get(
                key,false
            )
        );
    }
    st(
        key,
        value = true,
        {
            source = 'gameplay'
        } = {}
    ) {
        assertNonEmptyString(
            key,
            'flag key'
        );
        this.state.mutate(
            'story.setFlag',

            (state) => {
                state.storyFlags[key] = value;
            },

            {
                eevnetType:
                EVENTS.STORY_FLAG_CHANGED,

                payload: {
                    key,
                    value,
                    source,
                }
            }
        );

        return value;
    }

    clear(
        key,
        options = {}
    ) {
        return this.set(
            key,
            false,
            options
        );
    }

    toggles(
        key,
        options = {}
    ) {
        return this.set(
            key,
            !this.has(key),
            options
        );
    }

    all() {
        return this.state.read (
            (state) => ({
                ...state.storyFlags,
            })
        )
    }
}