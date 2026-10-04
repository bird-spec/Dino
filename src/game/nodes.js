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

function hash2(x, z, seed) {
  let h = (seed ^ Math.imul(x, 374761393) ^ Math.imul(z, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const templateCache = new Map();
const templateOffset = new Map();
async function getTemplate(path) {
  if (!templateCache.has(path)) {
    const gltf = await new GLTFLoader().loadAsync(path);
    const tpl = gltf.scene;
    tpl.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(tpl);
    templateCache.set(path, tpl);
    templateOffset.set(path, -box.min.y);
  }
  return templateCache.get(path);
}

const SCATTER = [
  { path: "/models/stone_rock.glb", harvest: "stone_rock", count: [2, 4] },
  { path: "/models/fern_patch.glb", harvest: "fern_patch", count: [1, 3] },
  { path: "/models/resin_tree.glb", harvest: "resin_tree", count: [0, 1] },
  { path: "/models/prehistoric_tree.glb", harvest: null, count: [2, 4] },
  { path: "/models/cactus.glb", harvest: null, count: [1, 3] },
  { path: "/models/rock.glb", harvest: null, count: [1, 2] },
  { path: "/models/bush.glb", harvest: null, count: [2, 4] },
  { path: "/models/grass_tuft.glb", harvest: null, count: [4, 8] },
];

export const SCATTER_RADIUS = 96;
export class ScatterManager {
  constructor(scene, game) {
    this.scene = scene;
    this.game = game;
    this.loaded = new Map();
    this.live = [];
  }
  async update(px, pz) {
    const r = Math.ceil(SCATTER_RADIUS / 32);
    const pcx = Math.floor(px / 32);
    const pcz = Math.floor(pz / 32);
    const want = new Set();
    for (let dx = -r; dx <= r; dx++)
      for (let dz = -r; dz <= r; dz++) {
        if (Math.hypot(dx, dz) > r + 0.5) continue;
        const k = pcx + dx + ", " + (pcz + dz);
        want.add(k);
        if (!this.loaded.has(k)) {
          const items = [];
          this.loaded.set(k, items);
          this.populate(pcx + dx, pcz + dz, items).catch((e) =>
            console.error("scatter", k, e),
          );
        }
      }
    for (const [k, items] of this.loaded) {
      if (want.has(k)) continue;
      for (const it of items) {
        this.scene.remove(it.mesh);
        const li = this.live.indexOf(it);
        if (li >= 0) this.live.splice(li, 1);
      }
      this.loaded.delete(k);
    }
  }
  async populate(cx, cz, items) {
    const rng = mulberry32(hash2(cx, cz, 10000));
    const placed = [];
    for (const entry of SCATTER) {
      const n =
        entry.count[0] +
        Math.floor(rng() * (entry.count[1] - entry.count[0] + 1));
      for (let i = 0; i < n; i++) {
        let x = 0,
          z = 0,
          ok = false;
        for (let tries = 0; tries < 8 && !ok; tries++) {
          x = cx * 32 + rng() * 32;
          z = cz * 32 + rng() * 32;
          ok =
            Math.hypot(x, z) > 6 &&
            placed.every((p) => Math.hypot(p.x - x, p.z - z) > 3);
        }
        if (!ok) continue;
        placed.push({ x, z });
        const tpl = await getTemplate(entry.path);
        const mesh = tpl.clone();
        mesh.position.set(x, 0, z);
        mesh.position.y +=
          getGroundY(x, z) + (templateOffset.get(entry.path) ?? 0);
        mesh.traverse((o) => {
          if (o.isMesh) o.castShadow = true;
        });
        const item = { mesh, interactId: null, prompt: "", nodeId: null };
        if (entry.harvest) {
          const idx = placed.length;
          const nodeId = `node_${cx}_${cz}_${idx}`;
          const interactId = `harvest_${cx}_${cz}_${idx}`;
          const existing = this.game.state.read(
            (s) => s.resources.nodes[nodeId],
          );
          if (existing && existing.quantity <= 0) continue;
          if (!existing) {
            this.game.resources.registerNode({
              id: nodeId,
              type: entry.harvest,
              quantity: 6,
              maxQuantity: 6,
              respawnSeconds: 0,
            });
            this.game.interaction.register({
              id: interactId,
              type: "harvest",
              cooldownMs: 500,
              condition: ({ state }) =>
                (state.resources.nodes[nodeId]?.quantity ?? 0) > 0,
              handler: () => {
                this.game.resources.harvest(nodeId, 1, { source: "world" });
              },
            });
          }
          item.nodeId = nodeId;
          item.interactId = interactId;
          item.prompt = `Harvest ${entry.harvest.replace("_", " ")}`;
          this.scene.add(mesh);
          items.push(item);
          this.live.push(item);
        }
      }
    }
  }
  nearest(x, z, maxDist) {
    let best = null;
    let bestD = maxDist;
    for (const it of this.live) {
      if (!it.interactId || !it.mesh.visible) continue;
      const d = Math.hypot(it.mesh.position.x - x, it.mesh.position.z - z);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    return best;
  }
  vanish(item) {
    item.mesh.visible = false;
    if (item.interactId) {
      try {
        this.game.interaction.unregister(item.interactId);
      } catch {
        // already gone
      }
    }
    const li = this.live.indexOf(item);
    if (li >= 0) this.live.splice(li, 1);
  }
}
