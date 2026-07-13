<div align="center">

<img src="assets/images/logo.png" width="100" height="100" alt="Kartik Gupta logo" />

# Kartik Gupta — Portfolio

### Backend Engineer

A fast, static, dependency-free portfolio. Content lives in JSON and is rendered to plain HTML at build time — so the page ships as pre-rendered markup with **no framework, no client-side rendering, and no runtime CSS/JS tooling**. A single small script adds progressive enhancement (theme, nav, reveal).

<br />

[![Live Site](https://img.shields.io/badge/Live-kartikgupta.in-a855f7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://kartikgupta.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br />

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?style=flat-square&logo=lucide&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![No Build Step](https://img.shields.io/badge/Build-none-64748b?style=flat-square)

<a href="https://kartikgupta.in"><strong>View the live site →</strong></a>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Updating Content](#updating-content)
- [Accessibility &amp; SEO](#accessibility--seo)
- [Contact](#contact)
- [License](#license)

---

## Overview

This is a hand-built, framework-free portfolio. Content is authored as JSON and compiled into a single static `index.html` by a tiny Node script — there is **no client-side rendering and no third-party runtime**. The browser downloads pre-rendered HTML, two small stylesheets, and one ~7.5KB progressive-enhancement script. Icons are inline SVG; utility CSS is a small hand-authored file (no Tailwind runtime).

> Edit a JSON file, run `npm run render`, and the static HTML is regenerated. The content exists in HTML before any JavaScript runs — good for crawlers, reader mode, and no-JS visitors.

### Why it's built this way

The earlier version shipped the Tailwind **browser runtime** (~407KB) and the full **Lucide** icon library (~356KB) as blocking scripts, then re-rendered every section on the client — throwing away HTML it had already pre-rendered. This version compiles everything ahead of time: the JS payload went from **~885KB to ~7.5KB**, the critical path is pure HTML/CSS, and the CSP no longer needs `unsafe-eval`.

---

## Features

| | |
|---|---|
| ⚡ **Static-first** | Content is pre-rendered to HTML at build time — meaningful markup before any JS runs. |
| 📦 **JSON-driven content** | Hero, stats, projects, skills, experience, and philosophy all come from `data/*.json`. |
| 🪶 **Tiny runtime** | One ~7.5KB `defer` script for theme, mobile nav, scroll-spy, and reveal. No framework, no CDN. |
| 🌗 **Dark / light theme** | One-tap toggle with `localStorage` persistence, OS-preference fallback, and no flash on load. |
| 📐 **Case-study proof** | Real metrics, achievements, and architecture notes surfaced directly in HTML — not hidden behind JS. |
| 🔎 **Native disclosures** | Per-project "Architecture & decisions" via `<details>` — accessible and JS-free. |
| ✨ **Motion, done right** | Scroll-reveal, a color-shifting scrollbar, and full `prefers-reduced-motion` support. |
| 🪟 **Glassmorphism UI** | Layered blur, gradient mesh background, and subtle noise texture — all CSS. |
| ♿ **Accessible** | Semantic landmarks, keyboard navigation, visible focus states, and a skip link. |
| 🔎 **SEO-ready** | Open Graph, Twitter Cards, JSON-LD structured data, sitemap, and `robots.txt`. |

---

## Tech Stack

- **Markup & styling** — HTML5, a small hand-authored utility stylesheet (`css/utilities.css`) plus a component stylesheet (`css/styles.css`) for glassmorphism, CSS-variable theming, and animations. No Tailwind runtime.
- **Build** — One Node ESM script (`scripts/render-content.mjs`) compiles `index.template.html` + `data/*.json` → `index.html`
- **Scripting** — One ~7.5KB vanilla-JS file (`js/main.js`), `defer`-loaded, for progressive enhancement only
- **Icons** — Inline SVG (no icon library)
- **Content** — Static JSON files (`/data`)
- **Hosting** — Static assets deployed to Cloudflare (configured via `wrangler.jsonc`)

---

## Project Structure

```text
Portfolio/
├── index.template.html     # Page shell with __TOKENS__ for each section
├── index.html              # Generated — do not edit by hand (run `npm run render`)
├── error.html              # Custom, self-contained 404 page (theme-aware)
├── css/
│   ├── utilities.css       # Small static layout helpers (replaces Tailwind runtime)
│   └── styles.css          # Theme variables, glassmorphism, components, animations
├── js/
│   └── main.js             # Progressive enhancement: theme, mobile nav, scroll-spy, reveal
├── scripts/
│   └── render-content.mjs  # Build: template + data/*.json → index.html
├── data/
│   ├── profile.json        # Name, tagline, "currently", philosophy, contact
│   ├── stats.json          # Headline metrics band
│   ├── projects.json       # Project cards, links, architecture notes
│   ├── skills.json         # Skills grouped by category, with proficiency
│   └── experience.json     # Work history + quantified achievements
├── assets/
│   └── images/             # Profile photo, logo, favicon
├── .well-known/
│   └── security.txt        # Responsible-disclosure contact
├── .htaccess               # Security headers & caching (Apache hosts)
├── robots.txt              # Crawler directives
├── sitemap.xml             # SEO sitemap
└── wrangler.jsonc          # Cloudflare deployment config
```

---

## How It Works

Rendering happens once, at build time — not in the browser:

- **`scripts/render-content.mjs`** reads `data/*.json`, escapes all values, and fills the `__TOKENS__` in `index.template.html` to produce a fully static `index.html`. Real metrics, achievements, and per-project architecture notes are baked straight into the markup.
- **`js/main.js`** runs after load (`defer`) and only *enhances* that static HTML: theme toggle (persisted, with `<meta name="theme-color">` sync), the mobile menu, IntersectionObserver scroll-spy, and scroll-reveal. If it never runs, the page is still complete and readable.
- Project deep-dives use native `<details>` elements — no modal JS, and the content is present for crawlers.

```text
data/*.json ─┐
             ├─▶ render-content.mjs ─▶ index.html (static, pre-rendered)
index.template.html ─┘                        │
                                               └─▶ main.js enhances in place
```

---

## Getting Started

The output is static files. The only "build" is regenerating `index.html` from JSON, which needs Node (no dependencies to install):

```bash
# Regenerate index.html after editing anything in data/ or the template
npm run render      # == node scripts/render-content.mjs
```

Then serve the folder with any static server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# Cloudflare (mirrors production)
npx wrangler dev
```

Then open **http://localhost:8000** (or the port your tool prints).

---

## Deployment

The repo is configured for **Cloudflare** static-asset hosting via `wrangler.jsonc`:

```bash
npx wrangler deploy
```

`wrangler.jsonc` serves the project directory as static assets. The included `.htaccess` adds security headers and caching rules for Apache-based hosts.

---

## Updating Content

All content lives in `/data` — edit the JSON, then run `npm run render`:

| File | Controls |
|------|----------|
| `data/profile.json` | Name, title, tagline, "currently" line, engineering philosophy, contact |
| `data/stats.json` | Headline metrics band |
| `data/projects.json` | Project cards, links, and "Architecture & decisions" notes |
| `data/skills.json` | Skills, categories, and proficiency |
| `data/experience.json` | Work-history timeline and quantified achievements |

> **Heads-up:** `index.html` is generated. Never edit it by hand — change the JSON (or `index.template.html`) and re-run `npm run render`, or your edits will be overwritten on the next build.

---

## Accessibility & SEO

- Semantic landmarks, ARIA labels, a skip link, and an aria-live region for section changes
- Full keyboard support, visible focus styles, and native `<details>` disclosures
- Honors `prefers-reduced-motion` (disables reveal, float, and scrollbar animation)
- Content is real HTML before JS runs — usable in reader mode, by crawlers, and with JS disabled
- Open Graph + Twitter Card metadata, JSON-LD `Person` schema, `sitemap.xml`, and `robots.txt`

---

## Contact

<div align="center">

[![Email](https://img.shields.io/badge/Email-contact@kartikgupta.in-a855f7?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@kartikgupta.in)
[![GitHub](https://img.shields.io/badge/GitHub-kg--0805-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kg-0805)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kg--0805-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/kg-0805)

</div>

---

## License

Released under the [MIT License](LICENSE).

<div align="center">
<sub>Built with vanilla JS, Tailwind CSS, and a lot of attention to detail.</sub>
</div>
