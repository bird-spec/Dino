import { hillHeight } from "./noise.js";
import * as THREE from "three";

export function buildTerrain(size, segments, seed, blocky) {
  const sheet = new THREE.PlaneGeometry(size, size, segments, segments);
  const amp = 12;
  const freq = 0.2;

  sheet.rotateX(-0.5 * Math.PI);

  const pos = sheet.getAttribute("position");

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    let sample = hillHeight(x * freq, z * freq, seed) * amp;

    if (blocky) {
      sample = Math.floor(sample / 0.1) * 0.1;
    }

    pos.setY(i, sample);
  }

  sheet.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const mesh = new THREE.Mesh(sheet, material);

  return mesh;
}
