const FLIP_LEFT = 'start-menu-submenu--flip-left';
const EDGE_GAP = 8;

function viewport() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

function getBottomBoundary(anchor, viewportHeight) {
  const taskbar = anchor?.closest('.xp-taskbar-shell')?.querySelector('.taskbar');
  const taskbarTop = taskbar?.getBoundingClientRect().top;

  return Number.isFinite(taskbarTop) ? Math.min(taskbarTop, viewportHeight) : viewportHeight;
}

export function positionStartMenuFlyout(submenu, anchor) {
  if (!submenu) return;

  const vp = viewport();
  const bottom = getBottomBoundary(anchor, vp.height);

  submenu.style.transform = '';
  submenu.classList.remove(FLIP_LEFT);

  let rect = submenu.getBoundingClientRect();

  if (rect.right + EDGE_GAP > vp.width) {
    submenu.classList.add(FLIP_LEFT);
    rect = submenu.getBoundingClientRect();
  }

  let dy = 0;
  if (rect.bottom + EDGE_GAP > bottom) {
    dy = bottom - EDGE_GAP - rect.bottom;
  }
  if (rect.top + dy < EDGE_GAP) {
    dy = EDGE_GAP - rect.top;
  }
  if (dy) {
    submenu.style.transform = `translateY(${Math.round(dy)}px)`;
  }
}
