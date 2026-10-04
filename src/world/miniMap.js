export class Minimap {
    constructor(options = {}) {
        this.size = options.size || 160;
        this.zoom = options.zoom || 2.5; // Controls zoom distance
        this.radius = this.size / 2;


        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');

        //top right styling
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: `${this.size}px`,
            height: `${this.size}px`,
            borderRadius: '50%',
            border: '3px solid #1a2634',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 255, 200, 0.1)',
            pointerEvents: 'none',
            zIndex: '1000'
        });

        document.body.appendChild(this.canvas);

        this.sweepAngle = 0;
    }


    worldToRadar(worldX, worldZ, playerX, playerZ) {
        const dx = (worldX - playerX) * this.zoom;
        const dz = (worldZ - playerZ) * this.zoom;

        return {
            x: this.radius + dx,
            y: this.radius + dz,
            distanceSq: dx * dx + dz * dz
        };
    }

    update(playerPosition, playerRotationY = 0, entities = [], deltaTime = 0.016) {
        const ctx = this.ctx;
        const r = this.radius;
        const px = playerPosition.x;
        const pz = playerPosition.z;


        ctx.clearRect(0, 0, this.size, this.size);


        ctx.save();
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.clip();//mask

        ctx.fillStyle = 'rgba(10, 18, 26, 0.85)';
        ctx.fillRect(0, 0, this.size, this.size);

        //Grid Rings
        ctx.strokeStyle = 'rgba(0, 255, 180, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r, r, r * 0.4, 0, Math.PI * 2);
        ctx.arc(r, r, r * 0.75, 0, Math.PI * 2);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(r, this.size);
        ctx.moveTo(0, r); ctx.lineTo(this.size, r);
        ctx.stroke();

        //render entities
        entities.forEach(ent => {
            const pos = this.worldToRadar(ent.x, ent.z, px, pz);

            //doesnt draw outside of radius
            if (pos.distanceSq > (r - 8) * (r - 8)) return;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);

            //not really in the game but color codes based off of enmey quest etc
            switch (ent.type) {
                case 'dino':
                case 'hostile':
                    ctx.fillStyle = '#ff4d4d';
                    break;
                case 'npc':
                case 'shop':
                    ctx.fillStyle = '#33ccff';
                    break;
                case 'quest':
                case 'objective':
                    ctx.fillStyle = '#ffcc00';
                    break;
                default:
                    ctx.fillStyle = '#ffffff';
            }
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        ctx.save();
        ctx.translate(r, r);
        ctx.rotate(playerRotationY);

        //vison cone
        ctx.fillStyle = 'rgba(0, 255, 200, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 0.6, -Math.PI / 4 - Math.PI / 2, Math.PI / 4 - Math.PI / 2);
        ctx.closePath();
        ctx.fill();

        //player arrow
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 5);
        ctx.lineTo(0, 3);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 5. Radar Sweep Line Animation
        this.sweepAngle += deltaTime * 2.5;
        ctx.strokeStyle = 'rgba(0, 255, 180, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r, r);
        ctx.lineTo(
            r + Math.cos(this.sweepAngle) * r,
            r + Math.sin(this.sweepAngle) * r
        );
        ctx.stroke();

        ctx.restore();
    }


    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}