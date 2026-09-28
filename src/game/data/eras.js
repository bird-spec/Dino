import { deepFreeze} from "../core/utils.js";

export const ERAS = deepFreeze({

    prehistory: {
        id: 'prehistory',
        name: 'Prehistory',
        description: 'THe dinosaur-era environment where the game begins,',
    },
    hyperspace: {
        id: 'hyperspace',
        name: 'Hyperspace',
        description: 'A transitional dimension between eras'
    }
})