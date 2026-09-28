import * as THREE from 'three';

const rainCount = 8000;
const dustCount = 2500;
const bounds = { x: 120, y: 80, z: 120 }; // temp values

const atomospherePalete = {
    day: {
        fog: new THREE.Color(0xb1c8d7),
        dust: new THREE.Color(0xfff5ea),
        fogDensity: 0.008
    },
    dusk: {
        fog: new THREE.Color(0xcc5a37),
        dust: new THREE.Color(0xffaa55),
        fogDensity: 0.018
    },
    night: {
        fog: new THREE.Color(0x050814),
        dust: new THREE.Color(0x446688),
        fogDensity: 0.035
    }
};

const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = new Float32Array(rainCount);

for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3]     = (Math.random() - 0.5) * bounds.x;
    rainPositions[i * 3 + 1] = Math.random() * bounds.y;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;

    //varying  speed per drop
    rainVelocities[i] = 1.2 + Math.random() * 0.8;
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
    color: 0x99ccff,
    size: 0.35,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

export const rain = new THREE.Points(rainGeometry, rainMaterial);

const dustGeometry = new THREE.BufferGeometry();
const dustPositions = new Float32Array(dustCount * 3);
const dustOffsets = new Float32Array(dustCount); // For floating oscillation math

for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3]     = (Math.random() - 0.5) * bounds.x;
    dustPositions[i * 3 + 1] = Math.random() * (bounds.y * 0.6);
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;

    dustOffsets[i] = Math.random() * Math.PI * 2;
}

dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

const dustMaterial = new THREE.PointsMaterial({
    color: atomospherePalete.day.dust,
    size: 0.25,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

export const dust = new THREE.Points(dustGeometry, dustMaterial);

export const sceneFog = new THREE.FogExp2(
    atomospherePalete.day.fog.getHex(),
    atomospherePalete.day.fogDensity
);


export function updateEnvironment(scene, centerPos = new THREE.Vector3(0, 0, 0), delta = 0.016, timeOfDay = 0.25) {
    if (scene && scene.fog !== sceneFog) {
        scene.fog = sceneFog;
    }

    const rainPosAttr = rain.geometry.attributes.position;
    const rainArray = rainPosAttr.array;

    for (let i = 0; i < rainCount; i++) {
        const yIndex = i * 3 + 1;
        rainArray[yIndex] -= rainVelocities[i] * (delta * 60);

        if (rainArray[yIndex] < 0) {
            rainArray[i * 3]     = centerPos.x + (Math.random() - 0.5) * bounds.x;
            rainArray[yIndex]     = centerPos.y + bounds.y * 0.8;
            rainArray[i * 3 + 2] = centerPos.z + (Math.random() - 0.5) * bounds.z;
        }
    }
    rainPosAttr.needsUpdate = true;

    const dustPosAttr = dust.geometry.attributes.position;
    const dustArray = dustPosAttr.array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < dustCount; i++) {
        const xIndex = i * 3;
        const yIndex = i * 3 + 1;

        dustArray[yIndex] += Math.sin(time + dustOffsets[i]) * 0.015;
        dustArray[xIndex] += Math.cos(time + dustOffsets[i]) * 0.008;

        if (Math.abs(dustArray[xIndex] - centerPos.x) > bounds.x * 0.5) {
            dustArray[xIndex] = centerPos.x + (Math.random() - 0.5) * bounds.x;
        }
    }
    dustPosAttr.needsUpdate = true;

    let targetFogColor = atomospherePalete.day.fog;
    let targetDustColor = atomospherePalete.day.dust;
    let targetDensity = atomospherePalete.day.fogDensity;

    if (timeOfDay >= 0.45 && timeOfDay < 0.65) {
        //transin to Dusk
        const factor = (timeOfDay - 0.45) / 0.20;
        targetFogColor = atomospherePalete.day.fog.clone().lerp(atomospherePalete.dusk.fog, factor);
        targetDustColor = atomospherePalete.day.dust.clone().lerp(atomospherePalete.dusk.dust, factor);
        targetDensity = THREE.MathUtils.lerp(atomospherePalete.day.fogDensity, atomospherePalete.dusk.fogDensity, factor);
    } else if (timeOfDay >= 0.65 || timeOfDay < 0.1) {
        //trans into / Night
        const factor = timeOfDay >= 0.65 ? (timeOfDay - 0.65) / 0.25 : 1.0;
        targetFogColor = atomospherePalete.dusk.fog.clone().lerp(atomospherePalete.night.fog, factor);
        targetDustColor = atomospherePalete.dusk.dust.clone().lerp(atomospherePalete.night.dust, factor);
        targetDensity = THREE.MathUtils.lerp(atomospherePalete.dusk.fogDensity, atomospherePalete.night.fogDensity, factor);
    }

    sceneFog.color.lerp(targetFogColor, 0.05);
    sceneFog.density = THREE.MathUtils.lerp(sceneFog.density, targetDensity, 0.05);
    dustMaterial.color.lerp(targetDustColor, 0.05);
}