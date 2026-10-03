import * as THREE from 'three';

//config stuff
export const GRID_SIZE = 100;
const STORAGE_KEY = 'dino_4d_terrain_state';

//better proformance height maps
export const heightMap = new Float32Array(GRID_SIZE * GRID_SIZE);
export const biomeMap = new Uint8Array(GRID_SIZE * GRID_SIZE); // 0: Water, 1: Plains, 2: Mountain, 3: Urban Concrete


function evaluateNoise(x, z) {
    const frequency1 = 0.04;
    const frequency2 = 0.08;
    const frequency3 = 0.15;

    const octave1 = Math.sin(x * frequency1) * Math.cos(z * frequency1) * 8.0;
    const octave2 = Math.sin(x * frequency2 + 1.5) * Math.sin(z * frequency2 + 0.5) * 3.5;
    const octave3 = Math.cos(x * frequency3) * Math.sin(z * frequency3) * 1.0;

    return octave1 + octave2 + octave3;
}


export function generateBaseTerrain() {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            const index = x * GRID_SIZE + z;
            const h = evaluateNoise(x, z);
            heightMap[index] = h;

            // Biome assignment
            if (h < -1.5) {
                biomeMap[index] = 0; //water
            } else if (h > 4.5) {
                biomeMap[index] = 2; //mountain
            } else {
                biomeMap[index] = 1; //plains
            }
        }
    }
}


export function mutateTerrainForEra(era) {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            const index = x * GRID_SIZE + z;
            const baseH = heightMap[index];

            if (era === 'prehistoric') {
                //no eroded
                if (baseH >= -1.5 && baseH <= 4.5) biomeMap[index] = 1;
            }
            else if (era === 'modern') {
                //central parts flat 4 city like infrastructure
                if (x >= 30 && x <= 70 && z >= 30 && z <= 70) {
                    heightMap[index] = Math.max(0, baseH * 0.15); //makes hills flatter like 4 roads
                    biomeMap[index] = 3; //concrete
                } else {
                    //water erosion for vibes
                    heightMap[index] = baseH * 0.85;
                }
            }
            else if (era === 'post_modern') {
                //Post-apocalyptic/modern forgot if needed
                if (biomeMap[index] === 3) {
                    const crackNoise = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.8;
                    heightMap[index] += crackNoise; //concrete(cracked)
                } else {
                    //big eroision
                    heightMap[index] = baseH * 0.7;
                }
            }
        }
    }
}


export function createTerrainMesh() {
    const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const posAttribute = geometry.attributes.position;

    for (let i = 0; i < posAttribute.count; i++) {
        const x = i % GRID_SIZE;
        const z = Math.floor(i / GRID_SIZE);
        const index = x * GRID_SIZE + z;

        //dynamic height
        posAttribute.setY(i, heightMap[index]);
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x3d8c40,
        wireframe: false,
        flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "TerrainMesh";
    return mesh;
}


export function getTerrainHeight(x, z) {
    const gx = Math.min(Math.max(Math.round(x), 0), GRID_SIZE - 1);
    const gz = Math.min(Math.max(Math.round(z), 0), GRID_SIZE - 1);
    return heightMap[gx * GRID_SIZE + gz];
}


export function saveTerrainState(currentEra = 'prehistoric') {
    const payload = {
        era: currentEra,
        heights: Array.from(heightMap),
        biomes: Array.from(biomeMap),
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log(`Terrain state saved for Era: ${currentEra}`);
}

export function loadTerrainState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const data = JSON.parse(raw);
        for (let i = 0; i < data.heights.length; i++) {
            heightMap[i] = data.heights[i];
            biomeMap[i] = data.biomes[i];
        }
        console.log(`Terrain state restored: ${new Date(data.timestamp).toLocaleTimeString()}`);
        return data;
    } catch (e) {
        console.error("Failed to parse  state", e);
        return null;
    }
}