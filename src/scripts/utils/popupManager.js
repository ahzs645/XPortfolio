class PopupManager {
    constructor() {
        this['activePopup'] = null, this['popupQueue'] = [], this['isInitialized'] = ![];
    } ['init']() {
        if (this['isInitialized']) return;
        this['createPopupContainer'](), this['setupGlobalEventListeners'](), this['isInitialized'] = !![];
    } ['createPopupContainer']() {
        const containerHTML = '\x0a\x20\x20\x20\x20\x20\x20<div\x20id=\x22global-popup-container\x22\x20class=\x22global-popup-container\x22\x20style=\x22display:\x20none;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-overlay\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-content-wrapper\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<!--\x20Popup\x20content\x20will\x20be\x20dynamically\x20inserted\x20here\x20-->\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20';
        document['body']['insertAdjacentHTML']('beforeend', containerHTML), this['container'] = document['getElementById']('global-popup-container'), this['overlay'] = this['container']['querySelector']('.popup-overlay'), this['contentWrapper'] = this['container']['querySelector']('.popup-content-wrapper');
    } ['setupGlobalEventListeners']() {
        this['overlay']['addEventListener']('click', () => {
            this['closeCurrentPopup']();
        }), document['addEventListener']('keydown', event => {
            event['key'] === 'Escape' && this['activePopup'] && this['closeCurrentPopup']();
        });
    } ['showPopup'](config) {
        const popupId = this['generatePopupId'](),
            popupElement = this['createPopupElement'](popupId, config),
            queueEntry = {};
        queueEntry['id'] = popupId, queueEntry['element'] = popupElement, queueEntry['config'] = config, this['popupQueue']['push'](queueEntry), this['showNextPopup']();
    } ['createPopupElement'](popupId, config) {
        const buttonsHTML = this['generateButtonsHTML'](config['buttons'] || []),
            popupHTML = '\x0a\x20\x20\x20\x20\x20\x20<div\x20id=\x22' + popupId + '\x22\x20class=\x22app-window\x20popup-window\x20active\x20' + (config['type'] || 'info') + '-popup\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-left\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (config['icon'] ? '<div\x20class=\x22title-bar-icon\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + config['icon'] + '\x22\x20alt=\x22' + config['title'] + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-text\x22>' + config['title'] + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-controls\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20aria-label=\x22Close\x22\x20class=\x22popup-close-btn\x22></button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-main-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-icon-section\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (config['icon'] ? '<div\x20class=\x22popup-icon\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + config['icon'] + '\x22\x20alt=\x22' + config['title'] + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-app-name\x22>' + config['title'] + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-message\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + config['message'] + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22popup-buttons-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + buttonsHTML + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20',
            wrapper = document['createElement']('div');
        return wrapper['innerHTML'] = popupHTML, wrapper['firstElementChild'];
    } ['generateButtonsHTML'](buttons) {
        if (!buttons || buttons['length'] === 0x0) return '';
        const mappedButtons = buttons['map'](button => '\x0a\x20\x20\x20\x20\x20\x20<button\x20class=\x22popup-action-btn\x22\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20data-action=\x22' + (button['action'] || 'close') + '\x22\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20data-popup-id=\x22' + (button['popupId'] || '') + '\x22\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (button['primary'] ? 'data-primary=\x22true\x22' : '') + '>\x0a\x20\x20\x20\x20\x20\x20\x20\x20' + button['text'] + '\x0a\x20\x20\x20\x20\x20\x20</button>\x0a\x20\x20\x20\x20')['join']('');
        return '<div\x20class=\x22popup-buttons\x22>' + mappedButtons + '</div>';
    } ['showNextPopup']() {
        if (this['popupQueue']['length'] === 0x0) return;
        const currentPopup = this['popupQueue'][0x0];
        this['activePopup'] = currentPopup, this['contentWrapper']['innerHTML'] = '', this['contentWrapper']['appendChild'](currentPopup['element']), this['setupPopupEventListeners'](currentPopup), this['container']['style']['display'] = 'flex', setTimeout(() => {
            const popupEl = currentPopup['element'];
            popupEl['classList']['add']('popup-active'), popupEl['classList']['add']('active');
            try {
                const primaryButton = popupEl['querySelector']('.popup-action-btn[data-primary=\x22true\x22]');
                if (primaryButton) {
                    const focusOpts = {};
                    focusOpts['preventScroll'] = !![], primaryButton['focus'](focusOpts);
                } else {
                    const closeBtn = popupEl['querySelector']('.popup-close-btn'),
                        focusOpts2 = {};
                    focusOpts2['preventScroll'] = !![], closeBtn && closeBtn['focus'](focusOpts2);
                }
            } catch (err) {}
        }, 0xa);
    } ['setupPopupEventListeners'](entry) {
        const element = entry['element'],
            closeBtn = element['querySelector']('.popup-close-btn');
        closeBtn && closeBtn['addEventListener']('click', () => {
            this['closeCurrentPopup']();
        });
        const actionBtns = element['querySelectorAll']('.popup-action-btn');
        actionBtns['forEach'](btn => {
            btn['addEventListener']('click', () => {
                const action = btn['dataset']['action'],
                    popupId = btn['dataset']['popupId'],
                    btnConfig = entry['config']['buttons']?.['find'](btnDef => btnDef['action'] === action);
                btnConfig && btnConfig['onClick'] && btnConfig['onClick'](popupId), action !== 'keep-open' && this['closeCurrentPopup']();
            });
        });
    } ['closeCurrentPopup']() {
        if (!this['activePopup']) return;
        const popupEl = this['activePopup']['element'];
        popupEl['classList']['remove']('popup-active'), popupEl['classList']['add']('popup-closing'), setTimeout(() => {
            this['container']['style']['display'] = 'none', popupEl['classList']['remove']('popup-closing'), this['popupQueue']['shift'](), this['activePopup'] = null, this['popupQueue']['length'] > 0x0 && this['showNextPopup'](), this['activePopup']?.['config']['onClose'] && this['activePopup']['config']['onClose']();
        }, 0xc8);
    } ['generatePopupId']() {
        return 'popup-' + Date['now']() + '-' + Math['random']()['toString'](0x24)['substr'](0x2, 0x9);
    } ['showMobileRestrictionPopup'](title, icon) {
        const okButton = {};
        okButton['text'] = 'OK', okButton['action'] = 'close', okButton['primary'] = !![];
        const styleConfig = {};
        styleConfig['centerButtons'] = !![];
        const popupConfig = {};
        popupConfig['type'] = 'mobile-restriction', popupConfig['title'] = title, popupConfig['message'] = 'This\x20program\x20is\x20only\x20available\x20on\x20desktop\x20devices.', popupConfig['icon'] = icon, popupConfig['buttons'] = [okButton], popupConfig['styles'] = styleConfig, this['showPopup'](popupConfig);
    }
}
const popupManager = new PopupManager();
window['popupManager'] = popupManager;
export default popupManager;