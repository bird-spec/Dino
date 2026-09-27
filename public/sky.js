import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
const scene = new THREE.Scene();
// lighting + sky of the app

// cav ended up making the sun, rename this file and merge them later.
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);