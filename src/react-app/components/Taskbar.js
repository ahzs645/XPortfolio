import html from '../html.js';

const { useEffect, useState } = window.React;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Taskbar({
  config,
  windows,
  activeWindowId,
  onSelect,
  onToggleStart,
  isStartOpen
}) {
  const [time, setTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const osName =
    config.osName ||
    config.developerOsName ||
    `${config.developerDisplayName || config.developerName || 'User'} XP`;

  return html`
    <footer class="taskbar" role="toolbar" aria-label="Taskbar">
      <button
        type="button"
        class=${`start-button ${isStartOpen ? 'active' : ''}`}
        onClick=${event => {
          event.stopPropagation();
          onToggleStart();
        }}
        aria-haspopup="menu"
        aria-expanded=${isStartOpen}
      >
        <span class="start-button-label">Start</span>
      </button>
      <nav class="taskbar-windows" aria-label="Open windows">
        ${windows.map(
          win => html`<button
            key=${win.id}
            type="button"
            class=${`taskbar-item ${
              activeWindowId === win.id && !win.minimized ? 'active' : ''
            } ${win.minimized ? 'minimized' : ''}`}
            onClick=${event => {
              event.stopPropagation();
              onSelect(win.id);
            }}
          >
            <span>${win.title}</span>
          </button>`
        )}
        ${windows.length === 0 && html`<span class="taskbar-empty">No applications open</span>`}
      </nav>
      <div class="system-tray" aria-label="System information">
        <span class="os-label" aria-hidden="true">${osName}</span>
        <time class="clock" aria-label="Current time">${time}</time>
      </div>
    </footer>
  `;
}
