let isMobileCache = null;
let isFirefoxCache = null;
let isInitialized = false;

export function isFirefox() {
    if (isFirefoxCache === null) {
        const userAgent = navigator.userAgent || '';
        isFirefoxCache = /Firefox/i.test(userAgent);
    }
    return isFirefoxCache;
}

export function isMobileDevice() {
    if (isMobileCache === null) {
        const userAgent = navigator.userAgent || '';
        const hasMobileKeywords = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
        const isTouchMac = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
        if (hasMobileKeywords || isTouchMac) {
            isMobileCache = true;
            return true;
        }
        try {
            const hasTouch = navigator.maxTouchPoints > 0;
            const width = window.innerWidth;
            const height = window.innerHeight;
            const minDimension = Math.min(width, height);
            const smallScreen = width <= 1200 && height <= 1200;
            isMobileCache = hasTouch && minDimension < 780 && smallScreen;
        } catch (err) {
            isMobileCache = false;
        }
    }
    return isMobileCache;
}

export function initializeDeviceDetection() {
    if (isInitialized) return;
    const mobile = isMobileDevice();
    const firefox = isFirefox();
    if (mobile) {
        document.documentElement.classList.add('mobile-device');
        document.body.classList.add('mobile-device');
    }
    if (firefox) {
        document.documentElement.classList.add('firefox-browser');
    }
    isInitialized = true;
}