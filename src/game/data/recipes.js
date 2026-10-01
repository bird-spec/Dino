import { deepFreeze} from "../core/utils.js";

export const RECIPES = deepFreeze({
    primitive_bundle: {
        id: 'primitive_bundle',
        name: 'Primitive Bundle',
        description: 'Basic binding made from stone and plant fiber.',
        station: null,

        ingredients: {
            stone: 2,
            fern_patch: 3
        },

        outputs: {
            resin: 1
        },

        craftTimeSeconds: 10
    },

    rocket_frame: {
        id: 'rocket_frame',
        name: 'Rocket Frame',
        description: ' Assemble the structural frame of the rocket.',
        station: 'workbench',

        ingredients: {
            stone: 6,
            resin: 2,
            obsidian_shard: 2
        },

        outputs: {
            rocket_frame: 1,
        },
        craftTimeSeconds: 60,

        requiresFlags: {
            met_elara: true
        }
    },

    fuel_system: {
        id: 'fuel_system',
        name:'Fuel System',
        description: 'Assemble the structural frame of the fuel system.',
        station: 'workbench',
        ingredients: {
            resin: 3,
            obsidian_shard: 3
        },
        outputs: {
            fuel_system: 1
        },

        craftTimeSeconds: 90,
        requiresFlags: {
            met_elara: true
        }
    },

    fuel_cell: {
        id: 'fuel_cell',
        name: 'Rocket Fuel Cell',
        description: 'Prepare a single launch-ready fuel cell.',
        station: 'workbench',

        ingredients: {
            fresh_water: 2,
            resin: 2
        },
        outputs: {
            rocket_fuel_cell: 1
        },

        craftTimeSeconds: 30,
    }
});