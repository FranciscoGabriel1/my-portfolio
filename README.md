# Francisco Marinho — Portfolio

Personal portfolio built with Next.js 16, featuring multilingual support, Apple-inspired design system, and professional animations.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19, on Node.js 24 LTS
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 (CSS-first `@theme`) + CSS Variables
- **Animations:** Framer Motion
- **i18n:** next-intl 4 (PT, EN, ES)
- **Theme:** next-themes (dark/light)
- **Forms:** React Hook Form + Zod 4
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

- Multilingual (PT 🇧🇷 / EN 🇺🇸 / ES 🇪🇸) with auto-translation via the DeepL API
- Dark / light mode toggle
- Responsive (mobile, tablet, desktop)
- Accessible (ARIA, skip-to-content, reduced motion)
- Apple-inspired design system (colors, typography, spacing)
- Sections: Hero, About, Projects, Experience, Contact

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
| `npm run translate` | Auto-generate EN/ES from PT via the DeepL API |
