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
import { bootstrapGame } from "./game/bootstrap.js";
import {
  spawnStoneNode,
  STONE_NODE_ID,
  STONE_INTERACT_ID,
} from "./game/nodes.js";

const scene = new THREE.Scene();
const loader = new GLTFLoader();

const game = bootstrapGame();
console.log("[game] systems ready: " + Object.keys(game).join(", "));

const pointer = document.createElement("div");

pointer.classList.add("pointer");

document.body.append(pointer);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const { sun } = createSun(scene);

const model = await spawnCharacter("player1", 0, 50, 0, 1, scene);
game.model = model;

const stoneMesh = await spawnStoneNode(scene, game);
game.stoneMesh = stoneMesh;

console.log(model);

const geometry = new THREE.BoxGeometry(100, 10, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x3f9b0b });

const ground = buildTerrain(1000, 400, 10000, true);
ground.receiveShadow = true;
scene.add(ground);

scene.background = new THREE.Color(0x87ceeb);

renderer.setAnimationLoop(animate);

const keys = {};
addEventListener("keydown", (e) => {
  if (e.code === "Space") e.preventDefault();
  keys[e.key.toLowerCase()] = true;
});
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

let nearStone = false;
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key.toLowerCase() !== "e" || !nearStone) return;
  try {
    game.interaction.interact(STONE_INTERACT_ID);
    game.ui?.notify("+1 stone", "success");
    if (game.resources.getNode(STONE_NODE_ID).quantity <= 0) {
      stoneMesh.visible = false;
      game.ui?.hideInteraction();
    }
  } catch {
    game.ui?.notify("Nothing left to harvest", "info");
  }
});

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

addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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

    let deg = (Math.atan2(s, f) * 180) / Math.PI;
    deg = (deg + 360) % 360;
    const len = Math.hypot(f, s);
    const norm = len > 1 ? 1 / len : 1;
    model.translateZ(-6 * speed * norm * dt);
    runDino(model, time, speed, deg, dt);
  }

  const spaceDown = !!keys[" "];
  const spacePressed = spaceDown && !keys._prevSpace;
  keys._prevSpace = spaceDown;
  jumpDino(model, time, spacePressed, dt, moving);

  if (!moving) {
    turnDino(model, getYaw(), time);
  }

  const stoneDx = model.position.x - stoneMesh.position.x;
  const stoneDz = model.position.z - stoneMesh.position.z;
  nearStone =
    stoneMesh.visible && Math.hypot(stoneDx, stoneDz) < 3.5;
  if (nearStone) game.ui?.showInteraction("Harvest stone", "E");
  else game.ui?.hideInteraction();

  updateSun(sun, model);
  updateThirdPov(camera, model);
  renderer.render(scene, camera);
}
