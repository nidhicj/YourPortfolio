import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneSetup } from './scene/SceneSetup.js';
// import { Corridor } from './scene/Corridor.js';
import { Lights } from './scene/Lights.js';
import { Placard, CARD_PX, SLIDE_PX } from './scene/Placard.js';
import { allEntries as rawEntries, workExperience } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);


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
        // this.corridor   = null;
        this.lights     = null;
        this.placards   = [];
        this.scrollProgress = 0;
        this.scrollPx = 0;
        this.init();
    }

    init() {
        this.setupScroll();
        // this.corridor = new Corridor(this.sceneSetup.scene);
        this.lights   = new Lights(this.sceneSetup.scene);
        this.createPlacards();
        this.buildIndexBar();
        this.setupUI();
        this.animate();
        this.handleLoading();
    }

    // ─── Scroll ───────────────────────────────────────────────────────────────
    setupScroll() {
        // ~1400px per card so user has time to read before it exits
        // Scroll height driven by Placard pixel budgets
        // const CARD_PX = 2600; // must match Placard.js CARD_PX
        const scrollHeight = 600 + allEntries.length * CARD_PX;
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

    updateIndexBar() {
        const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

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

        // ── Landing fully gone threshold: tB >= 0.98 → px >= 50 + 350*0.98 ≈ 393 ──
        const landingGone = this.scrollPx >= 393;

        // ── Nav highlights ──
        const navHome     = document.getElementById('navHome');
        const navWork     = document.getElementById('navWork');
        const navProjects = document.getElementById('navProjects');

        if (navHome)     navHome.classList.toggle('is-active',     !landingGone);
        if (navWork)     navWork.classList.toggle('is-active',      landingGone && activeType === 'work');
        if (navProjects) navProjects.classList.toggle('is-active',  landingGone && activeType === 'project');

        // ── Bar swap: Work bar visible during work section, Projects bar during project section ──
        const workWrapper     = document.getElementById('indexBarWorkWrapper');
        const projectsWrapper = document.getElementById('indexBarProjectsWrapper');
        if (!workWrapper || !projectsWrapper) return;

        const showWork     = landingGone && activeType === 'work';
        const showProjects = landingGone && activeType === 'project';

        // Apply state classes — CSS handles the dip/rise animation
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

    // ─── UI ───────────────────────────────────────────────────────────────────
    setupUI() {
        const audio = document.getElementById('audioToggle');
        if (audio) {
            let muted = true;
            audio.addEventListener('click', () => {
                muted = !muted;
                audio.classList.toggle('muted', muted);
            });
        }

        // ── Nav click handlers ──
        const navHome = document.getElementById('navHome');
        const navWork = document.getElementById('navWork');
        const navProjects = document.getElementById('navProjects');

        if (navHome) {
            navHome.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (navWork) {
            navWork.addEventListener('click', (e) => {
                e.preventDefault();
                // Jump to first work placard (index 0)
                const firstWork = this.placards.find(p => p.entry?.type === 'work');
                if (firstWork) {
                    window.scrollTo({
                        top: firstWork.index * CARD_PX + SLIDE_PX,
                        behavior: 'smooth'
                    });
                }
            });
        }

        if (navProjects) {
            navProjects.addEventListener('click', (e) => {
                e.preventDefault();
                // Jump to first side project placard
                const firstProject = this.placards.find(p => p.entry?.type === 'project');
                if (firstProject) {
                    window.scrollTo({
                        top: firstProject.index * CARD_PX + SLIDE_PX,
                        behavior: 'smooth'
                    });
                }
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

    // ─── Render loop ──────────────────────────────────────────────────────────
    animate() {
        requestAnimationFrame(() => this.animate());
        // Pass scroll progress to each card — they move, camera doesn't
        this.placards.forEach(p => p.update(this.scrollPx));
        this.sceneSetup.render();
    }
}

const boot = () => { try { new PortfolioApp(); } catch(e) { console.error(e); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();