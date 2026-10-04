import { cameraSettings } from "./camera.js";

export const settings = {
  viewDistance: Number(localStorage.getItem("dino4d:viewDistance") ?? 200),
};

export function applyViewDistance(scene, value) {
  settings.viewDistance = Math.min(400, Math.max(50, Math.round(value)));
  localStorage.setItem("dino4d:viewDistance", String(settings.viewDistance));
  if (scene.fog) {
    scene.fog.near = settings.viewDistance * 0.5;
    scene.fog.far = settings.viewDistance;
  }
  return settings.viewDistance;
}

export function openSettingsPanel(scene) {
  const old = document.getElementById("settings-panel");
  if (old) {
    old.remove();
    return false;
  }
  const panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.style.cssText =
    "position:fixed; top:20px; right:20px; z-index:10; background:#111; color:#fff; padding:12px; border-radius: 10px; font-family:sans-serif; width:240px";
  const title = document.createElement("h4");
  title.textContent = "Settings (O to close)";
  panel.appendChild(title);
  const label = document.createElement("div");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "50";
  slider.max = "400";
  slider.step = "10";
  slider.value = String(settings.viewDistance);
  slider.style.width = "100%";
  const show = () => {
    label.textContent = `View Distance: ${slider.value}`;
  };
  slider.addEventListener("input", () => {
    applyViewDistance(scene, Number(slider.value));
    show();
  });
  show();
  panel.appendChild(label);
  panel.appendChild(slider);
  const sLabel = document.createElement("div");
  const sSlider = document.createElement("input");
  sSlider.type = "range";
  sSlider.min = "0.0005";
  sSlider.max = "0.006";
  sSlider.step = "0.0005";
  sSlider.value = String(cameraSettings.sensitivity);
  sSlider.style.width = "100%";
  const sShow = () => {
    sLabel.textContent = `Mouse sensitivity: ${sSlider.value}`;
  };
  sSlider.addEventListener("input", () => {
    cameraSettings.sensitivity = Number(sSlider.value);
    localStorage.setItem("dino4d:sensitivity", sSlider.value);
    sShow();
  });
  sShow();
  panel.appendChild(sLabel);
  panel.appendChild(sSlider);
  document.body.appendChild(panel);
  return true;
}
