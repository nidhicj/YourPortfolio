import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import landingHTML from './overlays/landing.html?raw';
import { SceneSetup } from './scene/SceneSetup.js';
import { Lights } from './scene/Lights.js';
import { PaperRoll, LANDING_PX, ENTRY_PX, rollScrollPx } from './scene/PaperRoll.js';
import { ThemeManager } from './ThemeManager.js';
import { allEntries as rawEntries } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);

// Extra scroll px after last card


function ensureEntryIds(entries) {
    return entries.map((entry, index) => {
        if (entry.id) return entry;
        const base = entry.slug || entry.title || entry.company || entry.name || entry.label || `entry-${index + 1}`;
        const safe = String(base).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return { ...entry, id: safe || `entry-${index + 1}` };
    });
}

const allEntries = ensureEntryIds(rawEntries);


class ManifestStack {
    constructor(allEntries) {
        this.entries  = allEntries;
        this._strips  = new Map(); // entryId → el
        this._shown   = new Set(); // entryIds currently displayed
        this._el      = this._createContainer();
        allEntries.forEach((e, i) => this._createStrip(e, i));
    }

    _createContainer() {
        const el = document.createElement('div');
        el.id = 'manifestStack';
        // Inline styles as the container is created before CSS might be parsed
        el.style.cssText = [
            'position:fixed',
            'bottom:0', 'left:0', 'right:0',
            'z-index:9800',
            'pointer-events:none',
            'display:flex',
            'flex-direction:column',   // strips stack downward in DOM, visual order = newest on top
            'align-items:stretch',
        ].join(';');
        document.body.appendChild(el);
        return el;
    }

    _createStrip(entry, idx) {
        const el   = document.createElement('div');
        el.className = 'manifest-strip';
        el.dataset.entryId = entry.id;
        el._gen = 0;

        // Full date range for the right side
        const dateStr = (entry.date || '').trim();
        const dateParts = dateStr.split(/\s*[–—-]\s*/);
        const dateDisplay = dateParts.length >= 2
            ? `${dateParts[0].trim()} – ${dateParts[1].trim()}`
            : dateStr || '—';

        const tags = (entry.tags || []).slice(0, 3).join(' · ');

        // Spine layout: left half (right-aligned) | right half (left-aligned)
        el.innerHTML = `
            <div class="ms-left">
                <span class="ms-tags">${tags}</span>
                <span class="ms-title">${entry.title}</span>
            </div>
            <div class="ms-spine"></div>
            <div class="ms-right">
                <span class="ms-date">${dateDisplay}</span>
            </div>`;

        el.style.display = 'none';
        // Click restores the placard — JS will scroll back to hold position
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';

        this._el.prepend(el);
        this._strips.set(entry.id, el);
    }

    bindPlacards(placards) {
        // Called after placards are created — wires click → scroll back
        this._strips.forEach((strip, entryId) => {
            strip.addEventListener('click', () => {
                const placard = placards.find(p => p.entryId === entryId);
                if (!placard) return;
                // Scroll to the hold phase of this card so it fully re-appears
                const target = LANDING_PX + placard.index * ENTRY_PX;
                window.scrollTo({ top: target, behavior: 'smooth' });
            });
        });
    }

    update(scrollPx, placards) {
        const clamp  = (v,a,b) => Math.max(a, Math.min(b, v));

        let activeId = null;

        placards.forEach(placard => {
            const exitT      = placard.exitT ?? 0;
            const shouldShow = exitT > 0;
            const strip      = this._strips.get(placard.entryId);
            if (!strip) return;

            if (shouldShow && !this._shown.has(placard.entryId)) {
                // Cancel any pending hide from a previous scroll-back
                strip._gen++;
                strip.style.display = '';
                requestAnimationFrame(() => strip.classList.add('ms-visible'));
                this._shown.add(placard.entryId);
            } else if (!shouldShow && this._shown.has(placard.entryId)) {
                strip.classList.remove('ms-visible');
                this._shown.delete(placard.entryId);
                // Capture gen at hide time; only set display:none if gen unchanged
                const gen = ++strip._gen;
                const hide = () => { if (strip._gen === gen) strip.style.display = 'none'; };
                strip.addEventListener('transitionend', hide, { once: true });
                setTimeout(hide, 400); // fallback
            }

            // Active = entry currently near center (exitT around 0→0.5)
            if (exitT >= 0 && exitT < 0.6) activeId = placard.entryId;
        });

        this._strips.forEach((strip, id) => {
            strip.classList.toggle('ms-active', id === activeId);
        });
    }
}

