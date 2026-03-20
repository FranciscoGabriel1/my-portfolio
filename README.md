# Francisco Marinho — Portfolio

Personal portfolio built with Next.js 14, featuring multilingual support, Apple-inspired design system, and professional animations.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + CSS Variables
- **Animations:** Framer Motion + Lottie
- **i18n:** next-intl (PT, EN, ES)
- **Theme:** next-themes (dark/light)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/pt` automatically.

For full setup instructions, see [SETUP.md](./SETUP.md).

## Features

- Multilingual (PT 🇧🇷 / EN 🇺🇸 / ES 🇪🇸) with auto-translation via Claude API
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
| `npm run format` | Format with Prettier |
| `npm run translate` | Auto-generate EN/ES from PT via Claude API |
