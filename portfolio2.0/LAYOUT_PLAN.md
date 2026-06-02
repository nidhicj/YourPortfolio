# Layout Plan + Claude Code Prompt Guide v2

# Read alongside DESIGN_SYSTEM.md and content.md before building anything.

# Reference site: https://fintora-temlis.webflow.io/

---

## Setup (run once in your v2 project folder)

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint
npm install gsap @studio-freight/lenis
npm install @svgr/webpack   # for SVG icon imports
```

Add to next.config.js:

```js
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
module.exports = nextConfig;
```

---

## File Structure

```
/app
  layout.tsx                  ← root layout, theme provider, metadata/favicons
  page.tsx                    ← landing page (assembles all sections)
  /api/chat/route.ts          ← chatbot API (port from v1)
/components
  Nav.tsx                     ← navigation + theme toggle
  Hero.tsx                    ← hero section
  NicheSection.tsx            ← reusable expandable section + horizontal scroll
  ProjectPanel.tsx            ← individual project card inside horizontal track
  About.tsx                   ← about + stats
  ChatBubble.tsx              ← floating chatbot widget
  Footer.tsx
/lib
  theme.ts                    ← theme toggle logic + localStorage
  animations.ts               ← all GSAP setup, reusable animation functions
/styles
  globals.css                 ← all CSS variables, Fontshare imports, base reset
/public
  /images
    pic_op2.png               ← hero photo
    /projects/                ← project images
  /assets
    /icons/                   ← SVG icons
    /favicon/                 ← favicon files
DESIGN_SYSTEM.md              ← lives at root
content.md                    ← lives at root
LAYOUT_PLAN.md                ← this file, lives at root
```

---

## Build Sequence

Build in this exact order. Playwright screenshot after each step. Commit after groups.

```
Step 1:  globals.css — CSS variables, Fontshare imports, base reset, theme classes
Step 2:  lib/theme.ts — theme toggle logic
Step 3:  Nav.tsx — links + theme toggle button, no scroll behavior yet
Step 4:  Hero.tsx — layout only (photo + headline + CTAs), no animation
         → PLAYWRIGHT: screenshot + compare to reference site
   

Step 5:  NicheSection.tsx — collapsed state layout only
Step 6:  ProjectPanel.tsx — panel layout only
Step 7:  Wire NicheSection + ProjectPanel together, test expand/collapse
         → PLAYWRIGHT: screenshot all 4 sections collapsed and one expanded
   

Step 8:  About.tsx — layout only
Step 9:  ChatBubble.tsx — floating bubble + panel layout, wire /api/chat
Step 10: Footer.tsx
   

Step 11: lib/animations.ts — GSAP setup, Lenis smooth scroll
Step 12: Hero animations (entrance + scroll split)
         → PLAYWRIGHT: scroll through hero, verify split effect
Step 13: Section header reveals (each one different — see DESIGN_SYSTEM.md)
Step 14: Horizontal scroll inside expanded sections (pin + scrub)
         → PLAYWRIGHT: expand Agents section, scroll through panels
Step 15: Accent word parallax inside sections
Step 16: About counters + ChatBubble entrance
         → PLAYWRIGHT: full page scroll-through screenshot
   

Step 17: Mobile responsive pass (< 768px)
         → PLAYWRIGHT: screenshot at 375px width
  

Step 18: Remove ScrollTrigger markers, final color/spacing audit
       
```

---

## Claude Code Prompts

Start every session with this header (copy above your actual prompt):

```
Read DESIGN_SYSTEM.md, content.md, and LAYOUT_PLAN.md before writing any code.
Reference site: https://fintora-temlis.webflow.io/
Use Playwright to screenshot the reference site before building any UI component.
Never hardcode hex values — always use CSS variables from globals.css.
Never modify files outside the scope of this prompt.
```

---

### Prompt 1 — globals.css + theme setup

```
Read DESIGN_SYSTEM.md — Color Palette and Typography sections.

Create /styles/globals.css:
- Both [data-theme="light"] and [data-theme="dark"] CSS variable blocks exactly
  as defined in DESIGN_SYSTEM.md
