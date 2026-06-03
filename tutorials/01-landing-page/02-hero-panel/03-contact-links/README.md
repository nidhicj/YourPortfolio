# The Contact Links

## What you see

```
CONTACT
GITHUB   LINKEDIN   RESUME   EMAIL
```

Small monospaced uppercase text. On hover, each link breathes amber. Clicking navigates to the URL.

---

## Where it lives

**URLs and labels:** `src/data/chapters.ts`, hero chapter, `links` array

```ts
links: [
  { label: 'GitHub',   href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
  { label: 'Resume',   href: '/resume.pdf' },
  { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
],
```

**"CONTACT" label:** `src/data/profile.ts` → `labels.contact`

**Rendered by:** `src/components/compositions/Hero.tsx` — the links section at the bottom of the right column

**Hover animation:** `src/components/BreathLink.tsx` + `src/hooks/useBreath.ts`

---

## Recipe — update your GitHub URL

Open `src/data/chapters.ts`. Find the hero entry's `links` array. Change the `href`:

```ts
{ label: 'GitHub', href: 'https://github.com/your-actual-username' },
```

---

## Recipe — add a new link

Add an entry to the `links` array:

```ts
{ label: 'Twitter', href: 'https://twitter.com/yourhandle' },
```

It will automatically appear in both the Hero and CTA panels (both use `chapter.links`).

---

## Recipe — remove a link

Delete the entry from the array. The remaining links reflow automatically.

---

## Recipe — rename "CONTACT" to something else

Open `src/data/profile.ts`. Change:

```ts
export const labels = {
  contact: 'Contact',   // ← change this
  ...
}
```

---

## Mental model — how links render

The Hero maps over the `links` array:

```tsx
{chapter.links.map(l => (
  <BreathLink key={l.label} href={l.href} bg="light" style={...}>
    {l.label}
  </BreathLink>
))}
```

`map()` loops over every item in the array and renders one `<BreathLink>` per item. The order in the array is the order on screen.

`BreathLink` is a thin wrapper around an `<a>` tag that adds the breathing hover animation. If you wanted a plain link with no animation, you'd use `<a href={l.href}>` directly.

**`key={l.label}`** — React requires a unique `key` on each item in a list. Using the label is fine as long as labels are unique. If you had two links with the same label, React would warn you.

---

## Edge cases

**`href: '/resume.pdf'`** — this is a relative path. It looks for a file at `public/resume.pdf`. If that file doesn't exist, the link will 404. Add your actual PDF to `public/` and it will work.

**`href: 'mailto:...'`** — opens the user's default email client. It doesn't send an email from the site. Just a standard HTML mailto link.

**Both Hero and CTA use the same links array.** If you add a link to the hero chapter's `links`, it appears in both the Hero panel and the CTA panel. They share the same data. If you want different links per panel, you'd need to add a separate links field to the CTA chapter data and update `Cta.tsx` to use it.
