import {
    NotFoundError,
    ValidationError,
} from "../core/errors.js";
import {
    deepClone,
    assertNonEmptyString
} from "../core/utils.js";

export class NpcSystem {
    constructor ({
                     state,
                     npcCatalog
                 }) {
        this.state = state;
        this.npcCatalog = {
            ...npcCatalog
        };
    }

    register(npc) {
        if (
            !npc || typeof npc !== 'object'
        ) {
            throw new ValidationError(
                'NPC must be an object.'
            );
        }

        assertNonEmptyString(npc.id, 'npc id');

        this.npcCatalog[npc.id] =
            deepClone(npc);

        return this.get(npc.id);
    }

    get(npcId) {
        const npc = this.npcCatalog[npcId];
        if (!npc) {
            throw new NotFoundError(`Unknown NPC: ${npcId}`);
        }

        return deepClone(npc);
    }

    list() {
        return deepClone(
            this.npcCatalog,
        ) ;
    }
    markDiscovered(npcId) {
        this.get(npcId);

        if (
            !this.isDiscovered(npcId)
        ){
            this.state.mutate(
                'npc.discover',
                (state) => {
                    state.world
                        .discoveredNpcs[
                            npcId
                        ] = true;
                }
            );
        }

        return true;
    }

    isDiscovered(npcId) {
        this.get(npcId);

        return this.state.read(
            (state) =>
                Boolean (
                    state.world.discoveredNpcs[npcId]
                )
        );
    }
}