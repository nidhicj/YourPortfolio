import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneSetup } from './scene/SceneSetup.js';
import { Lights } from './scene/Lights.js';
import { Placard, CARD_PX, SLIDE_PX, EXIT_PX } from './scene/Placard.js';
import { ThemeManager } from './ThemeManager.js';
import { allEntries as rawEntries, workExperience } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);

// Extra scroll px after last card: one full EXIT window + hold for Contact, same for About
const CONTACT_PX  = EXIT_PX + 600;   // contact fades in after last card exits
const ABOUT_PX    = 800;             // about follows contact on further scroll


function ensureEntryIds(entries) {
    return entries.map((entry, index) => {
        if (entry.id) return entry;

        const base =
            entry.slug ||
            entry.title ||
            entry.company ||
            entry.name ||
            entry.label ||
            `entry-${index + 1}`;

        const safe = String(base)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        return {
            ...entry,
            id: safe || `entry-${index + 1}`
        };
    });
}

const allEntries = ensureEntryIds(rawEntries);

class PortfolioApp {
    constructor() {
        this.sceneSetup = new SceneSetup();
        this.lights     = null;
        this.placards   = [];
        this.themeManager = null;
        this.scrollProgress = 0;
        this.scrollPx = 0;
        this.init();
    }

    init() {
        this.setupScroll();
        this.lights   = new Lights(this.sceneSetup.scene);
        this.createPlacards();
        this.initTheme();
        this.buildIndexBar();
        this.setupUI();
        this.animate();
        this.handleLoading();
        this.setupResizeForPlacards();
    }

    // ─── Scroll ───────────────────────────────────────────────────────────────
    setupScroll() {
        const scrollHeight = 600 + allEntries.length * CARD_PX + CONTACT_PX + ABOUT_PX;
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

        // scrollPx updated directly from scroll event — most reliable source
        window.addEventListener('scroll', () => {
            this.scrollPx = window.scrollY;
        }, { passive: true });
    }

    // ─── Placards ─────────────────────────────────────────────────────────────
    createPlacards() {
        allEntries.forEach((entry, i) => {
            const p = new Placard(this.sceneSetup.scene, entry, i, allEntries.length);
            this.placards.push(p);
        });
    }

    // ─── Index bars (Work + Projects, separate) ───────────────────────────────
    buildIndexBar() {
        const workBar     = document.getElementById('indexBarWork');
        const projectsBar = document.getElementById('indexBarProjects');
        if (!workBar || !projectsBar) return;

        allEntries.forEach((entry, i) => {
            const targetBar = entry.type === 'work' ? workBar : projectsBar;

            const item = document.createElement('button');
            item.className = 'index-item';
            item.dataset.entryId = entry.id;
            item.dataset.type    = entry.type;

            const num   = document.createElement('span'); num.className   = 'index-num';
            const year  = document.createElement('span'); year.className  = 'index-year';
            const label = document.createElement('span'); label.className = 'index-label';

            num.textContent   = String(i + 1).padStart(2, '0');
            label.textContent = entry.type === 'work' ? entry.company : entry.title;
            const m = (entry.date || '').match(/\d{4}/);
            year.textContent  = m ? m[0] : '—';

            item.appendChild(num); item.appendChild(year); item.appendChild(label);
            item.addEventListener('click', () => this.jumpToEntryById(entry.id));
            targetBar.appendChild(item);
        });
    }

    jumpToEntryById(entryId) {
        const placard = this.placards.find(p => p.entryId === entryId);
        if (!placard) return;

        window.scrollTo({
            top: placard.index * CARD_PX + SLIDE_PX,
            behavior: 'smooth'
        });
    }

    // ─── Contact + About overlays ─────────────────────────────────────────────
    // Scroll windows (absolute px from top):
    //   lastCardExitEnd  = 600 + n*CARD_PX  (last card fully gone)
    //   contactStart     = lastCardExitEnd
    //   contactFull      = contactStart + 300   (fully opaque)
    //   aboutStart       = contactStart + CONTACT_PX - 300
    //   aboutFull        = aboutStart + 300
    updateEndSections() {
        const lastCardExitEnd = 600 + allEntries.length * CARD_PX;
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

        // Hide contact once about is fully in
        if (contactEl) {
            const contactOut = clamp((px - aboutStart) / 200, 0, 1);
            contactEl.style.opacity = Math.max(0, contactT - contactOut);
        }

        // Nav highlights for contact/about
        const navContact = document.getElementById('navContact');
        const navAbout   = document.getElementById('navAbout');
        if (navContact) navContact.classList.toggle('is-active', contactT > 0.5 && aboutT < 0.5);
        if (navAbout)   navAbout.classList.toggle('is-active',   aboutT > 0.5);
    }

