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
        const PAD  = 72;
        const INK  = '#0a0a0a';
        const MID  = 'rgba(10,10,10,0.42)';
        const SOFT = 'rgba(10,10,10,0.22)';
        const BRG  = '#7A1B2A';

        // ── Background ──
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, W, H, 24); ctx.fill();

        const bgGrd = ctx.createLinearGradient(W * 0.5, 0, W, H);
        bgGrd.addColorStop(0, 'rgba(255,255,255,0)');
        bgGrd.addColorStop(1, 'rgba(122,27,42,0.03)');
        ctx.fillStyle = bgGrd; ctx.roundRect(0,0,W,H,24); ctx.fill();

        // ── Top row: type pill + date ──
        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 19px "DM Sans",sans-serif';
        const pillW = ctx.measureText(typeLabel).width + 32;
        const pillX = isLeft ? PAD : W - PAD - pillW;
        ctx.fillStyle = 'rgba(122,27,42,0.08)';
        ctx.beginPath(); ctx.roundRect(pillX, 44, pillW, 34, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, pillX + 16, 68);

        ctx.font = '400 19px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = isLeft ? 'right' : 'left';
        ctx.fillText(this.entry.date || '', isLeft ? W - PAD : PAD, 68);

        // ── Title ──
        ctx.font = '800 74px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = isLeft ? 'left' : 'right';
        const titleX = isLeft ? PAD : W - PAD;
        this._wrap(ctx, this.entry.title, titleX, 176, W - PAD * 2, 86, 2, isLeft ? 'left' : 'right');

        // ── Company · Location ──
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        if (co) {
            ctx.font = '600 22px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = isLeft ? 'left' : 'right';
            ctx.fillText(co, titleX, 290);
        }

        // ── Divider ──
        ctx.strokeStyle = 'rgba(10,10,10,0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD, 318); ctx.lineTo(W - PAD, 318); ctx.stroke();

        // ── Description ──
        ctx.font = '400 25px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(10,10,10,0.72)';
        ctx.textAlign = isLeft ? 'left' : 'right';
        this._wrap(ctx, this.entry.description, titleX, 368, W - PAD * 2, 38, 4, isLeft ? 'left' : 'right');

        // ── Bottom row ──
        const botY = H - 52;

        if (this.entry.highlight) {
            ctx.font = '600 18px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = isLeft ? 'left' : 'right';
            ctx.fillText('↑ ' + this.entry.highlight, titleX, botY);
        }

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

        const frameColor = 0x7A1B2A; // burgundy
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