import * as THREE from "three";
import { loadModel } from "../utils/model.js";

export async function spawnCharacter(name, x, y, z, scale = 1, scene) {
  const model = await loadModel("/dino.glb", x, y, z, scale, scale, scale);
  model.name = name;

  const colors = {
    Body: 0x4ade80,
    Head: 0x4ade80,
    Tail: 0x22c55e,
    Left_Eye: 0x000000,
    Right_Eye: 0x000000,
    Left_Hand: 0x86efac,
    Right_Hand: 0x86efac,
    Left_Leg: 0x16a34a,
    Right_Leg: 0x16a34a,
  };

  const meshes = [];
  model.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });

  for (const m of meshes) {
    m.material = new THREE.MeshStandardMaterial({
      color: colors[m.name] ?? 0x4ade80,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
    });
  }

  scene.add(model);
  return model;
}

export default spawnCharacter;
