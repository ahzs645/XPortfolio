const HIDDEN_CONTAINER_STYLES = '\x0a\x20\x20position:\x20fixed\x20!important;\x0a\x20\x20top:\x20-10000px\x20!important;\x0a\x20\x20left:\x20-10000px\x20!important;\x0a\x20\x20width:\x201px\x20!important;\x0a\x20\x20height:\x201px\x20!important;\x0a\x20\x20overflow:\x20hidden\x20!important;\x0a\x20\x20visibility:\x20hidden\x20!important;\x0a\x20\x20opacity:\x200\x20!important;\x0a\x20\x20pointer-events:\x20none\x20!important;\x0a\x20\x20z-index:\x20-9999\x20!important;\x0a\x20\x20display:\x20block\x20!important;\x0a',
    HIDDEN_IFRAME_STYLES = '\x0a\x20\x20position:\x20absolute\x20!important;\x0a\x20\x20top:\x200\x20!important;\x0a\x20\x20left:\x200\x20!important;\x0a\x20\x20width:\x20100%\x20!important;\x0a\x20\x20height:\x20100%\x20!important;\x0a\x20\x20border:\x20none\x20!important;\x0a\x20\x20visibility:\x20hidden\x20!important;\x0a\x20\x20opacity:\x200\x20!important;\x0a\x20\x20pointer-events:\x20none\x20!important;\x0a',
    HIDDEN_IFRAME_STYLES_WITH_TRANSFORM = '\x0a\x20\x20' + HIDDEN_IFRAME_STYLES + '\x0a\x20\x20transform:\x20translateX(-10000px);\x20/*\x20keep\x20off-screen\x20to\x20avoid\x20resize\x20costs\x20*/\x0a';

function normalizeCSSText(_0x3dfc78) {
    return _0x3dfc78['replace'](/\s+/g, '\x20')['trim']();
}
export function ensureDOMReady(_0x4ceae3, _0x35dbb7 = 0xfa) {
    setTimeout(_0x4ceae3, _0x35dbb7);
}
export function updateTaskbarPlayingIndicator({
    windowId: _0x1dd04e,
    indicatorClass: _0xd65e0,
    isPlaying: isPlaying
}) {
    ensureDOMReady(() => {
        const _0x20dbdb = document['querySelector']('.taskbar-item[data-program-id=\x22' + _0x1dd04e + '\x22]');
        if (!_0x20dbdb) return;
        const _0x45763a = _0x20dbdb['querySelector']('span'),
            _0x4395b9 = _0x20dbdb['querySelector']('img');
        if (!_0x45763a || !_0x4395b9) return;
        const _0x157418 = _0x4395b9['alt'],
            _0x2c7327 = _0x45763a['querySelector']('.' + _0xd65e0);
        if (isPlaying && !_0x2c7327) _0x45763a['innerHTML'] = _0x157418 + '<span\x20class=\x22' + _0xd65e0 + '\x22\x20style=\x22color:\x20white;\x20margin-left:\x204px;\x22>🔊</span>';
        else !isPlaying && _0x2c7327 && (_0x45763a['innerHTML'] = _0x157418);
    });
}
export function createHiddenContainer(_0x333b2b, {
    tagName: tagName = 'div',
    attributes: attributes = {}
} = {}) {
    const _0x3b2cd3 = document['createElement'](tagName);
    return _0x3b2cd3['id'] = _0x333b2b, _0x3b2cd3['style']['cssText'] = normalizeCSSText(HIDDEN_CONTAINER_STYLES), Object['entries'](attributes)['forEach'](([_0x712e0c, _0x17e304]) => {
        _0x3b2cd3['setAttribute'](_0x712e0c, _0x17e304);
    }), _0x3b2cd3;
}
export function applyHiddenContainerStyles(_0x17004e) {
    _0x17004e['style']['cssText'] = normalizeCSSText(HIDDEN_CONTAINER_STYLES);
}
export function createPreloadIframe({
    src: src,
    id: _0x185e8c,
    withTransform: withTransform = !![]
}) {
    const _0x1f81ae = document['createElement']('iframe');
    _0x1f81ae['src'] = src, _0x1f81ae['name'] = _0x185e8c + '-preload', _0x1f81ae['setAttribute']('data-preload-app', _0x185e8c);
    const styles = withTransform ? HIDDEN_IFRAME_STYLES_WITH_TRANSFORM : HIDDEN_IFRAME_STYLES;
    return _0x1f81ae['style']['cssText'] = normalizeCSSText(styles), _0x1f81ae['setAttribute']('frameborder', '0'), _0x1f81ae['setAttribute']('scrolling', 'no'), _0x1f81ae['setAttribute']('sandbox', 'allow-scripts\x20allow-same-origin\x20allow-forms\x20allow-popups\x20allow-modals\x20allow-downloads'), _0x1f81ae['setAttribute']('aria-hidden', 'true'), _0x1f81ae;
}
export function applyHiddenIframeStyles(_0x2c2816, _0x5288c4 = ![]) {
    const _0x4916ce = Array['isArray'](_0x2c2816) ? Array['from'](_0x2c2816) : [_0x2c2816],
        styles = _0x5288c4 ? HIDDEN_IFRAME_STYLES_WITH_TRANSFORM : HIDDEN_IFRAME_STYLES;
    _0x4916ce['forEach'](_0xcb7de1 => {
        _0xcb7de1 && _0xcb7de1['style'] && (_0xcb7de1['style']['cssText'] = normalizeCSSText(styles));
    });
}