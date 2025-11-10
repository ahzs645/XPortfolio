import html from '../../html.js';
import projectsData from '../../../../projects.json' assert { type: 'json' };

const { useMemo, useState } = window.React;
const MAX_VISIBLE = 3;

export default function ProjectsContent() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const projects = useMemo(
    () => projectsData.filter(project => !project.placeholder),
    []
  );

  if (projects.length === 0) {
    return html`<div class="app-content"><p>No projects available yet. Come back soon!</p></div>`;
  }

  const selectedProject = projects[selectedIndex];
  const visibleProjects = projects.slice(0, MAX_VISIBLE);

  return html`
    <div class="app-content projects">
      <aside class="project-list" aria-label="Project list">
        <ul>
          ${visibleProjects.map(
            (project, index) => html`<li key=${project.title}>
              <button
                type="button"
                class=${selectedIndex === index ? 'active' : ''}
                onClick=${() => setSelectedIndex(index)}
              >
                <strong>${project.title}</strong>
                <span>${project.subtitle}</span>
              </button>
            </li>`
          )}
        </ul>
      </aside>
      <article class="project-details" aria-live="polite">
        <header>
          <h2>${selectedProject.title}</h2>
          <p class="project-subtitle">${selectedProject.subtitle}</p>
          <p class="project-role">${selectedProject.role}</p>
        </header>
        <section class="project-brief">
          <p>${selectedProject.brief}</p>
        </section>
        ${selectedProject.bulletPoints && selectedProject.bulletPoints.length > 0 &&
        html`<section>
          <h3>Highlights</h3>
          <ul>
            ${selectedProject.bulletPoints.map(point => html`<li key=${point}>${point}</li>`)}
          </ul>
        </section>`}
        ${selectedProject.toolsUsed && selectedProject.toolsUsed.length > 0 &&
        html`<section class="project-tools">
          <h3>Tools used</h3>
          <div class="tools-list">
            ${selectedProject.toolsUsed.map(tool => html`<span key=${tool}>${tool}</span>`)}
          </div>
        </section>`}
      </article>
    </div>
  `;
}
