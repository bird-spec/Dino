import * as THREE from "three";
import { loadModel } from "../utils/model.js";
import { getYaw, getPitch } from "./camera.js";

export async function spawnCharacter(name, x, y, z, scale = 1, scene) {
  const model = await loadModel("/dino.glb", x, y, z, scale, scale, scale);
  model.name = name;
  model.scale.x *= 1.35;

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
  const head = model.getObjectByName("Head");
  const eyeL = model.getObjectByName("Left_Eye");
  const eyeR = model.getObjectByName("Right_Eye");

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
    m.castShadow = true;
  }

  model.userData.baseY = y;
  model.userData.legL = legL;
  model.userData.legR = legR;
  model.userData.speed = 10;
  model.userData.isFlying = false;
  model.userData.legL_home = legL.position.clone();
  model.userData.legR_home = legR.position.clone();
  model.userData.rotateZ = model.rotation.z;
  model.userData.rotateY = model.rotation.y;
  model.userData.body = body;
  model.userData.head = head;
  model.userData.headX = head.rotation.x;
  model.userData.eyeL = eyeL;
  model.userData.eyeR = eyeR;
  model.userData.eyeLX = eyeL.rotation.x;
  model.userData.eyeRX = eyeR.rotation.x;
  model.updateMatrixWorld(true);
  const _hw = new THREE.Vector3();
  const _bw = new THREE.Vector3();
  head.getWorldPosition(_hw);
  body.getWorldPosition(_bw);
  const _dir = _bw
    .sub(_hw)
    .normalize()
    .transformDirection(head.parent.matrixWorld.clone().invert());
  model.userData.head_home = head.position.clone();
  model.userData.eyeL_homeP = eyeL.position.clone();
  model.userData.eyeR_homeP = eyeR.position.clone();
  model.userData.headSink = _dir;
  model.userData.sinkBase = 0.15;

  scene.add(model);
  return model;
}

const TURN_SPEED = 8;

export function turnDino(model, targetYaw, time) {
  const last = model.userData.lastTurnTime;
  let dt = 1 / 60;
  if (last !== undefined && time !== undefined) {
    dt = Math.min(0.05, Math.max(0.0001, (time - last) / 1000));
  }
  model.userData.lastTurnTime = time;

  let d = (targetYaw - model.rotation.y) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;

  model.rotation.y += d * (1 - Math.exp(-TURN_SPEED * dt));

  if (model.userData.head) {
    const tilt = THREE.MathUtils.clamp(getPitch() * 0.3, -0.3, 0.3);
    const k = 0.2;
    const h = model.userData;
    h.head.rotation.x += (h.headX + tilt - h.head.rotation.x) * k;
    if (h.eyeL) h.eyeL.rotation.x += (h.eyeLX + tilt - h.eyeL.rotation.x) * k;
    if (h.eyeR) h.eyeR.rotation.x += (h.eyeRX + tilt - h.eyeR.rotation.x) * k;
    const sink = h.sinkBase + Math.abs(tilt) * 0.5;
    h.head.position.copy(h.head_home).addScaledVector(h.headSink, sink);
    if (h.eyeL)
      h.eyeL.position.copy(h.eyeL_homeP).addScaledVector(h.headSink, sink);
    if (h.eyeR)
      h.eyeR.position.copy(h.eyeR_homeP).addScaledVector(h.headSink, sink);
  }

  const sink = h.sinkBase + Math.abs(tilt) * 0.5;
  h.head.position.copy(h.head_home).addScaledVector(h.headSink, sink);
  if (h.eyeL)
    h.eyeL.position.copy(h.eyeL_homeP).addScaledVector(h.headSink, sink);
  if (h.eyeR)
    h.eyeR.position.copy(h.eyeR_homeP).addScaledVector(h.headSink, sink);
}

export function runDino(model, time, speed, deg = 0) {
  const t = (time / 1000) * 10 * speed;
  const stride = 0.35;
  const lift = 0.25;

  const { legL, legR, legL_home, legR_home, baseY, rotateZ } = model.userData;

  turnDino(model, getYaw() + THREE.MathUtils.degToRad(deg), time);

  legL.position.z = legL_home.z - Math.sin(t) * stride;
  legL.position.y = legL_home.y + Math.max(0, Math.cos(t)) * lift;

  legR.position.z = legR_home.z - Math.sin(t + Math.PI) * stride;
  legR.position.y = legR_home.y + Math.max(0, Math.cos(t + Math.PI)) * lift;

  if (!model.userData.isFlying) {
    model.position.y = baseY + Math.abs(Math.sin(t)) * 0.08 * speed;
  }

  model.rotation.z = rotateZ + Math.sin(t) * 0.01 * speed;
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
