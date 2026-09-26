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

  const legL = model.getObjectByName("Left_Leg");
  const legR = model.getObjectByName("Right_Leg");
  const body = model.getObjectByName("Body");

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

  model.userData.baseY = y;
  model.userData.legL = legL;
  model.userData.legR = legR;
  model.userData.speed = 10;
  model.userData.isFlying = false;
  model.userData.legL_home = legL.position.clone();
  model.userData.legR_home = legR.position.clone();
  model.userData.rotateZ = model.rotation.z;
  model.userData.body = body;

  scene.add(model);
  return model;
}

export function runDino(model, time, speed, direction) {
  const t = (time / 1000) * 10 * speed;
  const stride = 0.35;
  const lift = 0.25;

  const { legL, legR, legL_home, legR_home, baseY, rotateZ } = model.userData;

  if (direction === "forward") {
    legL.position.z = legL_home.z - Math.sin(t) * stride;
    legL.position.y = legL_home.y + Math.max(0, Math.cos(t)) * lift;

    legR.position.z = legR_home.z - Math.sin(t + Math.PI) * stride;
    legR.position.y = legR_home.y + Math.max(0, Math.cos(t + Math.PI)) * lift;

    if (!model.userData.isFlying) {
      model.position.y = baseY + Math.abs(Math.sin(t)) * 0.08 * speed;
    }

    model.rotation.z = rotateZ + Math.sin(t) * 0.01 * speed;
  } else if (direction === "backward") {
    legL.position.z = legL_home.z + Math.sin(t) * stride;
    legL.position.y = legL_home.y + Math.max(0, Math.cos(t)) * lift;

    legR.position.z = legR_home.z + Math.sin(t + Math.PI) * stride;
    legR.position.y = legR_home.y + Math.max(0, Math.cos(t + Math.PI)) * lift;

    if (!model.userData.isFlying) {
      model.position.y = baseY + Math.abs(Math.sin(t)) * 0.08 * speed;
    }

    model.rotation.z = rotateZ + Math.sin(t) * 0.01 * speed;
  } else if (direction === "left") {
  } else if (direction === "right") {
  }
}

export function jumpDino(model, time, pressing) {
  const ud = model.userData;
  if (ud.isFlying) {
    ud.speed -= 0.6;
    model.position.y += ud.speed / 5;
    if (model.position.y <= ud.baseY) {
      model.position.y = ud.baseY;
      ud.isFlying = false;
    }
    return;
  }
  if (!pressing) return;
  if (model.position.y > ud.baseY + 0.01) return;
  ud.isFlying = true;
  ud.speed = 4.5;
}

export default spawnCharacter;
