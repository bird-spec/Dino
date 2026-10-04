import * as THREE from "three";
import { hillHeight } from "./noise.js";
import {
  TERRAIN_AMP,
  TERRAIN_FREQ,
  TERRAIN_BLOCK,
  TERRAIN_SEED,
} from "./blockTerrain.js";

export const CHUNK = 32;

const cubeGeo = new THREE.BoxGeometry(
  TERRAIN_BLOCK,
  TERRAIN_BLOCK,
  TERRAIN_BLOCK,
);
const terrainMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });

export function buildChunk(cx, cz) {
  const seed = TERRAIN_SEED;
  const x0 = cx * CHUNK;
  const z0 = cz * CHUNK;
  const n = Math.floor(CHUNK / TERRAIN_BLOCK);
  const holder = new THREE.InstancedMesh(cubeGeo, terrainMat, n * n);
  const dummy = new THREE.Object3D();
  let used = 0;

  for (let iz = 0; iz < n; iz++) {
    const wz = z0 + iz * TERRAIN_BLOCK + TERRAIN_BLOCK / 2;
  }

  let ix = 0;
  while (ix < n) {
    const wxStart = x0 + ix * TERRAIN_BLOCK + TERRAIN_BLOCK / 2;
    const hStart =
      hillHeight(wxStart * TERRAIN_FREQ, wz * TERRAIN_FREQ, seed) * TERRAIN_AMP;
    const sh = Math.floor(hStart / TERRAIN_BLOCK) * TERRAIN_BLOCK;
    let runLen = 1;
    while (ix + runLen < n) {
      const wxNext = x0 + (ix + runLen) * TERRAIN_BLOCK + TERRAIN_BLOCK / 2;
      const hNext =
        hillHeight(wxNext * TERRAIN_FREQ, wz * TERRAIN_FREQ, seed) *
        TERRAIN_AMP;
      if (Math.floor(hNext / TERRAIN_BLOCK) * TERRAIN_BLOCK !== sh) break;
      runLen++;
    }
    dummy.position.set(
      x0 + ix * TERRAIN_BLOCK + (runLen * TERRAIN_BLOCK) / 2,
      sh,
      wz,
    );
    dummy.scale.set(runLen, 1, 1);
    dummy.updateMatrix();
    holder.setMatrixAt(used, dummy.matrix);
    used++;
    ix += runLen;
  }
  holder.count = used;
  holder.instanceMatrix.needsUpdate = true;
  holder.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  holder.recieveShadow = true;
  return holder;
}

export class ChunkManager {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
  }
  key(cx, cz) {
    return cx + ", " + cz;
  }
  update(px, pz, viewDistance) {
    const radius = Math.max(1, Math.ceil(viewDistance / CHUNK));
    const pcx = Math.floor(px / CHUNK);
    const pcz = Math.floor(pz / CHUNK);
    const want = new Set();
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.hypot(dx, dz) > radius + 0.5) continue;
        const cx = pcx + dx;
        const cz = pcz + dz;
        const k = this.key(cx, cz);
        want.add(k);
        if (!this.chunks.has(k)) {
          const mesh = buildChunk(cx, cz);
          mesh.userData.chunk = k;
          this.scene.add(mesh);
          this.chunks.set(k, mesh);
        }
      }
    }
    for (const [k, mesh] of this.chunks) {
      if (!want.has(k)) {
        this.scene.remove(mesh);
        mesh.dispose();
        this.chunks.delete(k);
      }
    }
  }
}
