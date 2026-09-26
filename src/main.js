import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { spawnCharacter, runDino } from "./runtime/character.js";

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
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const model = await spawnCharacter("player1", 0, 5.2, 0, 1, scene);

console.log(model);

const geometry = new THREE.BoxGeometry(100, 0.1, 100);
const material = new THREE.MeshBasicMaterial({ color: 0x3f9b0b });

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

scene.background = new THREE.Color(0x87ceeb);

renderer.setAnimationLoop(animate);

const keys = {};
addEventListener("keydown", (e) => (keys[e.key] = true));
addEventListener("keyup", (e) => (keys[e.key] = false));

function animate(time) {
  model.rotation.x = 0;
  model.rotation.y = THREE.MathUtils.degToRad(10);

  if (keys["w"]) {
    let speed = keys["Shift"] ? 2 : 1;
    model.position.z -= keys["Shift"] ? 0.2 : 0.1;
    runDino(model, time, speed);
  }

  camera.position.z = model.position.z + 12;
  camera.position.y = 5;
  camera.position.x = model.position.x - 5;

  renderer.render(scene, camera);
}
