// Easy 3D model import just import model . js, whenever needed
import * as THREE from "three";
import {GLTFLoader} from "three/addons";

const scene = new THREE.Scene();
const loader = new GLTFLoader();

function loadModel(path, x,y,z, scaleX,scaleY,scaleZ) {
    loader.load(path, (gltf) => {
        gltf.scene.position.set(x,y,z);
        scene.add(gltf.scene);
        if (scaleX && scaleY && scaleZ != null) {
            gltf.scene.scale.set(scaleX,scaleY,scaleZ);
        }

    },
         function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
        (error) => {
        console.error('An error happened', error);
        });
}
export default loadModel;