import * as THREE from 'three';
import { THEME_COLORS } from '../ThemeManager.js';

// ─── Breakpoint ───────────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 640;

// ─── Camera constants (must match SceneSetup.js) ─────────────────────────────
const CAM_Y   = 1.6;
const CAM_Z   = 0;
const PLANE_Z = -2;
const FOV_DEG = 60;

const vpHalfH = () => {
    const fov = isMobile() ? 75 : FOV_DEG;
    return Math.tan((fov * Math.PI / 180) / 2) * Math.abs(PLANE_Z - CAM_Z);
};
const vpH = () => vpHalfH() * 2;
const vpW = () => vpH() * (window.innerWidth / window.innerHeight);

// ─── Roll geometry ────────────────────────────────────────────────────────────
const ROLL_WORLD_W = () => Math.min(vpW() * 0.90, isMobile() ? 2.2 : 3.0);
const SLOT_WORLD_H = () => {
    const aspect = isMobile() ? (900 / 1900) : (2800 / 1900);
    return ROLL_WORLD_W() / aspect;
};

// ─── Scroll budget ────────────────────────────────────────────────────────────
export const LANDING_PX    = 700;
export const ENTRY_PX      = 700;
export const ROLL_ENTRY_PX = ENTRY_PX;
export const rollScrollPx  = (n) => n * ENTRY_PX; // n = work entries only

// ─── Layout configs ───────────────────────────────────────────────────────────
import { DESKTOP_CFG } from './cardConfigs/desktop.js';
import { MOBILE_CFG   } from './cardConfigs/mobile.js';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

function _divider(ctx, W, PAD, slotY, isDark) {
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, slotY + 1);
    ctx.lineTo(W - PAD, slotY + 1);
    ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
