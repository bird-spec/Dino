import * as THREE from 'three';

export const rain = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffff }) // temp
);

export const dust = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffff }) // temp
);
//pretty sure export stuff doesnt work but im too lazy to change my code up till later so suck it
