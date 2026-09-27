import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { spawnCharacter, runDino, jumpDino } from "./runtime/character.js";
import { ThirdPov, updateThirdPov } from "./runtime/camera.js";
import { createSun, updateSun } from "./world/sun.js";

/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

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

const model = await spawnCharacter("player1", 0, 5.2, 0, 1, scene);

console.log(model);

const geometry = new THREE.BoxGeometry(100, 0.1, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x3f9b0b });

const cube = new THREE.Mesh(geometry, material);
cube.receiveShadow = true;
scene.add(cube);

scene.background = new THREE.Color(0x87ceeb);

renderer.setAnimationLoop(animate);

const keys = {};
addEventListener("keydown", (e) => (keys[e.key] = true));
addEventListener("keyup", (e) => (keys[e.key] = false));

model.rotation.x = 0;
model.rotation.y = THREE.MathUtils.degToRad(10);

const camera = ThirdPov(scene, model);

function animate(time) {
  if (keys["w"]) {
    let speed = keys["Shift"] ? 2 : 1;
    model.translateZ(-0.1 * speed);
    runDino(model, time, speed, "forward");
  }
  if (keys["s"]) {
    let speed = 1;
    model.translateZ(0.1);
    runDino(model, time, speed, "backward");
  }
  jumpDino(model, time, !!keys[" "]);

  updateSun(sun, model);
  updateThirdPov(camera, model);
  renderer.render(scene, camera);
}
