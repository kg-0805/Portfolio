import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const read = (p) => JSON.parse(fs.readFileSync(path.join(rootDir, p), 'utf8'));
const profile = read('data/profile.json');
const stats = read('data/stats.json');
const skills = read('data/skills.json');
const experience = read('data/experience.json');
const projects = read('data/projects.json');

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Inline SVG icons (replaces the 356KB Lucide runtime). */
const icon = {
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  dot: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.2-3.1-.13-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.71 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
};

function repoLinks(links = {}) {
  const out = [];
  if (links.github) {
    out.push(`<a href="${esc(links.github)}" target="_blank" rel="noopener noreferrer" class="proj-link">${icon.github}<span>Source</span></a>`);
  }
  if (links.demo) {
    out.push(`<a href="${esc(links.demo)}" target="_blank" rel="noopener noreferrer" class="proj-link">${icon.external}<span>Live</span></a>`);
  }
  return out.length ? `<div class="proj-links">${out.join('')}</div>` : '';
}

function techTags(list = [], limit) {
  const items = typeof limit === 'number' ? list.slice(0, limit) : list;
  return items.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join('');
}

function archDetails(notes = []) {
  if (!notes.length) return '';
  return `
    <details class="arch">
      <summary><span>Architecture &amp; decisions</span><span class="arch-chevron" aria-hidden="true">${icon.arrow}</span></summary>
      <ul class="arch-list">
        ${notes.map((n) => `<li><span class="arch-focus">${esc(n.focus)}</span><span class="arch-detail">${esc(n.detail)}</span></li>`).join('')}
      </ul>
    </details>`;
}

