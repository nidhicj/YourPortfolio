# 02 — profile.ts

**File:** `src/data/profile.ts`

## What you see

- Top-left wordmark in the navigation bar: your name
- Meta line inside the Hero panel: "AI/ML Engineer · Duluth, GA"
- Browser tab title and SEO description
- Section headers "Contact", "Experience", "Education"
- Bottom-right corner of the CTA panel: name + location + status

## The three exports

```ts
// src/data/profile.ts  (lines 1–17)

export const profile = {
  name:     'Nidhi Joshi',
  role:     'AI/ML Engineer',
  location: 'Duluth, GA',
  status:   'Open to work',
} as const;

export const siteMeta = {
  title:       `${profile.name} — ${profile.role}`,
  description: "I don't ship AI without guardrails. Building robust, explainable systems end-to-end.",
} as const;

export const labels = {
  contact:    'Contact',
  experience: 'Experience',
  education:  'Education',
} as const;
```

### Which components read from each export

**`profile`**

| Field | Component | Where it appears |
|---|---|---|
| `profile.name` | `TopBar.tsx` line 29 | Top-left wordmark, always visible |
| `profile.name` | `Cta.tsx` line 42 | Faint name in bottom-right of the CTA panel |
| `profile.role` | `Hero.tsx` line 28 | Meta line: "AI/ML Engineer · Duluth, GA" |
| `profile.location` | `Hero.tsx` line 28 | Same meta line |
| `profile.location` | `Cta.tsx` line 43 | CTA corner: "Duluth, GA · Open to work" |
| `profile.status` | `Cta.tsx` line 43 | CTA corner status text |

**`siteMeta`**

| Field | Component | Where it appears |
|---|---|---|
| `siteMeta.title` | `layout.tsx` line 6 | Browser tab, `<title>` tag, social share title |
| `siteMeta.description` | `layout.tsx` line 7 | `<meta name="description">`, social share description |

**`labels`**

| Field | Component | Where it appears |
|---|---|---|
| `labels.contact` | `Hero.tsx` line 86 | Header above the GitHub / LinkedIn / Resume / Email links |
| `labels.experience` | `About.tsx` line 27 | Header above the job entry |
| `labels.education` | `About.tsx` line 36 | Header above degree entries |

## Mental model

`profile.ts` is the single source of truth for your identity across the site. Change your name once here — it updates in the top bar, the hero, and the CTA panel simultaneously. This is the difference between a token and a magic string: a token is changed in one place and the change ripples everywhere.

## Recipe: change your name

```ts
// src/data/profile.ts  line 2
name: 'Your Name Here',
```

Save. The browser updates the top-left wordmark, the CTA corner text, and the browser tab title instantly (the tab updates on next page load in production; instantly in dev).

## Recipe: change the browser tab title

`siteMeta.title` is a template string that uses `profile.name` and `profile.role`:

```ts
title: `${profile.name} — ${profile.role}`,
```

The simplest way to customise it is to change `profile.name` and `profile.role`. If you want a different format entirely, replace the template:

```ts
export const siteMeta = {
  title: 'YourName · AI Engineer · Portfolio',
  description: 'Your custom description here.',
} as const;
```

## Recipe: change the "Open to work" status

```ts
// src/data/profile.ts  line 5
status: 'Freelancing',
```

This updates the faint line in the bottom-right corner of the CTA (last) panel.

## Edge case: globals.css must be manually synced

`src/app/globals.css` defines CSS custom properties for color values:

```css
/* src/app/globals.css  lines 61–64 */
--color-cream: #F8F6F2;
--color-navy:  #14213d;
--color-amber: #fca311;
--color-ink:   #0a0a0a;
```

These are duplicates of the same values in `src/lib/theme.ts`. TypeScript does not enforce the sync between the two files. If you change a color in `theme.ts` but forget to update `globals.css`, components that use `var(--color-amber)` inline (like the amber `"ed"` in the Hero headline) will show the old color while JavaScript-applied styles show the new one. Always update both files together. The comment on line 55 of `globals.css` reminds you: `/* Keep color values in sync with src/lib/theme.ts → colors */`.
