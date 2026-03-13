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
    sceneBg:     0xf5f0e8,
    cardBg:      '#ffffff',
    ink:         '#0d0d0d',
    inkMuted:    'rgba(13,13,13,0.62)',
    inkSoft:     'rgba(13,13,13,0.32)',
    inkVerysoft: 'rgba(13,13,13,0.18)',
    pillBg:      'rgba(200,152,42,0.10)',
    burgundy:    '#c8982a',
    css: {
        '--white':          '#f5f0e8',
        '--off-white':      '#ede8df',
        '--burgundy':       '#c8982a',
        '--burgundy-light': '#d4a843',
        '--burgundy-dim':   'rgba(200,152,42,0.15)',
        '--burgundy-pale':  'rgba(200,152,42,0.07)',
        '--ink':            '#0d0d0d',
        '--mid':            'rgba(13,13,13,0.48)',
        '--soft':           'rgba(13,13,13,0.28)',
        '--bar-bg':         'rgba(245,240,232,0.96)',
    },
},
dark: {
    sceneBg:     0x111008,
    cardBg:      '#1a1810',
    ink:         '#f0ebe0',
    inkMuted:    'rgba(240,235,224,0.72)',
    inkSoft:     'rgba(240,235,224,0.38)',
    inkVerysoft: 'rgba(240,235,224,0.22)',
    pillBg:      'rgba(200,152,42,0.15)',
    burgundy:    '#c8982a',
    css: {
        '--white':          '#111008',
        '--off-white':      '#1a1810',
        '--burgundy':       '#c8982a',
        '--burgundy-light': '#d4a843',
        '--burgundy-dim':   'rgba(200,152,42,0.20)',
        '--burgundy-pale':  'rgba(200,152,42,0.10)',
        '--ink':            '#f0ebe0',
        '--mid':            'rgba(240,235,224,0.52)',
        '--soft':           'rgba(240,235,224,0.30)',
        '--bar-bg':         'rgba(17,16,8,0.96)',
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