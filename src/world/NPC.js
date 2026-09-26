import * as THREE from 'three';
import loadModel from "../utils/model.js";
import Finding from "../utils/find.js";
import scene from "three/addons/offscreen/scene.js";

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 256;
function SpeechBubble(text,name) {
    context.fillStyle = '#f1b676';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '48px Arial';
    context.fillStyle = '#2c2c2c';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name+":"+text, canvas.width / 2, canvas.height / 2); // ugly fix this later
}

function spawnNPC(name, x, y, z, scaleX, scaleY, scaleZ) {
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.PlaneGeometry(1, 1, 1);
    const npc = new THREE.Mesh(geometry, material);
    //Change stuff above when models work again temp stuff
    npc.position.set(x, y, z);
    npc.scale.set(scaleX, scaleY, scaleZ);
    npc.name = name;
    scene.add(npc);
    return npc;
}

function PathFind(NPC, target){//NPC = ID to npc same w/ target
    //im thinking A*, perfect time to learn this algo!
    // i hate algorithms
    const targetCoords = Finding(target);
    let NPCcoords = Finding(NPC);

}

function Attack(){}

function Move(NPC, direction, distance){
    const npc = scene.getObjectByName(NPC);
}

function Shop(){}// this should use speech bubble partly