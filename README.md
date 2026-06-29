# 💼 Kartik Gupta – Portfolio Website

A modern single-page application (SPA) portfolio built with vanilla HTML, JavaScript, and Tailwind CSS. Features hash-based client-side routing, JSON-driven content, dynamic project modals, dark/light theme support, and smooth animations.

---

## 🌐 Live Website

[https://kartikgupta.in](https://kartikgupta.in)

---

## 🚀 Tech Stack

- **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS v3.4.17 (self-hosted)
- **Icons**: Lucide Icons (self-hosted)
- **Architecture**: Single-Page Application with hash-based routing
- **Data**: JSON-driven content (projects, skills, experience, stats)
- **Contact Form**: Web3Forms API
- **Hosting**: AWS S3 + CloudFront CDN
- **CI/CD**: GitHub Actions (S3 sync + CloudFront cache invalidation)

---

## 📁 Project Structure

```
Portfolio/
├── index.html              # Single SPA entry point
├── error.html              # Custom 404 page
├── css/
│   └── styles.css          # Custom styles (glassmorphism, animations)
├── js/
│   ├── app.js              # Main initialization and wiring
│   ├── router.js           # Hash-based routing and scroll spy
│   ├── modal.js            # Project modal system
│   ├── theme.js            # Dark/light theme management
│   ├── data-manager.js     # Data fetching, caching, validation
│   ├── renderer.js         # Section rendering (Home, About, Projects, Contact)
│   ├── tailwind.min.js     # Tailwind CSS v3.4.17 (self-hosted CDN)
│   └── lucide.min.js       # Lucide Icons (self-hosted)
├── data/
│   ├── projects.json       # Project data
│   ├── skills.json         # Skills and expertise
│   ├── experience.json     # Work experience
│   └── stats.json          # Key stats/metrics
├── assets/
│   └── images/             # Profile photo, logo, favicon
├── .htaccess               # Security headers, caching, routing, hotlink protection
├── robots.txt              # Search engine directives
├── sitemap.xml             # Sitemap for SEO
└── .github/
    └── workflows/
        └── deploy.yml      # CI/CD pipeline
```

---

## ✨ Features

- ⚡ **SPA Architecture** — No page reloads, instant section navigation
- 📦 **JSON-Driven Content** — Update projects, skills, and experience without touching HTML
- 🎨 **Dynamic Modals** — Click any project card for detailed info with animations
- 🌗 **Dark/Light Mode** — Theme toggle with localStorage persistence
- � **Fully Responsive** — Mobile-first design with breakpoints at 768px and 1024px
- ♿ **Accessible** — ARIA labels, keyboard navigation, focus trapping, screen reader support
- 🔒 **Secured** — CSP headers, directory listing disabled, hotlink protection, image drag prevention
- 🚀 **Zero External Dependencies** — All assets self-hosted (no CDN failures)
- � **Working Contact Form** — Submissions via Web3Forms API (no backend needed)
- 🎯 **SEO Optimized** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap

---

## � Deployment (CI/CD)

Every push to `main` triggers GitHub Actions:

1. Syncs files to the S3 bucket hosting `kartikgupta.in`
2. Invalidates CloudFront cache to reflect changes immediately

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `DISTRIBUTION_ID` | CloudFront Distribution ID |

---

## 🛠️ Local Development

No build step required. Open `index.html` directly or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

---

## � Updating Content

Edit the JSON files in `/data/` to update portfolio content:

- **Projects**: `data/projects.json` — Add/edit project entries
- **Skills**: `data/skills.json` — Update skills and proficiency levels
- **Experience**: `data/experience.json` — Add work history
- **Stats**: `data/stats.json` — Update key metrics

No code changes needed — the SPA reads and renders from these files automatically.

---

## 📬 Contact

[contact@kartikgupta.in](mailto:contact@kartikgupta.in) · [GitHub](https://github.com/kg-0805) · [LinkedIn](https://linkedin.com/in/kg-0805)

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
