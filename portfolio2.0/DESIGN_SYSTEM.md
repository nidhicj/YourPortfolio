# Design System v2
# Portfolio — [YOUR_NAME]
# Claude Code reads this before touching any UI component.
# Reference site: https://fintora-temlis.webflow.io/
# Before building any component, use Playwright to screenshot the reference site.

---

## Plugins — How To Use Them

### Playwright (visual verification — use after every component)
After building any component, always:
1. Screenshot localhost:3000 using Playwright
2. Screenshot https://fintora-temlis.webflow.io/ for comparison
3. Compare spacing, type weight, animation feel
4. Self-correct before asking the user to review
Never show the user a component you haven't visually verified yourself.

### Figma (if design file is provided)
If a Figma link is shared, read it directly via the Figma MCP before writing
any layout code. Do not guess layout from text descriptions when a Figma
file is available.

### frontend-design plugin
Apply the frontend-design plugin's principles for all components:
- Unexpected layouts over safe ones
- Typography as the primary visual element
- One well-orchestrated entrance over many scattered animations
- Commit to the aesthetic — never hedge

---

## Design Philosophy

This is an editorial portfolio, not a typical developer portfolio.
Typography carries 80% of the visual weight. Everything else supports it.
The site should feel confident, minimal, and slightly unpredictable.

Core rules:
- Type does the heavy lifting. Images and color are accents, not anchors.
- Empty space is tension, not emptiness. Use it deliberately.
- Every animation has a clear reason. Motion reveals — it does not decorate.
- The grid exists to be broken once per section. Deliberately.
- Unconventional does not mean chaotic. It means intentional surprise.

---

## Color Palette

```css
/* ── Light Theme (default) ─────────────────────────────────────── */
[data-theme="light"] {
  /* Backgrounds */
  --color-bg:            #F5F2ED;   /* warm off-white — page background */
  --color-bg-secondary:  #EDEAE4;   /* slightly darker — card, section bg */
  --color-surface:       #E8E4DC;   /* lifted elements, hover bg */

  /* Text */
  --color-text-primary:  #0F0E0C;   /* near-black — headlines */
  --color-text-secondary:#3D3B37;   /* dark warm gray — body copy */
  --color-text-muted:    #8A8680;   /* muted — labels, metadata, dates */

  /* Accent — teal. Use on: one hero word, nav hover, tag pills, CTA hover */
  --color-accent:        #0ac8bb;
  --color-accent-light:  #53b1f5;   /* light blue — pill bg, secondary highlights */

  /* Pop — gold. Use sparingly: one stat number, one section label, cursor trail */
  --color-pop:           #F5C842;
  --color-pop-muted:     #FBE99A;   /* light gold — hover bg for pop elements */

  /* Borders */
  --color-border:        #D4D0C8;
  --color-border-strong: #9E9A92;
}

/* ── Dark Theme ────────────────────────────────────────────────── */
[data-theme="dark"] {
  --color-bg:            #0E0D0B;
  --color-bg-secondary:  #181714;
  --color-surface:       #222018;

  --color-text-primary:  #F0EDE8;
  --color-text-secondary:#B8B4AE;
  --color-text-muted:    #6A6660;

  --color-accent:        #0ac8bb;   /* teal stays the same — it pops on dark too */
  --color-accent-light:  #53b1f5;

  --color-pop:           #F5C842;
  --color-pop-muted:     #3D3210;

  --color-border:        #2A2820;
  --color-border-strong: #3E3C36;
}
```

### Color usage rules
- `--color-accent` (teal): one hero headline word, nav hover, tag pill text, CTA border on hover, active section indicator. Max 5–6 appearances per page.
- `--color-accent-light` (light blue): pill backgrounds, secondary tag highlights, LLMs section label. Max 3–4 appearances.
- `--color-pop` (gold): one stat counter value, one section number label (Vision), scroll progress indicator. Max 2–3 appearances. Never use for text blocks.
- Never use more than 2 named colors in a single component.
- No gradients anywhere. Ever.

### Theme toggle
- Store preference in localStorage key: `portfolio-theme`
- Default to system preference via `prefers-color-scheme`
- Toggle button: top-right of nav, icon-only (sun/moon SVG from /assets/icons/)
- Transition: `transition: background-color 0.4s ease, color 0.3s ease` on `body`
- All color values use CSS variables — theme switch requires zero JS color changes

---

## Typography

```css
/* Fontshare — free, no license issues */
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@300,400,500,600,700&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500&display=swap');

:root {
  --font-display: 'Clash Display', sans-serif;   /* all headlines */
  --font-body:    'Satoshi', sans-serif;          /* body, labels, nav, UI */

  /* Type scale */
  --text-xs:   0.75rem;    /* 12px — metadata, timestamps */
  --text-sm:   0.875rem;   /* 14px — labels, tags */
  --text-base: 1rem;       /* 16px — body copy */
  --text-lg:   1.25rem;    /* 20px — large body */
  --text-xl:   1.75rem;    /* 28px — section intro */
  --text-2xl:  2.5rem;     /* 40px — section headlines */
  --text-3xl:  4rem;       /* 64px — page headlines */
  --text-4xl:  6rem;       /* 96px — hero display */
  --text-5xl:  9rem;       /* 144px — background accent text */
  --text-6xl:  13rem;      /* 208px — full-bleed typographic moments */

  /* Weights */
  --weight-light:    300;
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
}
```

