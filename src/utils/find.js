import * as THREE from "three";
import scene from "three/addons/offscreen/scene.js";
//Tool to find X Y Z of an object(NPCs) so camera can focus on them

function Find(objectID) {
    const object = scene.getObjectByName(objectID);
    if (object) {
        const target = new THREE.Vector3();
        object.getWorldPosition(target);
        return target;
    }
}

export default Find;