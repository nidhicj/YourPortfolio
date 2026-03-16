/**
 * ThemeManager.js — single source of truth for ALL colours.
 *
 * Responsibilities:
 *  1. Detect OS colour-scheme preference on first visit
 *  2. Persist manual override to localStorage
 *  3. On apply():
 *       a. Inject CSS custom properties onto <html> — main.css uses var(--x) as-is
 *       b. Update Three.js scene background
 *       c. Rebuild every Placard canvas texture via placard.setTheme(dark)
 *  4. Update the toggle button icon
 *
 * ─── TO EXPERIMENT WITH COLOURS ──────────────────────────────────────────────
 * Edit THEME_COLORS below. Save the file. Toggle the theme button once (or
 * twice to return to starting theme) and every surface — cards, nav, index
 * bar, landing page — will update instantly.
 *
 * CSS token → role mapping:
 *   --white          page / card / nav background
 *   --off-white      subtle alternate background (chat input, etc.)
 *   --burgundy       primary accent (active states, highlights, pill text)
 *   --burgundy-light secondary accent (hover glows, project stripe)
 *   --burgundy-dim   very faint tint (borders, pill background alpha)
 *   --burgundy-pale  even fainter tint (hover backgrounds)
 *   --ink            primary text
 *   --mid            secondary text (nav items, labels)
 *   --soft           tertiary text / borders
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'nj-portfolio-theme';

export const THEME_COLORS = {
light: {
    sceneBg:     0xffffff,
    cardBg:      '#ffffff',
    ink:         '#0a0a0a',
    inkMuted:    '#2a2a2a',
    inkSoft:     '#444444',
    inkVerysoft: '#666666',
    pillBg:      '#e6e6e6',
    burgundy:    '#1f1f1f',
    css: {
        '--white':          '#ffffff',
        '--off-white':      '#f0f0f0',
        '--burgundy':       '#1f1f1f',
        '--burgundy-light': '#3a3a3a',
        '--burgundy-dim':   '#bdbdbd',
        '--burgundy-pale':  '#e0e0e0',
        '--ink':            '#0a0a0a',
        '--mid':            '#333333',
        '--soft':           '#555555',
        '--bar-bg':         '#ffffff',
    },
},

dark: {
    sceneBg:     0x0b0b0b,
    cardBg:      '#111111',
    ink:         '#ffffff',
    inkMuted:    '#e6e6e6',
    inkSoft:     '#cfcfcf',
    inkVerysoft: '#a8a8a8',
    pillBg:      '#2b2b2b',
    burgundy:    '#d0d0d0',
    css: {
        '--white':          '#0b0b0b',
        '--off-white':      '#161616',
        '--burgundy':       '#d0d0d0',
        '--burgundy-light': '#f0f0f0',
        '--burgundy-dim':   '#5a5a5a',
        '--burgundy-pale':  '#2f2f2f',
        '--ink':            '#ffffff',
        '--mid':            '#d6d6d6',
        '--soft':           '#b5b5b5',
        '--bar-bg':         '#111111',
    },
},

};

export class ThemeManager {
    constructor(scene, placards, toggleBtn) {
        this.scene     = scene;
        this.placards  = placards;
        this.toggleBtn = toggleBtn;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
            this._theme = saved;
        } else {
            this._theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                this.apply(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    get theme()  { return this._theme; }
    get isDark() { return this._theme === 'dark'; }
    get colors() { return THEME_COLORS[this._theme]; }

    init() {
        this.apply(this._theme, false);
    }

    toggle() {
        const next = this._theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        this.apply(next, true);
    }

    apply(theme, animate) {
        this._theme = theme;
        const dark = theme === 'dark';
        const col  = THEME_COLORS[theme];

        // 1. Inject CSS custom properties — this is now the only colour source for DOM
        this._injectCSSTokens(col.css);

        // 2. Keep data-theme attribute for the index bar dark overrides + toggle icon
        document.documentElement.setAttribute('data-theme', theme);

        // 3. Smooth transition class
        if (animate) {
            document.documentElement.classList.add('theme-transitioning');
            setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 350);
        }

        // 4. Three.js scene background
        if (this.scene) {
            this.scene.background.set(col.sceneBg);
        }

        // 5. Rebuild placard canvas textures
        this.placards.forEach(p => p.setTheme(dark));

        // 6. Toggle button icon
        this._updateButton(dark);
    }

    _injectCSSTokens(tokens) {
        const root = document.documentElement;
        Object.entries(tokens).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
        });
    }

    _updateButton(dark) {
        if (!this.toggleBtn) return;
        this.toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        this.toggleBtn.classList.toggle('is-dark', dark);
    }
}

// ── Vite HMR: re-apply current theme whenever this file is saved ─────────────
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        if (window.__portfolioApp?.themeManager) {
            window.__portfolioApp.themeManager.apply(
                window.__portfolioApp.themeManager.theme,
                false
            );
        }
    });
}