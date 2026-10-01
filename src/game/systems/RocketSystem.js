import { EVENTS } from '../core/events.js';

import {
    NotFoundError,
    ValidationError,
} from "../core/errors.js";

import { deepClone}  from "../core/utils.js";

export class RocketSystem {
    constructor({
        state,
        eventBus,
        inventory,
        parts,
        storyFlags,
        eraSystem,
        hyperspace
                }) {
        this.state = state;
        this.eventBus = eventBus;
        this.inventory = inventory;
        this.parts = parts;
        this.storyFlags = storyFlags;
        this.eraSystem = eraSystem;
        this.hyperspace = hyperspace;
    }

    getParts() {
        return deepClone(
            this.parts
        );
    }

    getProgress() {
        const installed =
            this.state.read(
                (state) =>({
                    ...state.progression.rocket.parts
                })
            );

        const total =
            Object.keys(
                this.parts
            ).length;

        const installedCount =
            Object.values(
                installed
            ).filter(Boolean).length;
        return {
            installed,
            installedCount,
            total,
            percentage:
            total === 0
            ?0
                :Math.round(
                    (installedCount/total) * 100)
        };
    }

    hasAllParts() {const progress = this.getProgress();

    return (
        progress.installedCount ===
            progress.total
    );
    }

    canLaunch() {
        return (
            this.hasAllParts() &&
                this.inventory.has (
                    'rocket_fuel_cell',
                    1
                )
        );
    }

    installPart(partId) {
        const part = this.parts[partId];

        if (!part) {
            throw new NotFoundError(
                `Unknown rocket part: ${partId}`,
            );
        }

        const installed =
            this.state.read(
                (state) =>
                    Boolean(
                        state.progression.rocket.parts[partId]
                    )
            );

        if (installed) {
            throw new ValidationError(
                `Rocket part has already installed: ${partId}`,
            );
        }
        if (
            !this.inventory.has(
                part.itemId,
                1
            )
        ) {
            throw new ValidationError(
                `Missing rocket component: ${part.itemId}.`
            );
        }

        this.inventory.remove(
            part.itemId,
            1,
            {
                source:
                    'rocket_installation',
            }
        );

        this.state.mutate(
            'rocket.installPart',
            (state) => {
                state.progression.rocket.parts[partId] = true;
            },

            {
                eventType:
                EVENTS.ROCKET_PART_INSTALLED,

                payload: {
                    partId,
                    itemId: part.itemId
                }
            }
        );

        if (
            this.hasAllParts()
        ) {
            this.storyFlags.set('rocket_complete', true,

                {
                    source:
                    'rocket'
                }
                );
        }
        return this.getParts();
    }

    launch({
        destination =
        'hyperspace_gate'
           }={}) {
        if (
            !this.canLaunch()
        ) {
            throw new ValidationError(
                `Rocket cannot launch: all parts and one fuel cell are required.`
            );
        }

        this.inventory.remove(
            'rocket_fuel_cell',
            1,
            {
                source:
                'rocket_launch'
            }
        );

        this.state.mutate(
            'rocket.launch',

            (state) => {
                state.progression.rocket.launchCount += 1;
            },

            {
                eventType:
                EVENTS.ROCKET_LAUNCHED,

                payload: {
                    destination
                }
            }
        );

        this.storyFlags.set('rocket_launched', true,
            {
                source:'rocket'
            });
        this.eraSystem.unlock(
            'hyperspace',
            {
                reason:
                'rocket_launch'
            }
        );

        return this.hyperspace.enter(
            {
                destination,
                source:
                'rocket_launch'
            }
        );
    }
}