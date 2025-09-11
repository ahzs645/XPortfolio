import {
    EVENTS
} from '../utils/eventBus.js';
let SOCIALS_CACHE = null,
    SYSTEM_ASSETS = null;
async function getSocials() {
    if (SOCIALS_CACHE) return SOCIALS_CACHE;
    try {
        const _0x15e419 = await fetch('./ui.json'),
            _0x2a2a85 = await _0x15e419['json']();
        return SOCIALS_CACHE = Array['isArray'](_0x2a2a85['socials']) ? _0x2a2a85['socials'] : [], SOCIALS_CACHE;
    } catch (_0x5bc6d9) {
        return SOCIALS_CACHE = [], SOCIALS_CACHE;
    }
}
async function getSystemAssets() {
    if (SYSTEM_ASSETS) return SYSTEM_ASSETS;
    try {
        const _0x59c23 = await fetch('./ui.json');
        return SYSTEM_ASSETS = await _0x59c23['json'](), SYSTEM_ASSETS;
    } catch (_0x5e5600) {
        return SYSTEM_ASSETS = {}, SYSTEM_ASSETS;
    }
}
export default class Desktop {
    constructor(eventBus) {
        this['eventBus'] = eventBus, this['desktop'] = document['querySelector']('.desktop'), this['selectionBox'] = null, this['isDragging'] = ![], this['hasDragged'] = ![], this['startX'] = 0x0, this['startY'] = 0x0, this['lastClickTimes'] = {}, this['selectedIcons'] = new Set(), this['activeDragPointerId'] = null, this['cleanupArtifacts'](), this['createSelectionOverlay'](), getSocials()['then'](_0x36767c => {
            this['socials'] = _0x36767c, this['updateSocialDesktopIcons'](), this['setupIconEvents']();
        }), this['setupDesktopEvents'](), this['setupPointerSelectionEvents'](), this['setupKeyboardNavigation'](), this['desktop']['classList']['remove']('wallpaper-default', 'wallpaper-mobile');
        document['documentElement']['classList']['contains']('mobile-device') ? this['desktop']['classList']['add']('wallpaper-mobile') : this['desktop']['classList']['add']('wallpaper-default');
        this['eventBus']['subscribe'](EVENTS['WINDOW_CREATED'], () => this['clearSelection']()), this['eventBus']['subscribe'](EVENTS['WINDOW_FOCUSED'], () => this['clearSelection']()), this['eventBus']['subscribe'](EVENTS['PROGRAM_OPEN'], () => this['resetDragSelectionState']()), this['eventBus']['subscribe'](EVENTS['STARTMENU_OPENED'], () => this['resetDragSelectionState']());
        const preloadPicture = document['getElementById']('preload-wallpaper');
        if (preloadPicture) {
            const _0x26b79c = preloadPicture['querySelector']('img');
            _0x26b79c && _0x26b79c['currentSrc'] ? this['desktop']['style']['backgroundImage'] = 'url(\x27' + _0x26b79c['currentSrc'] + '\x27)' : getSystemAssets()['then'](_0x356e55 => {
                if (document['documentElement']['classList']['contains']('mobile-device') && _0x356e55['wallpaperMobile']) this['desktop']['style']['backgroundImage'] = 'url(\x27' + _0x356e55['wallpaperMobile'] + '\x27)';
                else _0x356e55['wallpaperDesktop'] && (this['desktop']['style']['backgroundImage'] = 'url(\x27' + _0x356e55['wallpaperDesktop'] + '\x27)');
            });
        }
    } ['getIcons']() {
        return this['desktop']['querySelectorAll']('.desktop-icon');
    } ['cleanupArtifacts']() {
        document['querySelectorAll']('#selection-box,\x20.selection-box')['forEach'](_0x3b0e16 => _0x3b0e16['remove']());
    } ['createSelectionOverlay']() {
        !this['overlay'] && (this['overlay'] = document['createElement']('div'), this['overlay']['className'] = 'selection-overlay', this['desktop']['prepend'](this['overlay']));
    } ['updateSocialDesktopIcons']() {
        if (!this['socials']) return;
        this['socials']['forEach'](_0x35446f => {
            const _0x262829 = this['desktop']['querySelector']('.desktop-icon[data-program-name=\x22' + _0x35446f['key'] + '\x22]\x20img');
            if (_0x262829 && _0x35446f['icon']) {
                const _0x142db5 = './' + _0x35446f['icon']['replace'](/^\.\//, '')['replace'](/^\//, '');
                _0x262829['src'] = _0x142db5, _0x262829['alt'] = _0x35446f['name'];
            }
        });
    } ['setupIconEvents']() {
        const _0x40a364 = 'ontouchstart' in window,
            _0x172f2a = document['documentElement']['classList']['contains']('mobile-device'),
            _0x46a60c = _0x40a364 && _0x172f2a,
            _0x5f1edc = (this['socials'] || [])['reduce']((_0x14ecac, _0x1c5587) => {
                return _0x14ecac[_0x1c5587['key']] = _0x1c5587, _0x14ecac;
            }, {});
        this['getIcons']()['forEach'](_0x290b1a => {
            if (_0x290b1a['tagName'] === 'A') return;
            const _0x869353 = _0x290b1a['querySelector']('span'),
                _0x1a9710 = _0x869353 ? _0x869353['textContent']['trim']()['toLowerCase']()['replace'](/\s+/g, '-') : '';
            let _0x35f8d0 = ![];
            const _0x456022 = _0x1deec8 => {
                _0x1deec8['stopPropagation']();
                if (_0x1deec8['type'] === 'touchend') _0x35f8d0 = !![], setTimeout(() => {
                    _0x35f8d0 = ![];
                }, 0x64);
                else {
                    if (_0x1deec8['type'] === 'click' && _0x35f8d0) return;
                }
                const _0x4a4b0b = Date['now'](),
                    _0x20d06e = 0x190,
                    _0x195c75 = this['lastClickTimes'][_0x1a9710] || 0x0;
                if (_0x4a4b0b - _0x195c75 < _0x20d06e) {
                    if (!_0x290b1a['classList']['contains']('selected')) this['selectIcon'](_0x290b1a, !![]);
                    let _0xd8c64f = _0x290b1a['getAttribute']('data-program-name');
                    if (_0x5f1edc[_0xd8c64f]) window['open'](_0x5f1edc[_0xd8c64f]['url'], '_blank');
                    else {
                        const _0x1b2c30 = {};
                        _0x1b2c30['programName'] = _0xd8c64f, this['eventBus']['publish'](EVENTS['PROGRAM_OPEN'], _0x1b2c30);
                    }
                    this['pendingDrag'] = ![], this['lastClickTimes'][_0x1a9710] = 0x0;
                } else this['toggleIconSelection'](_0x290b1a, _0x1deec8['ctrlKey']), this['lastClickTimes'][_0x1a9710] = _0x4a4b0b;
            };
            _0x46a60c ? (_0x290b1a['addEventListener']('touchend', _0x456022), _0x290b1a['addEventListener']('click', _0x456022)) : _0x290b1a['addEventListener']('click', _0x456022);
        });
    } ['setupDesktopEvents']() {
        this['desktop']['addEventListener']('click', _0x523e40 => {
            (_0x523e40['target'] === this['desktop'] || _0x523e40['target'] === this['overlay']) && (!this['isDragging'] && !this['hasDragged'] && this['clearSelection']());
        });
    } ['setupPointerSelectionEvents']() {
        const _0x39e99 = 0x4,
            _0x3b2037 = 0xa;
        window['addEventListener']('pointerdown', _0x19f4cf => {
            if (_0x19f4cf['target'] !== this['overlay'] && _0x19f4cf['target'] !== this['desktop']) return;
            if (document['documentElement']['classList']['contains']('mobile-device')) {
                if (this['activeDragPointerId'] !== null && this['activeDragPointerId'] !== _0x19f4cf['pointerId']) this['resetDragSelectionState']();
                else this['isDragging'] && this['activeDragPointerId'] === _0x19f4cf['pointerId'] && this['resetDragSelectionState']();
            }
            if (this['isDragging']) return;
            if (!_0x19f4cf['ctrlKey']) this['clearSelection']();
            const _0x236757 = this['desktop']['getBoundingClientRect']();
            this['startX'] = _0x19f4cf['clientX'] - _0x236757['left'], this['startY'] = _0x19f4cf['clientY'] - _0x236757['top'], this['clearTemporaryHighlights'](), this['pendingDrag'] = !![], this['isDragging'] = ![], this['hasDragged'] = ![], this['activeDragPointerId'] = _0x19f4cf['pointerId'];
            try {
                (_0x19f4cf['target'] === this['overlay'] ? this['overlay'] : this['desktop'])['setPointerCapture'](_0x19f4cf['pointerId']);
            } catch (_0x2d1659) {
                void _0x2d1659;
            }
        }), window['addEventListener']('pointermove', _0x7ee75d => {
            const _0xe1d2cc = this['desktop']['getBoundingClientRect'](),
                _0x54971e = _0x7ee75d['clientX'] - _0xe1d2cc['left'],
                _0x11e3ec = _0x7ee75d['clientY'] - _0xe1d2cc['top'],
                _0x5351ba = _0x54971e - this['startX'],
                _0xa0b640 = _0x11e3ec - this['startY'],
                _0x1d0b6e = Math['hypot'](_0x5351ba, _0xa0b640),
                _0x25598c = document['documentElement']['classList']['contains']('mobile-device') ? _0x3b2037 : _0x39e99;
            this['pendingDrag'] && _0x1d0b6e >= _0x25598c && (this['pendingDrag'] = ![], this['isDragging'] = !![], this['selectionBox'] = document['createElement']('div'), this['selectionBox']['className'] = 'selection-box', Object['assign'](this['selectionBox']['style'], {
                'left': this['startX'] + 'px',
                'top': this['startY'] + 'px',
                'width': '0px',
                'height': '0px'
            }), this['desktop']['appendChild'](this['selectionBox']));
            if (!this['isDragging'] || !this['selectionBox']) return;
            this['hasDragged'] = !![];
            const _0x28047b = Math['min'](_0x54971e, this['startX']),
                _0x4a3b48 = Math['min'](_0x11e3ec, this['startY']),
                _0x4f5e3b = Math['abs'](_0x54971e - this['startX']),
                _0x3a1d35 = Math['abs'](_0x11e3ec - this['startY']),
                _0x2d239a = this['selectionBox']['style'];
            _0x2d239a['left'] = _0x28047b + 'px', _0x2d239a['top'] = _0x4a3b48 + 'px', _0x2d239a['width'] = _0x4f5e3b + 'px', _0x2d239a['height'] = _0x3a1d35 + 'px', this['highlightIconsIntersecting'](_0x28047b, _0x4a3b48, _0x4f5e3b, _0x3a1d35);
        }), window['addEventListener']('pointerup', () => {
            if (this['pendingDrag']) {
                this['pendingDrag'] = ![], this['activeDragPointerId'] = null;
                return;
            }
            if (!this['isDragging']) return;
            this['selectionBox'] && this['getIcons']()['forEach'](_0x114819 => {
                _0x114819['classList']['contains']('hover-by-selection') && (_0x114819['classList']['remove']('hover-by-selection'), _0x114819['classList']['add']('selected'), this['selectedIcons']['add'](_0x114819));
            });
            const _0x18ff60 = this['hasDragged'];
            this['resetDragSelectionState'](), this['hasDragged'] = _0x18ff60, setTimeout(() => {
                this['hasDragged'] = ![];
            }, 0x0);
        });
    } ['highlightIconsIntersecting'](_0x411c6a, _0x50a977, _0x2968e2, _0x352e3d) {
        const _0x803e1e = {};
        _0x803e1e['left'] = _0x411c6a, _0x803e1e['top'] = _0x50a977, _0x803e1e['right'] = _0x411c6a + _0x2968e2, _0x803e1e['bottom'] = _0x50a977 + _0x352e3d;
        const _0x5ae7da = _0x803e1e;
        this['getIcons']()['forEach'](_0x1f04b1 => {
            const _0x526404 = _0x1f04b1['getBoundingClientRect'](),
                _0x44bff8 = this['desktop']['getBoundingClientRect'](),
                _0x481e76 = {};
            _0x481e76['left'] = _0x526404['left'] - _0x44bff8['left'], _0x481e76['top'] = _0x526404['top'] - _0x44bff8['top'], _0x481e76['right'] = _0x526404['right'] - _0x44bff8['left'], _0x481e76['bottom'] = _0x526404['bottom'] - _0x44bff8['top'];
            const _0x4f45ca = _0x481e76,
                _0x284311 = !(_0x4f45ca['right'] < _0x5ae7da['left'] || _0x4f45ca['left'] > _0x5ae7da['right'] || _0x4f45ca['bottom'] < _0x5ae7da['top'] || _0x4f45ca['top'] > _0x5ae7da['bottom']);
            _0x284311 ? _0x1f04b1['classList']['add']('hover-by-selection') : _0x1f04b1['classList']['remove']('hover-by-selection');
        });
    } ['toggleIconSelection'](_0x1b3b1a, _0x235619) {
        _0x235619 ? _0x1b3b1a['classList']['contains']('selected') ? (_0x1b3b1a['classList']['remove']('selected'), this['selectedIcons']['delete'](_0x1b3b1a)) : (_0x1b3b1a['classList']['add']('selected'), this['selectedIcons']['add'](_0x1b3b1a)) : (this['clearSelection'](), _0x1b3b1a['classList']['add']('selected'), this['selectedIcons']['add'](_0x1b3b1a));
    } ['selectIcon'](_0x207fbe, _0x52c852 = !![]) {
        if (_0x52c852) this['clearSelection']();
        _0x207fbe['classList']['add']('selected'), this['selectedIcons']['add'](_0x207fbe);
    } ['clearSelection']() {
        this['getIcons']()['forEach'](_0x2c8045 => {
            _0x2c8045['classList']['remove']('selected', 'hover-by-selection');
        }), this['selectedIcons']['clear']();
    } ['clearTemporaryHighlights']() {
        this['getIcons']()['forEach'](_0x16bd81 => _0x16bd81['classList']['remove']('hover-by-selection'));
    } ['resetDragSelectionState']() {
        this['isDragging'] = ![], this['hasDragged'] = ![], this['activeDragPointerId'] = null, this['selectionBox'] && this['selectionBox']['parentNode'] && (this['selectionBox']['parentNode']['removeChild'](this['selectionBox']), this['selectionBox'] = null), this['clearTemporaryHighlights']();
    } ['setupKeyboardNavigation']() {
        let _0x36911d = -0x1;
        document['addEventListener']('keydown', _0x6abc72 => {
            const _0x4d37e7 = document['querySelector']('.startmenu.active');
            if (_0x4d37e7) return;
            const _0x2aae6e = Array['from'](this['getIcons']());
            if (_0x2aae6e['length'] === 0x0) return;
            switch (_0x6abc72['key']) {
                case 'Tab':
                    _0x6abc72['preventDefault']();
                    _0x6abc72['shiftKey'] ? _0x36911d = _0x36911d <= 0x0 ? _0x2aae6e['length'] - 0x1 : _0x36911d - 0x1 : _0x36911d = _0x36911d >= _0x2aae6e['length'] - 0x1 ? 0x0 : _0x36911d + 0x1;
                    this['selectIcon'](_0x2aae6e[_0x36911d]);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    _0x6abc72['preventDefault'](), _0x36911d = _0x36911d >= _0x2aae6e['length'] - 0x1 ? 0x0 : _0x36911d + 0x1, this['selectIcon'](_0x2aae6e[_0x36911d]);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    _0x6abc72['preventDefault'](), _0x36911d = _0x36911d <= 0x0 ? _0x2aae6e['length'] - 0x1 : _0x36911d - 0x1, this['selectIcon'](_0x2aae6e[_0x36911d]);
                    break;
                case 'Enter':
                case '\x20':
                    if (_0x36911d >= 0x0 && _0x36911d < _0x2aae6e['length']) {
                        _0x6abc72['preventDefault']();
                        const _0x1c1cd6 = _0x2aae6e[_0x36911d];
                        _0x1c1cd6['click']();
                        const _0x548681 = {};
                        _0x548681['bubbles'] = !![], _0x548681['cancelable'] = !![], _0x548681['view'] = window;
                        const _0x1d99fe = new MouseEvent('dblclick', _0x548681);
                        _0x1c1cd6['dispatchEvent'](_0x1d99fe);
                    }
                    break;
                case 'Escape':
                    this['clearSelection'](), _0x36911d = -0x1;
                    break;
            }
        }), this['eventBus']['subscribe'](EVENTS['PROGRAM_OPEN'], () => {
            _0x36911d = -0x1;
        });
    }
}