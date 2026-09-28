import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsml/loaders/GLTFLoader.js";
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
}
