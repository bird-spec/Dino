import { deepFreeze} from "./utils.js";

export const ITEMS = deepFreeze({
    stone: {
        id: 'stone',
        name: 'Stone',
        description: 'Common prehistoric stone used for crafting,',
        stackSize: 20,
        tags: ['resource', 'crafting'],
    },
    fern_fiber: {
        id: 'fern_fiber',
        name: 'Fern Fiber',
        description: 'Tough plant fiber gathered from ferns and used for crafting',
        stackSize: 30,
        tags: ['resource', 'crafting'],
    },

    fresh_water: {
        id: 'fresh_water',
        name: 'Fresh Water',
        description: 'Clean water gathered from fresh water sources',
        stackSize: 10,
        tags: ['resource', 'survival'],

    },

    obsidian_shard: {
        id:'obsidian_shard',
        name: 'Obsidian Shard',
        description: 'Volcanic Glass useful in crafting ',
        stackSize: 20,
        tags: ['resource', 'advanced']
    },
    rocket_engine:{
        id: 'rocket_engine',
        name: 'Rocket Engine',
        description: 'A recovered engine for the prototype rocket',
        stackSize: 1,
        tags: ['rocket', 'progression']
    },

    fuel_sysyem: {
        id: 'fuel_system',
        name: 'Fuel System',
        description: 'A compact fuel-management assembly',
        stackSize: 1,
        tags: ['rocket', 'progression']
    },

    guidance_computer: {
        id: 'guidance_computer',
        name: 'Guidance Computer',
        description: 'A navigation computer capable of hyperspace calculations.',
        stackSize:1,
        tags: ['rocket', 'progression']
    },

    hyperspace_core:{
        id: 'hyperspace_core',
        name: 'Hyperspace Core',
        description: 'The exotic component that enables the hyperspace jump,',
        stackSize: 1,
        tags: ['rocket', 'progression','hyperspace']
    },

    rocket_fuel_cell:{
        id: 'rocket_fuel_cell',
        name: 'Rocket Fuel Cell',
        description: 'Fuel required for the rocket to launch.',
        stackSize: 5,
        tags: ['rocket', 'fuel']

    }
});