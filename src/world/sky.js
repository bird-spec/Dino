import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {createSun} from "./sun.js";
const scene = new THREE.Scene(); //need to remove these later

//change sky if needed later
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = createSun(scene);
const moon = new THREE.PointLight(0xffffff, 0.5);
const orbitRadius = 10;
const orbitSpeed = 0.005;
let orbitAngle = 0;

export function orbits(sun, moon,sky,deltaTime){
    orbitAngle += deltaTime * orbitSpeed;

    const sunX = Math.cos(orbitAngle) * orbitRadius;
    const sunY = Math.sin(orbitAngle) * orbitRadius;

    sun.position.set(sunX, sunY, 0);

    const moonAngle = orbitAngle + Math.PI;
    const moonX = Math.cos(moonAngle) * orbitRadius;
    const moonY = Math.sin(moonAngle) * orbitRadius;

    moon.position.set(moonX, moonY, 0);

    if (sky && sky.material.uniforms['exposure']) {
        const sunHeight = sunY / orbitRadius;

        //darkens when sun is lower/horizon based
        sky.material.uniforms['exposure'].value = Math.max(0.01, Math.min(0.5, (sunHeight + 0.2) * 0.5));
    }
}