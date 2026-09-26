// how many objects/movements  the browser can handle
import * as THREE from 'three';
import CalcFPS from "./stats.js";
import scene from "three/addons/offscreen/scene.js";

function stressTest() {
    for (let i = 0; i < 10; i++){
            scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)));
            console.log("FPS and fps drop if here: "+CalcFPS)
    }
    console.log("100 boxes added")
    if( CalcFPS > 30) {
        for (let i = 0; i < 900; i++){
            scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)));
            console.log("FPS and fps drop if here: "+CalcFPS)
        }
        console.log("1000 boxes")
    }
}

