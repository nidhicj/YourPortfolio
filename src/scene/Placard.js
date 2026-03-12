import * as THREE from 'three';

// ─── Layout ───────────────────────────────────────────────────────────────────
const READ_Z        = -2;    // depth where card is comfortably readable
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
        const PAD  = 80;
        const INK  = '#0a0a0a';
        const SOFT = 'rgba(10,10,10,0.28)';
        const BRG  = '#7A1B2A';

        // ── Background: white with very faint warm blush bottom-right ──
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, W, H, 28); ctx.fill();

        // Frosted image-zone tint — right half (simulates image behind glass)
        // const imgX = isLeft ? W * 0.58 : 0;
        // const imgGrd = ctx.createLinearGradient(imgX, 0, isLeft ? W : W * 0.42, H);
        // imgGrd.addColorStop(0, 'rgba(240,233,228,0)');
        // imgGrd.addColorStop(0.3, 'rgba(232,222,215,0.55)');
        // imgGrd.addColorStop(1,   'rgba(220,208,200,0.80)');
        // ctx.fillStyle = imgGrd;
        // ctx.roundRect(0, 0, W, H, 28); ctx.fill();

        // Subtle image-zone label (placeholder)
        // ctx.font = '400 18px "DM Sans",sans-serif';
        // ctx.fillStyle = 'rgba(10,10,10,0.14)';
        // ctx.textAlign = 'center';
        // ctx.fillText('Project Image', isLeft ? W * 0.79 : W * 0.21, H / 2);

        // Frosted overlay on text side — keeps text area crisp white
        // const frostX  = isLeft ? 0 : W * 0.44;
        // const frostW  = W * 0.56;
        // const frost   = ctx.createLinearGradient(frostX, 0, frostX + frostW, 0);
        // if (isLeft) {
        //     frost.addColorStop(0,    'rgba(255,255,255,1)');
        //     frost.addColorStop(0.78, 'rgba(255,255,255,0.96)');
        //     frost.addColorStop(1,    'rgba(255,255,255,0)');
        // } else {
        //     frost.addColorStop(0,    'rgba(255,255,255,0)');
        //     frost.addColorStop(0.22, 'rgba(255,255,255,0.96)');
        //     frost.addColorStop(1,    'rgba(255,255,255,1)');
        // }
        // ctx.fillStyle = frost;
        // ctx.roundRect(0, 0, W, H, 28); ctx.fill();

        // ── Text zone anchored to the clear side ──
        const tx  = isLeft ? PAD : W - PAD;          // text anchor X
        const tal = isLeft ? 'left' : 'right';        // text align
        const maxTW = W * 0.50;                       // max text width

        // ── Top: pill (type) + date ──
        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 18px "DM Sans",sans-serif';
        const pillW = ctx.measureText(typeLabel).width + 28;
        const pillX = isLeft ? PAD : W - PAD - pillW;

        ctx.fillStyle = 'rgba(122,27,42,0.09)';
        ctx.beginPath(); ctx.roundRect(pillX, 52, pillW, 32, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, pillX + 14, 74);

        // Date — sits right next to pill or opposite
        ctx.font = '400 17px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = isLeft ? 'left' : 'right';
        const dateX = isLeft ? pillX + pillW + 20 : pillX - 20;
        ctx.fillText(this.entry.date || '', dateX, 74);

        // ── Giant title — the hero ──
        ctx.font = '900 88px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = tal;
        ctx.fillText(this.entry.title, tx, 200);

        // ── Company in burgundy, medium weight ──
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        if (co) {
            ctx.font = '600 20px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = tal;
            ctx.fillText(co, tx, 320);
        }

        // ── Description — generous size, not muted ──
        ctx.font = '400 22px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(10,10,10,0.62)';
        ctx.textAlign = tal;
        this._wrap(ctx, this.entry.description, tx, 374, maxTW, 34, 4, tal);

        // ── Bottom row: highlight left, tags right ──
        const botY = H - 56;

        if (this.entry.highlight) {
            ctx.font = '700 17px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = tal;
            ctx.fillText('↑  ' + this.entry.highlight, tx, botY);
        }

        // Tags — dot separated, very quiet, opposite corner of text zone
        const tags = (this.entry.tags || []).slice(0, 5);
        if (tags.length) {
            ctx.font = '400 15px "DM Sans",sans-serif';
            ctx.fillStyle = 'rgba(10,10,10,0.22)';
            const tagStr = tags.join('  ·  ');
            // place at far edge of text zone
            const tagAnchor = isLeft ? Math.min(PAD + maxTW, W * 0.54) : Math.max(W - PAD - maxTW, W * 0.46);
            ctx.textAlign = isLeft ? 'right' : 'left';
            ctx.fillText(tagStr, tagAnchor, botY);
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

        // const frameColor = 0x7A1B2A; // burgundy
        // this.frameMesh = new THREE.Mesh(
        //     new THREE.PlaneGeometry(PW + 0.03, PH + 0.03),
        //     new THREE.MeshBasicMaterial({
        //         color: frameColor, transparent: true, opacity: 0.22, depthWrite: false,
        //     })
        // );

        this.mesh.position.set(this.side * OFFSET_X, 1.7, this.restZ);
        // this.frameMesh.position.set(this.side * OFFSET_X, 1.7, this.restZ - 0.001);

        // this.scene.add(this.frameMesh);
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

        // Current card's own slide-in and exit timing
        const slideT    = smooth(clamp(local / SLIDE_PX, 0, 1));
        const exitStart = SLIDE_PX + HOLD_PX;
        const exitT     = smooth(clamp((local - exitStart) / EXIT_PX, 0, 1));

        // Global stack motion driven by the currently active card
        const activeIndex   = Math.floor(scrollPx / CARD_PX);
        const activeLocal   = scrollPx - activeIndex * CARD_PX;
        const activeSlideT  = smooth(clamp(activeLocal / SLIDE_PX, 0, 1));
        let   stackShift    = (activeIndex + activeSlideT) * STACK_SPACING;

        // Last card fix: once it starts exiting, keep driving the stack forward
        // so it fully arrives at READ_Z before sweeping off laterally.
        const isLast = this.index === this._total - 1;
        if (isLast && exitT > 0) {
            // Push stack as if a phantom next card were sliding in
            stackShift = (this.index + 1) * STACK_SPACING;
        }

        // Everyone moves forward together, but no one comes past READ_Z
        const currentZ = Math.min(READ_Z, this.restZ + stackShift);

        // X: lean at rest, sweep fully off on exit
        const restX    = this.side * OFFSET_X;
        const currentX = restX + exitT * exitT * this.side * EXIT_X;

        const opacity = 1 - exitT * 0.92;

        this.currentZ = currentZ;
        this.exitT = exitT;

        this.mesh.position.set(currentX, 1.7, currentZ);
        this.mesh.material.opacity = Math.max(0, opacity);
    }

    // Static helper — total scroll height to pass to body
    static totalScrollHeight(n) {
        return 600 + n * CARD_PX;
    }

    get positionZ() { return this.restZ; }
}