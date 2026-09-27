import * as THREE from "three";

let yaw = 0;
let pitch = 0;
let listening = false;

export function ThirdPov(scene, model) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const sensitivity = 0.002;

  if (!listening) {
    listening = true;
    document.addEventListener("click", (e) => {
      document.body.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;
        pitch = Math.max(-0.5, Math.min(0.5, pitch));

        model.rotation.x = pitch;
        model.rotation.y = yaw;
      }
    });
  }

  return camera;
}

export function updateThirdPov(camera, model) {
  camera.position.set(
    model.position.x + Math.sin(yaw) * 12 - 5,
    model.position.y + 5 + pitch * 10,
    model.position.z + Math.cos(yaw) * 12,
  );
  camera.lookAt(model.position.x, model.position.y, model.position.z);
}
