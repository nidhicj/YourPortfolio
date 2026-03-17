import * as THREE from 'three';
import { THEME_COLORS } from '../ThemeManager.js';

// ─── Breakpoint ───────────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 640;

// ─── 3D Scene layout ─────────────────────────────────────────────────────────
const READ_Z   = () => isMobile() ? -3    : -2;
const PW       = () => isMobile() ? 2.0   : 2.8;
const PH       = () => isMobile() ? 2.75  : 1.55;

// Y positions (world space, camera at y=1.6, fov=60, READ_Z=-2)
// START_Y: card center just above top of viewport
// READ_Y:  card center in middle of viewport (readable)
// EXIT_Y:  card center just below bottom of viewport
// PEEK_Y:  where next card sits while current is at READ_Y (~30% peeking above top)
const CAM_Y    = 1.6;
const START_Y  = () => isMobile() ? 4.2   : 3.73;
const READ_Y   = () => isMobile() ? 1.55  : 1.70;
const EXIT_Y   = () => isMobile() ? -1.2  : -0.53;
const PEEK_Y   = () => isMobile() ? 2.8   : 2.29; // next card peeking from top

// ─── Scroll budget ────────────────────────────────────────────────────────────
export const LANDING_PX = 700;
export const SLIDE_PX   = 400;  // shorter slide — card arrives faster, less dead time
export const HOLD_PX    = 250;  // reading window
export const EXIT_PX    = 450;  // exit — card rolls down while disintegrating
export const CARD_PX    = SLIDE_PX + HOLD_PX + EXIT_PX;

// Card 0 begins sliding this many px BEFORE LANDING_PX — overlaps landing exit
// so the first card is already mid-arrival as the landing fades out
export const CARD0_EARLY = 350;

// ─── Layout configs ───────────────────────────────────────────────────────────
import { DESKTOP_CFG } from './cardConfigs/desktop.js';
import { MOBILE_CFG   } from './cardConfigs/mobile.js';

// ─────────────────────────────────────────────────────────────────────────────
//  CARD LAYOUT: title | highlight | tags | description
//  - No pill, no company, no date, no top rule
//  - Title: centered
//  - Highlight, tags, description: left-aligned, full width
// ─────────────────────────────────────────────────────────────────────────────

function drawCard(ctx, cfg, entry, palette, side, isDark) {
    const W   = cfg.canvasW;
    const H   = cfg.canvasH;
    const PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;

    const maxTW = W - PAD * 2;

    // ── Background ────────────────────────────────────────────────────────────
    if (!isDark) {
        ctx.fillStyle = cardBg;
        ctx.beginPath(); ctx.roundRect(0, 0, W, H, cfg.radius); ctx.fill();
    }
    // Dark mode: no background fill — content floats directly on scene bg (#0b0b0b)

    // ── Title — centered ─────────────────────────────────────────────────────
    ctx.font      = cfg.titleFont;
    ctx.fillStyle = INK;
    _wrap(ctx, entry.title, W / 2, cfg.titleY, maxTW, cfg.titleLH, cfg.titleLines, 'center');

    // ── Highlight — left, burgundy, below title ───────────────────────────────
    if (entry.highlight) {
        ctx.font      = cfg.hlFont;
        ctx.fillStyle = BRG;
        ctx.textAlign = 'center';
        ctx.fillText('\u2191  ' + entry.highlight, W / 2, cfg.hlY);
    }

    // ── Tags — center, muted, below highlight ─────────────────────────────────
    const tags = (entry.tags || []).slice(0, cfg.tagsMax);
    if (tags.length) {
        ctx.font      = cfg.tagsFont;
        ctx.fillStyle = inkVerysoft;
        ctx.textAlign = 'center';
        ctx.fillText(tags.join('  \u00b7  '), W / 2, cfg.tagsY);
    }

    // ── Desc rule ─────────────────────────────────────────────────────────────
    ctx.strokeStyle = BRG;
    ctx.globalAlpha = cfg.descRuleAlpha;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, cfg.descRuleY); ctx.lineTo(W - PAD, cfg.descRuleY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Description — left aligned ────────────────────────────────────────────
    ctx.font      = cfg.descFont;
    ctx.fillStyle = inkMuted;
    _wrap(ctx, entry.description, PAD, cfg.descY, maxTW, cfg.descLH, cfg.descLines, 'left');
}

