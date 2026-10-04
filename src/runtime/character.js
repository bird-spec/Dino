import * as THREE from "three";
import { loadModel } from "../utils/model.js";
import { hillHeight } from "../world/noise.js";
import {
  TERRAIN_AMP,
  TERRAIN_FREQ,
  TERRAIN_BLOCK,
  TERRAIN_SEED,
} from "../world/blockTerrain.js";
import { getYaw, getPitch } from "./camera.js";

// function to spawn character.
export async function spawnCharacter(name, x, y, z, scale = 1, scene) {
  const model = await loadModel("/dino.glb", x, y, z, scale, scale, scale);
  model.name = name;
  model.scale.x *= 1.35;

  //default colors

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

  //defining each part of the dino model

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

  model.updateMatrixWorld(true);
  const headBox = new THREE.Box3().setFromObject(head);
  const pivotPoint = headBox.getCenter(new THREE.Vector3());
  pivotPoint.y = headBox.min.y;

  const pivot = new THREE.Group();
  body.add(pivot);
  const pivotClone = pivotPoint.clone();
  body.worldToLocal(pivotClone);
  pivot.position.copy(pivotClone);
  pivot.attach(head);
  pivot.attach(eyeL);
  pivot.attach(eyeR);

  model.userData.baseY = y;
  model.userData.vy = 0;
  model.userData.legL = legL;
  model.userData.legR = legR;
  model.userData.speed = 10;
  model.userData.isFlying = false;
  model.userData.legL_home = legL.position.clone();
  model.userData.legR_home = legR.position.clone();
  model.userData.rotateZ = model.rotation.z;
  model.userData.rotateY = model.rotation.y;
  model.userData.body = body;
  model.userData.neckPivot = pivot;

  model.updateMatrixWorld(true);
  const fullBox = new THREE.Box3().setFromObject(model);
  model.userData.footOffset = model.position.y - fullBox.min.y;

  scene.add(model);
  return model;
}

const TURN_SPEED = 8;

export function getGroundY(x, z) {
  const h =
    hillHeight(x * TERRAIN_FREQ, z * TERRAIN_FREQ, TERRAIN_SEED) * TERRAIN_AMP;
  return (
    Math.floor(h / TERRAIN_BLOCK) * TERRAIN_BLOCK + TERRAIN_BLOCK / 2
  );
}

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

  const neckPivot = model.userData.neckPivot;

  const pitch = getPitch() * 0.1;

  const tilt = THREE.MathUtils.clamp(pitch, pitch - 0.3, pitch + 0.3);

  neckPivot.rotation.x += (tilt - neckPivot.rotation.x) * 0.3;
}

export function runDino(model, time, speed, deg = 0, dt = 1 / 60) {
  const t = (time / 1000) * 10 * speed;
  const stride = 0.35;
  const lift = 0.25;

  const { legL, legR, legL_home, legR_home, rotateZ, footOffset = 0 } = model.userData;

  turnDino(model, getYaw() + THREE.MathUtils.degToRad(deg), time);

  legL.position.z = legL_home.z - Math.sin(t) * stride;
  legL.position.y = legL_home.y + Math.max(0, Math.cos(t)) * lift;

  legR.position.z = legR_home.z - Math.sin(t + Math.PI) * stride;
  legR.position.y = legR_home.y + Math.max(0, Math.cos(t + Math.PI)) * lift;

  const groundY =
    getGroundY(model.position.x, model.position.z) + footOffset;

  if (!model.userData.isFlying) {
    model.position.y = groundY + Math.abs(Math.sin(t)) * 0.08 * speed;
  }

  model.rotation.z = rotateZ + Math.sin(t) * 0.01 * speed;
}

const GRAVITY = 210;
const JUMP_V0 = 88;
export function jumpDino(model, time, pressed, dt = 1 / 60, moving = false) {
  const ud = model.userData;
  if (pressed) ud.jumpBuffer = 0.15;
  else ud.jumpBuffer = Math.max(0, (ud.jumpBuffer ?? 0) - dt);
  const groundY =
    getGroundY(model.position.x, model.position.z) + (ud.footOffset ?? 0);

  if (!ud.isFlying) {
    if ((ud.jumpBuffer ?? 0) > 0) {
      ud.isFlying = true;
      ud.vy = JUMP_V0;
      ud.jumpBuffer = 0;
      return;
    }
    if (model.position.y > groundY + 0.25) {
      ud.isFlying = true;
      ud.vy = 0;
      return;
    }
    if (!moving) model.position.y = groundY;
    return;
  }
  ud.vy -= GRAVITY * dt;
  model.position.y += ud.vy * dt;
  if (ud.vy <= 0 && model.position.y <= groundY) {
    model.position.y = groundY;
    ud.isFlying = false;
    ud.vy = 0;
  }
}

export default spawnCharacter;
