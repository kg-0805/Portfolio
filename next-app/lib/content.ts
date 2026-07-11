import fs from 'fs';
import path from 'path';

function readJson<T>(fileName: string): T {
  const dataPath = path.resolve(process.cwd(), '..', 'data', fileName);
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw) as T;
}

export function getSiteData() {
  return {
    profile: readJson<{ name: string; title: string; description: string; ctaPrimary: string; ctaSecondary: string; contact: { email: string; linkedin: string; github: string } }>('profile.json'),
    stats: readJson<Array<{ number: string; label: string }>>('stats.json'),
    skills: readJson<Array<{ id: string; name: string; category: string; proficiency: string; yearsOfExperience: number }>>('skills.json'),
    experience: readJson<Array<{ id: string; title: string; company: string; startDate: string; endDate: string; description: string }>>('experience.json'),
    projects: readJson<Array<{ id: string; title: string; description: string; fullDescription: string; technologies: string[]; status: string; order: number; architectureNotes?: Array<{ focus: string; detail: string }> }>>('projects.json')
  };
}
