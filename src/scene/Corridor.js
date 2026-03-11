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
        this.frameMesh = null;

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
        const PAD  = 72;
        const INK  = '#0a0a0a';
        const MID  = 'rgba(10,10,10,0.42)';
        const SOFT = 'rgba(10,10,10,0.22)';
        const BRG  = '#7A1B2A';

        // ── Background: pure white with very subtle warm tint bottom-right ──
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, W, H, 24); ctx.fill();

        const bgGrd = ctx.createLinearGradient(W * 0.5, 0, W, H);
        bgGrd.addColorStop(0, 'rgba(255,255,255,0)');
        bgGrd.addColorStop(1, 'rgba(122,27,42,0.03)');
        ctx.fillStyle = bgGrd; ctx.roundRect(0,0,W,H,24); ctx.fill();

        // ── Top row: type pill (left) + date (right) ──
        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 19px "DM Sans",sans-serif';

        // Pill background
        const pillW = ctx.measureText(typeLabel).width + 32;
        const pillX = isLeft ? PAD : W - PAD - pillW;
        ctx.fillStyle = isWork ? 'rgba(122,27,42,0.08)' : 'rgba(122,27,42,0.06)';
        ctx.beginPath(); ctx.roundRect(pillX, 44, pillW, 34, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, pillX + 16, 68);

        // Date — opposite corner, muted
        ctx.font = '400 19px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = isLeft ? 'right' : 'left';
        ctx.fillText(this.entry.date || '', isLeft ? W - PAD : PAD, 68);

        // ── Title — large, pure near-black, Epilogue-weight feel ──
        ctx.font = '800 74px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = isLeft ? 'left' : 'right';
        const titleX = isLeft ? PAD : W - PAD;
        this._wrap(ctx, this.entry.title, titleX, 176, W - PAD * 2, 86, 2, isLeft ? 'left' : 'right');

        // ── Company · Location — burgundy, medium weight ──
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        if (co) {
            ctx.font = '600 22px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = isLeft ? 'left' : 'right';
            ctx.fillText(co, titleX, 290);
        }

        // ── Thin divider ──
        ctx.strokeStyle = 'rgba(10,10,10,0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD, 318); ctx.lineTo(W - PAD, 318); ctx.stroke();

        // ── Description — near-black, generous line height ──
        ctx.font = '400 25px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(10,10,10,0.72)';
        ctx.textAlign = isLeft ? 'left' : 'right';
        this._wrap(ctx, this.entry.description, titleX, 368, W - PAD * 2, 38, 4, isLeft ? 'left' : 'right');

        // ── Bottom row ──
        const botY = H - 52;

        // Highlight — text only, no box, just burgundy weight
        if (this.entry.highlight) {
            ctx.font = '600 18px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = isLeft ? 'left' : 'right';
            ctx.fillText('↑ ' + this.entry.highlight, titleX, botY);
        }

        // Tags — right side, minimal dots
        const tags = (this.entry.tags || []).slice(0, 5);
        if (tags.length) {
            ctx.font = '400 17px "DM Sans",sans-serif';
            ctx.fillStyle = SOFT;
            const tagStr = tags.join('  ·  ');
            ctx.textAlign = isLeft ? 'right' : 'left';
            ctx.fillText(tagStr, isLeft ? W - PAD : PAD, botY);
        }

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
        this.frameMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PW + 0.03, PH + 0.03),
            new THREE.MeshBasicMaterial({
                color: frameColor, transparent: true,
                opacity: 0.22, depthWrite: false,
            })
        );

        // Place at resting position immediately — stacked in depth, already visible
        this.mesh.position.set(this.side * OFFSET_X, 1.7, this.restZ);
        this.frameMesh.position.set(this.side * OFFSET_X, 1.7, this.restZ - 0.001);

        this.scene.add(this.frameMesh);
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
        const smooth = t => t * t * (3 - 2 * t);

        // Local progress 0→1 within this card's slot
        const local = clamp((scrollProgress - start) / slot, 0, 1);

        // Phase boundaries (fractions of local)
        const SLIDE_END = 0.15;   // slide finishes at 15%
        const HOLD_END  = 0.75;   // hold finishes at 75% — 60% of slot is pure reading time
        // exit runs 75%→100%

        const slideT = smooth(clamp(local / SLIDE_END, 0, 1));
        const exitT  = smooth(clamp((local - HOLD_END) / (1 - HOLD_END), 0, 1));

        // Z: slide restZ → READ_Z, then lock
        const currentZ = this.restZ + slideT * (READ_Z - this.restZ);

        // X: lean at rest, sweep off on exit — quadratic so it starts slow then accelerates
        const restX    = this.side * OFFSET_X;
        const currentX = restX + exitT * exitT * this.side * EXIT_X;

        // Opacity: fully visible the whole time, only fades during exit
        const opacity = 1 - exitT * 0.92;

        this.mesh.position.set(currentX, 1.7, currentZ);
        this.frameMesh.position.set(currentX, 1.7, currentZ - 0.001);

        this.mesh.material.opacity      = Math.max(0, opacity);
        this.frameMesh.material.opacity = Math.max(0, opacity * 0.22);
    }

    setTotal(n) { this._total = n; }

    get positionZ() { return this.restZ; }
}