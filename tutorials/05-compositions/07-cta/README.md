# 07 — CTA Composition

**File:** `src/components/compositions/Cta.tsx`

**Chapter:** `id: 'cta'`, `composition: 'cta'`, `bg: 'navy'`

## What you see

The final panel. Dark navy background. Two equal columns:

- **Left column:** A small amber mono label ("Let's work"), the large headline "Let's build / something / that ships." with the last word "ships." in amber, and four links below it (GitHub, LinkedIn, Resume, Email) spaced out horizontally.
- **Right column:** Bottom-right corner has two faint lines — the person's name in small Clash Display at very low opacity, and a location + status line in tiny mono at even lower opacity. These are the watermark.

## Where it lives

- `src/components/compositions/Cta.tsx`
- Chapter data: `src/data/chapters.ts` — the entry with `id: 'cta'`
- Watermark data: `src/data/profile.ts` — the `profile` export

## The amber last-word highlight (lines 12–18)

```tsx
{chapter.title.split('\n').map((l, i, arr) => (
  <span key={i}>
    {i === arr.length - 1
      ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
      : l}
    {i < arr.length - 1 && <br />}
  </span>
))}
```

The title is split on `\n` into lines. Only the last line (`i === arr.length - 1`) gets special treatment. `l.lastIndexOf(' ')` finds the position of the last space in that line. Everything before and including that space renders normally; everything after (the last word) renders in amber.

For `"that ships."`: `lastIndexOf(' ')` returns `4` (the space between "that" and "ships."). So `slice(0, 5)` = `"that "` (normal) and `slice(5)` = `"ships."` (amber).

## Mental model

`lastIndexOf(' ') + 1` splits at the boundary just after the last space — the beginning of the last word. This is different from the Hero composition which uses `slice(-2)` to always highlight exactly the last two characters. The CTA approach adapts to any word length; the Hero approach is fixed at two characters.

## The watermark (lines 41–44)

```tsx
<p style={{ ..., color: 'rgba(248,246,242,0.2)' }}>{profile.name}</p>
<p style={{ ..., color: 'rgba(248,246,242,0.12)' }}>{profile.location} · {profile.status}</p>
```

`profile.name`, `profile.location`, and `profile.status` all come from `src/data/profile.ts`. The name renders at `0.20` opacity; the location + status line at `0.12` opacity.

## Recipe: change the CTA headline

Edit `src/data/chapters.ts`, find the entry with `id: 'cta'`, and change `title`:

```ts
// chapters.ts  lines 131–133
title: 'Let\'s build\nsomething\nthat ships.',
// change to:
title: 'Ready to\nbuild something\nthat matters.',
```

The last word of the last line automatically gets the amber treatment — no component change needed.

## Recipe: change the watermark

The watermark reads from `src/data/profile.ts`:

```ts
// profile.ts  lines 1–6
export const profile = {
  name:     'Nidhi Joshi',
  role:     'AI/ML Engineer',
  location: 'Duluth, GA',
  status:   'Open to work',
} as const;
```

Change `name`, `location`, or `status` here. The watermark updates wherever `profile` is imported — currently only `Cta.tsx`, but also anywhere `siteMeta` is used.

## Recipe: add or remove CTA links

Links come from `chapter.links` in `chapters.ts`:

```ts
// chapters.ts  lines 133–138
links: [
  { label: 'GitHub',   href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
  { label: 'Resume',   href: '/resume.pdf' },
  { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
],
```

Add or remove entries. The links render as a flex-wrap row so additional links wrap to a second line if they overflow.

## Edge cases

- If the `title` field has no `\n` characters (a single-line title), then `arr.length - 1` is `0`, and the amber last-word logic runs on that single line. The entire title becomes one line with the last word in amber — this works correctly.
- If the last line of `title` has no space at all (e.g., `"Ships."`), `lastIndexOf(' ')` returns `-1`. Then `slice(0, 0)` = `""` and `slice(0)` = the entire line. The whole last line renders in amber. There is no guard against this.
- The CTA `links` array is independent of the Hero `links` array — they are on separate chapter objects. Changing one does not affect the other.