- Fontshare @import for Clash Display and Satoshi
- Base reset: box-sizing border-box, margin 0
- body: background var(--color-bg), color var(--color-text-primary)
- body transition: background-color 0.4s ease, color 0.3s ease
- Tailwind directives

Create /lib/theme.ts:
- Read theme from localStorage key "portfolio-theme" on mount
- Fall back to prefers-color-scheme if no stored value
- Apply by setting data-theme attribute on <html> element
- Export: useTheme hook that returns { theme, toggleTheme }

Show me globals.css when done. Do not build any components yet.
```

---

### Prompt 2 — Nav

```
Read DESIGN_SYSTEM.md and content.md — Navigation section.

Build /components/Nav.tsx:
- Fixed top, full width, z-index 100
- Left: YOUR_NAME (short_name from content.md), --font-display, --weight-medium
- Center: nav links from content.md nav_links, --font-body, --text-sm, uppercase
- Right: theme toggle button (sun/moon icon, /assets/icons/), uses useTheme from lib/theme.ts
- Hover on nav links: color → --color-accent, transition 0.25s
- No background — fully transparent, no blur
- On scroll past 80px: add 1px border-bottom --color-border, bg --color-bg at 90% opacity

No animations yet. Layout and theme toggle only.
Use Playwright to screenshot result.
```

---

### Prompt 3 — Hero (layout only)

```
Read DESIGN_SYSTEM.md — Hero Photo Treatment, Doubled Headline, Layout Grid.
Read content.md — Hero Section.
Use Playwright to screenshot https://fintora-temlis.webflow.io/ for reference.

Build /components/Hero.tsx — layout only, zero animations.

Layout:
- 100vh, 12-column grid, overflow hidden
- LEFT cols 1–7:
  - Headline: 3 lines, each line uses doubled span technique from DESIGN_SYSTEM.md
  - One word across the 3 lines uses --color-accent on span.front only
  - hero_description below headline, --font-body, --text-lg, --color-text-secondary
  - Two CTAs: primary (filled, --color-text-primary bg) and secondary (text only, 
    --color-accent on hover)
- RIGHT cols 7–12:
  - pic_op2.png via Next.js <Image>
  - rotate(-1.5deg), hard edges, no border-radius, no shadow
  - Bleeds to right viewport edge — no right padding on this side
  - Sits beside the headline — NOT below it

Use only CSS variables. No animations.
Use Playwright to screenshot and compare to reference site. Show me both screenshots.
```

---

### Prompt 4 — Expandable Niche Sections

```
Read DESIGN_SYSTEM.md — Expandable Niche Sections, Project panel pattern.
Read content.md — The 4 Niche Sections.

Build /components/NicheSection.tsx (reusable, takes section data as props):

Collapsed state:
- Full width row: label | title (--text-3xl) | tagline (muted) | + icon right
- 1px border-bottom --color-border, padding --space-8 0
- Clicking row toggles expanded state
- label color: use section.color_highlight from content.md

Expanded state (height animates open, 0.6s ease):
- Tagline appears just below header
- Horizontal scroll track of ProjectPanel components
- Large accent_word in background (--text-5xl, opacity 0.04, absolute)
- Only ONE section can be open at a time — closing current before opening new

Build /components/ProjectPanel.tsx:
- 420px wide, full track height
- Content: type pill, title, short_description, tech tags, year, link arrow
- coming_soon: true → on click show centered overlay ("Coming Soon" + close button)
- No border-radius, 1px border --color-border

Wire all 4 sections in /app/page.tsx using content.md section data.

No animations yet — expand/collapse can be instant for now.
Use Playwright to screenshot collapsed and one expanded state.
```

---

### Prompt 5 — ChatBubble

```
Read DESIGN_SYSTEM.md — Chatbot Bubble Component.
Read content.md — Chatbot Bubble section.

Build /components/ChatBubble.tsx:
- Fixed bottom-right, z-index 9999
- Bubble: 56×56px circle, --color-accent bg, white chat icon
- Tooltip: bubble_tooltip text, appears on hover
- Click opens panel: slides up from bottom-right
  - 400px wide, 560px tall
  - --color-bg-secondary background, 1px --color-border border, no border-radius
  - Header: chat_headline + close button
  - Message area: scrollable, user messages right, AI messages left
  - Input + send button at bottom
