import * as THREE from 'three';
import loadModel from "../utils/model.js";
import Finding from "../utils/find.js";
import {pathfind} from "../utils/pathfind.js";
const scene = new THREE.Scene();

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

function spawnNPC(name, x, y, z, scaleX, scaleY, scaleZ) { // need to add model here
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

export function PathFind(NPC, target, getTerrainData = null) {
    const targetCoords = Finding(target);
    let NPCcoords = Finding(NPC);

    if (!targetCoords || !NPCcoords) {
        console.warn(`missing coords for NPC (${NPC}) / target (${target})`);
        return [];
    }

    //1 world unit = 1 cell(may need to change this layer)
    const startX = Math.round(NPCcoords.x);
    const startY = Math.round(NPCcoords.y);
    const endX = Math.round(targetCoords.x);
    const endY = Math.round(targetCoords.y);

    const zLevel = NPCcoords.z !== undefined ? NPCcoords.z : 0;

    let obstacleCallback = null;
    let costCallback = null;

    if (getTerrainData) {
        obstacleCallback = (x, y) => {
            const data = getTerrainData(x, y);
            return data ? data.isObstacle : false;
        };

        costCallback = (x, y) => {
            const data = getTerrainData(x, y);
            return data ? data.cost : 1;
        };
    }

    const rawPath = pathfind(
        startX,
        startY,
        endX,
        endY,
        zLevel,
        obstacleCallback,
        costCallback
    );

    const calculatedPath = rawPath.map(node => ({
        x: node.x,
        y: node.y,
        z: node.z !== undefined ? node.z : zLevel,
        f: node.f,
        g: node.g
    }));

    return calculatedPath;
}

function Attack(){}

function Move(NPC, direction, distance){// direction needs to be X Y or Z!!! string no spaces!
    // negative = opposite for anyone who needs this
    const npc = scene.getObjectByName(NPC);
    if (direction === "X") {
        npc.position.x += distance;
    }
    if (direction === "Y") {
        npc.position.y += distance;
    }
    if (direction === "Z") { // z probably will never be used but can work for jumping
        npc.position.z += distance;
    }
}

function Shop(){}// this should use speech bubble partly

