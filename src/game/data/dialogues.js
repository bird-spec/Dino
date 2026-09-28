import { deepFreeze} from "../core/utils.js";

export const DIALOGUES = deepFreeze({
    elara_intro: {
        id: 'elara_intro',
        npcId: 'elara',
        startNode: 'start',

        nodes: {
            start: {
                text: 'Ypu made it through the temporal rift. That means the signal is real
            }
        }
    }
})

//not confirmed if gonna be used so pausing development for this now