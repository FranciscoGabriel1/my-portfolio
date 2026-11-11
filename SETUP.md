# Francisco Marinho — Portfolio Setup

## Requirements

- Node.js 24 LTS (pinned in `.nvmrc`; run `nvm use`). The test tooling needs Node 22.12 or newer.
- npm 11+

The `package-lock.json` is committed: use `npm ci` for a reproducible install.

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
| `RESEND_API_KEY` | Contact form | Free key at [resend.com](https://resend.com) |

Translations live in `messages/*.json` and are edited by hand (no translation service).

---

## Replacing placeholder content

### Profile photo
The photo is `public/images/profile.jpeg`, used by the Hero and About sections. Replace the file to update it.

### CV / Resume
The "Download CV" buttons open a Google Drive link per language, defined in `lib/cv.ts` (`CV_URL.pt`, `CV_URL.en`, `CV_URL.es`). To update the resume, upload the new PDF to Drive, share it as "anyone with the link", and replace the URL for that language.

The source PDF lives in `curriculum/`.

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
│   ├── animations/        # FadeInView, StaggerChildren, CountUp, Particles
│   ├── layout/            # Navbar, Footer, ThemeToggle, LanguageSwitcher
│   ├── sections/          # Hero, About, Projects, Experience, Contact
│   └── ui/                # Button, Badge, Card, Input, Textarea
├── curriculum/            # Source CV PDF
├── design/
│   └── prototipos/        # Visual prototypes (.pen and HTML), not part of the build
├── i18n/                  # next-intl config and routing
├── inspirations/          # Design references (not committed)
├── lib/                   # Utility functions and CV links (cv.ts)
├── messages/              # Translation files (pt, en, es)
├── public/                # Static assets
│   └── images/            # Photos and project images
└── scripts/               # Scene posters and screen captures
```

---

## Build for production

```bash
npm run build
npm run start
```
