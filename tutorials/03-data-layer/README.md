# 03 — Data Layer

## What you see

Every word on screen — every project title, tech stack line, body paragraph, link label, and your name in the top bar — comes from exactly two files. Open either one, save, and the browser updates instantly.

## The two files

```
src/data/chapters.ts   — one entry per panel (projects, about, CTA)
src/data/profile.ts    — your name, role, site title, and UI labels
```

## Which data feeds which components

```
src/data/chapters.ts
  └── chapters[]           ← array of Chapter objects
        ├── Accordion.tsx  (reads the array, one panel per entry)
        ├── Panel.tsx      (passes chapter to composition + Spine)
        ├── Spine.tsx      (chapter.name → vertical label on collapsed panel)
        ├── TopBar.tsx     (chapter.name → "01/07 · Lumen" nav text)
        └── compositions/
              Hero.tsx         (chapter.title, tagline, body, links)
              Bilateral.tsx    (chapter.title, label, tech, body, demo)
              ReadingRoom.tsx  (chapter.title, label, tech, body, demo)
              OffsetTitle.tsx  (chapter.title, label, tech, body, demo)
              MetricLead.tsx   (chapter.title, label, tech, body, metric, stats, demo)
              About.tsx        (chapter.title, body, experience, education)
              Cta.tsx          (chapter.title, label, links)

src/data/profile.ts
  ├── profile{}            ← name, role, location, status
  │     ├── TopBar.tsx     (profile.name → top-left wordmark)
  │     ├── Hero.tsx       (profile.role · profile.location → meta line)
  │     └── Cta.tsx        (profile.name, profile.location, profile.status → bottom-right corner)
  ├── siteMeta{}           ← title, description
  │     └── layout.tsx     (Next.js <Metadata> → browser tab + SEO)
  └── labels{}             ← "Contact", "Experience", "Education"
        ├── Hero.tsx       (labels.contact → section header above links)
        └── About.tsx      (labels.experience, labels.education → section headers)
```

## The rule

You never need to touch a component file to change text content. Chapters.ts controls every panel. Profile.ts controls your identity. Everything else is wiring.

## Next steps

- Changing panel text, reordering panels, adding a project panel → [01-chapters](./01-chapters/README.md)
- Changing your name, browser tab title, or section labels → [02-profile](./02-profile/README.md)
