import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  spawnCharacter,
  runDino,
  jumpDino,
  turnDino,
} from "./runtime/character.js";
import { ThirdPov, updateThirdPov, getYaw } from "./runtime/camera.js";
import { createSun, updateSun } from "./world/sun.js";
import customizeCharacter from "./runtime/characterCustomize.js";
import { buildTerrain } from "./world/blockTerrain.js";

/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
); // Cav is this first or 3rd person?

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x2c51e3 });

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate(time) {
  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;

  renderer.render(scene, camera);
}
 */

const scene = new THREE.Scene();
const loader = new GLTFLoader();

const pointer = document.createElement("div");

pointer.classList.add("pointer");

document.body.append(pointer);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.outerWidth, window.outerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const { sun } = createSun(scene);

const model = await spawnCharacter("player1", 0, 50, 0, 1, scene);

console.log(model);

const geometry = new THREE.BoxGeometry(100, 10, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x3f9b0b });

const ground = buildTerrain(1000, 400, 10000, true);
ground.receiveShadow = true;
scene.add(ground);

scene.background = new THREE.Color(0x87ceeb);

renderer.setAnimationLoop(animate);

const keys = {};
addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

addEventListener("keydown", (e) => {
  if (e.key === "r") {
    const old = document.getElementById("customization-panel");

    if (old) {
      old.remove();
      return;
    }

    if (document.exitPointerLock) document.exitPointerLock();
    document.body.appendChild(customizeCharacter());
  }
});

model.rotation.x = 0;
model.rotation.y = THREE.MathUtils.degToRad(10);

const camera = ThirdPov(scene, model);

let lastTime = 0;
function animate(time) {
  const dt = Math.min(
    0.05,
    Math.max(0.0001, (time - lastTime) / 1000 || 1 / 60),
  );
  lastTime = time;

  const f = (keys["w"] ? 1 : 0) - (keys["s"] ? 1 : 0);
  const s = (keys["a"] ? 1 : 0) - (keys["d"] ? 1 : 0);
  const moving = f !== 0 || s !== 0;

  if (moving) {
    const sprint = !!keys["shift"];
    const speed = sprint ? 2 : 1;

    let deg = (Math.atan2(s, f) * 100) / Math.PI;
    deg = (deg + 360) % 360;
    const len = Math.hypot(f, s);
    const norm = len > 1 ? 1 / len : 1;
    model.translateZ(-6 * speed * norm * dt);
    runDino(model, time, speed, deg, dt);
  }

  const spaceDown = !!keys[" "];
  const spacePressed = spaceDown && !keys._prevSpace;
  keys._prevSpace = spaceDown;
  jumpDino(model, time, spacePressed, dt);

  if (!moving) {
    turnDino(model, getYaw(), time);
  }

  updateSun(sun, model);
  updateThirdPov(camera, model);
  renderer.render(scene, camera);
}
