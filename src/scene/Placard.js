import * as THREE from 'three';

// ─── Layout ───────────────────────────────────────────────────────────────────
const READ_Z        = -2.3;    // depth where card is comfortably readable
const STACK_SPACING = 2;    // depth gap between stacked cards
const OFFSET_X      = 0.4;   // left/right lean while in stack
const EXIT_X        = 5.5;   // lateral distance on exit
const PW            = 2.8;
const PH            = 1.55;

// ─── Per-card scroll budget (in pixels) ──────────────────────────────────────
// Each card owns a window of scroll. Windows overlap so the stack is always
// visible — a card starts sliding forward while previous card is still in hold.
export const SLIDE_PX = 500;
export const HOLD_PX  = 200;
export const EXIT_PX  = 500;
export const CARD_PX  = SLIDE_PX + HOLD_PX + EXIT_PX;

export class Placard {
    constructor(scene, entry, index, total) {
        this.scene  = scene;
        this.entry  = entry;
        this.entryId = entry.id
        this.index  = index;
        this._total = total;

        this.side  = index % 2 === 0 ? -1 : 1;
        this.restZ = READ_Z - (index + 1) * STACK_SPACING;

        this.currentZ = this.restZ;
        this.exitT = 0;

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
        const accent = isWork ? '#FCBB6D' : '#B7FF4A';
        const PAD    = 64;
        const ax     = isLeft ? 'left' : 'right';
        const ox     = isLeft ? PAD + 14 : W - PAD - 14;

        // Background
        ctx.fillStyle = isWork ? '#0d1117' : '#080f12';
        ctx.roundRect(0, 0, W, H, 20); ctx.fill();

        // Accent warmth
        const grd = ctx.createRadialGradient(
            isLeft ? W*0.15 : W*0.85, H*0.2, 0,
            isLeft ? W*0.15 : W*0.85, H*0.2, W*0.55
        );
        grd.addColorStop(0, isWork ? 'rgba(252,187,109,0.07)' : 'rgba(183,255,74,0.06)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
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

        // Date
        ctx.font = '400 20px "Courier New",monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = isLeft ? 'right' : 'left';
        ctx.fillText(this.entry.date || '', isLeft ? W - PAD : PAD, 68);

        // Title
        ctx.font = '700 72px Arial,sans-serif';
        ctx.fillStyle = '#ffffff'; ctx.textAlign = ax;
        this._wrap(ctx, this.entry.title, ox, 160, W - PAD*2 - 20, 84, 2, ax);

        // Company · Location
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        ctx.font = '400 24px "Courier New",monospace';
        ctx.fillStyle = accent; ctx.globalAlpha = 0.9; ctx.textAlign = ax;
        ctx.fillText(co, ox, 268); ctx.globalAlpha = 1;

        // Rule
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD, 296); ctx.lineTo(W-PAD, 296); ctx.stroke();

        // Description
        ctx.font = '400 26px Arial,sans-serif';
        ctx.fillStyle = 'rgba(210,218,232,0.82)'; ctx.textAlign = ax;
        this._wrap(ctx, this.entry.description, ox, 346, W - PAD*2 - 20, 38, 4, ax);

        // Highlight chip
        if (this.entry.highlight) {
            const cy = H - 120, ct = this.entry.highlight;
            ctx.font = '600 21px "Courier New",monospace'; ctx.textAlign = 'left';
            const cw = ctx.measureText(ct).width + 36;
            const cx = isLeft ? PAD + 14 : W - PAD - 14 - cw;
            ctx.fillStyle = accent + '18'; ctx.strokeStyle = accent + '50'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(cx, cy, cw, 36, 7); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx, cy, cw, 36, 7); ctx.stroke();
            ctx.fillStyle = accent; ctx.fillText(ct, cx + 18, cy + 25);
        }

        // Tags
        const tagY = H - 58;
        ctx.font = '400 18px "Courier New",monospace'; ctx.textAlign = 'left';
        const tagData = (this.entry.tags||[]).slice(0,6)
            .map(t => ({ t, w: ctx.measureText(t).width + 24 }));
        const rowW = tagData.reduce((s,d) => s + d.w + 8, -8);
        let tx = isLeft ? PAD + 14 : W - PAD - 14 - rowW;
        tagData.forEach(({ t, w }) => {
            ctx.fillStyle = 'rgba(255,255,255,0.07)';
            ctx.beginPath(); ctx.roundRect(tx, tagY-20, w, 28, 5); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.40)';
            ctx.fillText(t, tx+12, tagY); tx += w + 8;
        });

        // Ghost number
        ctx.font = '800 220px Arial,sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.018)';
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

        const frameColor = this.entry.type === 'work' ? 0xFCBB6D : 0xB7FF4A;
        this.frameMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PW + 0.03, PH + 0.03),
            new THREE.MeshBasicMaterial({
                color: frameColor, transparent: true, opacity: 0.22, depthWrite: false,
            })
        );

        this.mesh.position.set(this.side * OFFSET_X, 1.7, this.restZ);
        this.frameMesh.position.set(this.side * OFFSET_X, 1.7, this.restZ - 0.001);

        this.scene.add(this.frameMesh);
        this.scene.add(this.mesh);
    }

    // ─── Update ───────────────────────────────────────────────────────────────
    // scrollPx = raw scroll position in pixels (window.scrollY equivalent via progress)
    // Each card has its own pixel window: starts at index * CARD_PX
    //
    //   0 ──── SLIDE_PX ──── (SLIDE+HOLD)_PX ──── CARD_PX
    //   |   slide fwd   |      hold still      |   exit    |
    //
    update(scrollPx) {
        const cardStart = this.index * CARD_PX;
        const local     = scrollPx - cardStart;
        const clamp     = (v,a,b) => Math.max(a, Math.min(b,v));
        const smooth    = t => t * t * (3 - 2 * t);

        // Current card's own exit timing
        const exitStart = SLIDE_PX + HOLD_PX;
        const exitT     = smooth(clamp((local - exitStart) / EXIT_PX, 0, 1));

        // Global stack motion driven by the currently active card
        const activeIndex   = Math.floor(scrollPx / CARD_PX);
        const activeLocal   = scrollPx - activeIndex * CARD_PX;
        const activeSlideT  = smooth(clamp(activeLocal / SLIDE_PX, 0, 1));
        const stackShift    = (activeIndex + activeSlideT) * STACK_SPACING;

        // Everyone moves forward together, but no one comes past READ_Z
        const currentZ = Math.min(READ_Z, this.restZ + stackShift);

        // X: lean at rest, sweep off on exit
        const restX    = this.side * OFFSET_X;
        const currentX = restX + exitT * exitT * this.side * EXIT_X;

        const opacity = 1 - exitT * 0.92;

        this.currentZ = currentZ;
        this.exitT = exitT;

        this.mesh.position.set(currentX, 1.7, currentZ);
        this.frameMesh.position.set(currentX, 1.7, currentZ - 0.001);
        this.mesh.material.opacity      = Math.max(0, opacity);
        this.frameMesh.material.opacity = Math.max(0, opacity * 0.22);
    }

    // Static helper — total scroll height to pass to body
    static totalScrollHeight(n) {
        return 600 + n * CARD_PX;
    }

    get positionZ() { return this.restZ; }
}