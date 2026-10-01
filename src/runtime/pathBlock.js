import * as THREE from "three";

export function spawnPathBlock(scene, x, y, z, color) {
  const geometry = new THREE.BoxGeometry(100, 0.1, 100);
  const material = new THREE.MeshStandardMaterial({ color: color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;
  cube.position.y = y;
  cube.position.z = z;
}
