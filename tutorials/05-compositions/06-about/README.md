# 06 — About Composition

**File:** `src/components/compositions/About.tsx`

**Chapter:** `id: 'about'`, `composition: 'about'`, `bg: 'cream'`

## What you see

The About panel. Cream background. Two equal columns:

- **Left column:** A small dark mono label ("About"), then the title "Building AI / that ships." in large dark Clash Display, and a body paragraph in medium-grey.
- **Right column:** Two bordered sections stacked at the bottom — an "Experience" block and an "Education" block. Each section has a faint top border, a small amber "EXPERIENCE" or "EDUCATION" section label, and the structured content below it.

The columns are aligned to the bottom (`alignItems: 'end'`), so both columns end flush at the same y position.

## Where it lives

- `src/components/compositions/About.tsx`
- Chapter data: `src/data/chapters.ts` — the entry with `id: 'about'`
- Section labels: `src/data/profile.ts` — the `labels` export

## The experience block (lines 25–33)

```tsx
{chapter.experience && (
  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '18px', marginBottom: '16px' }}>
    <p ...>{labels.experience}</p>
    <p ...>{chapter.experience.company}</p>
    <p ...>
      {chapter.experience.role} · {chapter.experience.period} · {chapter.experience.location}
    </p>
  </div>
)}
```

The section header text (`"EXPERIENCE"`) comes from `labels.experience` in `profile.ts`, not from `chapters.ts`. The actual content — company, role, period, location — comes from `chapter.experience`, which is a single object in `chapters.ts`.

## The education block (lines 34–44)

```tsx
{chapter.education && (
  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '18px' }}>
    <p ...>{labels.education}</p>
    {chapter.education.map(e => (
      <div key={e.school} style={{ marginBottom: '8px' }}>
        <p ...>{e.degree}</p>
        <p ...>{e.school} · {e.years}</p>
      </div>
    ))}
  </div>
)}
```

`chapter.education` is an **array** — each entry has `degree`, `school`, and `years`. The component maps over it, so you can have one or many education entries. The section label ("EDUCATION") also comes from `profile.ts → labels.education`.

## Mental model

Experience and education are **structured objects** in `chapters.ts`, not plain text. This means the component can apply consistent typography rules to each field independently — company name gets Clash Display at 20px, role + period + location get mono at 10px, etc. If they were plain text strings, that formatting would not be possible without parsing.

## Recipe: update job title, company, or period

Edit `src/data/chapters.ts`, find the `id: 'about'` entry, and change fields in `experience`:

```ts
// chapters.ts  lines 113–118
experience: {
  role:     'AI/ML Engineer',
  company:  'Escarda Technologies',
  period:   'Jan 2023 – Sep 2024',
  location: 'Berlin',
},
```

Change any field:

```ts
experience: {
  role:     'Senior ML Engineer',
  company:  'Escarda Technologies',
  period:   'Jan 2023 – Present',
  location: 'Berlin, Germany',
},
```

## Recipe: add an education entry

The `education` field is an array. Add a new object to it:

```ts
// chapters.ts  lines 119–122
education: [
  { degree: 'MSc Information Technology', school: 'University of Stuttgart', years: '2019–2022' },
  { degree: 'BE Electrical Engineering',  school: 'MSRIT Bengaluru',         years: '2013–2017' },
  // add:
  { degree: 'Online ML Specialization',   school: 'deeplearning.ai',         years: '2022' },
],
```

The new entry renders below the existing two with the same styling. No component change needed.

## Recipe: change the "Experience" or "Education" section labels

These labels come from `src/data/profile.ts`, not from `chapters.ts`:

```ts
// profile.ts  lines 13–16
export const labels = {
  contact:    'Contact',
  experience: 'Experience',
  education:  'Education',
} as const;
```

Change `experience` or `education` here to rename the section headers across the entire site.

## Edge cases

- If `chapter.experience` is omitted from the chapter entry, the experience block is not rendered. The education block still appears.
- If `chapter.education` is an empty array (`[]`), the `map` produces nothing — the education container div with the border and label still renders, but with no entries inside it. Set `education: undefined` instead if you want to suppress it entirely.
- The "About" label above the title comes from `chapter.label` (`'About'` in `chapters.ts`), not from `profile.ts`.
