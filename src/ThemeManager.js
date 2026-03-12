/**
 * ThemeManager.js
 *
 * Responsibilities:
 *  1. Detect OS colour-scheme preference on first visit
 *  2. Persist manual override to localStorage
 *  3. Apply theme to:
 *       a. <html data-theme="light|dark">  → CSS tokens do the rest
 *       b. Three.js scene background colour
 *       c. Every Placard canvas texture (calls placard.setTheme(dark))
 *  4. Update the toggle button icon
 */

const STORAGE_KEY = 'nj-portfolio-theme';

// Scene & card colours ───────────────────────────────────────────────────────
export const THEME_COLORS = {
    light: { 
        sceneBg: 0xffffff, 
        cardBg: '#ffffff', 
        ink: '#0a0a0a', 
        inkMuted: 'rgba(10,10,10,0.62)', 
        inkSoft: 'rgba(10,10,10,0.28)', 
        inkVerysoft: 'rgba(10,10,10,0.22)',
        pillBg: 'rgba(122,27,42,0.09)', 
        burgundy: '#7A1B2A', 
    }, 
    dark: { 
        sceneBg: 0x0f0d0e, 
        cardBg: '#0f0d0e', // exact match to scene bg — cards flush with scene 
        ink: '#f0ebe8', 
        inkMuted: 'rgba(240,235,232,0.72)', 
        inkSoft: 'rgba(240,235,232,0.38)', 
        inkVerysoft: 'rgba(240,235,232,0.25)', 
        pillBg: 'rgba(180,60,80,0.15)', 
        burgundy: '#c9485a', // slightly lighter for contrast on dark 
    },
};

export class ThemeManager {
    /**
     * @param {THREE.Scene}  scene     – Three.js scene (to update background)
     * @param {Placard[]}    placards  – all Placard instances
     * @param {HTMLElement}  toggleBtn – the sun/moon button element
     */
    constructor(scene, placards, toggleBtn) {
        this.scene     = scene;
        this.placards  = placards;
        this.toggleBtn = toggleBtn;

        // Resolve initial theme: saved pref → OS pref → light
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
            this._theme = saved;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this._theme = prefersDark ? 'dark' : 'light';
        }

        // Listen for OS preference changes (fires while tab is open, no saved override)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only react if the user hasn't set a manual override
            if (!localStorage.getItem(STORAGE_KEY)) {
                this.apply(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    get theme() { return this._theme; }
    get isDark() { return this._theme === 'dark'; }
    get colors() { return THEME_COLORS[this._theme]; }

    /** Apply on first call from PortfolioApp after placards are created */
    init() {
        this.apply(this._theme, false);
    }

    toggle() {
        const next = this._theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        this.apply(next, true);
    }

    /**
     * @param {'light'|'dark'} theme
     * @param {boolean}        animate  – if true, adds a brief CSS transition class
     */
    apply(theme, animate) {
        this._theme = theme;
        const dark  = theme === 'dark';
        const col   = THEME_COLORS[theme];

        // 1. HTML attribute → CSS tokens pick up automatically
        document.documentElement.setAttribute('data-theme', theme);

        // 2. Optional smooth transition class
        if (animate) {
            document.documentElement.classList.add('theme-transitioning');
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 350);
        }

        // 3. Three.js scene background
        if (this.scene) {
            this.scene.background.set(col.sceneBg);
        }

        // 4. Rebuild every placard canvas texture
        this.placards.forEach(p => p.setTheme(dark));

        // 5. Update toggle button icon & aria-label
        this._updateButton(dark);
    }

    _updateButton(dark) {
        if (!this.toggleBtn) return;
        this.toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        // Icon is swapped via CSS [data-theme="dark"] .theme-toggle__icon
        this.toggleBtn.classList.toggle('is-dark', dark);
    }

}

// HMR: when this module is hot-replaced, retrigger theme on all placards
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        // Find the running app instance and reapply current theme
        if (window.__portfolioApp?.themeManager) {
            window.__portfolioApp.themeManager.apply(
                window.__portfolioApp.themeManager.theme,
                false
            );
        }
    });
}