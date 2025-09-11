const validators = new Map();

export function registerMessageValidator(type, validator) {
    if (typeof type === 'string' && typeof validator === 'function') {
        validators.set(type, validator);
    }
}

const handlers = new Map();
let initialized = false;

export function initMessageRouter({ allowFileProtocol = true } = {}) {
    if (initialized) return;
    window.addEventListener('message', event => {
        try {
            if (!allowFileProtocol && window.location.protocol === 'file:') return;
            if (window.location.protocol !== 'file:') {
                if (event.origin !== window.origin) return;
            } else if (!allowFileProtocol) {
                return;
            }
            const messageType = event?.data?.type;
            if (!messageType || typeof messageType !== 'string') return;
            const handler = handlers.get(messageType);
            if (!handler) return;
            const validator = validators.get(messageType);
            if (validator && !validator(event.data)) return;
            handler(event);
        } catch (err) {}
    });
    initialized = true;
}

export function registerMessageHandler(type, handler) {
    handlers.set(type, handler);
}

export function handleProgramOpenRequest({ programName, eventData, publish, EVENTS }) {
    if (!programName || !publish || !EVENTS) return;
    if (
        document.documentElement.classList.contains('mobile-device') &&
        ['mediaPlayer', 'paint'].includes(programName)
    ) {
        import('./popupManager.js').then(({ default: popupManager }) => {
            if (!popupManager.isInitialized) popupManager.init();
            const appInfo = {
                mediaPlayer: { title: 'Media Player', icon: './assets/gui/start-menu/mediaPlayer.webp' },
                paint: { title: 'Paint', icon: './assets/gui/start-menu/paint.webp' }
            };
            const { title, icon } = appInfo[programName] || { title: 'This App', icon: null };
            popupManager.showMobileRestrictionPopup(title, icon);
        });
        return;
    }
    const defaultData = { programName };
    publish(EVENTS.PROGRAM_OPEN, eventData || defaultData);
}

registerMessageValidator('open-program', data => typeof data.programName === 'string' && data.programName.length < 40);
registerMessageValidator('confirm-open-program', data => typeof data.programName === 'string');
registerMessageValidator('confirm-open-link', data => typeof data.url === 'string' && data.url.startsWith('http'));
registerMessageValidator('resume-interaction', () => true);
registerMessageValidator('open-projects-from-overlay-studio', () => true);
registerMessageValidator('open-social-from-about', data => typeof data.key === 'string' && typeof data.url === 'string');