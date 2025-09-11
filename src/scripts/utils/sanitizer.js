const ALLOWED_TAGS = new Set(['br', 'strong', 'em', 'b', 'i', 'u', 'p', 'span', 'ul', 'ol', 'li', 'a']),
    URL_ATTRS = new Set(['href']),
    ALLOWED_ATTRS = new Set(['class', 'data-*', 'role', 'aria-*', 'target', 'rel', 'title', 'href']);

function isAttrAllowed(_0x425264) {
    if (ALLOWED_ATTRS['has'](_0x425264)) return !![];
    if (_0x425264['startsWith']('data-')) return !![];
    if (_0x425264['startsWith']('aria-')) return !![];
    return ![];
}

function sanitizeHTML(_0xdf6826) {
    if (typeof _0xdf6826 !== 'string') return '';
    (_0xdf6826['toLowerCase']()['includes']('<script') || _0xdf6826['toLowerCase']()['includes']('<style')) && (_0xdf6826 = _0xdf6826['replace'](/<\/(?:script|style)>/gi, '')['replace'](/<(?:script|style)[^>]*>/gi, ''));
    const _0xea4a18 = new DOMParser(),
        _0x290e11 = _0xea4a18['parseFromString']('<div>' + _0xdf6826 + '</div>', 'text/html'),
        _0x4166c3 = _0x290e11['body']['firstChild'],
        _0x10b796 = document['createTreeWalker'](_0x4166c3, NodeFilter['SHOW_ELEMENT'], null),
        _0x5b8995 = [];
    while (_0x10b796['nextNode']()) {
        const _0x452d9e = _0x10b796['currentNode'],
            _0x5096bd = _0x452d9e['tagName']['toLowerCase']();
        if (!ALLOWED_TAGS['has'](_0x5096bd)) {
            _0x5b8995['push'](_0x452d9e);
            continue;
        } [..._0x452d9e['attributes']]['forEach'](_0x18c617 => {
            const _0x3a94b9 = _0x18c617['name']['toLowerCase'](),
                _0x3bba26 = _0x18c617['value'];
            if (_0x3a94b9['startsWith']('on')) {
                _0x452d9e['removeAttribute'](_0x18c617['name']);
                return;
            }
            if (!isAttrAllowed(_0x3a94b9)) {
                _0x452d9e['removeAttribute'](_0x18c617['name']);
                return;
            }
            if (URL_ATTRS['has'](_0x3a94b9)) {
                const _0x5cff7e = _0x3bba26['trim']()['toLowerCase']();
                if (_0x5cff7e['startsWith']('javascript:') || _0x5cff7e['startsWith']('data:text/html')) _0x452d9e['removeAttribute'](_0x18c617['name']);
                else {
                    if (_0x3a94b9 === 'href' && _0x452d9e['getAttribute']('target') === '_blank') {
                        const _0x1f8232 = (_0x452d9e['getAttribute']('rel') || '')['split'](/\s+/);
                        if (!_0x1f8232['includes']('noopener')) _0x1f8232['push']('noopener');
                        if (!_0x1f8232['includes']('noreferrer')) _0x1f8232['push']('noreferrer');
                        _0x452d9e['setAttribute']('rel', _0x1f8232['join']('\x20')['trim']());
                    }
                }
            }
        });
    }
    return _0x5b8995['forEach'](_0x2f5f03 => _0x2f5f03['remove']()), _0x4166c3['innerHTML'];
}
export {
    sanitizeHTML
};