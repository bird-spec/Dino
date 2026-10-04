import * as THREE from "three";
import { loadModel } from "../utils/model.js";
import { getGroundY } from "../runtime/character.js";

export const STONE_NODE_ID = "stone_node_1";
export const STONE_INTERACT_ID = "harvest_stone_1";

export async function spawnStoneNode(scene, game, x = 4, z = -6) {
  const mesh = await loadModel("/models/stone_rock.glb", x, 0, z, 1, 1, 1);
  mesh.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(mesh);
  mesh.position.y += getGroundY(x, z) - box.min.y;
  mesh.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  scene.add(mesh);

  game.resources.registerNode({
    id: STONE_NODE_ID,
    type: "stone_rock",
    quantity: 9,
    maxQuantity: 9,
    respawnSeconds: 0,
  });

  game.interaction.register({
    id: STONE_INTERACT_ID,
    type: "harvest",
    cooldownMs: 500,
    condition: ({ state }) =>
      (state.resources.nodes[STONE_NODE_ID]?.quantity ?? 0) > 0,
    handler: () => {
      game.resources.harvest(STONE_NODE_ID, 1, { source: "world" });
    },
  });

  return mesh;
}
