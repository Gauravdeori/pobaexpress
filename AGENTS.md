# Working in this repo

Single-page marketing site for Poba Express. See [README.md](README.md) for the
stack and layout.

## Conventions

- Page sections live in `src/components/poba/` and are composed in
  `src/routes/index.tsx`. `src/components/ui/` is shadcn/ui — regenerate rather
  than hand-editing where possible.
- Every section anchors a nav link, so keep section `id`s and the `links` array
  in `src/components/poba/Navbar.tsx` in sync. Current anchors: `#home`,
  `#services`, `#about`, `#partners`, `#order`, `#contact` (the footer).
- Contact details are centralised in `src/lib/contact.ts`. Don't hardcode the
  phone number, email or WhatsApp link anywhere else.
- Styling is Tailwind v4 with the theme defined in `src/styles.css` (`@theme`
  block plus custom `@utility` rules like `glass` and `bg-gradient-hero`). Use
  the semantic tokens (`text-primary`, `bg-accent`, `shadow-soft`) over raw hex.
- `src/routeTree.gen.ts` is generated. Don't edit it.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```