Typography rules:
- Hero headline: `--font-display`, `--weight-semibold`, `--text-4xl` desktop / `--text-3xl` mobile
- Section headlines: `--font-display`, `--weight-semibold`, `--text-2xl` to `--text-3xl`
- Body copy: `--font-body`, `--weight-regular`, `--text-base`
- Tags/labels: `--font-body`, `--weight-medium`, `--text-xs`, uppercase, `letter-spacing: 0.08em`
- Doubled headline: two absolutely-stacked spans, span.back offset +8px on x, opacity 0.12

---

## Spacing

```css
:root {
  --space-1:  0.25rem;   --space-2:  0.5rem;
  --space-3:  0.75rem;   --space-4:  1rem;
  --space-6:  1.5rem;    --space-8:  2rem;
  --space-12: 3rem;      --space-16: 4rem;
  --space-24: 6rem;      --space-32: 8rem;
  --space-48: 12rem;
}
/* Section padding: --space-32 top/bottom desktop, --space-16 mobile */
/* Container: max-width 1280px, padding 0 --space-8 */
```

---

## Layout Grid

```css
:root {
  --grid-cols:           12;
  --grid-gutter:         var(--space-6);
  --container-max:       1280px;
  --container-padding:   var(--space-8);
}
```

Grid rules:
- Hero: full 12 cols. Text cols 1–7. Photo bleeds cols 7–12 to viewport edge.
- Expandable sections: full width when collapsed, full width when expanded.
- About: text cols 1–6, facts cols 7–12.
- Mobile (< 768px): all single column, photo below text.

---

## Expandable Niche Sections

This is the core interaction pattern of the portfolio.
The 4 sections (Agents, LLMs, Vision, Creative) stack vertically on the page.
Each is collapsed by default — only the header row is visible.

### Collapsed state
```
[label]  [title — large, --text-3xl]  [tagline — muted]  [+ expand icon]
─────────────────────────────────────────────────────────────────────────
```
- Full viewport width, 1px border bottom (--color-border)
- Label: --color-accent or --color-pop depending on section (see content.md)
- Title: --font-display, --weight-semibold
- Clicking anywhere on the row expands

### Expanded state
The section smoothly expands (height animation, 0.6s ease) to reveal:
- A horizontal scroll track containing project panels
- The section tagline appears just below the header
- Accent word appears large in background (opacity 0.04) as the track scrolls

### Project panel (inside horizontal track)
```
┌─────────────────────────────────┐
│  [type label — tag pill]        │
│                                 │
│  [project title — --text-2xl]   │
│  [short description]            │
│                                 │
│  [tech stack tags]              │
│                                 │
│  [year — muted]  [→ link]       │
└─────────────────────────────────┘
```
- Panel width: 420px desktop, 85vw mobile
- Panel height: fills track height
- Background: --color-bg-secondary
- Border: 1px solid --color-border
- No border-radius
- coming_soon: true → clicking panel shows "Coming Soon" overlay (centered, --font-display, --text-2xl, with close button). Do not navigate.

### Only one section open at a time
When a second section is clicked open, the currently open section collapses first (0.4s), then the new one expands (0.6s). They never stack open simultaneously.

---

## Animation System

Library: GSAP + ScrollTrigger
Smooth scroll: Lenis (`npm install @studio-freight/lenis`)

```js
const ease = {
  out:    "power3.out",
  snappy: "expo.out",
  soft:   "power2.inOut",
}
const dur = {
  fast:   0.3,
  normal: 0.6,
  slow:   1.0,
  crawl:  1.8,
}
```

### Animation inventory — implement in this exact order

**1. Hero entrance (page load)**
- Both headline layers (span.back + span.front) per line: y 50px → 0, opacity 0 → 1
- Stagger: 0.15s per line, ease: expo.out, duration: 1.0s
- Description + CTAs follow 0.35s after last headline line
- Photo: x 40px → 0, opacity 0 → 1, duration: 1.2s, ease: power3.out (slightly delayed, feels independent)

**2. Hero scroll split (signature effect — match Fintora feel)**
- As user scrolls past hero, span.back drifts LEFT (x → -100px) and fades
- span.front drifts RIGHT (x → +100px) and fades
- These move in OPPOSITE directions — the text tears apart
- scrub: 1.5 (smooth, tied to scroll position)
- Photo: y 0 → -60px parallax, scrub: 1

