import html from '../../html.js';

export default function ResumeContent({ config = {} }) {
  const skills = config.skills || ['Creative direction', 'Motion design', 'Front-end development'];
  const highlights = config.highlights || [
    '10+ years crafting digital experiences across sport and entertainment.',
    'Specialist in translating brand systems into interactive moments.',
    'Comfortable collaborating with multidisciplinary teams.'
  ];

  return html`
    <div class="app-content resume">
      <section>
        <h2>${config.developerName}</h2>
        <p class="resume-title">${config.developerTitle}</p>
        <p class="resume-location">${config.developerLocation}</p>
        <a class="resume-email" href=${`mailto:${config.developerEmail || ''}`}>
          ${config.developerEmail}
        </a>
      </section>
      <section>
        <h3>Career highlights</h3>
        <ul>
          ${highlights.map(item => html`<li key=${item}>${item}</li>`)}
        </ul>
      </section>
      <section>
        <h3>Core skills</h3>
        <div class="skills-grid">
          ${skills.map(skill => html`<span key=${skill}>${skill}</span>`)}
        </div>
      </section>
      ${config.resumeUrl &&
      html`<section class="resume-actions">
        <a href=${config.resumeUrl} target="_blank" rel="noopener noreferrer" class="button">
          View full resume
        </a>
      </section>`}
    </div>
  `;
}
