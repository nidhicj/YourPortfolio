# Portfolio Codebase — Tutorial

Learn this repo by what you see on screen, going section by section, drilling deeper as you go.

Each lesson has three parts:
- **Recipe** — exact lines to change, what you'll see happen
- **Mental model** — the one concept that makes it work
- **Edge cases** — what breaks and why

---

## Reading order

Start here and work top to bottom. Each folder builds on the one before.

```
01-landing-page/         What loads when you open the site
  01-topbar/             The "Nidhi Joshi · 01/07 HERO" bar at the top
  02-hero-panel/         The big cream section on the left
    01-headline/         "Research Engineered Shipped."
    02-tagline-and-bio/  The quote + bio text on the right
    03-contact-links/    GitHub / LinkedIn / Resume / Email
  03-book-spines/        The dark narrow panels on the right
  04-progress-bar/       The thin amber line at the bottom

02-scroll-and-panels/    What happens when you scroll
  01-smooth-scroll/      Why scrolling feels weighted
  02-panel-accordion/    How panels expand and collapse
  03-panel-widths/       The numbers that control how wide each panel is

03-data-layer/           Where all the text content lives
  01-chapters/           The 7 chapters and everything in them
  02-profile/            Your name, role, location, site title

04-theme-and-styles/     Where all the visual design lives
  01-theme-manager/      The single file that controls everything visual
  02-colors/             The 4 colours and how they flow through the site
  03-typography/         Font sizes, weights, letter spacing
  04-spacing/            Padding, gaps, margins

05-compositions/         The layout of each chapter panel
  01-hero/               Two-column grid with headline left, content right
  02-bilateral/          Amber rail + content + demo
  03-reading-room/       Content left, ghost accent + demo right
  04-offset-title/       Title top-right, demo mid-left, desc bottom
  05-metric-lead/        Huge number dominant, title + demo bottom
  06-about/              Two-column: bio left, experience + education right
  07-cta/                Full CTA with links

06-animations/           How things move
  01-gsap-panel-transitions/  How panels expand/collapse during scroll
  02-breathing-hover/    The amber breathing on hover
  03-lenis-scroll/       The smooth scroll engine
```

---

## How depth works in each lesson

Every concept is taught at three depths. Stop wherever you have what you need.

**Depth 1 — Recipe:** You copy the instruction, you see a result. No understanding required yet.

**Depth 2 — Mental model:** You understand *why* the recipe works. Now you can invent variations.

**Depth 3 — Edge cases:** You know what breaks it and why. Now you can debug without asking.

---

## Before you start

The dev server must be running to see changes live:

```bash
npm run dev
```

Open `http://localhost:3000` and keep it open while you work. Changes hot-reload instantly.
