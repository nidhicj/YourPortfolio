import * as THREE from 'three';

// ─── Scene constants ──────────────────────────────────────────────────────────
// Camera is FIXED at z=0, looking toward -Z.
// "Reading position" is z = -8 (comfortable distance from camera).
// Cards start stacked behind that: z = -8, -22, -36, -50 ...  (14 units apart)
// On scroll, each card slides forward to z=-8, holds, then exits left/right.

const CAMERA_Z      =  0;    // camera never moves
const READ_Z        = -8;    // z position where card is fully readable
const STACK_SPACING = 14;    // depth between stacked cards at rest
const OFFSET_X      = 0.4;   // left/right lean while in stack
const EXIT_X        = 5.5;   // how far off-screen on lateral exit
const PW            = 2.8;   // card width  (world units)
const PH            = 1.55;  // card height (world units)

export class Placard {
    constructor(scene, entry, index, total) {
        this._total = total;
        this.scene  = scene;
        this.entry  = entry;
        this.index  = index;

        // Which side this card leans/exits toward
        this.side = index % 2 === 0 ? -1 : 1;  // -1=left, +1=right

        // Resting depth — card 0 closest, card N deepest
        this.restZ = READ_Z - index * STACK_SPACING;

        this.mesh      = null;
        // this.frameMesh = null;

        this._build();
    }

    // ─── Canvas ───────────────────────────────────────────────────────────────
    _buildCanvas() {
        const W = 1400, H = 780;
        const cvs = document.createElement('canvas');
        cvs.width = W; cvs.height = H;
        const ctx = cvs.getContext('2d');

        const isLeft = this.side === -1;
        const isWork = this.entry.type === 'work';
        const accent     = '#7A1B2A';
        const accentLight = '#9B2335';
        const PAD    = 64;
        const ax     = isLeft ? 'left' : 'right';
        const ox     = isLeft ? PAD + 14 : W - PAD - 14;

        // Background — pure white for both work and project cards
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, W, H, 20);
        ctx.fill();

        // Faint burgundy warmth
        const grd = ctx.createRadialGradient(
            isLeft ? W*0.15 : W*0.85, H*0.2, 0,
            isLeft ? W*0.15 : W*0.85, H*0.2, W*0.55
        );
        grd.addColorStop(0, 'rgba(122,27,42,0.05)');
        grd.addColorStop(1, 'rgba(122,27,42,0)');
        ctx.fillStyle = grd; ctx.roundRect(0,0,W,H,20); ctx.fill();

        // Accent bar
        const barGrd = ctx.createLinearGradient(0, PAD, 0, H - PAD);
        barGrd.addColorStop(0, accent);
        barGrd.addColorStop(1, accent + '22');
        ctx.fillStyle = barGrd;
        ctx.fillRect(isLeft ? 0 : W - 6, PAD, 6, H - PAD*2);

        // Badge
        ctx.font = '500 20px "Courier New",monospace';
        ctx.fillStyle = accent; ctx.globalAlpha = 0.6;
        ctx.textAlign = ax;
        ctx.fillText(isWork ? 'WORK EXPERIENCE' : 'KEY PROJECT', ox, 68);
        ctx.globalAlpha = 1;

        // Date (opposite corner)
        ctx.font = '400 20px "Courier New",monospace';
        ctx.fillStyle = 'rgba(26,13,16,0.35)';
        ctx.textAlign = isLeft ? 'right' : 'left';
        ctx.fillText(this.entry.date || '', isLeft ? W - PAD : PAD, 68);

        // Title
        ctx.font = '800 72px "Syne",Arial,sans-serif';
        ctx.fillStyle = '#1a0d10';
        ctx.textAlign = ax;
        this._wrap(ctx, this.entry.title, ox, 160, W - PAD*2 - 20, 84, 2, ax);

        // Company · Location
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        ctx.font = '400 24px "Courier New",monospace';
        ctx.fillStyle = accent; ctx.globalAlpha = 0.9;
        ctx.textAlign = ax;
        ctx.fillText(co, ox, 268);
        ctx.globalAlpha = 1;

        // Rule
        ctx.strokeStyle = 'rgba(122,27,42,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD, 296); ctx.lineTo(W-PAD, 296); ctx.stroke();

        // Description
        ctx.font = '400 26px "DM Sans",Arial,sans-serif';
        ctx.fillStyle = 'rgba(26,13,16,0.65)';
        ctx.textAlign = ax;
        this._wrap(ctx, this.entry.description, ox, 346, W - PAD*2 - 20, 38, 4, ax);

        // Highlight chip
        if (this.entry.highlight) {
            const cy = H - 120, ct = this.entry.highlight;
            ctx.font = '600 21px "Courier New",monospace';
            ctx.textAlign = 'left';
            const cw = ctx.measureText(ct).width + 36;
            const cx = isLeft ? PAD + 14 : W - PAD - 14 - cw;
            ctx.fillStyle = 'rgba(122,27,42,0.10)'; ctx.strokeStyle = 'rgba(122,27,42,0.35)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(cx, cy, cw, 36, 7); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx, cy, cw, 36, 7); ctx.stroke();
            ctx.fillStyle = accent;
            ctx.fillText(ct, cx + 18, cy + 25);
        }

