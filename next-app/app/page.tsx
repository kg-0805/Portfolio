import { getSiteData } from '../lib/content';

export default function HomePage() {
  const { profile, stats, skills, experience, projects } = getSiteData();

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <main className="page-shell">
      <section className="hero-card">
        <h1>{profile.name}</h1>
        <p className="eyebrow">{profile.title}</p>
        <p>{profile.description}</p>
        <div className="actions">
          <a href="#projects">{profile.ctaPrimary}</a>
          <a href="#contact" className="secondary">{profile.ctaSecondary}</a>
        </div>
      </section>

      <section className="stats-grid" aria-label="Highlights">
        {stats.map((item) => (
          <article key={item.label} className="card">
            <strong>{item.number}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="content-block">
        <h2>Skills & Expertise</h2>
        <div className="skill-grid">
          {Object.entries(groupedSkills).map(([category, items]) => (
            <div key={category} className="card">
              <h3>{category}</h3>
              <ul>
                {items.map((skill) => (
                  <li key={skill.id}>{skill.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="content-block">
        <h2>Experience</h2>
        <div className="timeline">
          {experience.map((entry) => (
            <article key={entry.id} className="card timeline-item">
              <h3>{entry.title}</h3>
              <p className="company">{entry.company}</p>
              <p>{entry.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="content-block">
        <h2>Projects</h2>
        <div className="project-grid">
          {projects.map((project) => (
            <article key={project.id} className="card project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <ul className="tag-list">
                {project.technologies.slice(0, 3).map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="content-block">
        <h2>Contact</h2>
        <div className="card contact-card">
          <p>{profile.contact.email}</p>
          <p>{profile.contact.linkedin}</p>
          <p>{profile.contact.github}</p>
        </div>
      </section>
    </main>
  );
}
