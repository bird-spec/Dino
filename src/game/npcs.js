import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getGroundY } from "../runtime/character.js";

const cache = new Map();

async function getNpcTemplate(path) {
  if (!cache.has(path)) {
    const gltf = await new GLTFLoader().loadAsync(path);
    const tpl = gltf.scene;
    tpl.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(tpl);
    const center = new THREE.Vector3();
    box.getCenter(center);
    tpl.rotation.x = center.z >= 0 ? -Math.PI / 2 : Math.PI / 2;
    tpl.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(tpl);
    cache.set(path, { tpl, lift: -box.min.y });
  }
  return cache.get(path);
}

export async function spawnNpc(scene, { path, x, z, scale = 1, name = "npc" }) {
  const { tpl, lift } = await getNpcTemplate(path);
  const mesh = tpl.clone();
  mesh.name = name;
  mesh.scale.setScalar(scale);
  mesh.position.set(x, 0, z);
  mesh.position.y += getGroundY(x, z) + lift * scale;
  mesh.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  scene.add(mesh);
  mesh.userData.homeY = mesh.position.y;
  mesh.userData.phase = Math.random() * Math.PI * 2;
  return mesh;
}

export function animateNpc(mesh, model, time) {
  mesh.position.y =
    mesh.userData.homeY + Math.sin(time / 600 + mesh.userData.phase) * 0.08;
  const dx = model.position.x - mesh.position.x;
  const dz = model.position.z - mesh.position.z;
  mesh.rotation.y = Math.atan2(dx, dz);
}
