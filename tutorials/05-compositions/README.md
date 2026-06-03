# 05 — Compositions

A **composition** is a layout component that decides how one panel's content is arranged on screen.

## Mental model

Every chapter in `chapters.ts` has a `composition` field — a string like `'hero'`, `'bilateral'`, `'reading-room'`, etc. That string is the only thing that chooses how the panel looks.

`Panel.tsx` receives the chapter object and delegates rendering to a `<Composition>` inner component via a switch:

```tsx
// src/components/Panel.tsx  lines 18–28
function Composition({ chapter }: { chapter: Chapter }) {
  switch (chapter.composition) {
    case 'hero':          return <Hero chapter={chapter} />;
    case 'bilateral':     return <Bilateral chapter={chapter} />;
    case 'reading-room':  return <ReadingRoom chapter={chapter} />;
    case 'offset-title':  return <OffsetTitle chapter={chapter} />;
    case 'metric-lead':   return <MetricLead chapter={chapter} />;
    case 'about':         return <About chapter={chapter} />;
    case 'cta':           return <Cta chapter={chapter} />;
  }
}
```

Each branch imports a file from `src/components/compositions/`. The composition component receives the full `Chapter` object and renders only the fields it cares about — unused fields are silently ignored.

## One data object, seven layouts

The `Chapter` type defines all possible fields (`title`, `tech`, `metric`, `stats`, `experience`, `education`, etc.). No single composition uses all of them. For example:

- `MetricLead` reads `chapter.metric` — other compositions ignore it.
- `About` reads `chapter.experience` and `chapter.education` — no other composition does.
- Every composition reads `chapter.title` and `chapter.label`.

This means the data layer is flat and universal; the composition layer decides which pieces to show and where to place them.

## How to add a new composition

1. Create `src/components/compositions/MyLayout.tsx`, accept `{ chapter: Chapter }`, return JSX.
2. Add `'my-layout'` to the `Composition` union type in `src/data/chapters.ts` line 1–8.
3. Add a `case 'my-layout': return <MyLayout chapter={chapter} />;` to the switch in `Panel.tsx`.
4. Set `composition: 'my-layout'` on any chapter entry in `chapters.ts`.

## Files

| Composition | File | Chapter |
|---|---|---|
| `hero` | `compositions/Hero.tsx` | `id: 'hero'` |
| `bilateral` | `compositions/Bilateral.tsx` | `id: 'lumen'` |
| `reading-room` | `compositions/ReadingRoom.tsx` | `id: 'autodoc'` |
| `offset-title` | `compositions/OffsetTitle.tsx` | `id: 'projection-mapper'` |
| `metric-lead` | `compositions/MetricLead.tsx` | `id: 'weed-detection'` |
| `about` | `compositions/About.tsx` | `id: 'about'` |
| `cta` | `compositions/Cta.tsx` | `id: 'cta'` |
