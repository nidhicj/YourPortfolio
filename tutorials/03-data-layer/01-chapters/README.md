# 01 — chapters.ts

**File:** `src/data/chapters.ts`

## What you see

Each entry in the `chapters` array becomes one panel in the horizontal accordion. The array order is the left-to-right panel order on screen. The first panel is expanded on load.

## The Chapter interface (lines 15–32)

```ts
export interface Chapter {
  id:          string;          // REQUIRED — unique key, used in data-panel attr
  name:        string;          // REQUIRED — shown in Spine (collapsed label) + TopBar
  composition: Composition;     // REQUIRED — which layout template to use
  bg:          PanelBg;         // REQUIRED — panel background color
  title:       string;          // REQUIRED — main headline in the composition
  label?:      string;          // optional — small mono tag e.g. 'RAG · 2026'
  tagline?:    string;          // optional — hero only: large quote below the headline
  tech?:       string;          // optional — tech stack line (mono, muted amber)
  body?:       string;          // optional — body paragraph
  metric?:     string;          // optional — metric-lead only: big number e.g. '92%'
  stats?:      Stat[];          // optional — array of { value, label } pairs
  links?:      Link[];          // optional — hero + cta: array of { label, href }
  demo?:       boolean;         // optional — true = show DemoZone placeholder
  experience?: { role, company, period, location };  // optional — about only
  education?:  { degree, school, years }[];          // optional — about only
}
```

### Field details

| Field | Type | Used by | Notes |
|---|---|---|---|
| `id` | `string` | `Panel.tsx` `data-panel` attr | Must be unique. No spaces. |
| `name` | `string` | `Spine.tsx` line 42, `TopBar.tsx` line 33 | Appears rotated on collapsed panel and in the top nav. Keep it short (one word). |
| `composition` | `Composition` | `Panel.tsx` line 19–27 | Picks the component. Must match one of the 7 union values. |
| `bg` | `PanelBg` | `Panel.tsx` line 12–15 | Maps to `colors.cream`, `colors.ink`, or `colors.navy` from theme.ts. |
| `title` | `string` | Every composition | Use `\n` to force line breaks in the headline. |
| `label` | `string?` | Bilateral, ReadingRoom, OffsetTitle, MetricLead, About, Cta | Small uppercase mono line above the title. |
| `tagline` | `string?` | Hero only | The large quoted line on the right column. Use `\n` for line breaks. |
| `tech` | `string?` | Bilateral, ReadingRoom, OffsetTitle, MetricLead | Appears below the title in amber. Plain string, no array. |
| `body` | `string?` | Most compositions | Body paragraph. 17px Satoshi Light. |
| `metric` | `string?` | MetricLead only | The huge foregrounded number. |
| `stats` | `Stat[]?` | MetricLead | Each stat becomes a `value / label` pair. |
| `links` | `Link[]?` | Hero, Cta | Each becomes a BreathLink. |
| `demo` | `boolean?` | Bilateral, ReadingRoom, OffsetTitle, MetricLead | Shows the amber-outlined DemoZone placeholder when `true`. |
| `experience` | `object?` | About only | Single job entry. |
| `education` | `object[]?` | About only | Multiple degree entries. |

### Required vs optional at a glance

Required in every chapter: `id`, `name`, `composition`, `bg`, `title`

Everything else is optional — if omitted, the component just skips that section.

## Mental model

The `Chapter` type is a contract between data and UI. The compositions are receivers: they destructure exactly what they need and ignore the rest. If a field isn't in the chapter object, that UI block is simply not rendered. This is why you can safely add a field to one chapter without it affecting any other.

Think of each chapter entry as a form you fill in for that panel. The form has five required fields and a dozen optional ones.

## Recipe: add a new project panel

Add a new entry to the `chapters` array in `src/data/chapters.ts`. Insert it at the position you want (array order = left-to-right screen order):

```ts
{
  id:          'my-project',
  name:        'MyProj',
  composition: 'reading-room',
  bg:          'black',
  label:       'Tool · 2025',
  title:       'My\nProject',
  tech:        'Node.js · Postgres · Redis',
  body:        'What it does in two sentences.',
  demo:        true,
},
```

Then update `layout.nChapters` in `src/lib/theme.ts` to match the new total:

```ts
export const layout = {
  nChapters: 8,   // was 7, now 8
  ...
};
```

## Recipe: reorder chapters

Move the object to its new position in the array. Panel order on screen exactly follows array order. The first entry is always expanded on load.

## Recipe: remove a chapter

Delete the object from the array and decrement `layout.nChapters` in `src/lib/theme.ts`.

## Edge case: missing required field

TypeScript will catch it at build time. If you omit `id`, `name`, `composition`, `bg`, or `title`, you will see a type error and the build fails. In dev mode (`npm run dev`) the error appears in the terminal and as an overlay in the browser.

If you pass a `composition` value that is not in the `Composition` union — for example `'grid'` — TypeScript rejects it. Only `'hero' | 'bilateral' | 'reading-room' | 'offset-title' | 'metric-lead' | 'about' | 'cta'` are valid.

## Edge case: nChapters mismatch

`layout.nChapters` in theme.ts is used by Accordion to calculate total scroll distance and by TopBar to show "01/07". If you add a chapter but forget to increment `nChapters`, the last panel is unreachable by scrolling (total scroll is one chapter short) and TopBar shows the wrong denominator.
