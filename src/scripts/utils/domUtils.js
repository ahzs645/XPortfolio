const HIDDEN_CONTAINER_STYLES = `
  position: fixed !important;
  top: -10000px !important;
  left: -10000px !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: -9999 !important;
  display: block !important;
`;

const HIDDEN_IFRAME_STYLES = `
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
`;

const HIDDEN_IFRAME_STYLES_WITH_TRANSFORM = `
  ${HIDDEN_IFRAME_STYLES}
  transform: translateX(-10000px); /* keep off-screen to avoid resize costs */
`;

function normalizeCSSText(css) {
    return css.replace(/\s+/g, ' ').trim();
}

export function ensureDOMReady(fn, delay = 250) {
    setTimeout(fn, delay);
}

export function updateTaskbarPlayingIndicator({ windowId, indicatorClass, isPlaying }) {
    ensureDOMReady(() => {
        const taskbarItem = document.querySelector(`.taskbar-item[data-program-id="${windowId}"]`);
        if (!taskbarItem) return;
        const labelSpan = taskbarItem.querySelector('span');
        const iconImg = taskbarItem.querySelector('img');
        if (!labelSpan || !iconImg) return;
        const labelText = iconImg.alt;
        const existingIndicator = labelSpan.querySelector(`.${indicatorClass}`);
        if (isPlaying && !existingIndicator) {
            labelSpan.innerHTML = `${labelText}<span class="${indicatorClass}" style="color: white; margin-left: 4px;">🔊</span>`;
        } else if (!isPlaying && existingIndicator) {
            labelSpan.innerHTML = labelText;
        }
    });
}

export function createHiddenContainer(id, { tagName = 'div', attributes = {} } = {}) {
    const container = document.createElement(tagName);
    container.id = id;
    container.style.cssText = normalizeCSSText(HIDDEN_CONTAINER_STYLES);
    Object.entries(attributes).forEach(([attr, value]) => {
        container.setAttribute(attr, value);
    });
    return container;
}

export function applyHiddenContainerStyles(container) {
    container.style.cssText = normalizeCSSText(HIDDEN_CONTAINER_STYLES);
}

export function createPreloadIframe({ src, id, withTransform = true }) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.name = `${id}-preload`;
    iframe.setAttribute('data-preload-app', id);
    const styles = withTransform ? HIDDEN_IFRAME_STYLES_WITH_TRANSFORM : HIDDEN_IFRAME_STYLES;
    iframe.style.cssText = normalizeCSSText(styles);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    // iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads'); // Disabled for Chrome compatibility
    iframe.setAttribute('aria-hidden', 'true');
    return iframe;
}

export function applyHiddenIframeStyles(iframes, withTransform = false) {
    const elements = Array.isArray(iframes) ? Array.from(iframes) : [iframes];
    const styles = withTransform ? HIDDEN_IFRAME_STYLES_WITH_TRANSFORM : HIDDEN_IFRAME_STYLES;
    elements.forEach(el => {
        if (el && el.style) {
            el.style.cssText = normalizeCSSText(styles);
        }
    });
}