# Francisco Marinho — Portfolio

Personal portfolio built with Next.js 16: server-rendered content in three languages, a warm design system with WCAG 2.2 AA contrast, and motion that never hides content without JavaScript or with reduced motion.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19, on Node.js 24 LTS
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 (CSS-first `@theme`) + CSS Variables
- **Motion:** CSS + a single `IntersectionObserver` (no animation library); theme switch with the View Transitions API
- **3D:** Three.js hero scene, loaded with dynamic `import()` on first interaction, only on capable devices (static image otherwise)
- **Fonts:** Bricolage Grotesque, Instrument Sans, JetBrains Mono via `next/font` (self-hosted)
- **i18n:** next-intl 4 (PT, EN, ES)
- **Theme:** dark/light without a library: an inline script in `<head>` applies the saved theme before first paint (`lib/theme-script.ts`), and a small hook drives the toggle (`lib/theme.ts`)
- **Forms:** no libraries: native fields, an accessible subject list and a shared validation module (`lib/contact/validate.ts`); delivery via Resend
- **Tests:** Vitest + Testing Library, Playwright + axe
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/pt` automatically.

For full setup instructions, see [SETUP.md](./SETUP.md).

## Features

- Multilingual (PT 🇧🇷 / EN 🇺🇸 / ES 🇪🇸), with the texts in `messages/*.json`
- Dark / light mode toggle
- Responsive (mobile, tablet, desktop)
- Accessible: WCAG 2.2 AA checked with axe, keyboard-only flows, translated ARIA, reduced motion
- Readable without JavaScript: sections are React Server Components
- Sections: Hero, About, Projects, Career (timeline ruler), Contact
- Performance notes: [docs/otimizacao-de-desempenho.md](./docs/otimizacao-de-desempenho.md)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Build, then browser tests (Playwright): smoke, visual baselines, axe |
| `npm run test:e2e:update` | Same, rewriting the visual baselines (only on purpose) |
| `npm run format` | Format with Prettier |
