import * as THREE from 'three';

// lighting + sky of the app

const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.castShadow = true;
sunlight.position.set(10, 10, 10); // temp likely too close!!!

export default sunlight;