        // Tags
        const tagY = H - 58;
        ctx.font = '400 18px "Courier New",monospace';
        ctx.textAlign = 'left';
        const tagData = (this.entry.tags||[]).slice(0,6)
            .map(t => ({ t, w: ctx.measureText(t).width + 24 }));
        const rowW = tagData.reduce((s,d) => s + d.w + 8, -8);
        let tx = isLeft ? PAD + 14 : W - PAD - 14 - rowW;
        tagData.forEach(({ t, w }) => {
            ctx.fillStyle = 'rgba(122,27,42,0.07)';
            ctx.beginPath(); ctx.roundRect(tx, tagY-20, w, 28, 5); ctx.fill();
            ctx.fillStyle = 'rgba(26,13,16,0.45)';
            ctx.fillText(t, tx+12, tagY);
            tx += w + 8;
        });

        // Ghost index number
        ctx.font = '800 220px "Syne",Arial,sans-serif';
        ctx.fillStyle = 'rgba(122,27,42,0.035)';
        ctx.textAlign = isLeft ? 'right' : 'left';
        ctx.fillText(String(this.index+1).padStart(2,'0'), isLeft ? W-20 : 20, H+15);

        return cvs;
    }

    _wrap(ctx, text, x, y, maxW, lh, maxLines, align) {
        const words = text.split(' ');
        let line = '', count = 0;
        const draw = str => { ctx.textAlign = align; ctx.fillText(str.trim(), x, y); };
        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + ' ';
            if (ctx.measureText(test).width > maxW && i > 0) {
                draw(line); line = words[i] + ' '; y += lh; count++;
                if (count >= maxLines - 1) {
                    let tail = words.slice(i).join(' ');
                    while (ctx.measureText(tail+'…').width > maxW && tail.length > 1)
                        tail = tail.slice(0,-1);
                    draw(tail+'…'); return;
                }
            } else { line = test; }
        }
        if (line.trim()) draw(line);
    }

    // ─── Geometry ─────────────────────────────────────────────────────────────
    _build() {
        const tex = new THREE.CanvasTexture(this._buildCanvas());
        tex.anisotropy = 16;

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PW, PH),
            new THREE.MeshBasicMaterial({
                map: tex, transparent: true, opacity: 1,
                side: THREE.FrontSide, depthWrite: false,
            })
        );

        const frameColor = 0x7A1B2A; // burgundy for both work and project cards
        // this.frameMesh = new THREE.Mesh(
        //     new THREE.PlaneGeometry(PW + 0.03, PH + 0.03),
        //     new THREE.MeshBasicMaterial({
        //         color: frameColor, transparent: true,
        //         opacity: 0.22, depthWrite: false,
        //     })
        // );

        // Place at resting position immediately — stacked in depth, already visible
        this.mesh.position.set(this.side * OFFSET_X, 1.7, this.restZ);
        // this.frameMesh.position.set(this.side * OFFSET_X, 1.7, this.restZ - 0.001);

        // this.scene.add(this.frameMesh);
        this.scene.add(this.mesh);
    }

    // ─── Update — called every frame with scroll progress 0→1 ────────────────
    //
    // Each card owns a slot of total scroll.
    // Within that slot, three phases:
    //
    //   SLIDE  (0 → 15%): card moves forward from restZ to READ_Z
    //   HOLD   (15% → 75%): card sits perfectly still at READ_Z — reader reads
    //   EXIT   (75% → 100%): card sweeps laterally off screen
    //
    // Card 0 starts already at READ_Z so its slide is instant.
    //
    update(scrollProgress) {
        const n     = this._total;
        const slot  = 1 / n;
        const start = this.index * slot;
        const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
        const smooth = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Local progress 0→1 within this card's slot
        const local = clamp((scrollProgress - start) / slot, 0, 1);

        // Phase boundaries (fractions of local)
        const SLIDE_END = 0.20;   // slide finishes at 15%
        const HOLD_END  = 0.85;   // hold finishes at 75% — 60% of slot is pure reading time
        // exit runs 75%→100%

        const slideT = smooth(clamp(local / SLIDE_END, 0, 1));
        const exitT  = smooth(clamp((local - HOLD_END) / (1 - HOLD_END), 0, 1));

        // Z: slide restZ → READ_Z, then lock
        const currentZ = this.restZ + slideT * (READ_Z - this.restZ);

        // X: lean at rest, sweep off on exit — quadratic so it starts slow then accelerates
        const restX    = this.side * OFFSET_X;
        const currentX = restX + exitT * this.side * EXIT_X;

        // Opacity: fully visible the whole time, only fades during exit
        const opacity = 1 - exitT * 0.92;

        this.mesh.position.set(currentX, 1.7, currentZ);
        // this.frameMesh.position.set(currentX, 1.7, currentZ - 0.001);

        this.mesh.material.opacity      = Math.max(0, opacity);
        // this.frameMesh.material.opacity = Math.max(0, opacity * 0.22);
    }

    setTotal(n) { this._total = n; }

    get positionZ() { return this.restZ; }
}