- Wire to /api/chat POST endpoint

For /app/api/chat/route.ts:
[YOU INSERT YOUR V1 CHATBOT API LOGIC HERE — paste your v1 route file contents]

No entrance animation yet. Layout and wiring only.
```

---

### Prompt 6 — Hero animations

```
Read DESIGN_SYSTEM.md — Animation System, items 1 and 2.
Reference: https://fintora-temlis.webflow.io/ — use Playwright to study the hero scroll effect.

Add GSAP animations to /components/Hero.tsx and /lib/animations.ts:

Animation 1 — Page load entrance:
- span.back and span.front per line: y 50px → 0, opacity 0 → 1
- Stagger 0.15s per line, duration 1.0s, ease expo.out
- Description and CTAs: y 20px → 0, opacity 0 → 1, delay 0.5s after last line
- Photo: x 40px → 0, opacity 0 → 1, duration 1.2s, ease power3.out, slight delay

Animation 2 — Scroll split (hero signature effect):
- ScrollTrigger on Hero section, scrub: 1.5
- span.back: x → -100px, opacity → 0
- span.front: x → +100px, opacity → 0
- They move in OPPOSITE directions — text tears apart horizontally
- Photo: y 0 → -60px parallax, scrub: 1

Wrap everything in prefers-reduced-motion check.
Use Playwright to scroll through and screenshot the split effect in action.
```

---

### Prompt 7 — Section reveal animations (unpredictable)

```
Read DESIGN_SYSTEM.md — Animation System, item 3.

Add GSAP ScrollTrigger reveal animations to each section header.
Each section MUST use a different reveal approach:

Section 01 Agents: title slides from left (x: -60px → 0), label drops from top (y: -30px → 0)
Section 02 LLMs: title reveals via clip-path (clipPath: "inset(0 100% 0 0)" → "inset(0 0% 0 0)")
Section 03 Vision: SplitText char-by-char stagger (0.03s per char, y: 40px → 0)
Section 04 Creative: title and label enter simultaneously from different y values 
                     (title y: 60px, label y: -60px, both → 0)

All trigger at ScrollTrigger start: "top 80%", once: true.
Wrap in prefers-reduced-motion check.
Use Playwright to scroll through all 4 sections and screenshot each reveal.
```

---

### Prompt 8 — Horizontal scroll + section parallax

```
Read DESIGN_SYSTEM.md — Animation System, items 4 and 5.

Add horizontal scroll behavior to expanded NicheSection:

When a section is expanded:
- Pin the section using ScrollTrigger pin: true
- Horizontal scroll the project panel track as user scrolls down
- scrub: 0.8 (weighty feel)
- Scroll distance: total panel widths + gaps

Background accent word:
- Moves at slower speed than panels (scrub: 2, x: 0 → -200px)
- Creates depth as panels scroll over it

Use Playwright to expand the Agents section and scroll through all panels.
Verify panels scroll horizontally and accent word moves at different speed.
```

---

### Prompt 9 — Final audit

```
Use Playwright to take a full-page screenshot of localhost:3000.
Scroll through the entire page and take screenshots at each section.
Also screenshot https://fintora-temlis.webflow.io/ for comparison.

Audit and fix:
1. Color — count --color-accent uses. If more than 6, remove from least important elements.
   --color-pop (gold) should appear maximum 3 times. Check and trim.
2. Parallax uniformity — all standard parallax is scrub: 1, y range 0 → -50px.
   Any deviation from this should be intentional (documented in DESIGN_SYSTEM.md).
3. Hero photo — must be visible on first load in the hero section, not below fold.
4. Section spacing — all sections use --space-32 top/bottom. Normalize any outliers.
5. Remove all ScrollTrigger markers.
6. Dark theme check — toggle to dark, Playwright screenshot. 
   Verify all colors switch correctly, nothing is hardcoded.

List every change made and show before/after screenshots.
```
