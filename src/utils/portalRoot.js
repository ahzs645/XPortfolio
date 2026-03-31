const XP_PORTAL_ROOT_ID = 'xp-portal-root';

export function getXpPortalRoot() {
  if (typeof document === 'undefined') {
    return null;
  }

  const existingRoot = document.getElementById(XP_PORTAL_ROOT_ID);
  if (existingRoot) {
    return existingRoot;
  }

  const appRoot = document.getElementById('root');
  if (!appRoot) {
    return document.body;
  }

  const portalRoot = document.createElement('div');
  portalRoot.id = XP_PORTAL_ROOT_ID;
  portalRoot.style.position = 'absolute';
  portalRoot.style.inset = '0';
  portalRoot.style.width = '100%';
  portalRoot.style.height = '100%';
  portalRoot.style.pointerEvents = 'none';
  portalRoot.style.zIndex = '0';
  appRoot.appendChild(portalRoot);
  return portalRoot;
}

export default getXpPortalRoot;
