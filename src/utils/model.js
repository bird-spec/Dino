// Easy 3D model import just import model . js, whenever needed
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function loadModel(path, x, y, z, scaleX, scaleY, scaleZ) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, z);
        if (scaleX && scaleY && scaleZ != null) {
          model.scale.set(scaleX, scaleY, scaleZ);
        }
        resolve(model);
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened", error);
        reject(error);
      },
    );
  });
}
export default loadModel;
