import { hillHeight } from "./noise.js";
import * as THREE from "three";

export function buildTerrain(size, segments, seed, blocky) {
  const amp = 100;
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

    for (let ix = 0; ix < n; ix++) {
      for (let iz = 0; iz < n; iz++) {
        const wx = -size / 2 + ix * blockSize + blockSize / 2;
        const wz = -size / 2 + iz * blockSize + blockSize / 2;

        const h = hillHeight(wx * freq, wz * freq, seed) * amp;

        const sh = Math.floor(h / blockSize) * blockSize;

        dummy.position.set(wx, sh, wz);

        dummy.updateMatrix();

        holder.setMatrixAt(ix * n + iz, dummy.matrix);
      }
    }
    holder.instanceMatrix.needsUpdate = true;
    holder.castShadow = true;
    holder.receiveShadow = true;

    return holder;
  }
}
