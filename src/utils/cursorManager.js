const CURSOR_STYLE_ID = 'xportfolio-xp-cursor-style';
const CURSOR_PRELOAD_ATTR = 'data-xp-cursor-preload';
const CURSOR_ASSET_URLS = [
  '/ui/cursors/default.cur',
  '/ui/cursors/link.cur',
  '/ui/cursors/background.cur',
  '/cursors/arrow.png',
  '/cursors/arrow-link.png',
  '/cursors/wait.cur',
  '/cursors/arrow-wait.png',
  '/cursors/text-select.png',
];

const CURSOR_MODE_PRIORITY = {
  default: 0,
  progress: 1,
  none: 2,
};

const CURSOR_CSS = `
:root {
  --xp-cursor-default: url("/ui/cursors/default.cur"), url("/cursors/arrow.png") 0 0, default;
  --xp-cursor-link: url("/ui/cursors/link.cur"), url("/cursors/arrow-link.png") 0 0, url("/ui/cursors/default.cur"), default;
  --xp-cursor-progress: url("/ui/cursors/background.cur"), url("/cursors/wait.cur"), url("/cursors/arrow-wait.png") 0 0, url("/ui/cursors/default.cur"), default;
  --xp-cursor-text: url("/cursors/text-select.png") 12 12, url("/ui/cursors/default.cur"), default;
}

html,
body {
  cursor: var(--xp-cursor-default) !important;
}

body * {
  cursor: inherit !important;
}

a,
a * {
  cursor: var(--xp-cursor-link) !important;
}

input[type="email"],
input[type="number"],
input[type="password"],
input[type="search"],
input[type="text"],
textarea,
[contenteditable="true"] {
  cursor: var(--xp-cursor-text) !important;
}

html[data-xp-cursor-mode="progress"],
html[data-xp-cursor-mode="progress"] body,
html[data-xp-cursor-mode="progress"] body * {
  cursor: var(--xp-cursor-progress) !important;
}

html[data-xp-cursor-mode="none"],
html[data-xp-cursor-mode="none"] body,
html[data-xp-cursor-mode="none"] body * {
  cursor: none !important;
}
`;

const modeTokens = new Map();
let nextTokenId = 0;
let iframeObserver = null;

function preloadCursorAssets(doc = document) {
  if (!doc?.head) {
    return;
  }

  CURSOR_ASSET_URLS.forEach((url) => {
    if (doc.head.querySelector(`[${CURSOR_PRELOAD_ATTR}="${url}"]`)) {
      return;
    }

    const preloadLink = doc.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = url;
    preloadLink.setAttribute(CURSOR_PRELOAD_ATTR, url);
    doc.head.appendChild(preloadLink);
  });
}

function injectCursorStyle(doc) {
  if (!doc?.head || doc.getElementById(CURSOR_STYLE_ID)) {
    return;
  }

  preloadCursorAssets(doc);

  const style = doc.createElement('style');
  style.id = CURSOR_STYLE_ID;
  style.textContent = CURSOR_CSS;
  doc.head.appendChild(style);
}

function getActiveMode() {
  let activeMode = 'default';
  let activePriority = CURSOR_MODE_PRIORITY.default;

  modeTokens.forEach((mode) => {
    const priority = CURSOR_MODE_PRIORITY[mode] ?? CURSOR_MODE_PRIORITY.default;
    if (priority >= activePriority) {
      activeMode = mode;
      activePriority = priority;
    }
  });

  return activeMode;
}

function applyModeToDocument(doc, mode = getActiveMode()) {
  const root = doc?.documentElement;
  if (!root) {
    return;
  }

  if (mode === 'default') {
    delete root.dataset.xpCursorMode;
    return;
  }

  root.dataset.xpCursorMode = mode;
}

function getIframeCursorValue(mode = getActiveMode()) {
  switch (mode) {
    case 'none':
      return 'none';
    case 'progress':
      return 'url("/ui/cursors/background.cur"), url("/cursors/wait.cur"), url("/cursors/arrow-wait.png") 0 0, url("/ui/cursors/default.cur"), default';
    default:
      return 'url("/ui/cursors/default.cur"), url("/cursors/arrow.png") 0 0, default';
  }
}

function patchIframe(iframe) {
  if (!iframe) {
    return;
  }

  iframe.style.cursor = getIframeCursorValue();

  try {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) {
      return;
    }

    injectCursorStyle(iframeDoc);
    applyModeToDocument(iframeDoc);
  } catch {
    try {
      iframe.contentWindow?.postMessage({
        type: 'xp:cursor-mode',
        mode: getActiveMode(),
      }, '*');
    } catch {
      // Cross-origin iframe that does not accept postMessage cursor sync.
    }
  }
}

function bindIframeLoadHandler(iframe) {
  if (!iframe || iframe.dataset.xpCursorBound === 'true') {
    return;
  }

  iframe.dataset.xpCursorBound = 'true';
  iframe.addEventListener('load', () => patchIframe(iframe));
}

function patchIframeNode(node) {
  if (node?.nodeName === 'IFRAME') {
    bindIframeLoadHandler(node);
    patchIframe(node);
  }

  node?.querySelectorAll?.('iframe').forEach((iframe) => {
    bindIframeLoadHandler(iframe);
    patchIframe(iframe);
  });
}

function syncDocuments() {
  if (typeof document === 'undefined') {
    return;
  }

  injectCursorStyle(document);
  applyModeToDocument(document);
  document.querySelectorAll('iframe').forEach(patchIframe);
}

function initIframeObserver() {
  if (typeof document === 'undefined' || iframeObserver || !document.body) {
    return;
  }

  iframeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(patchIframeNode);
    });
  });

  iframeObserver.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('iframe').forEach(patchIframe);
}

function initCursorManager() {
  if (typeof document === 'undefined') {
    return;
  }

  injectCursorStyle(document);
  applyModeToDocument(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIframeObserver, { once: true });
  } else {
    initIframeObserver();
  }
}

function pushMode(mode) {
  const tokenId = `cursor-mode-${++nextTokenId}`;
  modeTokens.set(tokenId, mode);
  syncDocuments();

  return {
    release() {
      if (!modeTokens.has(tokenId)) {
        return;
      }

      modeTokens.delete(tokenId);
      syncDocuments();
    },
  };
}

initCursorManager();

export const cursorManager = {
  getMode: getActiveMode,
  patchIframe,
  pushMode,
  sync: syncDocuments,
};

export default cursorManager;
