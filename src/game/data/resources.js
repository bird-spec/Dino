import { deepFreeze} from "../core/utils.js";

export const RESOURCE_TYPES = deepFreeze({
    stone_rock: {
        id: 'stone_rock',
        name: 'Stone Rock',
        yieldItemId: 'stone',
        defaultYieldPerHarvest: 2
    },
    water_source: {
        id: 'water_source',
        name: 'Fresh Water Source',
        yieldItemId: 'fresh_water',
        defaultYieldPerHarvest: 1
    },
    fern_patch: {
        id: 'fern_patch',
        name: 'Fern Patch',
        yieldItemId: 'fern_patch',
        defaultYieldPerHarvest: 2
    },
    obsidian_vein: {
        id: 'obsidian_vein',
        name: 'Obsidian Vein',
        yieldItemId: 'obsidian_shard',
        defaultYieldPerHarvest: 1
    },
    resin_tree: {
        id: 'resin_tree',
        name: 'Resin Tree',
        yieldItemId: 'resin',
        defaultYieldPerHarvest: 1
    }
})