import React from 'react';
import { createRoot } from 'react-dom/client';
import GsapTourPlayer from './GsapTourPlayer';

// Launch the animated tour as a self-contained fullscreen app, mounted in its OWN React
// root appended to <body> — independent of the XP Tour window. That lets the chooser
// window close while the tour keeps playing (it would unmount with the window if it were
// rendered inside it). The tour removes itself when the user exits, presses Esc, or the
// tour issues fscommand("quit").
let active = null; // guard against double launches

export function launchAnimatedTour({ scene = 'A-tour.swf' } = {}) {
  if (active) return; // a tour is already running
  const container = document.createElement('div');
  container.setAttribute('data-xp-tour-root', '');
  document.body.appendChild(container);
  const root = createRoot(container);
  active = container;

  const teardown = () => {
    root.unmount();
    container.remove();
    if (active === container) active = null;
  };

  root.render(
    <GsapTourPlayer
      scene={scene}
      autoplay
      onExit={teardown}
      onFsCommand={(command) => { if (command === 'quit') teardown(); }}
    />,
  );
}
