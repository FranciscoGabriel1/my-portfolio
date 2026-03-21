# Francisco Marinho — Portfolio Setup

## Requirements

- Node.js 18+
- npm 9+

---

## Installation

```bash
npm install
```

---

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/pt` automatically.

Available routes: `/pt`, `/en`, `/es`

---

## Environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DEEPL_API_KEY` | Only for translations | Free key at [deepl.com/pro-api](https://deepl.com/pro-api) |
| `RESEND_API_KEY` | Contact form | Free key at [resend.com](https://resend.com) |

---

## Auto-generating translations

Edit `messages/pt.json` with your content in Portuguese, then run:

```bash
npm run translate
```

This calls the DeepL API and overwrites `messages/en.json` and `messages/es.json` automatically.

Free plan: 500.000 characters/month — more than enough for a portfolio.

---

## Replacing placeholder content

### Profile photo
Replace the `FM` initials placeholder in `components/sections/Hero.tsx`:
```tsx
// Replace the initials block with:
<Image src="/images/photo.jpg" alt="Francisco Marinho" fill className="object-cover" />
```
Place the photo at `public/images/photo.jpg`.

### CV / Resume
Place your PDF at `public/cv.pdf` — the "Download CV" button already points to this path.

Currently the PDF is at `curriculum/Francisco_Marinho_-_Desenvolvedor_Frontend_Sênior.pdf`.
Just copy it:
```bash
cp "curriculum/Francisco_Marinho_-_Desenvolvedor_Frontend_Sênior.pdf" public/cv.pdf
```

### Lottie animations
Place `.json` Lottie files at `public/lottie/`. Recommended source: [lottiefiles.com](https://lottiefiles.com).

Use the `LottiePlayer` component:
```tsx
import { LottiePlayer } from "@/components/animations/LottiePlayer";

<LottiePlayer src="/lottie/your-animation.json" />
```

### Project images
Place project images at `public/images/projects/`. They are referenced in `messages/pt.json` under `projects.items[].image`.

### Inspiration references
Add design references to `inspirations/` — this folder is not committed to git.

---

## Folder structure

```
├── app/
│   └── [locale]/          # i18n routes (pt, en, es)
├── components/
│   ├── animations/        # FadeInView, StaggerChildren, LottiePlayer
│   ├── layout/            # Navbar, Footer, ThemeToggle, LanguageSwitcher
│   ├── sections/          # Hero, About, Projects, Experience, Contact
│   └── ui/                # Button, Badge, Card, Input, Textarea
├── curriculum/            # Source CV PDF
├── i18n/                  # next-intl config and routing
├── inspirations/          # Design references (not committed)
├── lib/                   # Utility functions
├── messages/              # Translation files (pt, en, es)
├── public/                # Static assets
│   ├── cv.pdf             # Resume (add manually)
│   ├── images/            # Photos and project images
│   └── lottie/            # Lottie animation JSON files
└── scripts/
    └── translate.ts       # Auto-translation script
```

---

## Build for production

```bash
npm run build
npm run start
```