**3. Section header reveals (collapsed sections)**
- Each section header animates in as it enters viewport
- BUT each one uses a DIFFERENT reveal approach — this is intentional unpredictability:
  - Section 01 (Agents): title slides in from left (x: -60px → 0), label drops from top
  - Section 02 (LLMs): title reveals via clip-path (width 0% → 100%), feels like a wipe
  - Section 03 (Vision): title letters stagger individually (SplitText, char by char, 0.03s stagger)
  - Section 04 (Creative): title and label enter simultaneously from different y positions
- All trigger at ScrollTrigger start: "top 80%", once: true

**4. Horizontal scroll inside expanded section**
- When a section is expanded, projects scroll HORIZONTALLY as user scrolls down
- Use ScrollTrigger with `horizontal: true` and `pin: true` on the section
- The section is pinned while horizontal content scrolls, then releases
- Scroll distance = panel count × panel width + gaps
- Add a subtle velocity-based scrub (scrub: 0.8) so it feels weighty not instant

**5. Section accent word parallax**
- Large background word (opacity 0.04) moves at a DIFFERENT speed than the panels
- It scrolls slower (scrub: 2) — creates depth as panels pass over it
- This only applies inside the expanded section track

**6. About section counters**
- Stats count up from 0 when scrolled into view
- Duration: 1.8s, ease: power2.out
- The gold (--color-pop) value animates with a slight scale pulse at completion

**7. Chatbot bubble entrance**
- Bubble appears 2s after page load: scale 0 → 1, ease: back.out(1.7)
- On hover: slight scale up (1.08), ease: power2.out, duration: 0.2s
- On click: bubble scales down (0.9) then chat panel slides up from bottom

### Uniformity rules
- All parallax uses scrub: 1 UNLESS specified otherwise above
- All y-parallax ranges are 0 → -50px UNLESS specified otherwise
- Never animate more than 2 elements simultaneously in the same viewport region
- prefers-reduced-motion: wrap ALL GSAP animations in this check:
  ```js
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // all gsap code here
  }
  ```
- ScrollTrigger markers: ON during dev, remove before deploy

---

## Chatbot Bubble Component

Position: fixed, bottom-right, z-index: 9999
Bubble: 56px × 56px circle, background: --color-accent, icon: white SVG
Panel: slides up from bottom-right, 400px wide, 560px tall
Panel background: --color-bg-secondary
Panel border: 1px solid --color-border, border-radius: 0 (hard edges)
Close button: top-right of panel, --color-text-muted
Chat bubbles: user messages right-aligned, AI messages left-aligned
Input: full width, no border-radius, 1px border --color-border
Send button: --color-accent background, white icon
API route: /api/chat (ported from v1 — see LAYOUT_PLAN.md Prompt 7)

---

## Hero Photo Treatment

File: /images/pic_op2.png
Component: Next.js <Image> — never plain <img>
Position: right side of hero, cols 7–12, bleeds to viewport right edge
Transform: rotate(-1.5deg)
Edges: hard, no border-radius, no shadow
Clip: asymmetric — let the face breathe to one side, not centered
On scroll: y 0 → -60px parallax (scrub: 1)
Mobile: full width, below headline, remove rotation

---

## Assets Reference

```
/public/images/pic_op2.png              ← hero photo
/public/images/projects/[id].jpg        ← project screenshots (filename = project id)
/public/images/projects/placeholder.jpg ← used for coming_soon projects
/public/assets/icons/                   ← all UI icons (SVG)
/public/assets/favicon/                 ← favicon files
```

Icon usage:
- Inline SVG (imported as React component via @svgr/webpack) for icons that need color control
- <img src="/assets/icons/name.svg"> for purely decorative static icons
- Install: add `@svgr/webpack` to next.config.js

Favicon: referenced only in /app/layout.tsx metadata export. Never in components.

---

## Component Patterns

### Tag / Pill
```
font: --font-body, --weight-medium, --text-xs, uppercase, letter-spacing: 0.08em
bg: --color-accent-light at 20% opacity
color: --color-accent
padding: --space-1 --space-3
border-radius: 2px (angular, not pill-shaped)
```

### Section Header Row (collapsed)
```
display: flex, align-items: center, justify-content: space-between
padding: --space-8 0
border-bottom: 1px solid --color-border
cursor: pointer
label: --text-sm, --color-accent or --color-pop (per section)
title: --text-3xl, --font-display, --weight-semibold
icon: rotate 0deg (collapsed) → rotate 45deg (expanded), transition 0.4s
```

### Doubled Headline
```
position: relative
span.back: position absolute, opacity 0.12, x offset +8px, color --color-text-primary
span.front: position relative, opacity 1, color --color-text-primary
One targeted word: color --color-accent on span.front only
```

---

## Do Not

- No gradients (linear or radial) anywhere — ever
- No border-radius on cards or panels (0 or max 2px)
- No box shadows except subtle lift on hover
- No emoji in UI copy
- No hero background images or video backgrounds
- No centered body text — always left-aligned except hero tagline
- No more than 3 font weights on any single page
- No looping animations — entrance and scroll-triggered only
- No hardcoded hex values in components — always CSS variables
- No two sections open simultaneously
- Never skip Playwright screenshot verification after building a component
