import * as THREE from "three";

export function createSun(scene) {
  const sun = new THREE.DirectionalLight(0xfff2d9, 2.5);
  sun.position.set(50, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far = 250;
  scene.add(sun);
  scene.add(sun.target);

  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3f9b0b, 0.6));

  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfff6c9, fog: false });

  const sunObject = new THREE.Mesh(sunGeometry, sunMaterial);

  const haloGeometry = new THREE.SphereGeometry(9, 32, 32);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xffedb0,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  sunObject.add(halo);

  scene.add(sunObject);

  sunObject.position.set(sun.position.x, sun.position.y, sun.position.z);

  return { sun, sunObject };
}

export function updateSun(sun, model) {
  sun.target.position.copy(model.position);
}
