<div align="center">

<img src="assets/images/logo.png" width="100" height="100" alt="Kartik Gupta logo" />

# Kartik Gupta — Portfolio

### Backend Engineer & Cloud Architect

A fast, dependency-free single-page portfolio built with vanilla JavaScript and Tailwind CSS — JSON-driven content, a glassmorphism UI, dark/light theming, and smooth, intentional motion.

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

This is a hand-built, framework-free portfolio SPA. There is **no build step and no runtime dependency on a third-party CDN** — Tailwind and Lucide are self-hosted, and all content is rendered client-side from JSON. The result is a site that loads fast, deploys as plain static files, and stays trivially easy to maintain.

> Update a JSON file, refresh the page — the UI re-renders itself. No HTML edits, no rebuild.

---

## Features

| | |
|---|---|
| ⚡ **SPA, zero reloads** | Hash-based routing with scroll-spy keeps the nav in sync as you move through sections. |
| 📦 **JSON-driven content** | Projects, skills, experience, and stats all come from `data/*.json`. |
| 🌗 **Dark / light theme** | One-tap toggle with `localStorage` persistence, OS-preference fallback, and no flash on load. |
| 🎴 **Project modals** | Accessible detail dialogs with focus trapping, background scroll-lock, and Escape / backdrop close. |
| 🧭 **Morphing pill nav** | A floating pill that smoothly widens into a docked header as you scroll. |
| ✨ **Motion, done right** | Scroll-reveal, a color-shifting scrollbar, and `prefers-reduced-motion` support. |
| 🪟 **Glassmorphism UI** | Layered blur, gradient mesh background, and subtle noise texture. |
| 📨 **Working contact form** | Submissions via the Web3Forms API — no backend required. |
| ♿ **Accessible** | ARIA roles, keyboard navigation, visible focus states, and screen-reader live regions. |
| 🔎 **SEO-ready** | Open Graph, Twitter Cards, JSON-LD structured data, sitemap, and `robots.txt`. |

---

## Tech Stack

- **Markup & styling** — HTML5, Tailwind CSS 3.x (self-hosted build), custom CSS for glassmorphism, theming variables, and animations
- **Scripting** — Vanilla JavaScript (ES6+), organized into small single-responsibility modules
- **Icons** — Lucide (self-hosted)
- **Content** — Static JSON files (`/data`)
- **Contact** — Web3Forms API
- **Hosting** — Static assets deployed to Cloudflare (configured via `wrangler.jsonc`)

---

## Project Structure

```text
Portfolio/
├── index.html              # SPA entry point + embedded data fallback (for file://)
├── error.html              # Custom error page
├── css/
│   └── styles.css          # Theme variables, glassmorphism, nav, animations
├── js/
│   ├── app.js              # Bootstraps the app and wires everything together
│   ├── router.js           # Hash routing + scroll-spy
│   ├── renderer.js         # Builds Home, About, Projects, and Contact sections
│   ├── modal.js            # Project detail modal (focus trap, scroll lock)
│   ├── theme.js            # Dark/light theme manager
│   ├── data-manager.js     # Fetch, validate, and cache JSON content
│   ├── tailwind.min.js     # Self-hosted Tailwind build
│   └── lucide.min.js       # Self-hosted Lucide icons
├── data/
│   ├── projects.json       # Project cards + modal details
│   ├── skills.json         # Skills grouped by category
│   ├── experience.json     # Work history timeline
│   └── stats.json          # Headline metrics
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

The app is intentionally small and modular — each file owns one concern:

- **`data-manager.js`** fetches each `data/*.json` file, validates it against a schema, and caches the result. If a fetch fails (for example when the page is opened directly via `file://`), it falls back to a snapshot embedded in `index.html`, so the site still works offline.
- **`renderer.js`** turns that validated data into DOM — hero, stats, skills, experience timeline, project grid, and contact form — using safe text APIs to avoid XSS.
- **`router.js`** handles in-page navigation and highlights the active section as you scroll.
- **`modal.js`** opens project details in an accessible dialog and locks the background from scrolling.
- **`theme.js`** applies and persists the color theme, keeping the toggle, `<meta name="theme-color">`, and `<html>` class in sync.
- **`app.js`** ties initialization together once the DOM and icons are ready.

```text
data/*.json ──▶ data-manager (fetch → validate → cache) ──▶ renderer ──▶ DOM
                         │
                         └─ falls back to embedded snapshot (file://)
```

---

## Getting Started

No build, no install — it's static files. Serve the folder with any static server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# Cloudflare (mirrors production)
npx wrangler dev
```

Then open **http://localhost:8000** (or the port your tool prints).

> Opening `index.html` straight from disk works too, thanks to the embedded data fallback — but a local server is recommended so the live `data/*.json` files are loaded.

---

## Deployment

The repo is configured for **Cloudflare** static-asset hosting via `wrangler.jsonc`:

```bash
npx wrangler deploy
```

`wrangler.jsonc` serves the project directory as static assets. The included `.htaccess` adds security headers and caching rules for Apache-based hosts.

---

## Updating Content

All content lives in `/data` — edit the JSON and reload:

| File | Controls |
|------|----------|
| `data/projects.json` | Project cards and their modal details |
| `data/skills.json` | Skills, categories, and proficiency |
| `data/experience.json` | Work-history timeline |
| `data/stats.json` | Headline metrics on the home page |

> **Heads-up:** `index.html` keeps an inline snapshot of this data as a `file://` fallback. When served over HTTP the live JSON is used, so your edits show immediately. If you rely on `file://`, refresh that inline snapshot after editing the JSON.

---

## Accessibility & SEO

- Semantic landmarks, ARIA labels, and an aria-live region for section changes
- Full keyboard support, visible focus styles, and modal focus trapping
- Honors `prefers-reduced-motion`
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
