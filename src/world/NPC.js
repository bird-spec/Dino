import * as THREE from 'three';
import loadModel from "../utils/model.js";
import Finding from "../utils/find.js";
import { pathfind } from "../utils/pathfind.js";
import { QUESTS } from '../game/data/quests.js';
import { ITEMS } from '../game/core/items.js';
import { EVENTS } from '../game/core/events.js';

const scene = new THREE.Scene();

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 256;

const npcRegistry = {};


export function SpeechBubble(text, name) {
    context.fillStyle = '#f1b676';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '36px Arial';
    context.fillStyle = '#2c2c2c';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw NPC Name and Text
    context.fillText(`${name}:`, canvas.width / 2, canvas.height / 3);
    context.font = '28px Arial';
    context.fillText(text, canvas.width / 2, (canvas.height / 3) * 2);
}


export function spawnNPC(name, x, y, z, scaleX, scaleY, scaleZ, questIds = [], shopItems = []) {
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(1, 1, 1);
    const npc = new THREE.Mesh(geometry, material);

    npc.position.set(x, y, z);
    npc.scale.set(scaleX, scaleY, scaleZ);
    npc.name = name;
    scene.add(npc);

    //register npc
    npcRegistry[name] = {
        mesh: npc,
        quests: questIds.map(id => QUESTS[id]).filter(Boolean),
        activeQuestIndex: 0,
        shopInventory: shopItems.map(id => ITEMS[id]).filter(Boolean)
    };

    return npc;
}

export function PathFind(NPC, target, getTerrainData = null) {
    const targetCoords = Finding(target);
    let NPCcoords = Finding(NPC);

    if (!targetCoords || !NPCcoords) {
        console.log("NPC or target not found");
        return [];
    }

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

export function Attack(NPC, targetID) {
    const npc = scene.getObjectByName(NPC);
    const target = scene.getObjectByName(targetID);

    if (!npc || !target) return;

    //faces targer
    npc.lookAt(target.position);
    //ill add actgual attacking later
}

export function Move(NPC, direction, distance) {
    const npc = scene.getObjectByName(NPC);
    if (!npc) return;

    if (direction === "X") {
        npc.position.x += distance;
    }
    if (direction === "Y") {
        npc.position.y += distance;
    }
    if (direction === "Z") {
        npc.position.z += distance;
    }
}


export function Shop(NPCName, playerInventory = [], itemToBuyId = null) {
    const npcData = npcRegistry[NPCName];
    if (!npcData) {
        console.warn(`Shop: NPC ${NPCName} not found`);
        return;
    }

    if (npcData.shopInventory.length === 0) {
        SpeechBubble("I have nothing to trade.", NPCName);
        return;
    }

    //items 2 buy from npc
    if (!itemToBuyId) {
        const itemNames = npcData.shopInventory.map(item => item.name).join(', ');
        SpeechBubble(`Wares: ${itemNames}`, NPCName);
        return npcData.shopInventory;
    }

    // purchase
    const item = ITEMS[itemToBuyId];
    if (item && npcData.shopInventory.includes(item)) {
        playerInventory.push(item);
        SpeechBubble(`Here is your ${item.name}!`, NPCName);
        console.log(`[EVENT: ${EVENTS.ITEM_ADDED}] Player bought ${item.name}`);
        return true;
    } else {
        SpeechBubble("I don't have that item.", NPCName);
        return false;
    }
}


export function InteractQuest(NPCName, playerState = { quests: [], inventory: [] }) {
    const npcData = npcRegistry[NPCName];
    if (!npcData || npcData.quests.length === 0) {
        SpeechBubble("Hello choom!", NPCName);
        return;
    }

    const currentQuest = npcData.quests[npcData.activeQuestIndex];

    if (!currentQuest) {
        SpeechBubble("Im all out of task for you", NPCName);
        return;
    }

    // checks 4 quest
    const playerQuest = playerState.quests.find(q => q.id === currentQuest.id);

    if (!playerQuest) {
        //give quest
        playerState.quests.push({ ...currentQuest, completed: false });
        SpeechBubble(`Quest: ${currentQuest.title}!`, NPCName);
        console.log(`[EVENT: ${EVENTS.INTERACTION_USED}] Accepted quest: ${currentQuest.title}`);
    } else if (!playerQuest.completed) {
        //remind player
        const objective = currentQuest.objectives[0];
        SpeechBubble(`Bring me ${objective.target} ${objective.id}!`, NPCName);
    } else {
        //complete Quest + give rewards
        SpeechBubble(`Thank you! Take your reward.`, NPCName);
        if (currentQuest.rewards.items) {
            Object.keys(currentQuest.rewards.items).forEach(itemId => {
                if (ITEMS[itemId]) playerState.inventory.push(ITEMS[itemId]);
            });
        }
        npcData.activeQuestIndex++;
    }
}