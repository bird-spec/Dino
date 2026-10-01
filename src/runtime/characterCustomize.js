import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { spawnCharacter } from "./character.js";

function paintPart(model, keywords, color) {
  if (!model) return;
  model.traverse((o) => {
    if (!o.isMesh) return;
    const n = (o.name || "").toLowerCase();
    if (keywords.some((k) => n.includes(k))) o.material.color.set(color);
  });
}

function row(labelText, initial, onPick) {
  const h = document.createElement("h5");
  h.textContent = labelText + " ";
  const input = document.createElement("input");
  input.type = "color";
  input.value = initial;
  input.addEventListener("input", () => onPick(input.value));
  h.appendChild(input);
  return h;
}

export default function customizeCharacter() {
  const panel = document.createElement("div");
  panel.id = "customization-panel";
  panel.style.cssText =
    "position:fixed;top:20px;right:20px;z-index:10;background:#111;color:#fff;padding:12px;border-radius:10px;font-family:sans-serif;";

  const box = document.createElement("div");
  box.id = "3d-box";
  box.style.cssText =
    "width:300px;height:260px;background:#222;border-radius:8px;overflow:hidden;";
  panel.appendChild(box);

  const title = document.createElement("h4");
  title.textContent = "Customize your character (R to close)";
  panel.appendChild(title);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));

  const camera = new THREE.PerspectiveCamera(40, 300 / 260, 0.1, 100);
  camera.position.set(0, 7.5, 13);
  camera.lookAt(0, 6.3, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(300, 260);
  box.appendChild(renderer.domElement);

  let previewModel = null;
  let targetYaw = Math.PI;
  spawnCharacter("preview", 0, 5.2, 0, 1, scene).then((m) => {
    previewModel = m;
    previewModel.rotation.y = Math.PI;
  });

  box.addEventListener("mousemove", (e) => {
    const r = box.getBoundingClientRect();
    targetYaw = Math.PI + (((e.clientX - r.left) / r.width) * 2 - 1) * 0.9;
  });

  renderer.setAnimationLoop((time) => {
    if (previewModel) {
      previewModel.rotation.y += (targetYaw - previewModel.rotation.y) * 0.1;
    }
    renderer.render(scene, camera);
  });

  panel.appendChild(
    row("Eyes: ", "#000000", (c) => paintPart(previewModel, ["eye"], c)),
  );
  panel.appendChild(
    row("Hands: ", "#86efac", (c) => paintPart(previewModel, ["hand"], c)),
  );
  panel.appendChild(
    row("Legs: ", "#16a34a", (c) => paintPart(previewModel, ["leg"], c)),
  );
  panel.appendChild(
    row("Body: ", "#4ade80", (c) =>
      paintPart(previewModel, ["body", "head"], c),
    ),
  );
  panel.appendChild(
    row("Tail: ", "#22c55e", (c) => paintPart(previewModel, ["tail"], c)),
  );

  return panel;
}