class PortfolioApp {
    constructor() {
        this.sceneSetup     = new SceneSetup();
        this.lights         = null;
        this.placards       = [];
        this.roll           = null;
        this.themeManager   = null;
        this._cachedMeshY   = null;
        this._cachedSW      = null;
        this.manifest       = null;
        this.scrollProgress = 0;
        this.scrollPx       = 0;
        this.init();
    }

    init() {
        this.setupScroll();
        this.lights = new Lights(this.sceneSetup.scene);
        this.createPlacards();
        this.initTheme();
        this.buildIndexBar();
        this.setupUI();
        this.manifest       = new ManifestStack(allEntries);
        this.manifest.bindPlacards(this.placards);
        this.animate();
        this._loadOverlays();
        this.handleLoading();
        this.setupResizeForPlacards();
        this._ensureFonts();
    }

    // Force a canvas redraw on all placards once web fonts are confirmed loaded.
    // Without this, _build() fires before Bowlby One / DM Mono / Crete Round are
    // available and the browser falls back to generic families on first render.
    _ensureFonts() {
        const fonts = [
            'bold 1px "Bowlby One"',
            '400 1px "DM Mono"',
            '400 1px "Crete Round"',
        ];
        Promise.all(fonts.map(f => document.fonts.load(f)))
            .then(() => {
                this.roll?.rebuildCanvas();
            })
            .catch(() => {}); // non-fatal — fonts may already be loaded
    }

    _loadOverlays() {
        const inject = (html, mountId) => {
            const mount = document.getElementById(mountId);
            if (mount) mount.outerHTML = html;
        };
        inject(landingHTML,  'landingMount');
        // Tell CSS how tall the manifest stack can grow so about-bio clears it
        const stackMax = allEntries.length * 34;
        document.documentElement.style.setProperty('--stack-max-height', `${stackMax}px`);
    }

