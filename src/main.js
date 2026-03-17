import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import contactHTML from './overlays/contact.html?raw';
import aboutHTML   from './overlays/about.html?raw';
import landingHTML from './overlays/landing.html?raw';
import { SceneSetup } from './scene/SceneSetup.js';
import { Lights } from './scene/Lights.js';
import { Placard, CARD_PX, SLIDE_PX, EXIT_PX, HOLD_PX, LANDING_PX } from './scene/Placard.js';
import { ThemeManager } from './ThemeManager.js';
import { allEntries as rawEntries } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);

// Extra scroll px after last card
const CONTACT_PX = EXIT_PX + 600;
const ABOUT_PX   = 800;

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
                const target = LANDING_PX + placard.index * CARD_PX + SLIDE_PX;
                window.scrollTo({ top: target, behavior: 'smooth' });
            });
        });
    }

    update(scrollPx, placards) {
        const clamp  = (v,a,b) => Math.max(a, Math.min(b, v));

        let activeId = null;

        placards.forEach(placard => {
            const localPx   = scrollPx - (LANDING_PX + placard.index * CARD_PX);
            const exitStart = SLIDE_PX + HOLD_PX;
            const exitT     = clamp((localPx - exitStart) / EXIT_PX, 0, 1);
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

            // Active = card in HOLD or first half of EXIT
            const inHold  = localPx >= SLIDE_PX && localPx < exitStart;
            const earlyEx = exitT > 0 && exitT < 0.5;
            if (inHold || earlyEx) activeId = placard.entryId;
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
        this.themeManager   = null;
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
    }

    _loadOverlays() {
        const inject = (html, mountId) => {
            const mount = document.getElementById(mountId);
            if (mount) mount.outerHTML = html;
        };
        inject(landingHTML,  'landingMount');
        inject(contactHTML,  'contactOverlayMount');
        inject(aboutHTML,    'aboutOverlayMount');
        // Tell CSS how tall the manifest stack can grow so about-bio clears it
        const stackMax = allEntries.length * 34;
        document.documentElement.style.setProperty('--stack-max-height', `${stackMax}px`);
    }

    // ─── Scroll ───────────────────────────────────────────────────────────────
    setupScroll() {
        const scrollHeight = LANDING_PX + allEntries.length * CARD_PX + CONTACT_PX + ABOUT_PX;
        document.body.style.height = `${scrollHeight}px`;

        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
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

    // ─── Placards ─────────────────────────────────────────────────────────────
    createPlacards() {
        allEntries.forEach((entry, i) => {
            const p = new Placard(this.sceneSetup.scene, entry, i, allEntries.length);
            this.placards.push(p);
        });
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
        const placard = this.placards.find(p => p.entryId === entryId);
        if (!placard) return;
        window.scrollTo({ top: LANDING_PX + placard.index * CARD_PX + SLIDE_PX, behavior: 'smooth' });
    }

    // ─── Contact + About overlays ─────────────────────────────────────────────
    updateEndSections() {
        const lastCardExitEnd = LANDING_PX + allEntries.length * CARD_PX;
        const contactStart    = lastCardExitEnd;
        const aboutStart      = contactStart + CONTACT_PX - 300;

        const px    = this.scrollPx;
        const clamp = (v,a,b) => Math.max(a, Math.min(b,v));

        const contactT = clamp((px - contactStart) / 300, 0, 1);
        const aboutT   = clamp((px - aboutStart)   / 300, 0, 1);

        const contactEl = document.getElementById('contactOverlay');
        const aboutEl   = document.getElementById('aboutOverlay');

        if (contactEl) {
            contactEl.style.opacity       = contactT;
            contactEl.style.pointerEvents = contactT > 0.05 ? 'auto' : 'none';
            contactEl.style.transform     = `translateY(${(1 - contactT) * 40}px)`;
        }
        if (aboutEl) {
            aboutEl.style.opacity       = aboutT;
            aboutEl.style.pointerEvents = aboutT > 0.05 ? 'auto' : 'none';
            aboutEl.style.transform     = `translateY(${(1 - aboutT) * 40}px)`;
        }

        if (contactEl) {
            const contactOut   = clamp((px - aboutStart) / 200, 0, 1);
            const finalOpacity = Math.max(0, contactT - contactOut);
            contactEl.style.opacity       = finalOpacity;
            if (finalOpacity <= 0) contactEl.style.pointerEvents = 'none';
        }

        const navContact = document.getElementById('navContact');
        const navAbout   = document.getElementById('navAbout');
        if (navContact) navContact.classList.toggle('is-active', contactT > 0.5 && aboutT < 0.5);
        if (navAbout)   navAbout.classList.toggle('is-active',   aboutT > 0.5);
    }

    updateIndexBar() {
        const offsetPx      = Math.max(0, this.scrollPx - LANDING_PX);
        const activeIndex   = Math.min(this.placards.length - 1, Math.max(0, Math.floor(offsetPx / CARD_PX)));
        const activePlacard = this.placards[activeIndex];
        const activeId      = activePlacard?.entryId ?? null;

        document.querySelectorAll('.index-item').forEach((item) => {
            item.classList.toggle('is-active', item.dataset.entryId === activeId);
        });

        const landingGone    = this.scrollPx >= LANDING_PX * 0.65;
        const lastCardEnd    = LANDING_PX + allEntries.length * CARD_PX;
        const inContactAbout = this.scrollPx >= lastCardEnd;

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

        const px    = this.scrollPx;
        const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
        const ease  = t => t * t * (3 - 2 * t); // smoothstep

        // ── LEFT RAIL: per .lx-item stagger left ──────────────────────────
        // Line 0 begins at px=0, each subsequent line starts 25px later.
        // Each line takes 260px to fully exit.
        const lxItems = landing.querySelectorAll('.lx-item');
        lxItems.forEach((el, i) => {
            const start = i * 25;
            const end   = start + 260;
            const t     = ease(clamp((px - start) / (end - start), 0, 1));
            el.style.transform = `translate3d(${-window.innerWidth * 1.1 * t}px, 0, 0)`;
            el.style.opacity   = String(1 - t);
        });

        // ── RIGHT RAIL: 3 sequential units ────────────────────────────────
        // Unit A: hero-blocks  → exits first  (px 20–220)
        // Unit B: hero-photo   → exits second (px 80–320)
        // Unit C: hero-links   → exits last   (px 150–380)

        const heroBlocks = landing.querySelectorAll('.hero-block');
        const blockT = ease(clamp((px - 20) / 200, 0, 1));
        heroBlocks.forEach(b => {
            b.style.transform = `translateX(${window.innerWidth * 0.6 * blockT}px)`;
            b.style.opacity   = String(1 - blockT);
        });

        const photoEl = landing.querySelector('.hero-photo');
        if (photoEl) {
            const t = ease(clamp((px - 80) / 240, 0, 1));
            photoEl.style.transform = `translateX(${window.innerWidth * 0.5 * t}px)`;
            photoEl.style.opacity   = String(1 - t);
        }

        const linksEl = landing.querySelector('.hero-links');
        if (linksEl) {
            const t = ease(clamp((px - 150) / 230, 0, 1));
            linksEl.style.transform = `translateX(${window.innerWidth * 0.4 * t}px)`;
            linksEl.style.opacity   = String(1 - t);
        }

        // ── Whole landing overlay: blur + fade after lines are gone ───────
        const tB = clamp((px - 80) / 320, 0, 1);
        const tBe = ease(tB);
        gsap.set(landing, {
            opacity:   1 - tBe,
            filter:    `blur(${8 * tBe}px)`,
            transform: `scale(${1 - 0.03 * tBe})`
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

        if (navHome)    navHome.addEventListener('click',    e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        if (navWork)    navWork.addEventListener('click',    e => { e.preventDefault(); const f = this.placards[0]; if (f) window.scrollTo({ top: LANDING_PX + f.index * CARD_PX + SLIDE_PX, behavior: 'smooth' }); });
        if (navBlog)    navBlog.addEventListener('click',    e => { e.preventDefault(); /* placeholder — wire to blog route when ready */ });
        if (navContact) navContact.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX + allEntries.length * CARD_PX + 300, behavior: 'smooth' }); });
        if (navAbout)   navAbout.addEventListener('click',   e => { e.preventDefault(); window.scrollTo({ top: LANDING_PX + allEntries.length * CARD_PX + CONTACT_PX, behavior: 'smooth' }); });
    }

    handleLoading() {
        document.body.style.overflow = '';
    }

    setupResizeForPlacards() {
        window.addEventListener('resize', () => {
            this.placards.forEach(p => p.onResize());
        }, { passive: true });
    }

    // ─── Render loop ──────────────────────────────────────────────────────────
    animate() {
        requestAnimationFrame(() => this.animate());
        this.placards.forEach(p => p.update(this.scrollPx));
        this.manifest?.update(this.scrollPx, this.placards);
        this.sceneSetup.render();
    }
}


const boot = () => { try { window.__portfolioApp = new PortfolioApp(); } catch(e) { console.error(e); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();