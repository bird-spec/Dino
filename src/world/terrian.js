import * as THREE from "three";
import loadModel from "../utils/model.js";
const scene = new THREE.Scene();
//TODO remove new scene in prod/not testing!!!!!!
//GOES FOR ALL MI FILES


const widthSegments = 100;
const heightSegments = 100;
const geometry = new THREE.BufferGeometry();


const prehistoric = {
    "name": "prehistoric",
    "depth": 100,
    "peaks": 100,
    "palete": ["blue","orange","red"],
    "props": ["prop1","prop2","prop3"]
}

const iceAge = {
    "name": "prehistoric",
    "depth": 100,
    "peaks": 100,
    "palete": ["blue","orange","red"],
    "props": ["prop1","prop2","prop3"]
}

const modern = {
    "name": "prehistoric",
    "depth": 100,
    "peaks": 100,
    "palete": ["blue","orange","red"],
    "props": ["prop1","prop2","prop3"]
}

const postModern = {
    "name": "prehistoric",
    "depth": 100,
    "peaks": 100,
    "palete": ["blue","orange","red"],
    "props": ["prop1","prop2","prop3"]
}
//^^^^^^^ All tempoary placeholders

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
//fix/edit old test code above ^^


function scatterTerrianProps(propModels,period){// each model should = {"prop": wtv "biome":"wtv"}
    //need to make various rules for generation + random

}

//ToDO: FIX THIS HORRID SPELLING!!!!