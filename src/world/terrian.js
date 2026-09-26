import * as THREE from "three";
import loadModel from "../utils/model.js";


const widthSegments = 100;
const heightSegments = 100;
const geometry = new THREE.BufferGeometry();

const vertices = [];
for (let x = 0; x <= widthSegments; x++) {
    for (let z = 0; z <= heightSegments; z++) {
        const y = Math.sin(x * 0.5) * Math.cos(z * 0.5);
        vertices.push(x, y, z);
    }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