// ─── Word-wrap helper ─────────────────────────────────────────────────────────
function _wrap(ctx, text, x, y, maxW, lh, maxLines, align) {
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

// ─── Exit canvas draw ─────────────────────────────────────────────────────────
// Text zones fall downward, bottom-first stagger. easeOutQuart so each zone
// drops fast then decelerates — gravity with air resistance, not a slam.
function drawCardExit(ctx, cfg, entry, palette, side, isDark, exitT) {
    const W   = cfg.canvasW;
    const H   = cfg.canvasH;
    const PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;
    const maxTW = W - PAD * 2;

    const easeOut = t => 1 - Math.pow(1 - t, 4); // easeOutQuart — fast drop, graceful finish
    const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
    const STAGGER = 0.20; // zone 0 leads, zone 3 (title) follows
    const FALL    = H * 0.35; // modest fall — enough to read as falling, not theatrical

    const zoneT = (zone) => {
        const start = zone * STAGGER;
        const raw   = clamp((exitT - start) / (1 - start), 0, 1);
        return easeOut(raw);
    };

    // ── Background ───────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    if (!isDark) {
        ctx.fillStyle = cardBg;
        ctx.beginPath(); ctx.roundRect(0, 0, W, H, cfg.radius); ctx.fill();
    }

    // ── Zone 3: Title (last to fall) ─────────────────────────────────────────
    const t3 = zoneT(3); const op3 = 1 - t3;
    if (op3 > 0.01) {
        ctx.globalAlpha = op3;
        ctx.font = cfg.titleFont; ctx.fillStyle = INK;
        _wrap(ctx, entry.title, W / 2, cfg.titleY + FALL * t3, maxTW, cfg.titleLH, cfg.titleLines, 'center');
        ctx.globalAlpha = 1;
    }

    // ── Zone 2: Highlight ─────────────────────────────────────────────────────
    const t2 = zoneT(2); const op2 = 1 - t2;
    if (entry.highlight && op2 > 0.01) {
        ctx.globalAlpha = op2;
        ctx.font = cfg.hlFont; ctx.fillStyle = BRG;
        ctx.textAlign = 'center';
        ctx.fillText('\u2191  ' + entry.highlight, W / 2, cfg.hlY + FALL * t2);
        ctx.globalAlpha = 1;
    }

    // ── Zone 1: Tags ──────────────────────────────────────────────────────────
    const t1 = zoneT(1); const op1 = 1 - t1;
    const tags = (entry.tags || []).slice(0, cfg.tagsMax);
    if (tags.length && op1 > 0.01) {
        ctx.globalAlpha = op1;
        ctx.font = cfg.tagsFont; ctx.fillStyle = inkVerysoft;
        ctx.textAlign = 'center';
        ctx.fillText(tags.join('  \u00b7  '), W / 2, cfg.tagsY + FALL * t1);
        ctx.globalAlpha = 1;
    }

    // ── Zone 0: Description + rule (first to fall) ───────────────────────────
    const t0 = zoneT(0); const op0 = 1 - t0;
    if (op0 > 0.01) {
        ctx.strokeStyle = BRG; ctx.globalAlpha = op0 * cfg.descRuleAlpha; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, cfg.descRuleY + FALL * t0); ctx.lineTo(W - PAD, cfg.descRuleY + FALL * t0);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.globalAlpha = op0;
        ctx.font = cfg.descFont; ctx.fillStyle = inkMuted;
        _wrap(ctx, entry.description, PAD, cfg.descY + FALL * t0, maxTW, cfg.descLH, cfg.descLines, 'left');
        ctx.globalAlpha = 1;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLACARD CLASS
// ─────────────────────────────────────────────────────────────────────────────


export class Placard {
    constructor(scene, entry, index, total) {
        this.scene   = scene;
        this.entry   = entry;
        this.entryId = entry.id;
        this.index   = index;
        this._total  = total;
        this.exitT   = 0;

        this._isDark   = false;
        this._isMobile = isMobile();

        this.mesh = null;
        this._build();
    }

    _buildCanvas() {
        const cfg = this._isMobile ? MOBILE_CFG : DESKTOP_CFG;
        const cvs = document.createElement('canvas');
        cvs.width  = cfg.canvasW;
        cvs.height = cfg.canvasH;
        const ctx  = cvs.getContext('2d');
        const pal  = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
        drawCard(ctx, cfg, this.entry, pal, 1, this._isDark);
        this._cvs = cvs;
        this._ctx = ctx;
        return cvs;
    }

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

        // All cards start above viewport — Y drives everything, Z is fixed
        this.mesh.position.set(0, START_Y(), READ_Z());
        this.scene.add(this.mesh);
    }

    rebuildCanvas() {
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;
    }

    setTheme(isDark) {
        this._isDark = isDark;
        this._needsStaticRedraw = false;
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;
    }

    onResize() {
        const nowMobile = isMobile();
        if (nowMobile === this._isMobile) return;
        this._isMobile = nowMobile;
        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.PlaneGeometry(PW(), PH());
        const tex = this.mesh.material.map;
        tex.image = this._buildCanvas();
        tex.needsUpdate = true;
    }

    getScreenZones(camera, renderer) {
        if (this.mesh.material.opacity < 0.02) return null;

        const W = renderer.domElement.clientWidth;
        const H = renderer.domElement.clientHeight;
        const pos = this.mesh.position;
        this.mesh.geometry.computeBoundingBox();
        const box = this.mesh.geometry.boundingBox;

        const corners = [
            new THREE.Vector3(pos.x + box.min.x, pos.y + box.max.y, pos.z),
            new THREE.Vector3(pos.x + box.max.x, pos.y + box.max.y, pos.z),
            new THREE.Vector3(pos.x + box.min.x, pos.y + box.min.y, pos.z),
            new THREE.Vector3(pos.x + box.max.x, pos.y + box.min.y, pos.z),
        ].map(v => {
            const ndc = v.clone().project(camera);
            return { x: (ndc.x + 1) / 2 * W, y: (-ndc.y + 1) / 2 * H };
        });

        const left   = Math.min(corners[0].x, corners[2].x);
        const right  = Math.max(corners[1].x, corners[3].x);
        const top    = Math.min(corners[0].y, corners[1].y);
        const bottom = Math.max(corners[2].y, corners[3].y);
        const cW     = right - left;
        const cH     = bottom - top;

        const cfg = this._isMobile ? MOBILE_CFG : DESKTOP_CFG;
        return cfg.zoneFracs.map(([f0, f1]) => ({
            left,
            top:    top + f0 * cH,
            width:  cW,
            height: (f1 - f0) * cH,
        }));
    }

    update(scrollPx) {
        // Card 0 starts CARD0_EARLY px before LANDING_PX so it overlaps the landing exit
        const earlyOffset = this.index === 0 ? CARD0_EARLY : 0;
        const cardStart = LANDING_PX + this.index * CARD_PX - earlyOffset;
        const local     = scrollPx - cardStart;
        const clamp     = (v, a, b) => Math.max(a, Math.min(b, v));
        const easeOut   = t => 1 - Math.pow(1 - t, 4); // easeOutQuart

        // ── Exit phase ────────────────────────────────────────────────────
        const exitStart = SLIDE_PX + HOLD_PX;
        const rawExitT  = clamp((local - exitStart) / EXIT_PX, 0, 1);
        const exitT     = easeOut(rawExitT);
        this.exitT      = exitT;

        // Once fully off-screen below, hide
        if (rawExitT >= 1) {
            this.mesh.material.opacity = 0;
            this.mesh.position.set(0, EXIT_Y() - 2, READ_Z());
            return;
        }

        // ── Slide phase: START_Y → READ_Y ────────────────────────────────
        const rawSlideT = clamp(local / SLIDE_PX, 0, 1);
        const slideT    = easeOut(rawSlideT);
        const slideY    = START_Y() + (READ_Y() - START_Y()) * slideT;

        // ── Final Y ───────────────────────────────────────────────────────
        const finalY = rawExitT > 0
            ? READ_Y() + (EXIT_Y() - READ_Y()) * exitT
            : slideY;

        this.mesh.rotation.z = 0;
        this.mesh.material.opacity = 1;
        this.mesh.position.set(0, finalY, READ_Z());

        // ── Canvas redraw ─────────────────────────────────────────────────
        if (rawExitT > 0) {
            const cfg = this._isMobile ? MOBILE_CFG : DESKTOP_CFG;
            const pal = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
            drawCardExit(this._ctx, cfg, this.entry, pal, 1, this._isDark, exitT);
            this.mesh.material.map.needsUpdate = true;
        } else if (this._needsStaticRedraw) {
            const cfg = this._isMobile ? MOBILE_CFG : DESKTOP_CFG;
            const pal = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
            drawCard(this._ctx, cfg, this.entry, pal, 1, this._isDark);
            this.mesh.material.map.needsUpdate = true;
            this._needsStaticRedraw = false;
        }
        if (rawExitT > 0) this._needsStaticRedraw = true;
    }

    static totalScrollHeight(n) { return LANDING_PX + n * CARD_PX; }
    get positionZ() { return READ_Z(); }
}