    updateIndexBar() {
        // ── Which placard is currently active ──
        const activeIndex = Math.min(
            this.placards.length - 1,
            Math.max(0, Math.floor(this.scrollPx / CARD_PX))
        );
        const activePlacard = this.placards[activeIndex];
        const activeId      = activePlacard?.entryId ?? null;
        const activeType    = activePlacard?.entry?.type ?? null;

        // ── Highlight active item in whichever bar ──
        document.querySelectorAll('.index-item').forEach((item) => {
            item.classList.toggle('is-active', item.dataset.entryId === activeId);
        });

        // ── Landing fully gone threshold: tB >= 0.98 → px >= 393 ──
        const landingGone    = this.scrollPx >= 393;
        const lastCardEnd    = 600 + allEntries.length * CARD_PX;
        const inContactAbout = this.scrollPx >= lastCardEnd;

        // ── Nav highlights ──
        const navHome     = document.getElementById('navHome');
        const navWork     = document.getElementById('navWork');
        const navProjects = document.getElementById('navProjects');

        if (navHome)     navHome.classList.toggle('is-active',     !landingGone);
        if (navWork)     navWork.classList.toggle('is-active',      landingGone && activeType === 'work'    && !inContactAbout);
        if (navProjects) navProjects.classList.toggle('is-active',  landingGone && activeType === 'project' && !inContactAbout);

        // ── Bar swap ──
        const workWrapper     = document.getElementById('indexBarWorkWrapper');
        const projectsWrapper = document.getElementById('indexBarProjectsWrapper');
        if (!workWrapper || !projectsWrapper) return;

        const showWork     = landingGone && activeType === 'work'    && !inContactAbout;
        const showProjects = landingGone && activeType === 'project' && !inContactAbout;

        workWrapper.classList.toggle('bar--visible',  showWork);
        workWrapper.classList.toggle('bar--hidden',   !showWork);
        projectsWrapper.classList.toggle('bar--visible',  showProjects);
        projectsWrapper.classList.toggle('bar--hidden',   !showProjects);
    }

    // ─── Landing transition ───────────────────────────────────────────────────
    updateLandingTransition() {
        const landing = document.getElementById('landingPage');
        const left    = document.getElementById('landingLeft');
        const right   = document.getElementById('landingRight');
        // const vignette= document.getElementById('vignetteOverlay');
        if (!landing || !left || !right) return;

        // Use absolute pixels — landing clears in the first 400px of scroll,
        // completely independent of total page height
        const px  = this.scrollPx;
        const c   = (v,a,b) => Math.max(a, Math.min(b, v));

        // Rails split: 0 → 300px
        const tA = c(px / 300, 0, 1);
        gsap.set(left,  { x: -window.innerWidth * 1.05 * tA });
        gsap.set(right, { x:  window.innerWidth * 1.05 * tA });

        // Fade + blur: 50px → 400px
        const tB = c((px - 50) / 350, 0, 1);
        gsap.set(landing, {
            opacity: 1 - tB,
            filter: `blur(${10 * tB}px)`,
            transform: `scale(${1 - 0.04 * tB})`
        });
        landing.style.pointerEvents = tB > 0.98 ? 'none' : 'auto';
        const vignette = document.getElementById('vignetteOverlay');
        if (vignette) gsap.set(vignette, { opacity: 0.85 * tB });

        const hint = document.getElementById('scrollHint');
        if (hint) gsap.set(hint, { opacity: c(1 - px / 100, 0, 1) });
    }

    updateScrollIndicator(progress) {
        const bar = document.querySelector('.scroll-bar');
        if (bar) bar.style.width = `${progress * 100}%`;
    }

    // ─── Theme ────────────────────────────────────────────────────────────────
    initTheme() {
        const btn = document.getElementById('themeToggle');
        this.themeManager = new ThemeManager(
            this.sceneSetup.scene,
            this.placards,
            btn
        );
        this.themeManager.init();

        if (btn) {
            btn.addEventListener('click', () => this.themeManager.toggle());
        }
    }

    // ─── UI ───────────────────────────────────────────────────────────────────
    setupUI() {
        // ── Nav click handlers ──
        const navHome     = document.getElementById('navHome');
        const navWork     = document.getElementById('navWork');
        const navProjects = document.getElementById('navProjects');
        const navContact  = document.getElementById('navContact');
        const navAbout    = document.getElementById('navAbout');

        if (navHome) {
            navHome.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        if (navWork) {
            navWork.addEventListener('click', (e) => {
                e.preventDefault();
                const first = this.placards.find(p => p.entry?.type === 'work');
                if (first) window.scrollTo({ top: first.index * CARD_PX + SLIDE_PX, behavior: 'smooth' });
            });
        }
        if (navProjects) {
            navProjects.addEventListener('click', (e) => {
                e.preventDefault();
                const first = this.placards.find(p => p.entry?.type === 'project');
                if (first) window.scrollTo({ top: first.index * CARD_PX + SLIDE_PX, behavior: 'smooth' });
            });
        }
        if (navContact) {
            navContact.addEventListener('click', (e) => {
                e.preventDefault();
                // contactT reaches 1.0 at contactStart + 300 — scroll exactly there
                const target = 600 + allEntries.length * CARD_PX + 300;
                window.scrollTo({ top: target, behavior: 'smooth' });
            });
        }
        if (navAbout) {
            navAbout.addEventListener('click', (e) => {
                e.preventDefault();
                const target = 600 + allEntries.length * CARD_PX + CONTACT_PX;
                window.scrollTo({ top: target, behavior: 'smooth' });
            });
        }
    }

    handleLoading() {
        // Landing fades automatically as user scrolls — no click required.
        // Just make sure body can always scroll.
        document.body.style.overflow = '';
        const landing = document.getElementById('landingPage');
        if (landing) landing.classList.remove('hidden');
    }

    // ─── Placard resize ───────────────────────────────────────────────────────
    // When the user rotates their phone, each Placard checks whether it has
    // crossed the mobile breakpoint and rebuilds its geometry + canvas if so.
    setupResizeForPlacards() {
        window.addEventListener('resize', () => {
            this.placards.forEach(p => p.onResize());
        }, { passive: true });
    }

    // ─── Render loop ──────────────────────────────────────────────────────────
    animate() {
        requestAnimationFrame(() => this.animate());
        // Pass scroll progress to each card — they move, camera doesn't
        this.placards.forEach(p => p.update(this.scrollPx));
        this.sceneSetup.render();
    }
}

const boot = () => { try { window.__portfolioApp = new PortfolioApp(); } catch(e) { console.error(e); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();