let _isMobileCache = null,
    _isFirefoxCache = null,
    _isInitialized = ![];
export function isFirefox() {
    if (_isFirefoxCache === null) {
        const _0x252360 = navigator['userAgent'] || '';
        _isFirefoxCache = /Firefox/i ['test'](_0x252360);
    }
    return _isFirefoxCache;
}
export function isMobileDevice() {
    if (_isMobileCache === null) {
        const _0x2fdfb8 = navigator['userAgent'] || '',
            _0x4816a3 = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i ['test'](_0x2fdfb8),
            _0x3f0003 = /Macintosh/i ['test'](_0x2fdfb8) && navigator['maxTouchPoints'] > 0x1;
        if (_0x4816a3 || _0x3f0003) return _isMobileCache = !![], !![];
        try {
            const _0x4405ef = navigator['maxTouchPoints'] > 0x0,
                _0x4f67f7 = window['innerWidth'],
                _0x24a6b8 = window['innerHeight'],
                _0x9206fe = Math['min'](_0x4f67f7, _0x24a6b8),
                _0x5be04e = _0x4f67f7 <= 0x4b0 && _0x24a6b8 <= 0x4b0;
            _isMobileCache = _0x4405ef && _0x9206fe < 0x30c && _0x5be04e;
        } catch (_0x355da6) {
            _isMobileCache = ![];
        }
    }
    return _isMobileCache;
}
export function initializeDeviceDetection() {
    if (_isInitialized) return;
    const _0x1b13d7 = isMobileDevice(),
        _0x3fce7f = isFirefox();
    _0x1b13d7 && (document['documentElement']['classList']['add']('mobile-device'), document['body']['classList']['add']('mobile-device')), _0x3fce7f && document['documentElement']['classList']['add']('firefox-browser'), _isInitialized = !![];
}