//  WORK ENTRY SLOT
// ─────────────────────────────────────────────────────────────────────────────
function drawSlot(ctx, cfg, entry, palette, isDark, slotY) {
    const W = cfg.canvasW, H = cfg.canvasH, PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;
    const maxTW = W - PAD * 2;

    if (!isDark) { ctx.fillStyle = cardBg; ctx.fillRect(0, slotY, W, H); }
    _divider(ctx, W, PAD, slotY, isDark);

    ctx.font = cfg.titleFont; ctx.fillStyle = INK;
    _wrap(ctx, entry.title, W / 2, slotY + cfg.titleY, maxTW, cfg.titleLH, cfg.titleLines, 'center');

    if (entry.highlight) {
        ctx.font = cfg.hlFont; ctx.fillStyle = BRG; ctx.textAlign = 'center';
        ctx.fillText('\u2191  ' + entry.highlight, W / 2, slotY + cfg.hlY);
    }

    const tags = (entry.tags || []).slice(0, cfg.tagsMax);
    if (tags.length) {
        ctx.font = cfg.tagsFont; ctx.fillStyle = inkVerysoft; ctx.textAlign = 'center';
        ctx.fillText(tags.join('  \u00b7  '), W / 2, slotY + cfg.tagsY);
    }

    ctx.strokeStyle = BRG; ctx.globalAlpha = cfg.descRuleAlpha; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PAD, slotY + cfg.descRuleY); ctx.lineTo(W - PAD, slotY + cfg.descRuleY); ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = cfg.descFont; ctx.fillStyle = inkMuted;
    _wrap(ctx, entry.description, PAD, slotY + cfg.descY, maxTW, cfg.descLH, cfg.descLines, 'left');
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONTACT SLOT — static canvas draw, hover handled by DOM overlay
// ─────────────────────────────────────────────────────────────────────────────
function drawContactSlot(ctx, cfg, palette, isDark, slotY) {
    const W = cfg.canvasW, H = cfg.canvasH, PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;
    const CX = W / 2;

    if (!isDark) { ctx.fillStyle = cardBg; ctx.fillRect(0, slotY, W, H); }
    _divider(ctx, W, PAD, slotY, isDark);

    // Kicker
    ctx.font = `500 ${cfg.pad * 0.22}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.7; ctx.textAlign = 'center';
    ctx.fillText('GET IN TOUCH', CX, slotY + H * 0.28);
    ctx.globalAlpha = 1;

    // Title
    ctx.font = cfg.titleFont; ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText("Let's work", CX, slotY + H * 0.42);
    ctx.fillStyle = BRG;
    ctx.fillText('together.', CX, slotY + H * 0.42 + cfg.titleLH);

    // Links row — three items side by side
    const links = [
        { label: 'Email',    sub: 'joshichi.nidhi@gmail.com' },
        { label: 'LinkedIn', sub: 'connect-nidhichijoshi'    },
        { label: 'GitHub',   sub: 'nidhicj'                  },
    ];
    const lW = (W - PAD * 2) / 3;
    const lY = slotY + H * 0.70;
    const lH = H * 0.18;

    links.forEach((link, i) => {
        const lX = PAD + i * lW;

        // Card border
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 2; ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.roundRect(lX + 16, lY, lW - 32, lH, 16);
        ctx.stroke();

        // Label
        ctx.font = `500 ${cfg.pad * 0.26}px "DM Mono",monospace`;
        ctx.fillStyle = BRG; ctx.textAlign = 'center';
        ctx.fillText(link.label, lX + lW / 2, lY + lH * 0.42);

        // Sub
        ctx.font = `400 ${cfg.pad * 0.20}px "DM Mono",monospace`;
        ctx.fillStyle = inkVerysoft; ctx.textAlign = 'center';
        ctx.fillText(link.sub, lX + lW / 2, lY + lH * 0.72);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  BLOG SLOT
// ─────────────────────────────────────────────────────────────────────────────
function drawBlogSlot(ctx, cfg, palette, isDark, slotY) {
    const W = cfg.canvasW, H = cfg.canvasH, PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;
    const CX = W / 2;

    if (!isDark) { ctx.fillStyle = cardBg; ctx.fillRect(0, slotY, W, H); }
    _divider(ctx, W, PAD, slotY, isDark);

    // Kicker
    ctx.font = `500 ${cfg.pad * 0.22}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.7; ctx.textAlign = 'center';
    ctx.fillText('WRITING', CX, slotY + H * 0.28);
    ctx.globalAlpha = 1;

    // Title
    ctx.font = cfg.titleFont; ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText('Blog &', CX, slotY + H * 0.42);
    ctx.fillStyle = BRG;
    ctx.fillText('notes.', CX, slotY + H * 0.42 + cfg.titleLH);

    // Coming soon message
    ctx.font = `400 ${cfg.pad * 0.27}px "Crete Round",serif`;
    ctx.fillStyle = inkMuted; ctx.textAlign = 'center'; ctx.globalAlpha = 0.7;
    _wrap(ctx, 'Writing about AI systems, robotics, and things I had to figure out the hard way.', CX, slotY + H * 0.70, W - PAD * 4, cfg.descLH * 0.9, 2, 'center');
    ctx.globalAlpha = 1;

    // Coming soon pill
    const pillW = PAD * 4, pillH = PAD * 0.7;
    const pillX = CX - pillW / 2, pillY = slotY + H * 0.84;
    ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2); 
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `500 ${cfg.pad * 0.20}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.8; ctx.textAlign = 'center';
    ctx.fillText('COMING SOON', CX, pillY + pillH * 0.68);
    ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ABOUT SLOT
// ─────────────────────────────────────────────────────────────────────────────
function drawAboutSlot(ctx, cfg, palette, isDark, slotY) {
    const W = cfg.canvasW, H = cfg.canvasH, PAD = cfg.pad;
    const { ink: INK, inkMuted, inkVerysoft, burgundy: BRG, cardBg } = palette;

    if (!isDark) { ctx.fillStyle = cardBg; ctx.fillRect(0, slotY, W, H); }
    _divider(ctx, W, PAD, slotY, isDark);

    // ── Layout constants ──────────────────────────────────────────────────────
    const COL_W   = (W - PAD * 3) / 2;  // each column width
    const RX      = PAD * 2 + COL_W;    // right column X start
    const TOP     = slotY + H * 0.10;   // both columns start here

    // Font sizes — at 2x canvas these render at half size on screen
    const kickerFS = Math.round(PAD * 0.22);  // ~40px canvas = 20px screen
    const titleFS  = Math.round(PAD * 0.72);  // ~130px canvas = 65px screen — big and readable
    const funFS    = Math.round(PAD * 0.20);  // ~36px canvas = 18px screen
    const labelFS  = Math.round(PAD * 0.22);
    const degreeFS = Math.round(PAD * 0.26);  // ~47px canvas = 23px screen
    const schoolFS = Math.round(PAD * 0.21);
    const yearFS   = Math.round(PAD * 0.19);
    const chipFS   = Math.round(PAD * 0.20);  // ~36px canvas = 18px screen

    // Line heights — explicit, no fractional math
    const kickerLH = Math.round(kickerFS * 1.5);
    const titleLH  = Math.round(titleFS  * 1.3);
    const degreeLH = Math.round(degreeFS * 1.5);
    const schoolLH = Math.round(schoolFS * 1.5);
    const yearLH   = Math.round(yearFS   * 1.5);
    const chipH    = Math.round(chipFS   * 1.9);
    const chipGap  = Math.round(PAD * 0.15);

    // ── LEFT COLUMN ───────────────────────────────────────────────────────────
    let ly = TOP;

    // Kicker
    ctx.font = `500 ${kickerFS}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.7; ctx.textAlign = 'left';
    ctx.fillText('ABOUT ME', PAD, ly + kickerFS);
    ctx.globalAlpha = 1;
    ly += kickerLH + Math.round(PAD * 0.3);

    // Title
    ctx.font = `400 ${titleFS}px "Bowlby One",sans-serif`;
    ctx.fillStyle = INK; ctx.textAlign = 'left';
    ctx.fillText('Know', PAD, ly + titleFS);
    ly += titleLH;
    ctx.fillStyle = BRG;
    ctx.fillText('more.', PAD, ly + titleFS);
    ly += titleLH + Math.round(PAD * 0.55);

    // Bio — single block, enough lines for full text
    const bioFS    = Math.round(PAD * 0.23);
    const bioLH    = Math.round(bioFS * 1.70);
    const BIO_LINES = 6;

    ctx.font = `400 ${bioFS}px "Crete Round",serif`;
    ctx.fillStyle = inkMuted; ctx.globalAlpha = 0.9;
    _wrap(ctx,
        "I\u2019m an AI/ML engineer who bridges research and production building systems that are robust, explainable, and ready to ship. Always looking for systems that need automating, so colleagues aren\u2019t bogged down by repetitive manual work. AI is my tool for turning cognitive tasks into scalable systems.",
        PAD, ly + bioFS, COL_W, bioLH, BIO_LINES, 'left');
    ly += bioLH * BIO_LINES + Math.round(PAD * 0.5);
    ctx.globalAlpha = 1;

    // Fun line
    ctx.font = `400 ${funFS}px "Crete Round",serif`;
    ctx.fillStyle = inkVerysoft; ctx.globalAlpha = 0.65;
    ctx.textAlign = 'left';
    ctx.fillText('✦  Over-engineering my coffee routine since 2013.', PAD, ly + funFS);
    ctx.globalAlpha = 1;

    // ── RIGHT COLUMN ──────────────────────────────────────────────────────────
    let ry = TOP;

    // ── Education ──
    ctx.font = `500 ${labelFS}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.6; ctx.textAlign = 'left';
    ctx.fillText('EDUCATION', RX, ry + labelFS);
    ctx.globalAlpha = 1;
    ry += kickerLH + Math.round(PAD * 0.2);

    const edu = [
        { degree: 'M.Sc. Information Technology', school: 'University of Stuttgart, Germany', year: '2019 – 2022' },
        { degree: 'B.E. Electrical & Electronics',  school: 'Ramaiah Institute of Technology, Bangalore', year: '2013 – 2017' },
    ];

    edu.forEach(e => {
        const barX = RX;
        const barH = degreeLH * 2 + schoolLH;

        // Accent bar
        ctx.fillStyle = BRG; ctx.globalAlpha = 0.22;
        ctx.fillRect(barX, ry, 5, barH);
        ctx.globalAlpha = 1;

        const tx = RX + Math.round(PAD * 0.25);

        // Degree (up to 2 lines)
        ctx.font = `500 ${degreeFS}px "DM Sans",sans-serif`;
        ctx.fillStyle = INK; ctx.textAlign = 'left';
        _wrap(ctx, e.degree, tx, ry + degreeFS, COL_W - PAD * 0.3, degreeLH, 2, 'left');

        // School
        ctx.font = `400 ${schoolFS}px "DM Mono",monospace`;
        ctx.fillStyle = inkVerysoft;
        ctx.fillText(e.school, tx, ry + degreeLH * 2 + schoolFS);

        // Year
        ctx.font = `400 ${yearFS}px "DM Mono",monospace`;
        ctx.fillStyle = BRG; ctx.globalAlpha = 0.7;
        ctx.fillText(e.year, tx, ry + degreeLH * 2 + schoolLH + yearFS);
        ctx.globalAlpha = 1;

        ry += degreeLH * 2 + schoolLH + yearLH + Math.round(PAD * 0.45);
    });

    ry += Math.round(PAD * 0.35);

    // ── Skills ──
    ctx.font = `500 ${labelFS}px "DM Mono",monospace`;
    ctx.fillStyle = BRG; ctx.globalAlpha = 0.6; ctx.textAlign = 'left';
    ctx.fillText('SKILLS', RX, ry + labelFS);
    ctx.globalAlpha = 1;
    ry += kickerLH + Math.round(PAD * 0.2);

    const skills = ['Python', 'PyTorch', 'YOLOv8', 'LangChain', 'RAG', 'ROS2', 'Docker', 'C++', 'n8n', 'FastAPI', 'OpenCV'];
    const chipPadX = Math.round(PAD * 0.28);
    const maxChipW = COL_W; // never overflow column

    ctx.font = `400 ${chipFS}px "DM Mono",monospace`;
    let cx = RX, cy = ry;

    skills.forEach(skill => {
        // Use measured width but clamp to column — guards against fallback font metrics
        const measured = ctx.measureText(skill).width;
        // DM Mono is ~0.62em per char — use whichever is larger as a safety net
        const estimated = skill.length * chipFS * 0.62;
        const tw = Math.min(Math.max(measured, estimated) + chipPadX * 2, maxChipW);

        if (cx + tw > RX + COL_W) { cx = RX; cy += chipH + chipGap; }

        ctx.beginPath();
        ctx.roundRect(cx, cy, tw, chipH, chipH / 2);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; ctx.fill();
        ctx.strokeStyle = BRG; ctx.globalAlpha = 0.20; ctx.lineWidth = 2; ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = BRG; ctx.globalAlpha = 0.85; ctx.textAlign = 'center';
        ctx.fillText(skill, cx + tw / 2, cy + chipH * 0.67);
        ctx.globalAlpha = 1;
        cx += tw + chipGap;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAPER ROLL
// ─────────────────────────────────────────────────────────────────────────────
export class PaperRoll {
    constructor(scene, entries) {
        this.scene    = scene;
        this.entries  = entries;  // work entries only
        this._n       = entries.length;
        this._isDark  = false;

        // Total slots = work entries + contact + blog + about
        this._totalSlots = this._n + 3;

        // Shims for work entries only (manifest / index bar)
        this.placards = entries.map((e, i) => ({
            entryId: e.id,
            index:   i,
            exitT:   0,
        }));

        this._mesh = null;
        this._cvs  = null;
        this._ctx  = null;
        this._build();
    }

    _build() {
        const cfg  = this._cfg();
        const nAll = this._totalSlots;
        const CW   = cfg.canvasW;
        const CH   = cfg.canvasH;

        const cvs = document.createElement('canvas');
        cvs.width  = CW;
        cvs.height = CH * nAll;
        this._cvs = cvs;
        this._ctx = cvs.getContext('2d');

        this._drawCanvas();

        const tex = new THREE.CanvasTexture(cvs);
        tex.anisotropy = 16;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;

        const rollH = SLOT_WORLD_H() * nAll;
        const rollW = ROLL_WORLD_W();

        this._mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(rollW, rollH),
            new THREE.MeshBasicMaterial({
                map: tex, transparent: true, opacity: 0,
                side: THREE.FrontSide, depthWrite: false,
            })
        );

        this._mesh.position.set(0, CAM_Y, PLANE_Z);
        this.scene.add(this._mesh);
    }

    _cfg() {
        return isMobile() ? MOBILE_CFG : DESKTOP_CFG;
    }

    _drawCanvas() {
        const cfg  = this._cfg();
        const pal  = this._isDark ? THEME_COLORS.dark : THEME_COLORS.light;
        const ctx  = this._ctx;
        const nAll = this._totalSlots;
        const CW   = cfg.canvasW;
        const CH   = cfg.canvasH;

        ctx.clearRect(0, 0, CW, CH * nAll);
        if (!this._isDark) {
            ctx.fillStyle = pal.cardBg;
            ctx.fillRect(0, 0, CW, CH * nAll);
        }

        // Work entries
        this.entries.forEach((entry, i) => {
            drawSlot(ctx, cfg, entry, pal, this._isDark, i * CH);
        });

        // Extra sections after work entries
        const base = this._n;
        drawContactSlot(ctx, cfg, pal, this._isDark, (base + 0) * CH);
        drawBlogSlot   (ctx, cfg, pal, this._isDark, (base + 1) * CH);
        drawAboutSlot  (ctx, cfg, pal, this._isDark, (base + 2) * CH);
    }

    _drawAll() {
        this._drawCanvas();
        if (this._mesh) this._mesh.material.map.needsUpdate = true;
    }

    update(scrollPx) {
        const nAll  = this._totalSlots;
        const local = scrollPx - LANDING_PX;

        const totalRollPx = nAll * ENTRY_PX;
        const visible = local > -ENTRY_PX && local < totalRollPx + ENTRY_PX;
        this._mesh.material.opacity = visible ? 1 : 0;
        if (!visible) return;

        const worldPerPx = SLOT_WORLD_H() / ENTRY_PX;
        const rollH      = SLOT_WORLD_H() * nAll;
        const baseY      = CAM_Y - (rollH / 2 - SLOT_WORLD_H() * 0.5);
        const meshY      = baseY + local * worldPerPx;

        this._mesh.position.setY(meshY);

        // Update shim exitT for work entries only
        const scrolledEntries = local / ENTRY_PX;
        this.placards.forEach((shim, i) => {
            const t = scrolledEntries - i;
            shim.exitT = Math.max(0, Math.min(1, t));
        });
    }

    activeEntryId(scrollPx) {
        const local = scrollPx - LANDING_PX;
        const idx   = Math.round(local / ENTRY_PX);
        if (idx < 0 || idx >= this._n) return null;
        return this.entries[idx]?.id ?? null;
    }

    setTheme(isDark) {
        this._isDark = isDark;
        this._drawAll();
    }

    rebuildCanvas() {
        this._drawAll();
    }

    onResize() {
        const rollH = SLOT_WORLD_H() * this._totalSlots;
        const rollW = ROLL_WORLD_W();
        this._mesh.geometry.dispose();
        this._mesh.geometry = new THREE.PlaneGeometry(rollW, rollH);
        this._drawAll();
    }
}