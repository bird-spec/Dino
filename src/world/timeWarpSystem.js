import * as THREE from 'three';
import { EVENTS } from '../game/core/events.js';
import { ValidationError } from "../game/core/errors.js";
import { assertNonEmptyString } from "../game/core/utils.js";

const VALID_PHASES = new Set([
    'idle',
    'charging',
    'arrival',
    'complete'
]);


export class TimeWarpEngine {
    constructor({
        scene,
        camera,
        state,
        eventBus,
        eraSystem,
        duration = 3.0
    }) {
        this.state = state;
        this.eventBus = eventBus;
        this.eraSystem = eraSystem;
        this.hooks = new Map();

        this.scene = scene;
        this.camera = camera;
        this.duration = duration;

        this.isWarping = false;
        this.warpProgress = 0;
        this.hasSwapped = false;

        this.baseFOV = camera.fov;

        const overlayGeo = new THREE.PlaneGeometry(10, 10);
        this.overlayMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0,
            depthTest: false,
            depthWrite: false
        });

        this.overlayMesh = new THREE.Mesh(overlayGeo, this.overlayMat);
        this.overlayMesh.position.z = -0.5; // Lock in front of camera lens
        this.camera.add(this.overlayMesh);
        this.scene.add(this.camera);

        this.particleCount = 500;
        const particleGeo = new THREE.BufferGeometry();
        this.particlePositions = new Float32Array(this.particleCount * 3);
        this.particleVelocities = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            this.resetParticle(i);
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

        this.particleMat = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.15,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particleGeo, this.particleMat);
        this.scene.add(this.particles);
    }

    registerHook(name, callback) {
        assertNonEmptyString(name, 'hook name');

        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function.');
        }
        if (!this.hooks.has(name)) {
            this.hooks.set(name, new Set());3
        }

        this.hooks.get(name).add(callback);

        return () => {
            this.hooks.get(name)?.delete(callback);
        };
    }

    getState() {
        return this.state.read((state) => ({
            ...state.hyperspace
        }));
    }

    setPhase(phase) {
        assertNonEmptyString(phase, 'phase');

        if (!VALID_PHASES.has(phase)) {
            throw new ValidationError(`Invalid hyperspace phase: ${phase}.`);
        }

        const previous = this.getState().phase;

        this.state.mutate(
            'hyperspace.phase',
            (state) => {
                state.hyperspace.phase = phase;
            },
            {
                eventType: EVENTS.HYPERSPACE_PHASE_CHANGED,
                payload: { previous, phase }
            }
        );

        this._runHooks('onPhaseChange', { previous, phase });
        return this.getState();
    }

    _runHooks(name, payload) {
        for (const callback of this.hooks.get(name) ?? []) {
            try {
                callback(payload);
            } catch (error) {
                this.eventBus.emit(EVENTS.ERROR, {
                    source: `hyperspace: ${name}`,
                    error
                });
            }
        }
    }

    enter({
        destination = 'unknown',
        source = 'gameplay',
        onMidpointSwap = null
    } = {}) {
        assertNonEmptyString(destination, 'destination');

        if (this.getState().active || this.isWarping) {
            throw new ValidationError('Already in hyperspace.');
        }

        this.eraSystem.unlock('hyperspace', { reason: 'hyperspace_enter' });

        this.state.mutate(
            'hyperspace.enter',
            (state) => {
                state.hyperspace.active = true;
                state.hyperspace.phase = 'charging';
                state.hyperspace.destination = destination;
                state.hyperspace.transitCount += 1;
            },
            {
                eventType: EVENTS.HYPERSPACE_ENTERED,
                payload: { destination, source }
            }
        );

        this._runHooks('onEnter', { destination, source });

        this.isWarping = true;
        this.warpProgress = 0;
        this.hasSwapped = false;
        this.onMidpointSwap = onMidpointSwap;
        this.particles.position.copy(this.camera.position);

        return this.getState();
    }

    exit({ success = true, source = 'gameplay' } = {}) {
        if (!this.getState().active) {
            return this.getState();
        }

        const previous = this.getState();

        this.state.mutate(
            'hyperspace.exit',
            (state) => {
                state.hyperspace.active = false;
                state.hyperspace.phase = success ? 'complete' : 'idle';
            },
            {
                eventType: EVENTS.HYPERSPACE_EXITED,
                payload: { success, source, previous }
            }
        );

        this._runHooks('onExit', { success, source, previous });
        return this.getState();
    }

    resetParticle(i) {
        const i3 = i * 3;
        const radius = 10 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;

        this.particlePositions[i3] = radius * Math.cos(theta) * Math.cos(phi);
        this.particlePositions[i3 + 1] = radius * Math.sin(phi);
        this.particlePositions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

        this.particleVelocities[i3] = -this.particlePositions[i3] * 0.5;
        this.particleVelocities[i3 + 1] = -this.particlePositions[i3 + 1] * 0.5;
        this.particleVelocities[i3 + 2] = -this.particlePositions[i3 + 2] * 0.5;
    }


    update(deltaTime = 0.016) {
        if (!this.isWarping) return;

        this.warpProgress += deltaTime / this.duration;
        const t = Math.min(this.warpProgress, 1.0);

        if (t < 0.5) {
            const intensity = t * 2; //norm

            this.camera.fov = THREE.MathUtils.lerp(this.baseFOV, 110, intensity);
            this.camera.updateProjectionMatrix();

            this.camera.rotation.z = (Math.random() - 0.5) * 0.08 * intensity;
            this.camera.rotation.x += (Math.random() - 0.5) * 0.05 * intensity;

            this.overlayMat.opacity = intensity;
            this.particleMat.opacity = intensity;
        }

        if (t >= 0.5 && !this.hasSwapped) {
            this.hasSwapped = true;
            this.setPhase('arrival');

            if (this.onMidpointSwap) {
                this.onMidpointSwap(this.getState().destination);
            }
        }

        if (t >= 0.5) {
            const recovery = (t - 0.5) * 2; //0/1 norm

            this.camera.fov = THREE.MathUtils.lerp(110, this.baseFOV, recovery);
            this.camera.updateProjectionMatrix();

            this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0, recovery);

            this.overlayMat.opacity = 1.0 - recovery;
            this.particleMat.opacity = 1.0 - recovery;
        }

        const posAttr = this.particles.geometry.attributes.position;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            posAttr.array[i3] += this.particleVelocities[i3] * deltaTime;
            posAttr.array[i3 + 1] += this.particleVelocities[i3 + 1] * deltaTime;
            posAttr.array[i3 + 2] += this.particleVelocities[i3 + 2] * deltaTime;
        }
        posAttr.needsUpdate = true;

        if (t >= 1.0) {
            this.isWarping = false;

            //Reset cam
            this.camera.fov = this.baseFOV;
            this.camera.rotation.z = 0;
            this.camera.updateProjectionMatrix();
            this.overlayMat.opacity = 0;
            this.particleMat.opacity = 0;

            //Reset Particles
            for (let i = 0; i < this.particleCount; i++) {
                this.resetParticle(i);
            }

            //exit state
            this.exit({ success: true });
        }
    }
}

//haka time has been frozen at 14m for like past 4 hours
//HELPPPPPPP