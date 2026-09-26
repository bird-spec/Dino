//fps and stuff
import * as THREE from 'three';

let lastFrameTime = performance.now();
let fpsHistory = [];
const maxHistory = 60;
let lastUiUpdate = 0;

function CalcFPS() {
    requestAnimationFrame(CalcFPS);

    const currentTime = performance.now();

    const delta = currentTime - lastFrameTime;

    const instantaneousFps = delta > 0 ? 1000 / delta : 0;
    fpsHistory.push(instantaneousFps);
    if (fpsHistory.length > maxHistory) {
        fpsHistory.shift();
    }

    const averageFps = fpsHistory.reduce((sum, val) => sum + val, 0) / fpsHis

    if (currentTime - lastUiUpdate > 100) {
        const dropfps = Math.min(...fpsHistory);
        console.log(`FPS: ${averageFps.toFixed(2)} | Droppped FPS: ${dropfps.toFixed(2)}`);
    }
}

//yippe this should log fps