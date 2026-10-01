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
//^^^^^^^ All tempoary placeholders format not finalized

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


function scatterTerrianProps(propModels, period) {
    const scatterGroup = new THREE.Group();
    if (!propModels || propModels.length === 0) return scatterGroup;

    const totalPropsToSpawn = 10;
    const dummy = new THREE.Object3D();

    //calcs(short for caluclate for anyone whos new to the stream) the y level at a position
    const getTerrainHeight = (x, z) => Math.sin(x * 0.5) * Math.cos(z * 0.5);

    //makes sure props match biome
    const availableProps = propModels.filter(p => period.props.includes(p.name));
    if (availableProps.length === 0) return scatterGroup;

    const countPerProp = Math.floor(totalPropsToSpawn / availableProps.length);

    availableProps.forEach((propData) => {
        const sourceMesh = propData.mesh || propData;

        const instancedMesh = new THREE.InstancedMesh(
            sourceMesh.geometry,
            sourceMesh.material,
            countPerProp
        );
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        for (let i = 0; i < countPerProp; i++) {
            //random grid spot
            const x = Math.random() * widthSegments;
            const z = Math.random() * heightSegments;
            const y = getTerrainHeight(x, z);

            //skip if not enough room
            if (y < -0.8) continue;

            //Random rotation
            dummy.position.set(x, y, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;

            const scale = 0.8 + Math.random() * 0.5;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        scatterGroup.add(instancedMesh);
    });

    scene.add(scatterGroup);
    return scatterGroup;
}

//ToDO: FIX THIS HORRID SPELLING!!!!
