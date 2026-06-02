# Breathing Hover Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Math.sin`-driven breathing animation to chapter title headings and contact links — on hover, color brightness oscillates smoothly between a rest value and an amber peak over a ~4s cycle.

**Architecture:** A shared `useBreath` hook manages one rAF loop per element, driven by phase + breathIntensity state held in refs (no re-renders). Two thin wrapper components — `BreathText` and `BreathLink` — allow compositions to remain server components while adding the client-side hook. Config lives in `theme.ts`.

**Tech Stack:** React hooks, `requestAnimationFrame`, CSS `color` via inline style, TypeScript, Next.js App Router

---

## File Map

| Action | File | Role |
|---|---|---|
| Modify | `src/lib/theme.ts` | Add `breath` config (speed + color ranges) |
| Create | `src/hooks/useBreath.ts` | rAF loop, Math.sin engine, mouseenter/leave |
| Create | `src/components/BreathText.tsx` | `'use client'` h1/h2 wrapper using the hook |
| Create | `src/components/BreathLink.tsx` | `'use client'` anchor wrapper using the hook |
| Modify | `src/components/compositions/Hero.tsx` | Replace h1 → BreathText, a → BreathLink |
| Modify | `src/components/compositions/About.tsx` | Replace h2 → BreathText (light bg) |
| Modify | `src/components/compositions/Bilateral.tsx` | Replace h2 → BreathText (dark bg) |
| Modify | `src/components/compositions/ReadingRoom.tsx` | Replace h2 → BreathText (dark bg) |
| Modify | `src/components/compositions/OffsetTitle.tsx` | Replace h2 → BreathText (dark bg) |
| Modify | `src/components/compositions/MetricLead.tsx` | Replace h2 → BreathText (dark bg) |
| Modify | `src/components/compositions/Cta.tsx` | Replace h2 → BreathText, a → BreathLink (dark bg) |

---

## Task 1: Add `breath` config to `theme.ts`

**Files:**
- Modify: `src/lib/theme.ts`

- [ ] **Add the `breath` export after the existing `anim` export**

Open `src/lib/theme.ts` and add this block after the `anim` export:

```ts
export const breath = {
  speed: 0.026,  // radians/frame → ~4s cycle at 60fps
  colors: {
    headline: {
      light: { lo: [10,  10,  10,  0.88] as const, hi: [252, 163, 17, 0.95] as const },
      dark:  { lo: [248, 246, 242, 0.85] as const, hi: [252, 163, 17, 0.95] as const },
    },
    link: {
      light: { lo: [0,   0,   0,   0.38] as const, hi: [252, 163, 17, 0.90] as const },
      dark:  { lo: [248, 246, 242, 0.32] as const, hi: [252, 163, 17, 0.90] as const },
    },
  },
} as const;
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/lib/theme.ts
git commit -m "feat: add breath animation config to theme"
```

---

## Task 2: Create `src/hooks/useBreath.ts`

**Files:**
- Create: `src/hooks/useBreath.ts`

- [ ] **Create the file**

```ts
import { useEffect, useRef } from 'react';
import { breath } from '@/lib/theme';

type BreathType = 'headline' | 'link';
type BgType = 'light' | 'dark';
type ColorTuple = readonly [number, number, number, number];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendColor(lo: ColorTuple, hi: ColorTuple, t: number): string {
  const r = lerp(lo[0], hi[0], t);
  const g = lerp(lo[1], hi[1], t);
  const b = lerp(lo[2], hi[2], t);
  const a = lerp(lo[3], hi[3], t);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
}

export function useBreath<T extends HTMLElement = HTMLElement>(opts: {
  type: BreathType;
  bg?: BgType;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const bg = opts.bg ?? 'light';
    const range = breath.colors[opts.type][bg];

    let phase = 0;
    let active = false;
    let breathIntensity = 0;
    let rafId: number | null = null;

    function tick() {
      if (active) {
        phase += breath.speed;
        breathIntensity = Math.min(1, breathIntensity + 0.04);
      } else {
        breathIntensity = Math.max(0, breathIntensity - 0.025);
      }

      const sine = (Math.sin(phase) + 1) / 2;
      el.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);

      if (active || breathIntensity > 0.001) {
        rafId = requestAnimationFrame(tick);
      } else {
        el.style.color = blendColor(range.lo, range.hi, 0);
        rafId = null;
      }
    }

    function onEnter() {
      active = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onLeave() {
      active = false;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.style.color = '';
    };
  }, [opts.type, opts.bg]);

  return { ref };
}
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/hooks/useBreath.ts
git commit -m "feat: add useBreath hook — rAF Math.sin breathing engine"
```

---

## Task 3: Create `BreathText` and `BreathLink` wrapper components

**Files:**
- Create: `src/components/BreathText.tsx`
- Create: `src/components/BreathLink.tsx`

- [ ] **Create `src/components/BreathText.tsx`**

