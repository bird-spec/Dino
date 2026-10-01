import { EVENTS } from '../core/events.js';
import { deepFreeze } from "../core/utils.js";

export const QUESTS = deepFreeze({
    gather_stone: {
        id: 'gather_stone',
        title: 'Basic Tools',
        description: 'Collect stone and craft some basic survival tools',

        objectives: [
            {
            id: 'stone_count',
            title: 'Collect 3 pieces of Stone',
            target: 3,
            trigger: EVENTS.ITEM_ADDED,
            match: {
                itemId: 'stone'
            }
        }],
        rewards: {
            items: {
                fern_fiber: 2
            },
            xp: 25
        }
    },
    gather_fiber: {
        id: 'gather_fiber',
        title:'New World',
        description: 'Gather durable plant fiber from the prehistoric fiber.',

        prerequisites: {
            quests: ['gather_stone']
        },
        objectives: [
            {
                id: 'fiber_count',
                title: 'Collect 7 fern fiber',
                target: 7,
                trigger: EVENTS.ITEM_ADDED,
                match: {
                    itemId: 'fern_fiber'
                }
            }],
        rewards: {
            items: {
                obsidian_shard:1
            },
            xp: 40
        }
    },
    inspect_ancient_site: {
        id: 'inspect_ancient_site',
        title: 'What is that?',
        description: 'Inspect the ancient site for treasures',

        prerequisites: {
            quests: ['gather_stone']
        },
        objectives: [
            {
                id:'site_inspection',
                title: 'Inspect the strange device',
                target: 1,
                trigger: EVENTS.INTERACTION_USED,
                match: {
                    interactionId: 'ancient_device'
                }
            }],
        rewards: {
            xp: 60,

            storyFlags: {
                ancient_device_inspected: true

            }
        }
    }
});

