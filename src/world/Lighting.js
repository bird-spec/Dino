import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
const scene = new THREE.Scene();
// lighting + sky of the app

const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.castShadow = true;
sunlight.position.set(10, 10, 10); // temp likely too close!!!
scene.add(sunlight);


const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);