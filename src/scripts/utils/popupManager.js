class PopupManager {
    constructor() {
        this['activePopup'] = null, this['popupQueue'] = [], this['isInitialized'] = ![];
    } ['init']() {
        if (this['isInitialized']) return;
        this['createPopupContainer'](), this['setupGlobalEventListeners'](), this['isInitialized'] = !![];
    } ['createPopupContainer']() {
        const _0x37459d = '\x0a\x20\x20\x20\x20\x20\x20<div\x20id=\x22global-popup-container\x22\x20class=\x22global-popup-container\x22\x20style=\x22display:\x20none;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-overlay\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-content-wrapper\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<!--\x20Popup\x20content\x20will\x20be\x20dynamically\x20inserted\x20here\x20-->\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20';
        document['body']['insertAdjacentHTML']('beforeend', _0x37459d), this['container'] = document['getElementById']('global-popup-container'), this['overlay'] = this['container']['querySelector']('.popup-overlay'), this['contentWrapper'] = this['container']['querySelector']('.popup-content-wrapper');
    } ['setupGlobalEventListeners']() {
        this['overlay']['addEventListener']('click', () => {
            this['closeCurrentPopup']();
        }), document['addEventListener']('keydown', _0x3fa31b => {
            _0x3fa31b['key'] === 'Escape' && this['activePopup'] && this['closeCurrentPopup']();
        });
    } ['showPopup'](_0x342765) {
        const _0x4867b0 = this['generatePopupId'](),
            _0x1b3899 = this['createPopupElement'](_0x4867b0, _0x342765),
            _0x1479f9 = {};
        _0x1479f9['id'] = _0x4867b0, _0x1479f9['element'] = _0x1b3899, _0x1479f9['config'] = _0x342765, this['popupQueue']['push'](_0x1479f9), this['showNextPopup']();
    } ['createPopupElement'](_0x44000b, _0x479b75) {
        const _0x56c561 = this['generateButtonsHTML'](_0x479b75['buttons'] || []),
            _0x5ebca1 = '\x0a\x20\x20\x20\x20\x20\x20<div\x20id=\x22' + _0x44000b + '\x22\x20class=\x22app-window\x20popup-window\x20active\x20' + (_0x479b75['type'] || 'info') + '-popup\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-left\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x479b75['icon'] ? '<div\x20class=\x22title-bar-icon\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + _0x479b75['icon'] + '\x22\x20alt=\x22' + _0x479b75['title'] + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-text\x22>' + _0x479b75['title'] + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-controls\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20aria-label=\x22Close\x22\x20class=\x22popup-close-btn\x22></button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-main-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-icon-section\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x479b75['icon'] ? '<div\x20class=\x22popup-icon\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + _0x479b75['icon'] + '\x22\x20alt=\x22' + _0x479b75['title'] + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-app-name\x22>' + _0x479b75['title'] + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-message\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x479b75['message'] + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-buttons-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x56c561 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20',
            _0x528285 = document['createElement']('div');
        return _0x528285['innerHTML'] = _0x5ebca1, _0x528285['firstElementChild'];
    } ['generateButtonsHTML'](_0x418947) {
        if (!_0x418947 || _0x418947['length'] === 0x0) return '';
        const _0x2d9610 = _0x418947['map'](_0x37e115 => '\x0a\x20\x20\x20\x20\x20\x20<button\x20class=\x22popup-action-btn\x22\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20data-action=\x22' + (_0x37e115['action'] || 'close') + '\x22\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20data-popup-id=\x22' + (_0x37e115['popupId'] || '') + '\x22\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x37e115['primary'] ? 'data-primary=\x22true\x22' : '') + '>\x0a\x20\x20\x20\x20\x20\x20\x20\x20' + _0x37e115['text'] + '\x0a\x20\x20\x20\x20\x20\x20</button>\x0a\x20\x20\x20\x20')['join']('');
        return '<div\x20class=\x22popup-buttons\x22>' + _0x2d9610 + '</div>';
    } ['showNextPopup']() {
        if (this['popupQueue']['length'] === 0x0) return;
        const _0x1b95b1 = this['popupQueue'][0x0];
        this['activePopup'] = _0x1b95b1, this['contentWrapper']['innerHTML'] = '', this['contentWrapper']['appendChild'](_0x1b95b1['element']), this['setupPopupEventListeners'](_0x1b95b1), this['container']['style']['display'] = 'flex', setTimeout(() => {
            const _0x363b33 = _0x1b95b1['element'];
            _0x363b33['classList']['add']('popup-active'), _0x363b33['classList']['add']('active');
            try {
                const _0xe00919 = _0x363b33['querySelector']('.popup-action-btn[data-primary=\x22true\x22]');
                if (_0xe00919) {
                    const _0x24f265 = {};
                    _0x24f265['preventScroll'] = !![], _0xe00919['focus'](_0x24f265);
                } else {
                    const _0x55bcf3 = _0x363b33['querySelector']('.popup-close-btn'),
                        _0x2db2d2 = {};
                    _0x2db2d2['preventScroll'] = !![], _0x55bcf3 && _0x55bcf3['focus'](_0x2db2d2);
                }
            } catch (_0x4ca70a) {}
        }, 0xa);
    } ['setupPopupEventListeners'](_0x369049) {
        const _0x5f236d = _0x369049['element'],
            _0x2a4f96 = _0x5f236d['querySelector']('.popup-close-btn');
        _0x2a4f96 && _0x2a4f96['addEventListener']('click', () => {
            this['closeCurrentPopup']();
        });
        const _0x350a1e = _0x5f236d['querySelectorAll']('.popup-action-btn');
        _0x350a1e['forEach'](_0x38a264 => {
            _0x38a264['addEventListener']('click', () => {
                const _0x2d97d3 = _0x38a264['dataset']['action'],
                    _0x9b82ba = _0x38a264['dataset']['popupId'],
                    _0x34a0be = _0x369049['config']['buttons']?.['find'](_0x1e0e7f => _0x1e0e7f['action'] === _0x2d97d3);
                _0x34a0be && _0x34a0be['onClick'] && _0x34a0be['onClick'](_0x9b82ba), _0x2d97d3 !== 'keep-open' && this['closeCurrentPopup']();
            });
        });
    } ['closeCurrentPopup']() {
        if (!this['activePopup']) return;
        const _0x14273b = this['activePopup']['element'];
        _0x14273b['classList']['remove']('popup-active'), _0x14273b['classList']['add']('popup-closing'), setTimeout(() => {
            this['container']['style']['display'] = 'none', _0x14273b['classList']['remove']('popup-closing'), this['popupQueue']['shift'](), this['activePopup'] = null, this['popupQueue']['length'] > 0x0 && this['showNextPopup'](), this['activePopup']?.['config']['onClose'] && this['activePopup']['config']['onClose']();
        }, 0xc8);
    } ['generatePopupId']() {
        return 'popup-' + Date['now']() + '-' + Math['random']()['toString'](0x24)['substr'](0x2, 0x9);
    } ['showMobileRestrictionPopup'](_0x188cdb, _0x254264) {
        const _0xd7d755 = {};
        _0xd7d755['text'] = 'OK', _0xd7d755['action'] = 'close', _0xd7d755['primary'] = !![];
        const _0x1191ec = {};
        _0x1191ec['centerButtons'] = !![];
        const _0x116bbe = {};
        _0x116bbe['type'] = 'mobile-restriction', _0x116bbe['title'] = _0x188cdb, _0x116bbe['message'] = 'This\x20program\x20is\x20only\x20available\x20on\x20desktop\x20devices.', _0x116bbe['icon'] = _0x254264, _0x116bbe['buttons'] = [_0xd7d755], _0x116bbe['styles'] = _0x1191ec, this['showPopup'](_0x116bbe);
    }
}
const popupManager = new PopupManager();
window['popupManager'] = popupManager;
export default popupManager;