import { deepFreeze } from '../core/utils'

export const NPCS = deepFreeze({
    elara: {
        id: 'elara',
        name:'Dr.Elara Voss',
        role: 'Time researcher',
        description: 'A stranded researcher studying the strange energy signature in the prehistoric zone.',
        dialogueId: 'elara_introduction',
        tags: ['researcher', 'story']
    },

    sentinel: {
        id: 'sentinel',
        name: 'Temporal Sentinel',
        role: 'Unknown Construct',
        description: ' An ancient machine-like entity guarding a hyperspace anomaly.',
        tags: ['mystery', 'hyperspace']
    }
});
//Not confirmed to be used in the game so pausing development for now