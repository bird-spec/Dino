import * as THREE from "three";

let yaw = 0;
let pitch = 0;
let listening = false;

const SIDE = 4;
const HEIGHT = 3.5;
const BACK = 9;
const AHEAD = 10;

export function getYaw() {
  return yaw;
}

export function updateThirdPov(camera, model) {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  camera.position
    .copy(model.position)
    .addScaledVector(forward, -BACK)
    .addScaledVector(right, SIDE);
  camera.position.y += HEIGHT;

  const lookTarget = model.position
    .clone()
    .addScaledVector(forward, AHEAD)
    .addScaledVector(right, SIDE * 0.3);
  lookTarget.y -= 2 - pitch * 10;
  camera.lookAt(lookTarget);
}

export function ThirdPov(scene, model) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const sensitivity = 0.002;

  yaw = model.rotation.y;

  if (!listening) {
    listening = true;
    document.addEventListener("click", (e) => {
      document.body.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;
        pitch = Math.max(-1, Math.min(2, pitch));
      }
    });
  }

  updateThirdPov(camera, model);

  return camera;
}
