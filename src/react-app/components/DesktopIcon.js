import html from '../html.js';

export default function DesktopIcon({ icon, title, description, onOpen }) {
  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return html`
    <button
      type="button"
      class="desktop-icon"
      onDoubleClick=${onOpen}
      onKeyDown=${handleKeyDown}
      aria-label=${`${title}: ${description}`}
    >
      <img src=${icon} alt="" aria-hidden="true" loading="lazy" />
      <span>${title}</span>
    </button>
  `;
}
