import * as THREE from 'three';
import { THEME_COLORS } from '../ThemeManager.js';

// ─── Breakpoint ───────────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 640;

// ─── 3D Layout — per-mode ─────────────────────────────────────────────────────
// READ_Z: how close the front card stops to the camera.
// Mobile needs -3 (further back) so the tall portrait card is fully readable.
// Desktop stays at -2 (closer) — landscape cards are short so they fit fine at -2.
const READ_Z        = () => isMobile() ? -3 : -2;
const STACK_SPACING = 2;

const OFFSET_X = () => isMobile() ? 0.05 : 0.4;
const EXIT_X   = () => isMobile() ? 2.8  : 5.5;

// Card plane: portrait on mobile, landscape on desktop
const PW     = () => isMobile() ? 2.0  : 2.8;
const PH     = () => isMobile() ? 2.75 : 1.55;
const CARD_Y = () => isMobile() ? 1.55 : 1.7;

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
        this.restZ = READ_Z() - (index + 1) * STACK_SPACING;

        this.currentZ = this.restZ;
        this.exitT    = 0;

        this._isDark   = false;
        this._isMobile = isMobile();

        this.mesh = null;
        this._build();
    }

    // ─── Canvas dispatch ──────────────────────────────────────────────────────
    _buildCanvas() {
        return this._isMobile
            ? this._buildCanvasMobile()
            : this._buildCanvasDesktop();
    }

    // ── Desktop: original landscape layout ────────────────────────────────────
    _buildCanvasDesktop() {
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

        ctx.fillStyle = pal.cardBg;
        ctx.roundRect(0, 0, W, H, 28); ctx.fill();

        if (this._isDark) {
            const vign = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
            vign.addColorStop(0, 'rgba(0,0,0,0)');
            vign.addColorStop(1, 'rgba(0,0,0,0.25)');
            ctx.fillStyle = vign;
            ctx.roundRect(0, 0, W, H, 28); ctx.fill();
        }

        const tx    = isLeft ? PAD : W - PAD;
        const tal   = isLeft ? 'left' : 'right';
        const maxTW = W * 0.50;

        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 18px "DM Sans",sans-serif';
        const pillW = ctx.measureText(typeLabel).width + 28;
        const pillX = isLeft ? PAD : W - PAD - pillW;

        ctx.fillStyle = pal.pillBg;
        ctx.beginPath(); ctx.roundRect(pillX, 52, pillW, 32, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, pillX + 14, 74);

        ctx.font = '400 17px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = isLeft ? 'left' : 'right';
        const dateX = isLeft ? pillX + pillW + 20 : pillX - 20;
        ctx.fillText(this.entry.date || '', dateX, 74);

        ctx.font = '900 88px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = tal;
        ctx.fillText(this.entry.title, tx, 200);

        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  \u00b7  ');
        if (co) {
            ctx.font = '600 20px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = tal;
            ctx.fillText(co, tx, 320);
        }

        ctx.font = '400 22px "DM Sans",sans-serif';
        ctx.fillStyle = pal.inkMuted;
        ctx.textAlign = tal;
        this._wrap(ctx, this.entry.description, tx, 374, maxTW, 34, 4, tal);

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

    // ── Mobile: portrait layout — centred top-to-bottom flow ──────────────────
    // Canvas 900x1260 matches the 2.0 x 2.75 world-unit plane (same ~1:1.375 ratio)
    // Zone guide (canvas px):
    //   56–100  : pill badge + date
    //   140–340 : big title (2 lines max, 96px Epilogue)
    //   370     : thin divider rule
    //   410–450 : company · location
    //   490–760 : description (5 lines, 30px)
    //   1180–1260: bottom strip — highlight + tags
    _buildCanvasMobile() {
        const W = 900, H = 1260;
        const cvs = document.createElement('canvas');
        cvs.width = W; cvs.height = H;
        const ctx = cvs.getContext('2d');

        const isWork = this.entry.type === 'work';
        const PAD    = 64;
        const textW  = W - PAD * 2;

        const pal  = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
        const INK  = pal.ink;
        const SOFT = pal.inkSoft;
        const BRG  = pal.burgundy;

        // Background
        ctx.fillStyle = pal.cardBg;
        ctx.roundRect(0, 0, W, H, 36); ctx.fill();

        if (this._isDark) {
            const vign = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.85);
            vign.addColorStop(0, 'rgba(0,0,0,0)');
            vign.addColorStop(1, 'rgba(0,0,0,0.28)');
            ctx.fillStyle = vign;
            ctx.roundRect(0, 0, W, H, 36); ctx.fill();
        }

        // ── Pill + date row ──
        const typeLabel = isWork ? 'Work Experience' : 'Key Project';
        ctx.font = '500 26px "DM Sans",sans-serif';
        const pillW = ctx.measureText(typeLabel).width + 36;

        ctx.fillStyle = pal.pillBg;
        ctx.beginPath(); ctx.roundRect(PAD, 56, pillW, 44, 99); ctx.fill();
        ctx.fillStyle = BRG;
        ctx.textAlign = 'left';
        ctx.fillText(typeLabel, PAD + 18, 88);

        ctx.font = '400 24px "DM Sans",sans-serif';
        ctx.fillStyle = SOFT;
        ctx.textAlign = 'right';
        ctx.fillText(this.entry.date || '', W - PAD, 88);

        // ── Big title ──
        ctx.font = '900 96px "Epilogue","DM Sans",sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = 'left';
        this._wrap(ctx, this.entry.title, PAD, 220, textW, 108, 2, 'left');

        // ── Thin divider ──
        ctx.strokeStyle = BRG;
        ctx.globalAlpha = 0.18;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(PAD, 370); ctx.lineTo(W - PAD, 370);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // ── Company · location ──
        const co = [this.entry.company, this.entry.location].filter(Boolean).join('  \u00b7  ');
        if (co) {
            ctx.font = '600 28px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = 'left';
            ctx.fillText(co, PAD, 428);
        }

        // ── Description ──
        ctx.font = '400 30px "DM Sans",sans-serif';
        ctx.fillStyle = pal.inkMuted;
        ctx.textAlign = 'left';
        this._wrap(ctx, this.entry.description, PAD, 508, textW, 46, 5, 'left');

        // ── Bottom strip ──
        const botY = H - 64;

        if (this.entry.highlight) {
            ctx.font = '700 26px "DM Sans",sans-serif';
            ctx.fillStyle = BRG;
            ctx.textAlign = 'left';
            ctx.fillText('\u2191  ' + this.entry.highlight, PAD, botY);
        }

        const tags = (this.entry.tags || []).slice(0, 4);
        if (tags.length) {
            ctx.font = '400 22px "DM Sans",sans-serif';
            ctx.fillStyle = pal.inkVerysoft;
            ctx.textAlign = 'right';
            ctx.fillText(tags.join('  \u00b7  '), W - PAD, botY);
        }

        return cvs;
    }

    // ─── Shared word-wrap helper ──────────────────────────────────────────────
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

    // ─── Build ────────────────────────────────────────────────────────────────
    _build() {
        this._isMobile = isMobile();
        const tex = new THREE.CanvasTexture(this._buildCanvas());
        tex.anisotropy = 16;

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PW(), PH()),
            new THREE.MeshBasicMaterial({
                map: tex, transparent: true, opacity: 1,
                side: THREE.FrontSide, depthWrite: false,
            })
        );

        this.mesh.position.set(this.side * OFFSET_X(), CARD_Y(), this.restZ);
        this.scene.add(this.mesh);
    }

    // ─── Theme ────────────────────────────────────────────────────────────────
    setTheme(isDark) {
        this._isDark = isDark;
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;
    }

    // ─── Resize — swap geometry if portrait/landscape mode flips ─────────────
    onResize() {
        const nowMobile = isMobile();
        if (nowMobile === this._isMobile) return; // same mode, nothing to do

        this._isMobile = nowMobile;

        // restZ depends on READ_Z which just changed — recalculate
        this.restZ = READ_Z() - (this.index + 1) * STACK_SPACING;

        // Replace the plane geometry with new dimensions
        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.PlaneGeometry(PW(), PH());

        // Rebuild canvas texture for new layout
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;

        // Reposition for new CARD_Y, OFFSET_X, and restZ
        this.mesh.position.set(this.side * OFFSET_X(), CARD_Y(), this.restZ);
    }

    // ─── Update (scroll-driven each frame) ───────────────────────────────────
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

        const currentZ = Math.min(READ_Z(), this.restZ + stackShift);
        const restX    = this.side * OFFSET_X();
        const currentX = restX + exitT * exitT * this.side * EXIT_X();
        const opacity  = 1 - exitT * 0.92;

        this.currentZ = currentZ;
        this.exitT    = exitT;

        this.mesh.position.set(currentX, CARD_Y(), currentZ);
        this.mesh.material.opacity = Math.max(0, opacity);
    }

    static totalScrollHeight(n) {
        return 600 + n * CARD_PX;
    }

    get positionZ() { return this.restZ; }
}