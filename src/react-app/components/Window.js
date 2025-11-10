import html from '../html.js';

const { useCallback, useMemo } = window.React;

const WINDOW_CHROME_HEIGHT = 32;

export default function Window({
  config,
  app,
  windowState,
  isActive,
  onClose,
  onFocus,
  onMinimize,
  onMove
}) {
  const { position, zIndex, minimized, size } = windowState;
  const Content = app.Component;

  const style = useMemo(
    () => ({
      zIndex,
      transform: `translate(${position.x}px, ${position.y}px)`,
      width: (size && size.width) || 520,
      height: (size && size.height) || 360,
      visibility: minimized ? 'hidden' : 'visible',
      pointerEvents: minimized ? 'none' : 'auto'
    }),
    [position.x, position.y, size?.width, size?.height, zIndex, minimized]
  );

  const handlePointerDown = useCallback(
    event => {
      if (minimized) return;
      event.preventDefault();
      onFocus();
      const startX = event.clientX;
      const startY = event.clientY;
      const { x, y } = position;

      const handleMove = moveEvent => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        onMove({ x: x + deltaX, y: y + deltaY });
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp, { once: true });
    },
    [minimized, onFocus, onMove, position]
  );

  return html`
    <section
      class=${`app-window ${isActive ? 'active' : ''}`}
      style=${style}
      role="dialog"
      aria-modal="false"
      aria-label=${app.title}
      onPointerDown=${event => {
        event.stopPropagation();
        if (!minimized) onFocus();
      }}
    >
      <header class="window-title-bar" onPointerDown=${handlePointerDown}>
        <div class="window-title">
          <img src=${app.icon} alt="" aria-hidden="true" />
          <span>${app.title}</span>
        </div>
        <div class="window-controls">
          <button type="button" aria-label="Minimize" onClick=${onMinimize}>_</button>
          <button type="button" aria-label="Close" onClick=${onClose}>×</button>
        </div>
      </header>
      <div class="window-body" style=${{ minHeight: `${WINDOW_CHROME_HEIGHT}px` }}>
        <${Content} config=${config} />
      </div>
    </section>
  `;
}