```tsx
'use client';
import { useBreath } from '@/hooks/useBreath';

type HeadingTag = 'h1' | 'h2' | 'h3';
type BgType = 'light' | 'dark';

interface BreathTextProps {
  as?: HeadingTag;
  bg?: BgType;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function BreathText({ as: Tag = 'h2', bg = 'light', style, className, children }: BreathTextProps) {
  const { ref } = useBreath<HTMLHeadingElement>({ type: 'headline', bg });
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={className}>
      {children}
    </Tag>
  );
}
```

- [ ] **Create `src/components/BreathLink.tsx`**

```tsx
'use client';
import { useBreath } from '@/hooks/useBreath';

type BgType = 'light' | 'dark';

interface BreathLinkProps {
  href: string;
  bg?: BgType;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function BreathLink({ href, bg = 'light', style, children }: BreathLinkProps) {
  const { ref } = useBreath<HTMLAnchorElement>({ type: 'link', bg });
  return (
    <a ref={ref} href={href} style={{ textDecoration: 'none', ...style }}>
      {children}
    </a>
  );
}
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/components/BreathText.tsx src/components/BreathLink.tsx
git commit -m "feat: add BreathText and BreathLink wrapper components"
```

---

## Task 4: Update `Hero.tsx`

**Files:**
- Modify: `src/components/compositions/Hero.tsx`

The Hero panel has a light (cream) background. Replace the `<h1>` with `<BreathText as="h1" bg="light">` and each `<a>` link with `<BreathLink bg="light">`. Remove the existing `onMouseEnter`/`onMouseLeave` color handlers from links — the hook replaces them.

- [ ] **Update the file**

Replace the entire file with:

```tsx
import type { Chapter } from '@/data/chapters';
import { fonts, typo, space } from '@/lib/theme';
import { profile, labels } from '@/data/profile';
import { BreathText } from '@/components/BreathText';
import { BreathLink } from '@/components/BreathLink';

export default function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="content absolute inset-0 grid"
      style={{
        padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
        gridTemplateColumns: '1fr 1fr',
        columnGap: '48px',
        alignItems: 'start',
      }}
    >
      {/* left: meta + headline */}
      <div>
        <p style={{
          fontFamily:    fonts.mono,
          fontSize:      typo.metaSize,
          letterSpacing: typo.metaLetterSpacing,
          textTransform: 'uppercase',
          color:         'rgba(0,0,0,0.3)',
          marginBottom:  `${space.metaGap}px`,
        }}>
          {profile.role} · {profile.location}
        </p>
        <BreathText as="h1" bg="light" style={{
          fontFamily:    fonts.clash,
          fontWeight:    700,
          fontSize:      typo.heroSize,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
        }}>
          {chapter.title.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === 1
                ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
                : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </BreathText>
      </div>

      {/* right: tagline + bio + contact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
        {chapter.tagline && (
          <blockquote style={{
            fontFamily:    fonts.clash,
            fontWeight:    700,
            fontSize:      typo.taglineSize,
            letterSpacing: '-0.03em',
            lineHeight:    1.05,
            color:         'rgba(10,10,10,0.88)',
          }}>
            {chapter.tagline.split('\n').map((l, i, arr) => (
              <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
            ))}
          </blockquote>
        )}
        {chapter.body && (
          <p style={{
            fontFamily:  fonts.satoshi,
            fontSize:    typo.bodySize,
            lineHeight:  typo.bodyLineHeight,
            fontWeight:  typo.bodyWeight,
            color:       'rgba(0,0,0,0.5)',
            maxWidth:    '360px',
          }}>
            {chapter.body}
          </p>
        )}
        {chapter.links && (
          <div>
            <p style={{
              fontFamily:    fonts.mono,
              fontSize:      typo.metaSize,
              letterSpacing: typo.metaLetterSpacing,
              textTransform: 'uppercase',
              color:         'rgba(252,163,17,0.7)',
              marginBottom:  '12px',
            }}>
              {labels.contact}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {chapter.links.map(l => (
                <BreathLink
                  key={l.label}
                  href={l.href}
                  bg="light"
                  style={{
                    fontFamily:    fonts.mono,
                    fontSize:      typo.metaSize,
                    letterSpacing: typo.linkLetterSpacing,
                    textTransform: 'uppercase',
                  }}
                >
                  {l.label}
                </BreathLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/components/compositions/Hero.tsx
git commit -m "feat: add breathing hover to Hero h1 and links"
```

---

## Task 5: Update `About.tsx`

**Files:**
- Modify: `src/components/compositions/About.tsx`

About has a light (cream) background. Replace `<h2>` with `<BreathText as="h2" bg="light">`.

- [ ] **Add the import and replace the h2**

At the top of `src/components/compositions/About.tsx`, add:

```tsx
import { BreathText } from '@/components/BreathText';
import { labels } from '@/data/profile';
```

Replace the existing `<h2 style={{ ... }}>` element with:

