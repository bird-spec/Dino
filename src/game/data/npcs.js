import { deepFreeze } from '../core/utils'

export const NPCS = deepFreeze({
    elara: {
        id: 'elara',
        name:'Dr.Elara Voss',
        role: 'Time researcher',
        description: 'A stranded researcher studying the strange energy signature in the prehistoric zone.'
        dialogueId: 'elara_introduction',
        tags: ['researcher', 'story']
    }
})