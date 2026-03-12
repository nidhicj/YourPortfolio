import * as THREE from 'three';
import { THEME_COLORS } from '../ThemeManager.js';

// ─── Layout ───────────────────────────────────────────────────────────────────
const READ_Z        = -2;
const STACK_SPACING = 2;
const OFFSET_X      = 0.4;
const EXIT_X        = 5.5;
const PW            = 2.8;
const PH            = 1.55;

// ─── Per-card scroll budget ───────────────────────────────────────────────────
export const SLIDE_PX = 500;
export const HOLD_PX  = 200;
export const EXIT_PX  = 500;
export const CARD_PX  = SLIDE_PX + HOLD_PX + EXIT_PX;

export class Placard {
    constructor(scene, entry, index, total) {
        this.scene   = scene;
        this.entry   = entry;
        this.entryId = entry.id;
        this.index   = index;
        this._total  = total;

        this.side  = index % 2 === 0 ? -1 : 1;
        this.restZ = READ_Z - (index + 1) * STACK_SPACING;

        this.currentZ = this.restZ;
        this.exitT    = 0;

        // Start light; ThemeManager.init() calls setTheme() right after placards are created
        this._isDark = false;

        this.mesh = null;
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
        const PAD    = 80;

        const pal  = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
        const INK  = pal.ink;
        const SOFT = pal.inkSoft;
        const BRG  = pal.burgundy;

        // Background
        ctx.fillStyle = pal.cardBg;
        ctx.roundRect(0, 0, W, H, 28); ctx.fill();

        // Subtle inner vignette in dark mode so card edge doesn't float
        if (this._isDark) {
            const vign = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
            vign.addColorStop(0, 'rgba(0,0,0,0)');
            vign.addColorStop(1, 'rgba(0,0,0,0.25)');
            ctx.fillStyle = vign;
            ctx.roundRect(0, 0, W, H, 28); ctx.fill();
        }

        // Text zone
        const tx    = isLeft ? PAD : W - PAD;
        const tal   = isLeft ? 'left' : 'right';
        const maxTW = W * 0.50;

        // Pill badge
        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 18px "DM Sans",sans-serif';
        const pillW = ctx.measureText(typeLabel).width + 28;
        const pillX = isLeft ? PAD : W - PAD - pillW;

        ctx.fillStyle = pal.pillBg;
        ctx.beginPath(); ctx.roundRect(pillX, 52, pillW, 32, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, pillX + 14, 74);

        // Date
        ctx.font = '400 17px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = isLeft ? 'left' : 'right';
        const dateX = isLeft ? pillX + pillW + 20 : pillX - 20;
        ctx.fillText(this.entry.date || '', dateX, 74);

        // Giant title
        ctx.font = '900 88px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = tal;
        ctx.fillText(this.entry.title, tx, 200);

        // Company
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  ·  ');
        if (co) {
            ctx.font = '600 20px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = tal;
            ctx.fillText(co, tx, 320);
        }

        // Description
        ctx.font = '400 22px "DM Sans",sans-serif';
        ctx.fillStyle = pal.inkMuted;
        ctx.textAlign = tal;
        this._wrap(ctx, this.entry.description, tx, 374, maxTW, 34, 4, tal);

        // Bottom row
        const botY = H - 56;

        if (this.entry.highlight) {
            ctx.font = '700 17px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = tal;
            ctx.fillText('\u2191  ' + this.entry.highlight, tx, botY);
        }

        const tags = (this.entry.tags || []).slice(0, 5);
        if (tags.length) {
            ctx.font = '400 15px "DM Sans",sans-serif';
            ctx.fillStyle = pal.inkVerysoft;
            const tagStr = tags.join('  \u00b7  ');
            const tagAnchor = isLeft
                ? Math.min(PAD + maxTW, W * 0.54)
                : Math.max(W - PAD - maxTW, W * 0.46);
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
                    while (ctx.measureText(tail + '\u2026').width > maxW && tail.length > 1)
                        tail = tail.slice(0, -1);
                    draw(tail + '\u2026'); return;
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

        this.mesh.position.set(this.side * OFFSET_X, 1.7, this.restZ);
        this.scene.add(this.mesh);
    }

    // ─── Theme ────────────────────────────────────────────────────────────────
    setTheme(isDark) {
        this._isDark = isDark;
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;
    }

    // ─── Update ───────────────────────────────────────────────────────────────
    update(scrollPx) {
        const cardStart = this.index * CARD_PX;
        const local     = scrollPx - cardStart;
        const clamp     = (v, a, b) => Math.max(a, Math.min(b, v));
        const smooth    = t => t * t * (3 - 2 * t);

        const exitStart = SLIDE_PX + HOLD_PX;
        const exitT     = smooth(clamp((local - exitStart) / EXIT_PX, 0, 1));

        const activeIndex  = Math.floor(scrollPx / CARD_PX);
        const activeLocal  = scrollPx - activeIndex * CARD_PX;
        const activeSlideT = smooth(clamp(activeLocal / SLIDE_PX, 0, 1));
        let   stackShift   = (activeIndex + activeSlideT) * STACK_SPACING;

        const isLast = this.index === this._total - 1;
        if (isLast && exitT > 0) {
            stackShift = (this.index + 1) * STACK_SPACING;
        }

        const currentZ = Math.min(READ_Z, this.restZ + stackShift);
        const restX    = this.side * OFFSET_X;
        const currentX = restX + exitT * exitT * this.side * EXIT_X;
        const opacity  = 1 - exitT * 0.92;

        this.currentZ = currentZ;
        this.exitT    = exitT;

        this.mesh.position.set(currentX, 1.7, currentZ);
        this.mesh.material.opacity = Math.max(0, opacity);
    }

    static totalScrollHeight(n) {
        return 600 + n * CARD_PX;
    }

    get positionZ() { return this.restZ; }
}