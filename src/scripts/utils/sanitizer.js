const ALLOWED_TAGS = new Set(['br', 'strong', 'em', 'b', 'i', 'u', 'p', 'span', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'code', 'pre']),
    URL_ATTRS = new Set(['href']),
    ALLOWED_ATTRS = new Set(['class', 'data-*', 'role', 'aria-*', 'target', 'rel', 'title', 'href']);

function isAttrAllowed(attrName) {
    if (ALLOWED_ATTRS['has'](attrName)) return !![];
    if (attrName['startsWith']('data-')) return !![];
    if (attrName['startsWith']('aria-')) return !![];
    return ![];
}

function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    (html['toLowerCase']()['includes']('<script') || html['toLowerCase']()['includes']('<style')) && (html = html['replace'](/<\/(?:script|style)>/gi, '')['replace'](/<(?:script|style)[^>]*>/gi, ''));
    const parser = new DOMParser(),
        doc = parser['parseFromString']('<div>' + html + '</div>', 'text/html'),
        root = doc['body']['firstChild'],
        walker = document['createTreeWalker'](root, NodeFilter['SHOW_ELEMENT'], null),
        toRemove = [];
    while (walker['nextNode']()) {
        const node = walker['currentNode'],
            tagName = node['tagName']['toLowerCase']();
        if (!ALLOWED_TAGS['has'](tagName)) {
            toRemove['push'](node);
            continue;
        } [...node['attributes']]['forEach'](attr => {
            const attrNameLower = attr['name']['toLowerCase'](),
                attrValue = attr['value'];
            if (attrNameLower['startsWith']('on')) {
                node['removeAttribute'](attr['name']);
                return;
            }
            if (!isAttrAllowed(attrNameLower)) {
                node['removeAttribute'](attr['name']);
                return;
            }
            if (URL_ATTRS['has'](attrNameLower)) {
                const url = attrValue['trim']()['toLowerCase']();
                if (url['startsWith']('javascript:') || url['startsWith']('data:text/html')) node['removeAttribute'](attr['name']);
                else {
                    if (attrNameLower === 'href' && node['getAttribute']('target') === '_blank') {
                        const relParts = (node['getAttribute']('rel') || '')['split'](/\s+/);
                        if (!relParts['includes']('noopener')) relParts['push']('noopener');
                        if (!relParts['includes']('noreferrer')) relParts['push']('noreferrer');
                        node['setAttribute']('rel', relParts['join']('\x20')['trim']());
                    }
                }
            }
        });
    }
    return toRemove['forEach'](removeNode => removeNode['remove']()), root['innerHTML'];
}
export {
    sanitizeHTML
};