    // ─── Scroll ───────────────────────────────────────────────────────────────
    setupScroll() {
        const n = allEntries.length;
        // Roll has work entries + 3 extra slots (contact, blog, about)
        const scrollHeight = LANDING_PX + rollScrollPx(n + 3) + 600;
        document.body.style.height = `${scrollHeight}px`;

        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => {
                this.scrollProgress = self.progress;
                this.scrollPx = window.scrollY;
                this.updateScrollIndicator(self.progress);
                this.updateLandingTransition();
                this.updateIndexBar();
                this.updateEndSections();
            }
        });

        window.addEventListener('scroll', () => { this.scrollPx = window.scrollY; }, { passive: true });
    }

    // ─── Paper Roll ───────────────────────────────────────────────────────────
    createPlacards() {
        this.roll = new PaperRoll(this.sceneSetup.scene, allEntries);
        // Expose .placards shims so ManifestStack / index bar code still works.
        // Add setTheme and rebuildCanvas stubs so ThemeManager keeps working.
        this.placards = this.roll.placards.map(shim => ({
            ...shim,
            setTheme:     (dark) => this.roll.setTheme(dark),
            rebuildCanvas:()     => this.roll.rebuildCanvas(),
        }));
    }

    // ─── Index bars ───────────────────────────────────────────────────────────
    buildIndexBar() {
        const workBar = document.getElementById('indexBarWork');
        if (!workBar) return;

        allEntries.forEach((entry) => {
            const item  = document.createElement('button');
            item.className = 'index-item';
            item.dataset.entryId = entry.id;

            // Show full date range split across two spans if it contains –
            const dateStr = (entry.date || '').trim();
            const parts   = dateStr.split(/\s*[–—-]\s*/); // split on en-dash, em-dash, or hyphen

            if (parts.length >= 2) {
                const from = document.createElement('span');
                from.className = 'index-date-from';
                from.textContent = parts[0].trim();

                const to = document.createElement('span');
                to.className = 'index-date-to';
                to.textContent = parts[1].trim();

                item.appendChild(from);
                item.appendChild(to);
            } else {
                const year = document.createElement('span');
                year.className = 'index-year';
                year.textContent = dateStr || '—';
                item.appendChild(year);
            }

            item.addEventListener('click', () => this.jumpToEntryById(entry.id));
            workBar.appendChild(item);
        });
    }

    jumpToEntryById(entryId) {
        const shim = this.placards.find(p => p.entryId === entryId);
        if (!shim) return;
        window.scrollTo({ top: LANDING_PX + shim.index * ENTRY_PX, behavior: 'smooth' });
    }

    // ─── End sections ─────────────────────────────────────────────────────────
    // Contact, Blog, About are all drawn on the paper roll — no DOM overlays.
    updateEndSections() {}

    updateIndexBar() {
        const activeId = this.roll?.activeEntryId(this.scrollPx) ?? null;

        document.querySelectorAll('.index-item').forEach((item) => {
            item.classList.toggle('is-active', item.dataset.entryId === activeId);
        });

        const landingGone    = this.scrollPx >= LANDING_PX * 0.65;
        const n              = allEntries.length;
        // Bar disappears as soon as the contact slot starts rolling in
        const workSectionEnd = LANDING_PX + rollScrollPx(n);
        const inContactAbout = this.scrollPx >= workSectionEnd;

        const navHome = document.getElementById('navHome');
        const navWork = document.getElementById('navWork');
        if (navHome) navHome.classList.toggle('is-active', !landingGone);
        if (navWork) navWork.classList.toggle('is-active', landingGone && !inContactAbout);

        const workWrapper = document.getElementById('indexBarWorkWrapper');
        if (!workWrapper) return;

        const showBar = landingGone && !inContactAbout;
        workWrapper.classList.toggle('bar--visible', showBar);
        workWrapper.classList.toggle('bar--hidden',  !showBar);
    }

    // ─── Landing transition — per-element stagger exit ───────────────────────
    // LEFT rail:  each .lx-item slides LEFT one by one (staggered)
    // RIGHT RAIL: hero-photo exits first, hero-links exits second
    // Everything driven by scrollPx — fully reversible.
    updateLandingTransition() {
        const landing = document.getElementById('landingPage');
        if (!landing) return;

        const px     = this.scrollPx;
        const clamp  = (v,a,b) => Math.max(a, Math.min(b, v));
        // easeInQuart: objects accelerate away — exits feel physical, not floaty
        const easeIn = t => t * t * t * t;
        // easeInOutCubic: for the full-page fade — slow start, peak mid, slow finish
        const easeIO = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

        // ── LEFT RAIL: per .lx-item stagger ──────────────────────────────
        // Items exit with a 60px stagger, over 420px each — uses full 700px budget
        const lxItems = landing.querySelectorAll('.lx-item');
        lxItems.forEach((el, i) => {
            const start = i * 60;
            const end   = start + 420;
            const raw   = clamp((px - start) / (end - start), 0, 1);
            const t     = easeIn(raw);
            el.style.transform = `translate3d(${-window.innerWidth * t}px, 0, 0)`;
            el.style.opacity   = String(clamp(1 - raw * 1.6, 0, 1)); // fades before fully off-screen
        });

        // ── RIGHT RAIL ────────────────────────────────────────────────────
        // Unit A: hero-blocks  (px  60–460)
        // Unit B: hero-photo   (px 140–520)
        // Unit C: hero-links   (px 220–580)
        const heroBlocks = landing.querySelectorAll('.hero-block');
        const blockRaw   = clamp((px - 60)  / 400, 0, 1);
        const blockT     = easeIn(blockRaw);
        heroBlocks.forEach(b => {
            b.style.transform = `translateX(${window.innerWidth * blockT}px)`;
            b.style.opacity   = String(clamp(1 - blockRaw * 1.6, 0, 1));
        });

        const photoEl = landing.querySelector('.hero-photo');
        if (photoEl) {
            const raw = clamp((px - 140) / 380, 0, 1);
            const t   = easeIn(raw);
            photoEl.style.transform = `translateX(${window.innerWidth * t}px)`;
            photoEl.style.opacity   = String(clamp(1 - raw * 1.6, 0, 1));
        }

        const linksEl = landing.querySelector('.hero-links');
        if (linksEl) {
            const raw = clamp((px - 220) / 360, 0, 1);
            const t   = easeIn(raw);
            linksEl.style.transform = `translateX(${window.innerWidth * t}px)`;
            linksEl.style.opacity   = String(clamp(1 - raw * 1.6, 0, 1));
        }

        // ── Whole landing overlay: scale + blur across full 700px budget ──
        const tB  = clamp((px - 80) / 620, 0, 1);
        const tBe = easeIO(tB);
        gsap.set(landing, {
            opacity:   1 - tBe,
            filter:    `blur(${14 * tBe}px)`,
            transform: `scale(${1 - 0.04 * tBe})`
        });
        landing.style.pointerEvents = tBe > 0.98 ? 'none' : 'auto';

        if (tBe > 0.98) {
            landing.querySelectorAll('.landing-hero, .landing-nav')
                .forEach(el => { el.style.pointerEvents = 'none'; });
        } else {
            landing.querySelectorAll('.landing-hero, .landing-nav')
                .forEach(el => { el.style.pointerEvents = ''; });
        }
    }

    updateScrollIndicator(progress) {
        const bar = document.querySelector('.scroll-bar');
        if (bar) bar.style.width = `${progress * 100}%`;
    }

    // ─── Theme ────────────────────────────────────────────────────────────────
    initTheme() {
        const btn = document.getElementById('themeToggle');
        this.themeManager = new ThemeManager(this.sceneSetup.scene, this.placards, btn);
        this.themeManager.init();
        if (btn) btn.addEventListener('click', () => this.themeManager.toggle());
    }

    // ─── UI ───────────────────────────────────────────────────────────────────
    setupUI() {
        const navHome    = document.getElementById('navHome');
        const navWork    = document.getElementById('navWork');
        const navBlog    = document.getElementById('navBlog');
        const navContact = document.getElementById('navContact');
        const navAbout   = document.getElementById('navAbout');

        const n = allEntries.length;
        if (navHome)    navHome.addEventListener('click',    e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        if (navWork)    navWork.addEventListener('click',    e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX, behavior: 'smooth' }); });
        if (navBlog)    navBlog.addEventListener('click',    e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX + rollScrollPx(n + 1), behavior: 'smooth' }); });
        if (navContact) navContact.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX + rollScrollPx(n),     behavior: 'smooth' }); });
        if (navAbout)   navAbout.addEventListener('click',   e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX + rollScrollPx(n + 2), behavior: 'smooth' }); });
    }

    // ─── Roll link hit areas ──────────────────────────────────────────────────
    // Positions transparent <a> tags over the canvas-drawn contact link cards.
    // A CSS div handles the hover highlight — zero canvas redraws, instant response.
    updateRollLinks() {
        const mesh = this.roll?._mesh;
        const hl   = document.getElementById('rollLinkHighlight');

        if (!mesh || mesh.material.opacity < 0.05) {
            if (hl) hl.style.opacity = '0';
            ['rollLinkEmail','rollLinkLinkedIn','rollLinkGitHub'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.pointerEvents = 'none';
            });
            return;
        }

        const camera = this.sceneSetup.camera;
        const sw     = this.sceneSetup.renderer.domElement.clientWidth;
        const sh     = this.sceneSetup.renderer.domElement.clientHeight;

        // Geometry — reuse cached values, only recompute when mesh moves
        const meshY = mesh.position.y;
        const meshZ = mesh.position.z;
        if (meshY === this._cachedMeshY && sw === this._cachedSW) {
            // Mesh hasn't moved — hit areas are still correct, skip
            return;
        }
        this._cachedMeshY = meshY;
        this._cachedSW    = sw;

        const nAll       = allEntries.length + 3;
        const rollH      = mesh.geometry.parameters.height;
        const slotWorldH = rollH / nAll;
        const meshW      = mesh.geometry.parameters.width;

        // Contact slot Y center in world space
        const contactIdx      = allEntries.length;
        const slotLocalY      = rollH / 2 - slotWorldH * (contactIdx + 0.5);
        const slotWorldY      = meshY + slotLocalY;

        // Project to screen — reuse a single vector, no allocation
        const fovHalfTan = Math.tan(camera.fov * Math.PI / 360);
        const dist       = Math.abs(meshZ - camera.position.z);
        const pxPerUnit  = sh / (2 * fovHalfTan * dist);

        // Slot screen center Y
        const slotScreenCY = sh / 2 - (slotWorldY - camera.position.y) * pxPerUnit;
        const slotScreenH  = slotWorldH * pxPerUnit;

        // Mesh screen X extents
        const meshScreenCX = sw / 2;  // mesh is centered at x=0
        const meshScreenW  = meshW * pxPerUnit;
        const screenLeft   = meshScreenCX - meshScreenW / 2;

        // Link cards: lY = slotY + H*0.70, lH = H*0.18 (canvas fractions)
        const cardTop    = slotScreenCY - slotScreenH * 0.5 + slotScreenH * 0.70;
        const cardHeight = slotScreenH * 0.18;
        const cardW      = meshScreenW / 3;

        const visible = cardTop > -cardHeight && cardTop < sh + cardHeight;

        const ids = ['rollLinkEmail', 'rollLinkLinkedIn', 'rollLinkGitHub'];
        ids.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;

            if (!el._hoverWired) {
                el._hoverWired = true;
                el.addEventListener('mouseenter', () => {
                    if (!hl) return;
                    // Snap highlight to this card's position (already computed above)
                    const hx = parseFloat(el.style.left);
                    const hy = parseFloat(el.style.top);
                    const hw = parseFloat(el.style.width);
                    const hh = parseFloat(el.style.height);
                    hl.style.left    = `${hx}px`;
                    hl.style.top     = `${hy}px`;
                    hl.style.width   = `${hw}px`;
                    hl.style.height  = `${hh}px`;
                    hl.style.opacity = '1';
                });
                el.addEventListener('mouseleave', () => {
                    if (hl) hl.style.opacity = '0';
                });
            }

            if (!visible) { el.style.pointerEvents = 'none'; return; }

            const x = screenLeft + i * cardW + cardW * 0.04;
            const w = cardW * 0.92;
            el.style.left          = `${x}px`;
            el.style.top           = `${cardTop}px`;
            el.style.width         = `${w}px`;
            el.style.height        = `${cardHeight}px`;
            el.style.pointerEvents = 'auto';
            el.style.cursor        = 'pointer';
        });
    }

    handleLoading() {
        document.body.style.overflow = '';
    }

    setupResizeForPlacards() {
        window.addEventListener('resize', () => {
            this.roll?.onResize();
        }, { passive: true });
    }

    // ─── Render loop ──────────────────────────────────────────────────────────
    animate() {
        requestAnimationFrame(() => this.animate());
        this.roll?.update(this.scrollPx);
        this.manifest?.update(this.scrollPx, this.placards);
        this.updateRollLinks();
        this.sceneSetup.render();
    }
}


const boot = () => { try { window.__portfolioApp = new PortfolioApp(); } catch(e) { console.error(e); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();