```tsx
<BreathText as="h2" bg="light" style={{
  fontFamily:    'var(--font-clash)',
  fontWeight:    700,
  fontSize:      'clamp(56px,7vw,96px)',
  letterSpacing: '-0.04em',
  lineHeight:    0.9,
}}>
  {chapter.title.split('\n').map((l, i) => (
    <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>
  ))}
</BreathText>
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/components/compositions/About.tsx
git commit -m "feat: add breathing hover to About h2"
```

---

## Task 6: Update dark-background compositions

**Files:**
- Modify: `src/components/compositions/Bilateral.tsx`
- Modify: `src/components/compositions/ReadingRoom.tsx`
- Modify: `src/components/compositions/OffsetTitle.tsx`
- Modify: `src/components/compositions/MetricLead.tsx`

All four have dark backgrounds (`black` or `navy`). Same pattern: add import, replace `<h2>` with `<BreathText as="h2" bg="dark">`, keep all existing style props.

- [ ] **Update `Bilateral.tsx`**

Add at the top:
```tsx
import { BreathText } from '@/components/BreathText';
```

Replace:
```tsx
<h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>{chapter.title}</h2>
```
With:
```tsx
<BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
  {chapter.title}
</BreathText>
```

- [ ] **Update `ReadingRoom.tsx`**

Add at the top:
```tsx
import { BreathText } from '@/components/BreathText';
```

Replace:
```tsx
<h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>{chapter.title}</h2>
```
With:
```tsx
<BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
  {chapter.title}
</BreathText>
```

- [ ] **Update `OffsetTitle.tsx`**

Add at the top:
```tsx
import { BreathText } from '@/components/BreathText';
```

Replace:
```tsx
<h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>
  {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
</h2>
```
With:
```tsx
<BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
  {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
</BreathText>
```

- [ ] **Update `MetricLead.tsx`**

Add at the top:
```tsx
import { BreathText } from '@/components/BreathText';
```

Replace:
```tsx
<h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(48px,5.5vw,80px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>
  {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
</h2>
```
With:
```tsx
<BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(48px,5.5vw,80px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
  {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
</BreathText>
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/components/compositions/Bilateral.tsx src/components/compositions/ReadingRoom.tsx src/components/compositions/OffsetTitle.tsx src/components/compositions/MetricLead.tsx
git commit -m "feat: add breathing hover to dark-panel chapter titles"
```

---

## Task 7: Update `Cta.tsx`

**Files:**
- Modify: `src/components/compositions/Cta.tsx`

CTA has a dark (navy) background. Replace `<h2>` with `<BreathText as="h2" bg="dark">` and each `<a>` link with `<BreathLink bg="dark">`. Remove existing `onMouseEnter`/`onMouseLeave` from links.

- [ ] **Add imports**

At the top of `src/components/compositions/Cta.tsx`, add:

```tsx
import { BreathText } from '@/components/BreathText';
import { BreathLink } from '@/components/BreathLink';
```

- [ ] **Replace the h2**

Replace:
```tsx
<h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>
  {chapter.title.split('\n').map((l, i, arr) => (
    <span key={i}>
      {i === arr.length - 1
        ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
        : l}
      {i < arr.length - 1 && <br />}
    </span>
  ))}
</h2>
```
With:
```tsx
<BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
  {chapter.title.split('\n').map((l, i, arr) => (
    <span key={i}>
      {i === arr.length - 1
        ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
        : l}
      {i < arr.length - 1 && <br />}
    </span>
  ))}
</BreathText>
```

- [ ] **Replace the links**

Replace the existing links block:
```tsx
{chapter.links.map(l => (
  <a key={l.label} href={l.href}
    style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(248,246,242,0.4)', textDecoration: 'none' }}
    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-amber)')}
    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,246,242,0.4)')}>
    {l.label}
  </a>
))}
```
With:
```tsx
{chapter.links.map(l => (
  <BreathLink
    key={l.label}
    href={l.href}
    bg="dark"
    style={{
      fontFamily:    'var(--font-mono)',
      fontSize:      '10px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
    }}
  >
    {l.label}
  </BreathLink>
))}
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/components/compositions/Cta.tsx
git commit -m "feat: add breathing hover to Cta h2 and links"
```

---

## Task 8: Verify in browser

**Files:** none

- [ ] **Start the dev server if not already running**

```bash
NEXT_PUBLIC_DEV_ROUTES=true npm run dev -- --port 3000
```

- [ ] **Open http://localhost:3000 and verify**

Check each of these manually:
1. Hover over "Research / Engineered / Shipped." headline in Hero → color breathes from near-black → amber → near-black, ~4s cycle
2. Hover over GitHub / LinkedIn / Resume / Email links in Hero → same breathing from dim → amber
3. Scroll to chapter 2 (Lumen) — hover the "Lumen" headline → breathes from cream → amber on dark bg
4. Scroll through all chapters and hover each title
5. Scroll to CTA (chapter 7) — hover title and links → breath on dark bg
6. Verify no console errors

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: breathing hover animation — links and chapter titles"
```
