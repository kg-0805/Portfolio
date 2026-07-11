import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const profile = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/profile.json'), 'utf8'));
const stats = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/stats.json'), 'utf8'));
const skills = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/skills.json'), 'utf8'));
const experience = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/experience.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/projects.json'), 'utf8'));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHome() {
  return `
    <div class="relative flex flex-col items-center text-center py-16 md:py-24">
      <div class="hero-shapes" aria-hidden="true">
        <div class="hero-shape"></div>
        <div class="hero-shape"></div>
        <div class="hero-shape"></div>
      </div>
      <div class="profile-ring mb-8 relative z-10">
        <img src="assets/images/profile.jpg" alt="${escapeHtml(profile.name)} profile photo" class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover" />
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 relative z-10 gradient-text">${escapeHtml(profile.name)}</h1>
      <p class="text-xl md:text-2xl font-semibold mb-6 relative z-10 shimmer-text">${escapeHtml(profile.title)}</p>
      <p class="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed relative z-10 mb-8">${escapeHtml(profile.description)}</p>
      <div class="flex flex-wrap gap-4 justify-center relative z-10">
        <a href="#projects" class="btn-gradient inline-flex items-center gap-2 text-sm no-underline">${escapeHtml(profile.ctaPrimary)}</a>
        <a href="#contact" class="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all no-underline">${escapeHtml(profile.ctaSecondary)}</a>
      </div>
    </div>
  `;
}

function renderStats() {
  return `
    <div class="py-16 md:py-20 max-w-5xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        ${stats.map((item) => `
          <div class="stat-card glass-card rounded-2xl p-6 text-center">
            <div class="stat-number">${escapeHtml(item.number)}</div>
            <div class="stat-label">${escapeHtml(item.label)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSkills() {
  const grouped = { backend: [], cloud: [], database: [], tools: [] };
  skills.forEach((skill) => {
    if (grouped[skill.category]) {
      grouped[skill.category].push(skill);
    }
  });

  return `
    <div class="mb-16">
      <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Skills & Expertise</h3>
      <p class="text-gray-500 mb-8">The tools and platforms I rely on to deliver production systems.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${Object.entries(grouped).filter(([, items]) => items.length).map(([category, items]) => `
          <div class="glass-card rounded-2xl p-5">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))}</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              ${items.map((skill) => `<li>${escapeHtml(skill.name)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderExperience() {
  return `
    <div>
      <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-6">Experience</h3>
      <div class="space-y-4">
        ${experience.map((entry) => `
          <article class="glass-card rounded-2xl p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">${escapeHtml(entry.title)}</h4>
                <p class="text-purple-600 font-medium">${escapeHtml(entry.company)}</p>
              </div>
              <span class="text-sm text-gray-500">${escapeHtml(entry.startDate.split('-')[0])}${entry.endDate === 'Present' ? ' — Present' : ` — ${entry.endDate.split('-')[0]}`}</span>
            </div>
            <p class="mt-3 text-sm text-gray-600 leading-relaxed">${escapeHtml(entry.description)}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProjects() {
  const ordered = [...projects].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
  return `
    <div class="py-12 md:py-16 max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-2 gradient-text">Projects</h2>
      <p class="text-gray-500 text-center mb-10">Systems I&apos;ve architected, built, and shipped to production</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${ordered.slice(0, 6).map((project) => `
          <article class="project-card glass-card rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(project.title)}</h3>
            <p class="text-sm text-gray-600 mb-4">${escapeHtml(project.description)}</p>
            <div class="flex flex-wrap gap-2">
              ${project.technologies.slice(0, 3).map((tech) => `<span class="tech-tag inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">${escapeHtml(tech)}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderContact() {
  return `
    <div class="py-12 md:py-16 max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-2 gradient-text">Get In Touch</h2>
      <p class="text-gray-500 text-center mb-10">Have a project in mind? I&apos;d love to hear about it.</p>
      <div class="glass-card rounded-3xl p-8 md:p-10">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Let&apos;s build something reliable</h3>
            <p class="text-gray-600 leading-relaxed">Whether it is a new API, a cloud migration, or scaling an existing platform, I enjoy turning complex engineering requirements into production-ready systems.</p>
          </div>
          <div class="space-y-4">
            <a href="mailto:${escapeHtml(profile.contact.email)}" class="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-gray-700 hover:bg-purple-500/10 transition-all no-underline">
              <span class="text-purple-600">✉</span>
              <span>${escapeHtml(profile.contact.email)}</span>
            </a>
            <a href="${escapeHtml(profile.contact.linkedin)}" class="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-gray-700 hover:bg-purple-500/10 transition-all no-underline">
              <span class="text-purple-600">in</span>
              <span>${escapeHtml(profile.contact.linkedin.replace('https://', ''))}</span>
            </a>
            <a href="${escapeHtml(profile.contact.github)}" class="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-gray-700 hover:bg-purple-500/10 transition-all no-underline">
              <span class="text-purple-600">⌘</span>
              <span>${escapeHtml(profile.contact.github.replace('https://', ''))}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

const indexPath = path.join(rootDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const replacements = {
  '__HOME__': renderHome(),
  '__STATS__': renderStats(),
  '__SKILLS__': renderSkills(),
  '__EXPERIENCE__': renderExperience(),
  '__PROJECTS__': renderProjects(),
  '__CONTACT__': renderContact(),
};

for (const [token, value] of Object.entries(replacements)) {
  html = html.replaceAll(token, value);
}

fs.writeFileSync(indexPath, html);
console.log('Rendered content from JSON data into index.html');
