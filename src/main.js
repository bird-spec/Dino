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
import { ChunkManager } from "./world/chunks.js";
import { settings, openSettingsPanel } from "./runtime/settings.js";
import { ScatterManager } from "./game/nodes.js";
import { spawnNpc, animateNpc } from "./game/npcs.js";
import { DustPuffs } from "./utils/dust.js";

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

const scatter = new ScatterManager(scene, game);
game.scatter = scatter;
const dust = new DustPuffs(scene);
const elara = await spawnNpc(scene, {
  path: "/models/elara.glb",
  x: 12,
  z: 6,
  scale: 2,
  name: "elara",
});
let nearTarget = null;
let beepCtx = null;
let beepedThisJump = false;
function beep() {
  beepCtx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (beepCtx.state === "suspended") void beepCtx.resume();
  const o = beepCtx.createOscillator();
  const g = beepCtx.createGain();
  o.type = "square";
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.15, beepCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, beepCtx.currentTime + 0.09);
  o.connect(g);
  g.connect(beepCtx.destination);
  o.start();
  o.stop(beepCtx.currentTime + 0.1);
}

console.log(model);

const geometry = new THREE.BoxGeometry(100, 10, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x3f9b0b });

const chunkManager = new ChunkManager(scene);
chunkManager.update(0, 0, settings.viewDistance);
scene.fog = new THREE.Fog(
  0x87ceeb,
  settings.viewDistance * 0.5,
  settings.viewDistance,
);

scene.background = new THREE.Color(0x87ceeb);

let lastTime = 0;
renderer.setAnimationLoop(animate);
document.getElementById("boot-loader")?.remove();

const keys = {};
addEventListener("keydown", (e) => {
  if (e.code === "Space") e.preventDefault();
  keys[e.key.toLowerCase()] = true;
});
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key.toLowerCase() !== "e" || !nearTarget) return;
  try {
    game.interaction.interact(nearTarget.interactId);
    const left = game.resources.getNode(nearTarget.nodeId).quantity;
    const got = nearTarget.prompt.replace("Harvest ", "");
    game.ui?.notify(
      left > 0 ? `+1 ${got}` : `${got} depleted`,
      left > 0 ? "success" : "info",
    );
    if (left <= 0) {
      scatter.vanish(nearTarget);
      nearTarget = null;
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
  if (e.key.toLowerCase() === "o") {
    const old = document.getElementById("customization-panel");
    if (old) old.remove();
    if (document.exitPointerLock) document.exitPointerLock();
    openSettingsPanel(scene);
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

let chunkTimer = 0;
function animate(time) {
  const dt = Math.min(
    0.05,
    Math.max(0.0001, (time - lastTime) / 1000 || 1 / 60),
  );
  lastTime = time;

  if (game.ui?.paused) {
    renderer.render(scene, camera);
    return;
  }

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
    model.translateZ(-9 * speed * norm * dt);
    runDino(model, time, speed, deg, dt);
  }

  const spaceDown = !!keys[" "];
  const spacePressed = spaceDown && !keys._prevSpace;
  keys._prevSpace = spaceDown;
  jumpDino(model, time, spacePressed, dt, moving);

  if (!model.userData.isFlying) beepedThisJump = false;
  else if (!beepedThisJump) {
    for (const it of scatter.live) {
      if (!it.isCactus || !it.mesh.visible) continue;
      const cd = Math.hypot(
        it.mesh.position.x - model.position.x,
        it.mesh.position.z - model.position.z,
      );
      if (cd < 1.6) {
        beep();
        beepedThisJump = true;
        break;
      }
    }
  }

  if (!moving) {
    turnDino(model, getYaw(), time);
  }

  if (model.position.y < -20) {
    model.position.set(0, 60, 0);
    model.userData.vy = 0;
    model.userData.isFlying = true;
    game.ui?.notify("TIMELINE RESTORED", "info");
  }

  nearTarget = scatter.nearest(model.position.x, model.position.z, 3.5);
  if (nearTarget) game.ui?.showInteraction(nearTarget.prompt, "E");
  else game.ui?.hideInteraction();

  dust.tick(dt, {
    moving,
    grounded: !model.userData.isFlying,
    x: model.position.x,
    y: model.position.y - (model.userData.footOffset ?? 1),
    z: model.position.z,
  });

  chunkTimer += dt;
  if (chunkTimer > 0.5) {
    chunkTimer = 0;
    chunkManager.update(
      model.position.x,
      model.position.z,
      settings.viewDistance,
    );
    scatter.update(model.position.x, model.position.z);
  }

  animateNpc(elara, model, time);
  updateSun(sun, model);
  updateThirdPov(camera, model);
  renderer.render(scene, camera);
}
