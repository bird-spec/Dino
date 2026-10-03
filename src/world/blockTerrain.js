import { hillHeight } from "./noise.js";
import * as THREE from "three";

export function buildTerrain(size, segments, seed, blocky) {
  const amp = 12;
  const freq = 0.2;

  if (!blocky) {
    const sheet = new THREE.PlaneGeometry(size, size, segments, segments);

    sheet.rotateX(-0.5 * Math.PI);

    const pos = sheet.getAttribute("position");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let sample = hillHeight(x * freq, z * freq, seed) * amp;

      pos.setY(i, sample);
    }

    sheet.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
    const mesh = new THREE.Mesh(sheet, material);
    mesh.receiveShadow = true;
    return mesh;
  } else {
    const blockSize = 0.5;
    const cube = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const material = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });

    const n = Math.floor(size / blockSize);

    const holder = new THREE.InstancedMesh(cube, material, n * n);
    const dummy = new THREE.Object3D();
    let used = 0;

    for (let iz = 0; iz < n; iz++) {
      const wz = -size / 2 + iz * blockSize + blockSize / 2;
      let ix = 0;

      while (ix < n) {
        const wxStart = -size / 2 + ix * blockSize + blockSize / 2;
        const hStart = hillHeight(wxStart * freq, wz * freq, seed) * amp;
        const sh = Math.floor(hStart / blockSize) * blockSize;

        let runLen = 1;
        while (ix + runLen < n) {
          const wxNext = -size / 2 + (ix + runLen) * blockSize + blockSize / 2;
          const hNext = hillHeight(wxNext * freq, wz * freq, seed) * amp;
          const shNext = Math.floor(hNext / blockSize) * blockSize;
          if (shNext !== sh) break;
          runLen++;
        }

        const centerX = -size / 2 + ix * blockSize + (runLen * blockSize) / 2;
        dummy.position.set(centerX, sh, wz);
        dummy.scale.set(runLen, 1, 1);
        dummy.updateMatrix();
        holder.setMatrixAt(used, dummy.matrix);
        used++;

        ix += runLen;
      }
    }

    holder.count = used;
    holder.instanceMatrix.needsUpdate = true;
    holder.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    holder.castShadow = false;
    holder.receiveShadow = true;

    return holder;
  }
}
