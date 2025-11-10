import html from '../html.js';

export default function StartMenu({ config, apps, onClose, onOpenApp }) {
  return html`
    <aside
      class="start-menu"
      role="menu"
      aria-label="Start menu"
      onPointerDown=${event => event.stopPropagation()}
    >
      <header class="start-menu-header">
        <div class="avatar" aria-hidden="true"></div>
        <div class="start-menu-user">
          <span class="user-name">${config.developerDisplayName || config.developerName}</span>
          <span class="user-title">${config.developerTitle}</span>
        </div>
      </header>
      <div class="start-menu-body">
        <nav>
          <ul>
            ${apps.map(
              app => html`<li key=${app.id}>
                <button
                  type="button"
                  onClick=${() => {
                    onOpenApp(app.id);
                    onClose();
                  }}
                >
                  <img src=${app.icon} alt="" aria-hidden="true" />
                  <span>
                    <strong>${app.title}</strong>
                    <small>${app.description}</small>
                  </span>
                </button>
              </li>`
            )}
          </ul>
        </nav>
      </div>
      <footer class="start-menu-footer">
        <a href=${`mailto:${config.developerEmail || ''}`}>Email</a>
        <a href=${config.developerWebsite || '#'} target="_blank" rel="noopener noreferrer">
          Website
        </a>
      </footer>
    </aside>
  `;
}
