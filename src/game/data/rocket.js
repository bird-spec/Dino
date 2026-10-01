import { deepFreeze} from "../core/utils.js";

export const ROCKET_PARTS = deepFreeze({

    frame: {
        id: 'frame',
        name: 'Rocket Frame',
        itemId: 'rocket_frame',
    },

    engine: {
        id: 'engine',
        name: 'Rocket Engine',
        itemId: 'rocket_engine',
    },

    fuelSystem: {
        id: 'fuelSystem',
        name: 'Fuel System',
        itemId: 'fuel_system',
    },
    guidance: {
        id: 'guidance',
        name: 'Guidance Computer',
        itemId: 'guidance_computer',
    },

    hyperspaceCore: {
        id: 'hyperspaceCore',
        name: 'Hyperspace Core',
        itemId: 'hyperspace_core',
    }
});