import html from '../html.js';
import Window from './Window.js';

export default function WindowManager({
  config,
  windows,
  activeWindowId,
  appsById,
  onClose,
  onFocus,
  onMinimize,
  onMove
}) {
  return html`
    <div class="window-layer" aria-live="polite">
      ${windows.map(windowState => {
        const app = appsById[windowState.id];
        if (!app) return null;
        return html`<${Window}
          key=${windowState.id}
          config=${config}
          app=${app}
          windowState=${windowState}
          isActive=${activeWindowId === windowState.id}
          onClose=${() => onClose(windowState.id)}
          onFocus=${() => onFocus(windowState.id)}
          onMinimize=${() => onMinimize(windowState.id)}
          onMove=${position => onMove(windowState.id, position)}
        />`;
      })}
    </div>
  `;
}
