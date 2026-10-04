import * as THREE from "three";

const DUST_N = 60;

export class DustPuffs {
  constructor(scene) {
    this.positions = new Float32Array(DUST_N * 3);
    this.velocities = new Float32Array(DUST_N * 3);
    this.life = new Float32Array(DUST_N);
    this.cursor = 0;
    this.timer = 0;

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );
    this.points = new THREE.Points(
      this.geometry,
      new THREE.PointsMaterial({
        color: 0xcbb98a,
        size: 0.18,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  puff(x, y, z) {
    for (let i = 0; i < 6; i++) {
      const k = this.cursor;
      this.cursor = (this.cursor + 1) % DUST_N;
      this.positions[k * 3] = x + (Math.random() - 0.5) * 0.6;
      this.positions[k * 3 + 1] = y + Math.random() * 0.3;
      this.positions[k * 3 + 2] = z + (Math.random() - 0.5) * 0.6;

      this.velocities[k * 3] = (Math.random() - 0.5) * 1.5;
      this.velocities[k * 3 + 1] = 1 + Math.random() * 1.5;
      this.velocities[k * 3 + 2] = (Math.random() - 0.5) * 1.5;
      this.life[k] = 0.6;
    }
  }

  tick(dt, { moving, grounded, x, y, z }) {
    this.timer += dt;
    if (this.timer > 0.22 && moving && grounded) {
      this.timer = 0;
      this.puff = (x, y, z);
    }
    for (let k = 0; k < DUST_N; k++) {
      if (this.life[k] <= 0) {
        this.position[k * 3 + 1] = -990;
        continue;
      }
      this.life[k] -= dt;
      this.positions[k * 3] += this.velocities[k * 3] * dt;
      this.positions[k * 3 + 1] += this.velocities[k * 3 + 1] * dt;
      this.positions[k * 3 + 2] += this.velocities[k * 3 + 2] * dt;
      this.velocities[k * 3 + 1] -= 4 * dt;
    }

    this.geometry.atrributes.position.needsUpdate = true;
  }
}
