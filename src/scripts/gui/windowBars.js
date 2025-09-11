export function createAddressBar({
    icon: iconSrc,
    title: title = 'About\x20Me'
} = {}) {
    const container = document['createElement']('div');
    container['className'] = 'addressbar-container';
    const iconHtml = iconSrc ? '<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20style=\x22margin:\x200\x203px\x200\x200\x22\x20alt=\x22icon\x22\x20width=\x2214\x22\x20height=\x2214\x22\x20src=\x22' + iconSrc + '\x22\x20/>' : '';
    return container['innerHTML'] = '\x0a\x20\x20\x20\x20<div\x20class=\x22addressbar-row\x22>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22address-label-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x22color:\x20#7f7c73;\x20font-size:\x2011px;\x22>Address</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22addressbar\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22display:\x20flex;\x20align-items:\x20center;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + iconHtml + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22addressbar-title\x22>' + title + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20alt=\x22dropdown\x22\x20class=\x22dropdownIcon\x22\x20width=\x2216\x22\x20height=\x2218\x22\x20src=\x22./assets/gui/toolbar/tooldropdown.webp\x22\x20style=\x22filter:\x20grayscale(100%);\x20opacity:\x200.6;\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22address-bar-progress\x22\x20aria-hidden=\x22true\x22></div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22go-button-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20alt=\x22go\x22\x20class=\x22goIcon\x22\x20width=\x2220\x22\x20height=\x2220\x22\x20src=\x22./assets/gui/toolbar/go.webp\x22\x20style=\x22filter:\x20grayscale(100%);\x20opacity:\x200.6;\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span>Go</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20</div>\x0a\x20\x20', container;
}
let SOCIALS_CACHE = null;
async function getSocials() {
    if (SOCIALS_CACHE) return SOCIALS_CACHE;
    try {
        const response = await fetch('ui.json'),
            data = await response['json']();
        return SOCIALS_CACHE = Array['isArray'](data['socials']) ? data['socials'] : [], SOCIALS_CACHE;
    } catch (error) {
        return SOCIALS_CACHE = [], SOCIALS_CACHE;
    }
}
export function createMenuBar(menuConfig, windowId, parentWindowElement) {
    if (!menuConfig || !menuConfig['items']) return null;
    const container = document['createElement']('div');
    container['className'] = 'menu-bar-container';
    let _parentWindowElement = parentWindowElement,
        cleanupHandler = null;
    container['setParentWindowElement'] = function(_0x58c38) {
        _parentWindowElement && cleanupHandler && (_parentWindowElement['removeEventListener']('window-drag-start', cleanupHandler), _parentWindowElement['removeEventListener']('request-close-window', cleanupHandler)), _parentWindowElement = _0x58c38, _parentWindowElement && cleanupHandler && (_parentWindowElement['addEventListener']('window-drag-start', cleanupHandler), _parentWindowElement['addEventListener']('request-close-window', cleanupHandler));
    };
    const menuBar = document['createElement']('div');
    menuBar['className'] = 'menu-bar', menuConfig['items']['forEach'](menuItem => {
        if (windowId === 'resume-window' && menuItem['key'] === 'file' && Array['isArray'](menuItem['dropdown'])) {
            menuItem['dropdown'] = menuItem['dropdown']['filter'](_0x36599a => _0x36599a['action'] !== 'pageSetup');
            if (!menuItem['dropdown']['some'](_0x2f1bbc => _0x2f1bbc['action'] === 'saveResume')) {
                const _0x294f82 = menuItem['dropdown']['findIndex'](_0x5a6425 => _0x5a6425['action'] === 'filePrint');
                if (_0x294f82 !== -0x1) {
                    const _0x33a1ca = {};
                    _0x33a1ca['text'] = 'Save', _0x33a1ca['action'] = 'saveResume', _0x33a1ca['enabled'] = !![], menuItem['dropdown']['splice'](_0x294f82, 0x0, _0x33a1ca);
                } else {
                    const _0x6d702 = {};
                    _0x6d702['text'] = 'Download', _0x6d702['action'] = 'saveResume', _0x6d702['enabled'] = !![], menuItem['dropdown']['push'](_0x6d702);
                }
            }
        }
        const itemElement = document['createElement']('div');
        itemElement['className'] = 'menu-item' + (!menuItem['enabled'] ? '\x20disabled' : ''), itemElement['textContent'] = menuItem['text'], itemElement['setAttribute']('data-menu', menuItem['key']), menuBar['appendChild'](itemElement);
        if (menuItem['dropdown'] && menuItem['dropdown']['length'] > 0x0 && !['edit', 'tools', 'help']['includes'](menuItem['key'])) {
            const dropdownMenu = document['createElement']('div');
            dropdownMenu['id'] = menuItem['key'] + '-menu-' + windowId, dropdownMenu['className'] = 'dropdown-menu', dropdownMenu['style']['position'] = 'absolute', dropdownMenu['style']['zIndex'] = '99999', menuItem['dropdown']['forEach'](dropdownEntry => {
                if (dropdownEntry['type'] === 'separator') {
                    const separator = document['createElement']('div');
                    separator['className'] = 'menu-separator', dropdownMenu['appendChild'](separator);
                } else {
                    const option = document['createElement']('div');
                    let enabled = dropdownEntry['enabled'] !== ![];
                    dropdownEntry['action'] === 'maximizeWindow' && document['documentElement']['classList']['contains']('mobile-device') && (enabled = ![]), option['className'] = 'menu-option' + (!enabled ? '\x20disabled' : ''), option['textContent'] = dropdownEntry['text'], dropdownEntry['action'] && enabled && option['setAttribute']('data-action', dropdownEntry['action']), dropdownMenu['appendChild'](option);
                }
            }), container['appendChild'](dropdownMenu);
        }
    });
    const logoPlaceholder = document['createElement']('img');
    return logoPlaceholder['className'] = 'menu-bar-logo-placeholder', logoPlaceholder['src'] = './assets/gui/toolbar/barlogo.webp', logoPlaceholder['decoding'] = 'async', logoPlaceholder['loading'] = 'lazy', logoPlaceholder['alt'] = 'Logo', menuBar['appendChild'](logoPlaceholder), container['insertBefore'](menuBar, container['firstChild']), setTimeout(() => {
        let _0x14bff1 = null;
        const _0x5b5e8a = {};
        container['querySelectorAll']('.dropdown-menu')['forEach'](_0x75c60a => {
            const _0x4f01a9 = _0x75c60a['id']['split']('-')[0x0];
            _0x5b5e8a[_0x4f01a9] = _0x75c60a;
        });

        function _0x17ede2() {
            if (_0x14bff1) {
                const _0x2dbace = _0x14bff1['getAttribute']('data-menu'),
                    _0x77ab55 = _0x5b5e8a[_0x2dbace];
                if (_0x77ab55) _0x77ab55['classList']['remove']('show');
                _0x14bff1['classList']['remove']('active'), _0x14bff1 = null;
            }
        }
        cleanupHandler = _0x17ede2;
        if (_parentWindowElement) {
            _parentWindowElement['addEventListener']('window-drag-start', _0x17ede2), _parentWindowElement['addEventListener']('request-close-window', _0x17ede2), _parentWindowElement['addEventListener']('window:iframe-interaction', _0x17ede2);
            const _0x1bd6b9 = _parentWindowElement['querySelector']('iframe');
            if (_0x1bd6b9) {
                const _0x283cda = {};
                _0x283cda['passive'] = !![], _0x283cda['capture'] = !![], _0x1bd6b9['addEventListener']('pointerdown', _0x17ede2, _0x283cda), _0x1bd6b9['addEventListener']('load', () => {
                    const _0x4aa6b1 = {};
                    _0x4aa6b1['passive'] = !![], _0x4aa6b1['capture'] = !![], _0x1bd6b9['addEventListener']('pointerdown', _0x17ede2, _0x4aa6b1);
                });
            }
        }
        const _0x365965 = container['querySelectorAll']('.menu-bar\x20.menu-item:not(.disabled)');
        _0x365965['forEach'](_0x5e1a3d => {
            _0x5e1a3d['addEventListener']('mouseenter', () => {
                _0x14bff1 && _0x14bff1 !== _0x5e1a3d && _0x5e1a3d['click']();
            }), _0x5e1a3d['addEventListener']('click', _0x55e6c3 => {
                _0x55e6c3['stopPropagation']();
                const _0x465084 = _0x5e1a3d['getAttribute']('data-menu'),
                    _0x47646d = _0x5b5e8a[_0x465084];
                if (!_0x47646d) return;
                if (_0x14bff1 === _0x5e1a3d) {
                    _0x17ede2();
                    return;
                }
                _0x17ede2();
                if (_0x465084 === 'view' && _parentWindowElement) {
                    const _0x167deb = _0x47646d['querySelector']('[data-action=\x22maximizeWindow\x22]');
                    if (_0x167deb) {
                        const _0x1979b9 = _parentWindowElement['classList']['contains']('maximized');
                        _0x167deb['textContent'] = _0x1979b9 ? 'Restore' : 'Maximize', _0x167deb['setAttribute']('aria-label', _0x1979b9 ? 'Restore' : 'Maximize');
                    }
                }
                _0x5e1a3d['classList']['add']('active');
                const _0x41279b = _0x5e1a3d['closest']('.menu-bar')['getBoundingClientRect'](),
                    _0xb1a725 = _0x5e1a3d['getBoundingClientRect']();
                _0x47646d['parentElement'] !== document['body'] && document['body']['appendChild'](_0x47646d);
                _0x47646d['style']['minWidth'] = '130px', _0x47646d['classList']['add']('show');
                const _0x5896b = _0x47646d['offsetWidth'] || 0x82;
                _0x47646d['classList']['remove']('show');
                const _0x4681e2 = Math['round'](Math['min'](_0xb1a725['left'] + window['scrollX'], window['scrollX'] + document['documentElement']['clientWidth'] - _0x5896b - 0x4));
                _0x47646d['style']['left'] = _0x4681e2 + 'px', _0x47646d['style']['top'] = Math['round'](_0x41279b['bottom'] + window['scrollY']) - 0x2 + 'px', _0x47646d['style']['minWidth'] = '130px', _0x47646d['classList']['add']('show'), _0x14bff1 = _0x5e1a3d;
                const _0x2b1332 = _0x30d38d => {
                    const _0x4952ab = _0x30d38d['relatedTarget'];
                    (!_0x4952ab || !_0x47646d['contains'](_0x4952ab) && !container['contains'](_0x4952ab)) && (_0x17ede2(), _0x47646d['removeEventListener']('mouseleave', _0x2b1332, !![]));
                };
                _0x47646d['addEventListener']('mouseleave', _0x2b1332, !![]);
            });
        });
        const _0x2eaabb = _0x55abb2 => {
            if (!_0x14bff1) return;
            const _0x3e78e8 = _0x14bff1['getAttribute']('data-menu'),
                _0x265eb6 = _0x5b5e8a[_0x3e78e8];
            if (!_0x265eb6) return _0x17ede2();
            !_0x265eb6['contains'](_0x55abb2['target']) && !container['contains'](_0x55abb2['target']) && _0x17ede2();
        };
        setTimeout(() => {
            document['addEventListener']('click', _0x2eaabb), document['addEventListener']('pointerdown', _0x2eaabb, !![]), document['addEventListener']('keydown', _0x2f53f3 => {
                if (_0x2f53f3['key'] === 'Escape') _0x17ede2();
            }), window['addEventListener']('scroll', _0x17ede2, !![]), window['addEventListener']('resize', _0x17ede2);
        }, 0x0);
        const _0x51a74f = container['querySelectorAll']('.dropdown-menu\x20.menu-option:not(.disabled)');
        _0x51a74f['forEach'](_0x34fe91 => {
            const _0x4673a8 = _0x34fe91['cloneNode'](!![]);
            _0x34fe91['replaceWith'](_0x4673a8), _0x4673a8['addEventListener']('click', _0x10a2ab => {
                _0x10a2ab['stopPropagation'](), _0x10a2ab['preventDefault']();
                const _0x32c770 = _0x4673a8['getAttribute']('data-action'),
                    _0x3e6bc3 = _parentWindowElement;
                if (_0x3e6bc3 && _0x3e6bc3['dataset']['acceptInput'] === 'false') {
                    _0x17ede2();
                    return;
                }
                if (_0x32c770 && _0x3e6bc3) {
                    const _0x19e049 = () => {
                        if (_0x32c770 === 'exitProgram') {
                            const _0x34d6e3 = {};
                            _0x34d6e3['bubbles'] = ![], _0x3e6bc3['dispatchEvent'](new CustomEvent('request-close-window', _0x34d6e3));
                        } else {
                            if (_0x32c770 === 'minimizeWindow') {
                                const _0x3ff14a = {};
                                _0x3ff14a['bubbles'] = ![], _0x3e6bc3['dispatchEvent'](new CustomEvent('request-minimize-window', _0x3ff14a));
                            } else {
                                if (_0x32c770 === 'maximizeWindow') {
                                    const _0x553e2c = {};
                                    _0x553e2c['bubbles'] = ![], _0x3e6bc3['dispatchEvent'](new CustomEvent('request-maximize-window', _0x553e2c));
                                } else {
                                    if (_0x32c770['startsWith']('file') || _0x32c770['startsWith']('edit') || _0x32c770['startsWith']('view') || _0x32c770['startsWith']('tools') || _0x32c770['startsWith']('help') || _0x32c770 === 'saveResume' || _0x32c770 === 'newMessage' || _0x32c770 === 'sendMessage') {
                                        const _0x146394 = {};
                                        _0x146394['action'] = _0x32c770, _0x146394['button'] = null;
                                        const _0x4d2ccb = {};
                                        _0x4d2ccb['detail'] = _0x146394, _0x4d2ccb['bubbles'] = ![], _0x3e6bc3['dispatchEvent'](new CustomEvent('dispatchToolbarAction', _0x4d2ccb));
                                    }
                                }
                            }
                        }
                    };
                    _0x19e049();
                }
                _0x17ede2();
            });
        });
    }, 0x0), container;
}
export function createToolbar(_0x1cdb1b, _0xf64797, _0x16d4cb) {
    if (!_0x1cdb1b || !_0x1cdb1b['buttons']) return null;
    const _0x56b52a = document['createElement']('div');
    _0x56b52a['className'] = 'toolbar-container';
    const _0x527a07 = document['createElement']('div');
    _0x527a07['className'] = 'toolbar-row';
    if (_0x16d4cb) _0x527a07['classList']['add']('toolbar-bottom');
    const _0x1fcbaa = document['documentElement']['classList']['contains']('mobile-device');
    let _0x51b63d = _0x1cdb1b['buttons'];
    if (_0x1fcbaa && _0xf64797 === 'contact-window') {
        _0x51b63d = _0x51b63d['filter'](_0x1e06c3 => _0x1e06c3['enabled'] !== ![] || _0x1e06c3['type'] === 'separator');
        const _0x13cd19 = _0x51b63d['find'](_0x3a6de2 => _0x3a6de2['key'] === 'new'),
            _0x27f46e = _0x51b63d['find'](_0x324e9e => _0x324e9e['key'] === 'send'),
            _0x116496 = [];
        if (_0x27f46e) _0x116496['push'](_0x27f46e);
        if (_0x13cd19) _0x116496['push'](_0x13cd19);
        _0x51b63d = _0x116496;
    }
    if (_0x1fcbaa && _0xf64797 === 'about-window') {
        _0x51b63d = _0x51b63d['filter'](_0x541b6e => _0x541b6e['enabled'] !== ![] || _0x541b6e['type'] === 'separator');
        const _0x39c7de = _0x51b63d['findIndex'](_0x5da99c => _0x5da99c['key'] === 'projects');
        let _0x4958be = _0x51b63d['findIndex'](_0x3ab234 => _0x3ab234['key'] === 'resume');
        if (_0x4958be > 0x0 && _0x51b63d[_0x4958be - 0x1]['type'] === 'separator') {
            _0x51b63d['splice'](_0x4958be - 0x1, 0x1);
            if (_0x39c7de < _0x4958be) _0x4958be--;
        }
        _0x51b63d[_0x4958be + 0x1] && _0x51b63d[_0x4958be + 0x1]['type'] === 'separator' && _0x51b63d['splice'](_0x4958be + 0x1, 0x1);
        if (_0x39c7de !== -0x1 && _0x4958be !== -0x1 && _0x4958be - _0x39c7de === 0x1) {
            const _0x53656f = {};
            _0x53656f['type'] = 'separator', _0x51b63d['splice'](_0x4958be, 0x0, _0x53656f);
        }
    }
    let _0x4e19ab = null;
    _0x1fcbaa && (_0x4e19ab = document['createElement']('div'), _0x4e19ab['className'] = 'toolbar-button\x20toolbar-close-button', _0x4e19ab['setAttribute']('aria-label', 'Close'), _0x4e19ab['innerHTML'] = '<img\x20decoding=\x22async\x22\x20alt=\x22close\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22assets/gui/toolbar/delete.webp\x22\x20/><span>Close</span>', _0x4e19ab['addEventListener']('click', _0x40a3fe => {
        _0x40a3fe['stopPropagation']();
        let parentWindowElement = _0x56b52a['parentElement'];
        while (parentWindowElement && !parentWindowElement['classList']['contains']('app-window')) {
            parentWindowElement = parentWindowElement['parentElement'];
        }
        if (parentWindowElement && parentWindowElement['dataset']['acceptInput'] === 'false') return;
        if (parentWindowElement) {
            const _0x2e23bb = {};
            _0x2e23bb['bubbles'] = ![], parentWindowElement['dispatchEvent'](new CustomEvent('request-close-window', _0x2e23bb));
        }
    }), _0x527a07['appendChild'](_0x4e19ab));
    _0x51b63d['forEach'](_0x566807 => {
        if (_0x566807['type'] === 'socials') {
            ((async () => {
                let _0x1f8654 = await getSocials();
                _0xf64797 === 'contact-window' && (_0x1f8654 = _0x1f8654['filter'](_0x3de1cc => _0x3de1cc['key'] === 'linkedin')), _0x1f8654['forEach'](_0x3ab3b3 => {
                    const _0x502d61 = document['createElement']('div');
                    _0x502d61['className'] = 'toolbar-button\x20social\x20' + _0x3ab3b3['key'], _0x502d61['setAttribute']('data-action', 'openExternalLink'), _0x502d61['setAttribute']('data-url-to-open', _0x3ab3b3['url']), _0x502d61['setAttribute']('title', 'View\x20on\x20' + _0x3ab3b3['name']), _0x502d61['setAttribute']('aria-label', 'View\x20on\x20' + _0x3ab3b3['name']), _0x502d61['setAttribute']('data-social-key', _0x3ab3b3['key']), _0xf64797 === 'contact-window' && _0x3ab3b3['key'] === 'linkedin' && !_0x1fcbaa ? _0x502d61['innerHTML'] = '<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20alt=\x22' + _0x3ab3b3['name'] + '\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22' + _0x3ab3b3['icon'] + '\x22\x20/><span>LinkedIn</span>' : _0x502d61['innerHTML'] = '<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20alt=\x22' + _0x3ab3b3['name'] + '\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22' + _0x3ab3b3['icon'] + '\x22\x20/>', _0x502d61['addEventListener']('click', _0x4906b3 => {
                        _0x4906b3['stopPropagation']();
                        try {
                            const _0x245d01 = {};
                            _0x245d01['type'] = 'confirm-open-link', _0x245d01['url'] = _0x3ab3b3['url'], _0x245d01['label'] = _0x3ab3b3['name'], window['postMessage'](_0x245d01, '*');
                        } catch (_0x5d5e8f) {
                            window['open'](_0x3ab3b3['url'], '_blank');
                        }
                    }), _0x527a07['appendChild'](_0x502d61);
                });
            })());
            return;
        }
        if (_0x1fcbaa && _0xf64797 === 'projects-window' && _0x566807['key'] === 'home') return;
        if (_0x1fcbaa && _0x566807['desktopOnly']) return;
        if (!_0x1fcbaa && _0x566807['mobileOnly']) return;
        if (_0x566807['type'] === 'separator') {
            const _0x5d6768 = document['createElement']('div');
            _0x5d6768['className'] = 'vertical_line', _0x527a07['appendChild'](_0x5d6768);
            return;
        }
        if (_0x566807['key']) {
            const _0x5b1d52 = document['createElement']('div');
            _0x5b1d52['className'] = 'toolbar-button\x20' + _0x566807['key'];
            if (!_0x566807['enabled']) _0x5b1d52['classList']['add']('disabled');
            _0x566807['action'] && _0x5b1d52['setAttribute']('data-action', _0x566807['action']);
            let _0x5a170b = '';
            _0x566807['icon'] && (_0x5a170b += '<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20alt=\x22' + _0x566807['key'] + '\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22' + _0x566807['icon'] + '\x22\x20/>'), _0x566807['text'] && (_0x5a170b += '<span>' + _0x566807['text'] + '</span>'), _0x5b1d52['innerHTML'] = _0x5a170b, _0x566807['style'] && _0x5b1d52['setAttribute']('style', _0x566807['style']), _0x566807['url'] && (_0x5b1d52['dataset']['urlToOpen'] = _0x566807['url']), _0x527a07['appendChild'](_0x5b1d52);
        }
    }), _0x56b52a['appendChild'](_0x527a07);
    if (!window['__toolbarPressInit']) {
        window['__toolbarPressInit'] = !![];
        const _0x17c405 = new Set(),
            _0x2e65c5 = _0x22b5f4 => _0x22b5f4['pointerType'] ? _0x22b5f4['isPrimary'] : !![],
            add = _0x9ae505 => {
                if (!_0x9ae505 || _0x9ae505['classList']['contains']('disabled') || _0x9ae505['classList']['contains']('pressed')) return;
                _0x9ae505['classList']['add']('touch-active'), _0x17c405['add'](_0x9ae505);
            },
            _0xd295d4 = () => {
                _0x17c405['forEach'](_0x2c6926 => _0x2c6926['classList']['remove']('touch-active')), _0x17c405['clear']();
            },
            _0x18066d = _0x25985d => {
                if (!_0x25985d) return;
                _0x25985d['classList']['remove']('touch-active'), _0x17c405['delete'](_0x25985d);
            };
        document['addEventListener']('pointerdown', _0x9a12ef => {
            if (_0x9a12ef['button'] !== 0x0 || !_0x2e65c5(_0x9a12ef)) return;
            const _0x45ada7 = _0x9a12ef['target']['closest']('.toolbar-button');
            if (!_0x45ada7) return;
            add(_0x45ada7);
        }, !![]), document['addEventListener']('pointerup', _0x2884fc => {
            const _0x228421 = _0x2884fc['target']['closest']('.toolbar-button');
            if (_0x228421) _0x18066d(_0x228421);
            else _0xd295d4();
        }, !![]), document['addEventListener']('pointercancel', _0xd295d4, !![]), document['addEventListener']('pointerleave', _0x1a8869 => {
            if (!_0x1a8869['relatedTarget']) _0xd295d4();
        }, !![]);
        const _0x58f51b = {};
        _0x58f51b['passive'] = !![], _0x58f51b['capture'] = !![], document['addEventListener']('touchstart', _0x4aa352 => {
            const _0x586863 = _0x4aa352['target']['closest']('.toolbar-button');
            if (_0x586863) add(_0x586863);
        }, _0x58f51b);
        const _0x3ab267 = {};
        _0x3ab267['passive'] = !![], _0x3ab267['capture'] = !![], document['addEventListener']('touchend', _0xd295d4, _0x3ab267);
        const _0x344159 = {};
        _0x344159['passive'] = !![], _0x344159['capture'] = !![], document['addEventListener']('touchcancel', _0xd295d4, _0x344159), document['addEventListener']('visibilitychange', () => {
            if (document['visibilityState'] !== 'visible') _0xd295d4();
        }), document['addEventListener']('click', () => {
            requestAnimationFrame(_0xd295d4);
        }, !![]);
    }
    if (_0x1fcbaa && _0xf64797 === 'projects-window' && _0x4e19ab) {
        let _0x235a8a = ![];
        const _0xa4f28c = () => {
                _0x235a8a = !![], _0x4e19ab['innerHTML'] = '<img\x20decoding=\x22async\x22\x20alt=\x22home\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22assets/gui/toolbar/home.webp\x22\x20/><span>Home</span>', _0x4e19ab['setAttribute']('aria-label', 'Home');
            },
            _0x37173c = () => {
                _0x235a8a = ![], _0x4e19ab['innerHTML'] = '<img\x20decoding=\x22async\x22\x20alt=\x22close\x22\x20width=\x2225\x22\x20height=\x2225\x22\x20src=\x22assets/gui/toolbar/delete.webp\x22\x20/><span>Close</span>', _0x4e19ab['setAttribute']('aria-label', 'Close');
            };
        _0x37173c(), _0x4e19ab['replaceWith'](_0x4e19ab['cloneNode'](!![])), _0x4e19ab = _0x527a07['querySelector']('.toolbar-close-button'), _0x4e19ab['addEventListener']('click', _0x185e23 => {
            _0x185e23['stopPropagation']();
            if (_0x235a8a) {
                let parent = _0x56b52a['parentElement'];
                while (parent && !parent['classList']['contains']('app-window')) {
                    parent = parent['parentElement'];
                }
                if (parent) {
                    const _0x5f564d = parent['querySelector']('iframe');
                    if (_0x5f564d && _0x5f564d['contentWindow']) {
                        const _0x56dfc5 = {};
                        _0x56dfc5['type'] = 'toolbar:action', _0x56dfc5['action'] = 'navigateHome', _0x5f564d['contentWindow']['postMessage'](_0x56dfc5, '*');
                    }
                }
            } else {
                let parent = _0x56b52a['parentElement'];
                while (parent && !parent['classList']['contains']('app-window')) {
                    parent = parent['parentElement'];
                }
                if (parent) {
                    const _0x26bcb4 = {};
                    _0x26bcb4['bubbles'] = ![], parent['dispatchEvent'](new CustomEvent('request-close-window', _0x26bcb4));
                }
            }
        }), window['addEventListener']('message', _0x4c5746 => {
            _0x4c5746['data'] && _0x4c5746['data']['type'] === 'project:view-state' && (_0x4c5746['data']['inDetailView'] ? _0xa4f28c() : (_0x37173c(), _0x4e19ab && void _0x4e19ab['offsetWidth']));
        });
    }
    return _0x56b52a;
}
export {
    getSocials
};