/* ---------------------------------------------------------------- Hero */
function renderHero() {
  const c = profile.currently;
  return `
    <div class="hero">
      <div class="hero-shapes" aria-hidden="true">
        <div class="hero-shape"></div>
        <div class="hero-shape"></div>
        <div class="hero-shape"></div>
      </div>

      <div class="hero-photo">
        <img src="assets/images/profile.jpg" alt="${esc(profile.name)}" width="112" height="112" />
      </div>

      <p class="hero-eyebrow">
        <span class="status-dot" aria-hidden="true"></span>
        ${esc(profile.availability)}
      </p>
      <h1 class="hero-title gradient-text">${esc(profile.name)}</h1>
      <p class="hero-subtitle shimmer-text">${esc(profile.title)}</p>
      <p class="hero-tagline">${esc(profile.tagline)}</p>

      <div class="hero-cta">
        <a href="#projects" class="btn-gradient">${esc(profile.ctaPrimary)} ${icon.arrow}</a>
        <a href="#contact" class="btn-outline">${esc(profile.ctaSecondary)}</a>
      </div>

      <div class="hero-now glass-card">
        <span class="hero-now-badge">Currently</span>
        <p class="hero-now-text">
          <strong>${esc(c.role)}</strong> at <strong>${esc(c.company)}</strong> — ${esc(c.detail)}
        </p>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------- Metrics */
function renderMetrics() {
  return `
    <div class="metrics">
      <div class="metrics-grid">
        ${stats.map((s) => `
          <div class="metric-card glass-card">
            <div class="metric-number">${esc(s.number)}</div>
            <div class="metric-label">${esc(s.label)}</div>
            ${s.detail ? `<div class="metric-detail">${esc(s.detail)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------ Featured */
function renderFeatured() {
  const featured = projects.find((p) => p.featured) || projects[0];
  // Pull the quantified achievements from the matching experience entry so the
  // headline case study leads with impact, not just a tech list.
  const exp = experience.find((e) => /digital india/i.test(e.company));
  const wins = (exp?.achievements || []).slice(0, 5);

  return `
    <div class="section-head">
      <p class="section-kicker">Selected work</p>
      <h2 class="section-title gradient-text">Featured case study</h2>
      <p class="section-sub">The system I spend most of my time making faster and more reliable.</p>
    </div>

    <article class="featured glass-card">
      <div class="featured-body">
        <div class="featured-lead">
          <span class="badge badge-live">Production · National scale</span>
          <h3 class="featured-title">${esc(featured.title)}</h3>
          <p class="featured-desc">${esc(featured.fullDescription)}</p>
          <div class="tech-row">${techTags(featured.technologies, 8)}</div>
        </div>

        ${wins.length ? `
        <div class="featured-wins">
          <p class="wins-heading">Impact</p>
          <ul class="wins-list">
            ${wins.map((w) => `<li><span class="wins-check">${icon.check}</span><span>${esc(w)}</span></li>`).join('')}
          </ul>
        </div>` : ''}
      </div>

      ${featured.architectureNotes?.length ? `
      <div class="featured-arch">
        <p class="wins-heading">How it holds up under load</p>
        <div class="arch-grid">
          ${featured.architectureNotes.map((n) => `
            <div class="arch-card">
              <p class="arch-focus">${esc(n.focus)}</p>
              <p class="arch-detail">${esc(n.detail)}</p>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </article>
  `;
}

/* ------------------------------------------------------------ Projects */
function renderProjects() {
  const featured = projects.find((p) => p.featured) || projects[0];
  const ordered = [...projects]
    .filter((p) => p.id !== featured.id)
    .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));

  return `
    <div class="section-head section-head-sub">
      <h3 class="section-subtitle">More things I've built &amp; shipped</h3>
    </div>
    <div class="projects-grid">
      ${ordered.map((p) => `
        <article class="project-card glass-card">
          <div class="project-card-top">
            <h3 class="project-title">${esc(p.title)}</h3>
            ${repoLinks(p.links)}
          </div>
          <div class="project-body">
            <p class="project-desc">${esc(p.description)}</p>
            <div class="tech-row">${techTags(p.technologies, 5)}</div>
          </div>
          ${archDetails(p.architectureNotes)}
        </article>
      `).join('')}
    </div>
  `;
}

/* ---------------------------------------------------------- Experience */
function renderExperience() {
  const yearOf = (d) => (d === 'Present' ? 'Present' : String(d).split('-')[0]);
  return `
    <div class="section-head">
      <p class="section-kicker">Track record</p>
      <h2 class="section-title gradient-text">Experience</h2>
      <p class="section-sub">Where I've built backends, and what came out of it.</p>
    </div>

    <div class="timeline">
      ${experience.map((e) => `
        <article class="timeline-item glass-card">
          <div class="timeline-node" aria-hidden="true"></div>
          <div class="timeline-head">
            <div>
              <h3 class="timeline-role">${esc(e.title)}</h3>
              <p class="timeline-company">${esc(e.company)}</p>
            </div>
            <span class="timeline-dates">${esc(yearOf(e.startDate))} — ${esc(yearOf(e.endDate))}</span>
          </div>
          <p class="timeline-desc">${esc(e.description)}</p>
          ${(e.achievements || []).length ? `
          <ul class="timeline-achievements">
            ${e.achievements.map((a) => `<li><span class="ach-check">${icon.check}</span><span>${esc(a)}</span></li>`).join('')}
          </ul>` : ''}
          <div class="tech-row tech-row-muted">${techTags(e.technologies)}</div>
        </article>
      `).join('')}
    </div>
  `;
}

/* -------------------------------------------------------------- Skills */
function renderSkills() {
  const labels = { backend: 'Backend', cloud: 'Cloud & Infra', database: 'Data', tools: 'Tooling' };
  const order = ['backend', 'cloud', 'database', 'tools'];
  const grouped = {};
  skills.forEach((s) => { (grouped[s.category] ||= []).push(s); });

  return `
    <div class="section-head">
      <p class="section-kicker">Toolbox</p>
      <h2 class="section-title gradient-text">Skills &amp; expertise</h2>
      <p class="section-sub">The stack I reach for to ship dependable production systems.</p>
    </div>

    <div class="skills-grid">
      ${order.filter((cat) => grouped[cat]?.length).map((cat) => `
        <div class="skill-group glass-card">
          <h3 class="skill-group-title">${esc(labels[cat] || cat)}</h3>
          <ul class="skill-list">
            ${grouped[cat].map((s) => `<li>${esc(s.name)}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------------------------------------------------------- Philosophy */
function renderPhilosophy() {
  const list = profile.philosophy || [];
  if (!list.length) return '';
  return `
    <div class="section-head section-head-spaced">
      <p class="section-kicker">How I work</p>
      <h2 class="section-title gradient-text">Engineering approach</h2>
      <p class="section-sub">The principles behind the systems above.</p>
    </div>

    <div class="philosophy-grid">
      ${list.map((p, i) => `
        <div class="philosophy-card glass-card">
          <span class="philosophy-num">0${i + 1}</span>
          <h3 class="philosophy-title">${esc(p.title)}</h3>
          <p class="philosophy-detail">${esc(p.detail)}</p>
        </div>
      `).join('')}
    </div>
  `;
}

/* ------------------------------------------------------------- Contact */
function renderContact() {
  const c = profile.contact;
  const host = (u) => esc(String(u).replace(/^https?:\/\//, ''));
  return `
    <div class="section-head">
      <p class="section-kicker">Contact</p>
      <h2 class="section-title gradient-text">Let's build something reliable</h2>
      <p class="section-sub">Whether it's a new API, a cloud migration, or scaling a platform that's starting to creak — I'm happy to talk it through.</p>
    </div>

    <div class="contact-grid">
      <div class="contact-side">
        <p class="contact-side-heading">Reach me directly</p>
        <div class="contact-links">
          <a href="mailto:${esc(c.email)}" class="contact-link">
            <span class="contact-icon">${icon.mail}</span>
            <span class="contact-link-body"><span class="contact-link-label">Email</span><span class="contact-link-value">${esc(c.email)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon.arrow}</span>
          </a>
          <a href="${esc(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="contact-link">
            <span class="contact-icon">${icon.linkedin}</span>
            <span class="contact-link-body"><span class="contact-link-label">LinkedIn</span><span class="contact-link-value">${host(c.linkedin)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon.arrow}</span>
          </a>
          <a href="${esc(c.github)}" target="_blank" rel="noopener noreferrer" class="contact-link">
            <span class="contact-icon">${icon.github}</span>
            <span class="contact-link-body"><span class="contact-link-label">GitHub</span><span class="contact-link-value">${host(c.github)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon.arrow}</span>
          </a>
        </div>
        <p class="contact-availability">
          <span class="status-dot" aria-hidden="true"></span>${esc(profile.availability)}
        </p>
      </div>

      <div class="contact-form-wrap glass-card">
        <h3 class="contact-form-title">Send a message</h3>
        <form id="contact-form" class="contact-form" novalidate>
          <div class="field field-half">
            <label for="cf-name">Name</label>
            <input type="text" id="cf-name" name="name" placeholder="Your name" autocomplete="name" required />
          </div>
          <div class="field field-half">
            <label for="cf-email">Email</label>
            <input type="email" id="cf-email" name="email" placeholder="you@example.com" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="cf-subject">Subject</label>
            <input type="text" id="cf-subject" name="subject" placeholder="What's this about?" required />
          </div>
          <div class="field">
            <label for="cf-message">Message</label>
            <textarea id="cf-message" name="message" rows="5" placeholder="Tell me a bit about what you're building…" required></textarea>
          </div>
          <button type="submit" class="btn-gradient contact-submit">Send message ${icon.arrow}</button>
          <p id="contact-status" class="contact-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;
}

const templatePath = path.join(rootDir, 'index.template.html');
const outPath = path.join(rootDir, 'index.html');
let html = fs.readFileSync(templatePath, 'utf8');

const replacements = {
  __HERO__: renderHero(),
  __METRICS__: renderMetrics(),
  __FEATURED__: renderFeatured(),
  __PROJECTS__: renderProjects(),
  __EXPERIENCE__: renderExperience(),
  __SKILLS__: renderSkills(),
  __PHILOSOPHY__: renderPhilosophy(),
  __CONTACT__: renderContact(),
};

for (const [token, value] of Object.entries(replacements)) {
  html = html.replaceAll(token, value);
}

// Content-hash the CSS/JS URLs so a redeploy busts the browser cache. Assets are
// served with a 1-year cache (see .htaccess); versioning the URL is what lets an
// update actually reach returning visitors without shipping stale styles.
function versioned(rel) {
  const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(rootDir, rel))).digest('hex').slice(0, 8);
  return `${rel}?v=${hash}`;
}
for (const rel of ['css/utilities.css', 'css/styles.css', 'js/main.js']) {
  html = html.replace(`href="${rel}"`, `href="${versioned(rel)}"`)
             .replace(`src="${rel}"`, `src="${versioned(rel)}"`);
}

fs.writeFileSync(outPath, html);
console.log('Rendered index.html from template + data/*.json');
