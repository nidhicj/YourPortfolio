# Client vs. Server Components

Next.js can render components on the server (before the page reaches the browser) or on the client (in the browser). By default, components are server-rendered. `'use client'` opts a component into client-side rendering.

---

## Server component

Renders to HTML on the server before it's sent to the browser. The HTML arrives complete — no JavaScript needs to run before the user sees content.

Restrictions:
- Cannot use hooks (`useState`, `useEffect`, `useRef`)
- Cannot attach event listeners
- Cannot access browser-only APIs (`window`, `document`, `navigator`)

Benefits:
- Faster initial page load
- Content is visible even before JavaScript loads

---

## Client component

Marked with `'use client'` at the top of the file. React renders this component in the browser using JavaScript. Required for anything interactive or animated.

Can use:
- Hooks (`useState`, `useEffect`, `useRef`)
- Event listeners (`addEventListener`)
- Browser APIs (`window.innerHeight`, `requestAnimationFrame`)
- Animation libraries (GSAP, Lenis)

---

## Which files are which in this codebase

**Client components — marked with `'use client'`:**

`Accordion.tsx` — uses `useState`, `useEffect`, `useRef`, and attaches Lenis scroll listeners. Everything interactive lives here.

`TopBar.tsx` — receives props that change as you scroll (`chapterNumber`, `chapterName`). Must be a client component to update dynamically.

`BreathText.tsx` — uses `useBreath` which uses `useEffect` and `useRef` to run the animation loop and attach event listeners.

`BreathLink.tsx` — same as BreathText.

**Server components — no directive, just plain TypeScript:**

`Hero.tsx`, `About.tsx`, `Bilateral.tsx`, `ReadingRoom.tsx`, `OffsetTitle.tsx`, `MetricLead.tsx`, `Cta.tsx` — these compositions take `chapter` data and return HTML structure. No hooks, no event listeners, no animation. They're entirely static arrangements of content.

`Panel.tsx`, `Spine.tsx`, `DemoZone.tsx` — static structure, no browser APIs.

---

## The boundary rule

A server component can import and render a client component. The client component becomes the "client boundary" — everything it renders runs in the browser.

```
Hero.tsx (server)
  └── BreathText.tsx (client) ← boundary
        └── animation runs in browser from here down
  └── BreathLink.tsx (client) ← boundary
        └── animation runs in browser from here down
```

`Hero.tsx` itself is a server component. It imports `BreathText` and `BreathLink`, which ARE client components. The headline text arrives as server-rendered HTML. Then the client component layer activates in the browser and attaches the breathing animation on top.

---

## Why compositions don't need `'use client'`

The composition files (`Hero.tsx`, `Bilateral.tsx`, etc.) import `BreathText` and `BreathLink`. The breathing animation runs inside those child components — in the browser, where they're client components. The composition itself is just arranging elements into a layout. No browser API is called by the composition directly.

You only need `'use client'` when the file itself calls a hook or browser API — not because a child component does.

---

## Performance consequence

Keeping compositions as server components means their HTML content is in the initial page response. A user with a slow connection sees the text immediately. The JavaScript for the breathing animation loads asynchronously on top.

If all compositions were client components, none of the content would be visible until React loaded and ran in the browser. For a portfolio, that would mean a blank screen longer than necessary.
