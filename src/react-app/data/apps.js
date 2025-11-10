import AboutContent from '../components/apps/AboutContent.js';
import ProjectsContent from '../components/apps/ProjectsContent.js';
import ResumeContent from '../components/apps/ResumeContent.js';
import ContactContent from '../components/apps/ContactContent.js';

export const APPS = [
  {
    id: 'about',
    title: 'About Me',
    icon: './assets/gui/desktop/about.webp',
    Component: AboutContent,
    initialSize: { width: 520, height: 420 },
    description: 'Learn more about my background and design philosophy.'
  },
  {
    id: 'resume',
    title: 'Resume',
    icon: './assets/gui/desktop/resume.svg',
    Component: ResumeContent,
    initialSize: { width: 600, height: 460 },
    description: 'Review my experience, core skills, and recent highlights.'
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: './assets/gui/desktop/projects.webp',
    Component: ProjectsContent,
    initialSize: { width: 720, height: 520 },
    description: 'Browse selected client and personal work.'
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: './assets/gui/desktop/contact.webp',
    Component: ContactContent,
    initialSize: { width: 480, height: 420 },
    description: 'Get in touch directly from the XP desktop.'
  }
];

export function getAppById(id) {
  return APPS.find(app => app.id === id);
}
