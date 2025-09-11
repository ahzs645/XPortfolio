import {
    EVENTS
} from '../utils/eventBus.js';
const _0x5ec48a = {};
_0x5ec48a['type'] = 'program', _0x5ec48a['programName'] = 'about', _0x5ec48a['icon'] = './assets/gui/desktop/about.webp', _0x5ec48a['label'] = 'About\x20Me';
const _0x6eb516 = {};
_0x6eb516['type'] = 'program', _0x6eb516['programName'] = 'projects', _0x6eb516['icon'] = './assets/gui/desktop/projects.webp', _0x6eb516['label'] = 'My\x20Projects';
const _0x1cf3d0 = {};
_0x1cf3d0['type'] = 'program', _0x1cf3d0['programName'] = 'resume', _0x1cf3d0['icon'] = './assets/gui/desktop/resume.webp', _0x1cf3d0['label'] = 'My\x20Resume';
const _0x123071 = {};
_0x123071['type'] = 'program', _0x123071['programName'] = 'contact', _0x123071['icon'] = './assets/gui/desktop/contact.webp', _0x123071['label'] = 'Contact\x20Me';
const _0xcebe11 = {};
_0xcebe11['type'] = 'separator';
const _0x40d209 = {};
_0x40d209['type'] = 'program', _0x40d209['programName'] = 'mediaPlayer', _0x40d209['icon'] = './assets/gui/start-menu/mediaPlayer.webp', _0x40d209['label'] = 'Media\x20Player', _0x40d209['disabled'] = ![];
const _0x35083a = {};
_0x35083a['type'] = 'program', _0x35083a['programName'] = 'musicPlayer', _0x35083a['icon'] = './assets/gui/start-menu/music.webp', _0x35083a['label'] = 'Music\x20Player', _0x35083a['disabled'] = ![];
const _0x4090ee = {};
_0x4090ee['type'] = 'program', _0x4090ee['programName'] = 'image-viewer', _0x4090ee['icon'] = './assets/gui/start-menu/photos.webp', _0x4090ee['label'] = 'Image\x20Viewer', _0x4090ee['disabled'] = ![];
const _0x47a26d = {};
_0x47a26d['type'] = 'program', _0x47a26d['programName'] = 'paint', _0x47a26d['icon'] = './assets/gui/start-menu/paint.webp', _0x47a26d['label'] = 'Paint', _0x47a26d['disabled'] = ![];
const _0x5d129a = {};
_0x5d129a['type'] = 'program', _0x5d129a['programName'] = 'cmd', _0x5d129a['icon'] = './assets/gui/start-menu/cmd.webp', _0x5d129a['label'] = 'Command\x20Prompt', _0x5d129a['disabled'] = ![];
const _0x15a7d2 = {};
_0x15a7d2['type'] = 'separator';
const ALL_PROGRAMS_ITEMS_BASE = [_0x5ec48a, _0x6eb516, _0x1cf3d0, _0x123071, _0xcebe11, _0x40d209, _0x35083a, _0x4090ee, _0x47a26d, _0x5d129a, _0x15a7d2],
    _0x3d19af = {};
_0x3d19af['type'] = 'program', _0x3d19af['programName'] = 'program3', _0x3d19af['icon'] = './assets/gui/start-menu/vanity-apps/after-effects.webp', _0x3d19af['label'] = 'Adobe\x20After\x20Effects', _0x3d19af['disabled'] = !![];
const _0x456610 = {};
_0x456610['type'] = 'program', _0x456610['programName'] = 'program4', _0x456610['icon'] = './assets/gui/start-menu/vanity-apps/illustrator.webp', _0x456610['label'] = 'Adobe\x20Illustrator', _0x456610['disabled'] = !![];
const _0x4c45b7 = {};
_0x4c45b7['type'] = 'program', _0x4c45b7['programName'] = 'program5', _0x4c45b7['icon'] = './assets/gui/start-menu/vanity-apps/illustrator.webp', _0x4c45b7['label'] = 'Adobe\x20InDesign', _0x4c45b7['disabled'] = !![];
const _0x1427e1 = {};
_0x1427e1['type'] = 'program', _0x1427e1['programName'] = 'program1', _0x1427e1['icon'] = './assets/gui/start-menu/vanity-apps/photoshop.webp', _0x1427e1['label'] = 'Adobe\x20Photoshop', _0x1427e1['disabled'] = !![];
const _0x3c9d2e = {};
_0x3c9d2e['type'] = 'program', _0x3c9d2e['programName'] = 'program2', _0x3c9d2e['icon'] = './assets/gui/start-menu/vanity-apps/premiere.webp', _0x3c9d2e['label'] = 'Adobe\x20Premiere\x20Pro', _0x3c9d2e['disabled'] = !![];
const _0x547390 = {};
_0x547390['type'] = 'program', _0x547390['programName'] = 'program10', _0x547390['icon'] = './assets/gui/start-menu/vanity-apps/blender.webp', _0x547390['label'] = 'Blender', _0x547390['disabled'] = !![];
const _0xf91342 = {};
_0xf91342['type'] = 'program', _0xf91342['programName'] = 'program6', _0xf91342['icon'] = './assets/gui/start-menu/vanity-apps/davinci.webp', _0xf91342['label'] = 'Davinci\x20Resolve', _0xf91342['disabled'] = !![];
const _0x3a65bb = {};
_0x3a65bb['type'] = 'program', _0x3a65bb['programName'] = 'program7', _0x3a65bb['icon'] = './assets/gui/start-menu/vanity-apps/figma.webp', _0x3a65bb['label'] = 'Figma', _0x3a65bb['disabled'] = !![];
const _0xf9921 = {};
_0xf9921['type'] = 'program', _0xf9921['programName'] = 'program11', _0xf9921['icon'] = './assets/gui/start-menu/vanity-apps/copilot.webp', _0xf9921['label'] = 'GitHub\x20Copilot', _0xf9921['disabled'] = !![];
const _0x33215f = {};
_0x33215f['type'] = 'program', _0x33215f['programName'] = 'program9', _0x33215f['icon'] = './assets/gui/start-menu/vanity-apps/obs.webp', _0x33215f['label'] = 'OBS\x20Studio', _0x33215f['disabled'] = !![];
const _0x3e1475 = {};
_0x3e1475['type'] = 'program', _0x3e1475['programName'] = 'vscode', _0x3e1475['icon'] = './assets/gui/start-menu/vanity-apps/vscode.webp', _0x3e1475['label'] = 'VS\x20Code', _0x3e1475['disabled'] = !![];
const _0xe66aa6 = {};
_0xe66aa6['type'] = 'program', _0xe66aa6['programName'] = 'program8', _0xe66aa6['icon'] = './assets/gui/start-menu/vanity-apps/wordpress.webp', _0xe66aa6['label'] = 'Wordpress', _0xe66aa6['disabled'] = !![];
const RECENTLY_USED_ITEMS = [_0x3d19af, _0x456610, _0x4c45b7, _0x1427e1, _0x3c9d2e, _0x547390, _0xf91342, _0x3a65bb, _0xf9921, _0x33215f, _0x3e1475, _0xe66aa6];
let SOCIALS = [],
    systemAssets = null;
const _0x1dd77b = {};
_0x1dd77b['id'] = 'cmd', _0x1dd77b['icon'] = './assets/gui/start-menu/cmd.webp', _0x1dd77b['title'] = 'Command\x20Prompt', _0x1dd77b['programName'] = 'cmd', _0x1dd77b['action'] = 'open-program';
const CMD_CONFIG = _0x1dd77b;
async function getSystemAssets() {
    if (systemAssets) return systemAssets;
    try {
        const _0x38175 = await fetch('./ui.json');
        return systemAssets = await _0x38175['json'](), systemAssets;
    } catch (_0x2b472f) {
        return systemAssets = {}, systemAssets;
    }
}
async function loadSocials() {
    try {
        const _0x127457 = await fetch('./ui.json'),
            _0x39a032 = await _0x127457['json']();
        return SOCIALS = Array['isArray'](_0x39a032['socials']) ? _0x39a032['socials'] : [], _0x39a032;
    } catch (_0x11f765) {
        return SOCIALS = [], {};
    }
}

function buildMenuHTML(_0x420c10, _0x2403aa, _0x48e8b6) {
    return '<ul' + (_0x48e8b6 ? '\x20class=\x22' + _0x48e8b6 + '\x22' : '') + '>' + _0x420c10['map'](_0x5e2352 => {
        if (_0x5e2352['type'] === 'separator') return '<li\x20class=\x22' + _0x2403aa + '-separator\x22></li>';
        else {
            if (_0x5e2352['type'] === 'program') return '<li\x20class=\x22' + _0x2403aa + '-item' + (_0x5e2352['disabled'] ? '\x20disabled' : '') + '\x22\x20data-action=\x22open-program\x22\x20data-program-name=\x22' + _0x5e2352['programName'] + '\x22>\x0a' + ('<img\x20decoding=\x22async\x22\x20src=\x22' + _0x5e2352['icon'] + '\x22\x20alt=\x22' + _0x5e2352['label'] + '\x22>\x0a') + (_0x5e2352['label'] + '\x0a') + '</li>';
            else {
                if (_0x5e2352['type'] === 'url') return '<li\x20class=\x22' + _0x2403aa + '-item\x22\x20data-action=\x22open-url\x22\x20data-url=\x22' + _0x5e2352['url'] + '\x22>\x0a' + ('<img\x20decoding=\x22async\x22\x20src=\x22' + _0x5e2352['icon'] + '\x22\x20alt=\x22' + _0x5e2352['label'] + '\x22>\x0a') + (_0x5e2352['label'] + '\x0a') + '</li>';
            }
        }
        return '';
    })['join']('') + '</ul>';
}

function attachMenuItemEffects(_0x32a8df, _0x472ade) {
    const _0x4719f4 = _0x32a8df['querySelectorAll'](_0x472ade);
    _0x4719f4['forEach'](_0x489d96 => {
        _0x489d96['addEventListener']('mousedown', _0x21a808 => {
            _0x21a808['preventDefault'](), _0x489d96['classList']['add']('menu-item-clicked');
        }), ['mouseup', 'mouseleave', 'mouseout']['forEach'](_0x4fd62e => {
            _0x489d96['addEventListener'](_0x4fd62e, () => {
                _0x489d96['classList']['remove']('menu-item-clicked');
            });
        });
    });
}
export default class StartMenu {
    constructor(eventBus) {
        this['eventBus'] = eventBus, this['startButton'] = document['getElementById']('start-button'), this['startMenu'] = null, this['allProgramsMenu'] = null, this['recentlyUsedMenu'] = null, this['activeWindowOverlay'] = null, this['infoData'] = {}, this['systemAssets'] = null, this['_eventsInitialized'] = ![], this['_init'](), this['eventBus']['subscribe'](EVENTS['STARTMENU_TOGGLE'], () => this['toggleStartMenu']()), this['eventBus']['subscribe'](EVENTS['STARTMENU_CLOSE_REQUEST'], () => {
            this['startMenu']?.['classList']['contains']('active') && this['closeStartMenu']();
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_FOCUSED'], _0x3d6fe0 => {
            this['updateContentOverlay'](_0x3d6fe0?.['windowId']);
        });
    } ['_cleanup']() {
        try {
            this['removeIframeFocusListeners'](), this['removeWindowBlurListener'](), this['_onWindowMouseDown'] && (window['removeEventListener']('mousedown', this['_onWindowMouseDown'], !![]), this['_onWindowMouseDown'] = null), this['_onDocumentKeyDown'] && (document['removeEventListener']('keydown', this['_onDocumentKeyDown']), this['_onDocumentKeyDown'] = null), this['startMenu'] && this['_onStartMenuClick'] && (this['startMenu']['removeEventListener']('click', this['_onStartMenuClick']), this['_onStartMenuClick'] = null), this['startMenu'] && this['startMenu']['parentNode'] && this['startMenu']['parentNode']['removeChild'](this['startMenu']), this['allProgramsMenu'] && this['allProgramsMenu']['parentNode'] && this['allProgramsMenu']['parentNode']['removeChild'](this['allProgramsMenu']), this['recentlyUsedMenu'] && this['recentlyUsedMenu']['parentNode'] && this['recentlyUsedMenu']['parentNode']['removeChild'](this['recentlyUsedMenu']), this['startMenu'] = null, this['allProgramsMenu'] = null, this['recentlyUsedMenu'] = null, this['activeWindowOverlay'] = null, this['_eventsInitialized'] = ![];
        } catch (_0x44a94a) {}
    }
    async ['_init']() {
        this['infoData'] = await loadSocials(), this['systemAssets'] = await getSystemAssets(), this['createStartMenuElement'](), this['setupEventListeners']();
    } ['createStartMenuElement']() {
        const _0x3db683 = this['startMenu'] || document['querySelector']('.startmenu');
        _0x3db683 && _0x3db683 !== this['startMenu'] && _0x3db683['parentNode']['removeChild'](_0x3db683);
        const _0x286b04 = document['createElement']('div');
        _0x286b04['className'] = 'startmenu', _0x286b04['innerHTML'] = this['getMenuTemplate'](), _0x286b04['style']['visibility'] = 'hidden', _0x286b04['style']['opacity'] = '0', document['body']['appendChild'](_0x286b04), this['startMenu'] = _0x286b04;
        const _0x1bb69b = this['infoData']?.['contact']?.['name'] || 'Mitch\x20Ivin';
        _0x286b04['querySelectorAll']('.menutopbar\x20.username')['forEach'](_0x3c4880 => {
            _0x3c4880['textContent'] = _0x1bb69b;
        }), this['createAllProgramsMenu'](), this['createRecentlyUsedMenu'](), this['setupMenuItems'](), this['_setupDelegatedEventHandlers']();
    } ['_createSubMenu'](_0x566194, _0x4d142f, _0x375184) {
        if (!this[_0x375184]) {
            const _0x2033dc = document['createElement']('div');
            _0x2033dc['className'] = _0x566194, _0x2033dc['innerHTML'] = _0x4d142f, _0x2033dc['style']['display'] = 'none', document['body']['appendChild'](_0x2033dc), this[_0x375184] = _0x2033dc;
        }
        return this[_0x375184];
    } ['_createMenuWithEffects']({
        items: _0x402ff1,
        itemClass: _0x78cc1c,
        ulClass: _0x2a0aea,
        menuClass: _0x1924fc,
        propertyName: _0x14812e,
        itemSelector: _0x238ebf,
        attachClickHandler: _0x5d6517
    }) {
        const _0x82504a = buildMenuHTML(_0x402ff1, _0x78cc1c, _0x2a0aea),
            _0x372dd0 = this['_createSubMenu'](_0x1924fc, _0x82504a, _0x14812e);
        return attachMenuItemEffects(_0x372dd0, _0x238ebf), _0x5d6517 && _0x372dd0['addEventListener']('click', this['_handleMenuClick']['bind'](this)), _0x372dd0;
    } ['createAllProgramsMenu']() {
        this['_createMenuWithEffects']({
            'items': getAllProgramsItems(),
            'itemClass': 'all-programs',
            'ulClass': 'all-programs-items',
            'menuClass': 'all-programs-menu',
            'propertyName': 'allProgramsMenu',
            'itemSelector': '.all-programs-item',
            'attachClickHandler': !![]
        });
    } ['createRecentlyUsedMenu']() {
        const _0x758e95 = {};
        _0x758e95['items'] = RECENTLY_USED_ITEMS, _0x758e95['itemClass'] = 'recently-used', _0x758e95['ulClass'] = 'recently-used-items', _0x758e95['menuClass'] = 'recently-used-menu', _0x758e95['propertyName'] = 'recentlyUsedMenu', _0x758e95['itemSelector'] = '.recently-used-item', _0x758e95['attachClickHandler'] = !![], this['_createMenuWithEffects'](_0x758e95);
    } ['getMenuTemplate']() {
        function _0xcd1ed4(_0x1b1888) {
            if (!_0x1b1888) return '';
            const {
                id: _0x56e24f,
                icon: _0x2487fe,
                title: _0x40871e,
                description: _0x2346e8,
                programName: _0x466db6,
                action: _0x55d175,
                url: _0x395dde,
                disabledOverride: _0x87396b
            } = _0x1b1888, _0x26c29c = [], _0x22dd01 = typeof _0x87396b === 'boolean' ? _0x87396b : _0x26c29c['includes'](_0x466db6), _0x55c456 = _0x22dd01 ? '\x20disabled' : '', _0x596ccd = _0x22dd01 ? '' : _0x55d175 ? 'data-action=\x22' + _0x55d175 + '\x22' : '', _0x3ea4f5 = _0x22dd01 ? '' : _0x466db6 ? 'data-program-name=\x22' + _0x466db6 + '\x22' : '', _0x3e6c1f = _0x395dde ? 'data-url=\x22' + _0x395dde + '\x22' : '', _0x43854a = (_0x466db6 || _0x56e24f) === 'projects', _0x5d97eb = '<span\x20class=\x22item-title' + (_0x43854a ? '\x20projects-bold' : '') + '\x22>' + _0x40871e + '</span>';
            return '<li\x20class=\x22menu-item' + _0x55c456 + '\x22\x20id=\x22menu-' + (_0x466db6 || _0x56e24f) + '\x22\x20' + _0x596ccd + '\x20' + _0x3ea4f5 + '\x20' + _0x3e6c1f + '\x20tabindex=\x22' + (_0x22dd01 ? '-1' : '0') + '\x22\x20aria-disabled=\x22' + (_0x22dd01 ? 'true' : 'false') + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + _0x2487fe + '\x22\x20alt=\x22' + _0x40871e + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22item-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x5d97eb + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x2346e8 ? '<span\x20class=\x22item-description\x22>' + _0x2346e8 + '</span>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</li>';
        }
        const _0x191e01 = this['systemAssets']?.['userIcon'] || './assets/gui/boot/userlogin.webp',
            _0x28bdb6 = this['infoData']?.['contact']?.['name'] || 'Mitch\x20Ivin',
            _0x13c29b = SOCIALS['map'](_0xb9c849 => ({
                'id': _0xb9c849['key'],
                'icon': _0xb9c849['icon'] ? './' + _0xb9c849['icon']['replace'](/^\.\//, '')['replace'](/^\//, '') : '',
                'title': _0xb9c849['name'],
                'url': _0xb9c849['url'],
                'action': 'open-url',
                'disabledOverride': ![]
            })),
            _0x28d41a = {};
        _0x28d41a['id'] = 'mediaPlayer', _0x28d41a['icon'] = './assets/gui/start-menu/mediaPlayer.webp', _0x28d41a['title'] = 'Media\x20Player', _0x28d41a['programName'] = 'mediaPlayer', _0x28d41a['action'] = 'open-program', _0x28d41a['disabledOverride'] = ![];
        const _0x5278a0 = {};
        _0x5278a0['id'] = 'image-viewer', _0x5278a0['icon'] = './assets/gui/start-menu/photos.webp', _0x5278a0['title'] = 'Image\x20Viewer', _0x5278a0['programName'] = 'image-viewer', _0x5278a0['action'] = 'open-program', _0x5278a0['disabledOverride'] = ![];
        const _0x1e856d = {};
        _0x1e856d['id'] = 'musicPlayer', _0x1e856d['icon'] = './assets/gui/start-menu/music.webp', _0x1e856d['title'] = 'Music\x20Player', _0x1e856d['programName'] = 'musicPlayer', _0x1e856d['action'] = 'open-program', _0x1e856d['disabledOverride'] = ![];
        const _0x2a6897 = [_0x28d41a, _0x5278a0, _0x1e856d];
        let _0x4d7759, _0x46fe6b, _0x25b734, _0x9e81c9, _0x525822, _0x30db17;
        const _0x280274 = {};
        _0x280274['id'] = 'image-viewer', _0x280274['icon'] = './assets/gui/start-menu/photos.webp', _0x280274['title'] = 'Image\x20Viewer', _0x280274['programName'] = 'image-viewer', _0x280274['action'] = 'open-program', _0x280274['disabledOverride'] = ![];
        const _0x594de4 = _0x280274;
        _0x4d7759 = _0x594de4, _0x46fe6b = _0x2a6897[0x0], _0x25b734 = _0x2a6897[0x2], _0x9e81c9 = _0x13c29b[0x0], _0x525822 = _0x13c29b[0x1], _0x30db17 = _0x13c29b[0x2];
        const _0x4ea489 = '\x0a\x20\x20\x20\x20\x20\x20<li\x20class=\x22menu-item\x22\x20id=\x22menu-program4\x22\x20data-action=\x22toggle-recently-used\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20src=\x22./assets/gui/start-menu/recently-used.webp\x22\x20alt=\x22Recently\x20Used\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22item-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22item-title\x22>Recently\x20Used</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</li>',
            _0x16da20 = {};
        _0x16da20['id'] = 'resume', _0x16da20['icon'] = './assets/gui/desktop/resume.webp', _0x16da20['title'] = 'My\x20Resume', _0x16da20['programName'] = 'resume', _0x16da20['action'] = 'open-program';
        const _0x114915 = '\x0a\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x9e81c9) + '\x0a\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x525822) + '\x0a\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x30db17) + '\x0a\x20\x20\x20\x20\x20\x20<li\x20class=\x22menu-divider\x20divider-darkblue\x22><hr\x20class=\x22divider\x22></li>\x0a\x20\x20\x20\x20\x20\x20' + _0x4ea489 + '\x0a\x20\x20\x20\x20\x20\x20<li\x20class=\x22menu-divider\x20divider-darkblue\x22><hr\x20class=\x22divider\x22></li>\x0a\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(CMD_CONFIG) + '\x0a\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x16da20) + '\x0a\x20\x20\x20\x20',
            _0x3f9233 = {};
        _0x3f9233['id'] = 'projects', _0x3f9233['icon'] = './assets/gui/desktop/projects.webp', _0x3f9233['title'] = 'My\x20Projects', _0x3f9233['description'] = 'View\x20my\x20work', _0x3f9233['programName'] = 'projects', _0x3f9233['action'] = 'open-program';
        const _0x565139 = {};
        _0x565139['id'] = 'contact', _0x565139['icon'] = './assets/gui/desktop/contact.webp', _0x565139['title'] = 'Contact\x20Me', _0x565139['description'] = 'Send\x20me\x20a\x20message', _0x565139['programName'] = 'contact', _0x565139['action'] = 'open-program';
        const _0x527055 = {};
        _0x527055['id'] = 'about', _0x527055['icon'] = './assets/gui/desktop/about.webp', _0x527055['title'] = 'About\x20Me', _0x527055['programName'] = 'about', _0x527055['action'] = 'open-program';
        const _0x519fb6 = {};
        _0x519fb6['id'] = _0x4d7759['id'], _0x519fb6['icon'] = _0x4d7759['icon'], _0x519fb6['title'] = _0x4d7759['title'], _0x519fb6['programName'] = _0x4d7759['programName'], _0x519fb6['action'] = _0x4d7759['action'], _0x519fb6['url'] = _0x4d7759['url'], _0x519fb6['disabledOverride'] = _0x4d7759['disabledOverride'];
        const _0x28ca72 = {};
        _0x28ca72['id'] = _0x46fe6b['id'], _0x28ca72['icon'] = _0x46fe6b['icon'], _0x28ca72['title'] = _0x46fe6b['title'], _0x28ca72['programName'] = _0x46fe6b['programName'], _0x28ca72['action'] = _0x46fe6b['action'], _0x28ca72['url'] = _0x46fe6b['url'], _0x28ca72['disabledOverride'] = _0x46fe6b['disabledOverride'];
        const _0x10d09d = {};
        _0x10d09d['id'] = 'paint', _0x10d09d['icon'] = './assets/gui/start-menu/paint.webp', _0x10d09d['title'] = 'Paint', _0x10d09d['programName'] = 'paint', _0x10d09d['action'] = 'open-program';
        const _0x34755f = {};
        return _0x34755f['id'] = _0x25b734['id'], _0x34755f['icon'] = _0x25b734['icon'], _0x34755f['title'] = _0x25b734['title'], _0x34755f['programName'] = _0x25b734['programName'], _0x34755f['action'] = _0x25b734['action'], _0x34755f['url'] = _0x25b734['url'], _0x34755f['disabledOverride'] = _0x25b734['disabledOverride'], '\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22menutopbar\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + _0x191e01 + '\x22\x20alt=\x22User\x22\x20class=\x22userpicture\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22username\x22>' + _0x28bdb6 + '</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22start-menu-middle\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22middle-section\x20middle-left\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<ul\x20class=\x22menu-items\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x3f9233) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x565139) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li\x20class=\x22menu-divider\x22><hr\x20class=\x22divider\x22></li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x527055) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x519fb6) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x28ca72) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x10d09d) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0xcd1ed4(_0x34755f) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li\x20class=\x22menu-divider\x22><hr\x20class=\x22divider\x22></li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</ul>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22all-programs-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22all-programs-button\x22\x20id=\x22menu-all-programs\x22\x20data-action=\x22toggle-all-programs\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span>All\x20Programs</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20src=\x22./assets/gui/start-menu/arrow.webp\x22\x20alt=\x22All\x20Programs\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22middle-section\x20middle-right\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<ul\x20class=\x22menu-items\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x114915 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</ul>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22start-menu-footer\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22footer-buttons\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22footer-button\x22\x20id=\x22btn-log-off\x22\x20data-action=\x22log-off\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20src=\x22./assets/gui/start-menu/logoff.webp\x22\x20alt=\x22Log\x20Off\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span>Log\x20Off</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22footer-button\x22\x20id=\x22btn-shut-down\x22\x20data-action=\x22shut-down\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20src=\x22./assets/gui/start-menu/shutdown.webp\x22\x20alt=\x22Shut\x20Down\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span>Shut\x20Down</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20';
    } ['setupEventListeners']() {
        this['_onWindowMouseDown'] = _0x39ff8e => {
            if (!this['startMenu']?.['classList']['contains']('active')) return;
            if (this['_lastOpenedAt'] && Date['now']() - this['_lastOpenedAt'] < 0xc8) return;
            const _0x3330a3 = _0x39ff8e['target'];
            if (_0x3330a3['classList']['contains']('start-menu-content-click-overlay') || _0x3330a3['tagName'] === 'IFRAME') return;
            const _0x10cbaf = this['startMenu']['contains'](_0x3330a3),
                _0x3ffed7 = this['startButton']['contains'](_0x3330a3),
                _0x3d274e = this['allProgramsMenu']?.['contains'](_0x3330a3),
                _0x2c121a = this['recentlyUsedMenu']?.['contains'](_0x3330a3);
            !_0x10cbaf && !_0x3ffed7 && !_0x3d274e && !_0x2c121a && (_0x39ff8e['stopPropagation'](), _0x39ff8e['preventDefault'](), this['hideAllProgramsMenu'](), this['closeStartMenu']());
        }, window['addEventListener']('mousedown', this['_onWindowMouseDown'], !![]), this['_onDocumentKeyDown'] = _0x11d23b => {
            _0x11d23b['key'] === 'Escape' && this['startMenu']?.['classList']['contains']('active') && this['closeStartMenu']();
        }, document['addEventListener']('keydown', this['_onDocumentKeyDown']), this['_eventsInitialized'] = !![];
    } ['_handleMenuClick'](_0x7c8be6) {
        const _0x15c42b = _0x7c8be6['target']['closest']('[data-action],\x20[data-program-name],\x20[data-url]');
        if (!_0x15c42b) return;
        if (_0x15c42b['classList']['contains']('all-programs-item') && _0x15c42b['classList']['contains']('disabled')) {
            _0x7c8be6['stopPropagation'](), _0x7c8be6['preventDefault']();
            return;
        }
        if (_0x15c42b['classList']['contains']('recently-used-item') && _0x15c42b['classList']['contains']('disabled')) {
            _0x7c8be6['stopPropagation'](), _0x7c8be6['preventDefault']();
            return;
        }
        const _0x9a12cb = _0x15c42b['dataset']['action'],
            _0x32d6ba = _0x15c42b['dataset']['programName'],
            _0x208fa2 = _0x15c42b['dataset']['url'];
        if (_0x9a12cb === 'toggle-recently-used') {
            this['showRecentlyUsedMenu']();
            return;
        }
        if (_0x9a12cb === 'open-program' && _0x32d6ba) {
            if (document['documentElement']['classList']['contains']('mobile-device') && (_0x32d6ba === 'mediaPlayer' || _0x32d6ba === 'paint')) {
                _0x7c8be6['preventDefault'](), _0x7c8be6['stopPropagation'](), import('../utils/popupManager.js')['then'](({
                    default: _0x393944
                }) => {
                    !_0x393944['isInitialized'] && _0x393944['init']();
                    const _0x4dca60 = {};
                    _0x4dca60['title'] = 'Media\x20Player', _0x4dca60['icon'] = './assets/gui/start-menu/mediaPlayer.webp';
                    const _0x4a5110 = {};
                    _0x4a5110['title'] = 'Paint', _0x4a5110['icon'] = './assets/gui/start-menu/paint.webp';
                    const _0x1aa6d3 = {};
                    _0x1aa6d3['mediaPlayer'] = _0x4dca60, _0x1aa6d3['paint'] = _0x4a5110;
                    const _0x3c9e67 = _0x1aa6d3,
                        _0xf2df78 = {};
                    _0xf2df78['title'] = 'This\x20App', _0xf2df78['icon'] = null;
                    const {
                        title: _0x77aa58,
                        icon: _0x2847ba
                    } = _0x3c9e67[_0x32d6ba] || _0xf2df78;
                    _0x393944['showMobileRestrictionPopup'](_0x77aa58, _0x2847ba);
                }), this['closeStartMenu']();
                return;
            }
            this['openProgram'](_0x32d6ba), this['closeStartMenu']();
        } else {
            if (_0x9a12cb === 'open-url' && _0x208fa2) {
                try {
                    window['postMessage']({
                        'type': 'confirm-open-link',
                        'url': _0x208fa2,
                        'label': _0x15c42b?.['textContent']?.['trim']() || ''
                    }, '*');
                } catch (_0x12df03) {
                    window['open'](_0x208fa2, '_blank');
                }
                this['closeStartMenu']();
            } else {
                if (_0x9a12cb === 'log-off') {
                    const _0x284e24 = {};
                    _0x284e24['dialogType'] = 'logOff', this['eventBus']['publish'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], _0x284e24), this['closeStartMenu']();
                } else {
                    if (_0x9a12cb === 'shut-down') {
                        const _0x58ef94 = {};
                        _0x58ef94['dialogType'] = 'shutDown', this['eventBus']['publish'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], _0x58ef94), this['closeStartMenu']();
                    }
                }
            }
        }
    } ['_setupDelegatedEventHandlers']() {
        this['startMenu'] && (this['_onStartMenuClick'] = this['_handleMenuClick']['bind'](this), this['startMenu']['addEventListener']('click', this['_onStartMenuClick']));
    } ['setupMenuItems']() {
        this['setupAllProgramsMenu']();
        const _0x4d49a0 = this['startMenu']['querySelector']('#menu-program4');
        if (_0x4d49a0) {
            _0x4d49a0['setAttribute']('data-action', 'toggle-recently-used'), _0x4d49a0['style']['position'] = 'relative', _0x4d49a0['style']['width'] = '100%';
            const _0x428b73 = document['createElement']('span');
            _0x428b73['className'] = 'mut-menu-arrow', _0x428b73['innerHTML'] = '►', _0x428b73['style']['position'] = 'absolute', _0x428b73['style']['right'] = '8px', _0x428b73['style']['top'] = '50%', _0x428b73['style']['transform'] = 'translateY(-50%)\x20scaleX(0.5)', _0x428b73['style']['fontSize'] = '10px', _0x4d49a0['appendChild'](_0x428b73), _0x4d49a0['addEventListener']('mouseenter', () => this['showRecentlyUsedMenu']()), _0x4d49a0['addEventListener']('mouseleave', _0xa93427 => {
                if (_0xa93427['relatedTarget'] && (_0xa93427['relatedTarget']['closest']('.recently-used-menu') || _0xa93427['relatedTarget'] === this['recentlyUsedMenu'])) return;
                this['hideRecentlyUsedMenu']();
            });
        }
    } ['setupAllProgramsMenu']() {
        const _0x5af4b3 = document['getElementById']('menu-all-programs');
        if (!_0x5af4b3 || !this['allProgramsMenu'] || !this['startMenu']) return;
        _0x5af4b3['addEventListener']('mouseenter', () => this['showAllProgramsMenu']()), _0x5af4b3['addEventListener']('mouseleave', _0x2dc82e => {
            if (_0x2dc82e['relatedTarget'] && (_0x2dc82e['relatedTarget']['closest']('.all-programs-menu') || _0x2dc82e['relatedTarget'] === this['allProgramsMenu'])) return;
            this['hideAllProgramsMenu']();
        }), this['allProgramsMenu']['addEventListener']('mouseleave', _0x4e03f8 => {
            if (_0x4e03f8['relatedTarget'] && (_0x4e03f8['relatedTarget'] === _0x5af4b3 || _0x4e03f8['relatedTarget']['closest']('#menu-all-programs'))) return;
            this['hideAllProgramsMenu']();
        });
        const _0x562421 = this['startMenu']['querySelectorAll']('.menu-item:not(#menu-all-programs),\x20.menutopbar,\x20.start-menu-footer,\x20.middle-right');
        _0x562421['forEach'](_0x3819a7 => {
            _0x3819a7['addEventListener']('mouseenter', () => this['hideAllProgramsMenu']());
        });
    } ['showAllProgramsMenu']() {
        if (!this['allProgramsMenu'] || !this['startMenu']) return;
        const _0x4ade8f = this['startMenu']['querySelector']('#menu-all-programs'),
            _0x254ca0 = this['startMenu']['querySelector']('.start-menu-footer');
        if (!_0x4ade8f || !_0x254ca0) return;
        const _0x605fa9 = _0x4ade8f['getBoundingClientRect'](),
            _0x9a5a7 = _0x254ca0['getBoundingClientRect'](),
            _0x19e451 = _0x605fa9['right'] + 'px',
            _0x596b53 = window['innerHeight'] - _0x9a5a7['top'] + 'px',
            _0x19872d = {};
        _0x19872d['left'] = _0x19e451, _0x19872d['bottom'] = _0x596b53, _0x19872d['top'] = 'auto', _0x19872d['display'] = 'block', Object['assign'](this['allProgramsMenu']['style'], _0x19872d), this['allProgramsMenu']['classList']['add']('active');
    } ['hideAllProgramsMenu']() {
        this['allProgramsMenu'] && (this['allProgramsMenu']['classList']['remove']('active'), this['allProgramsMenu']['style']['display'] = 'none');
    } ['openProgram'](_0x485f02) {
        const _0x547faf = {};
        _0x547faf['programName'] = _0x485f02, this['eventBus']['publish'](EVENTS['PROGRAM_OPEN'], _0x547faf);
    } ['toggleStartMenu']() {
        if (!this['startMenu']) {
            this['createStartMenuElement']();
            if (!this['startMenu']) return;
        }
        if (!this['startButton']) {
            this['startButton'] = document['getElementById']('start-button');
            if (!this['startButton']) return;
        }!this['_eventsInitialized'] && this['setupEventListeners']();
        const _0x2edacc = this['startMenu'];
        if (!_0x2edacc) return;
        const _0x53da3c = _0x2edacc['classList']['contains']('active');
        if (!_0x53da3c) {
            _0x2edacc['style']['visibility'] = 'visible', _0x2edacc['style']['opacity'] = '1', _0x2edacc['classList']['add']('active'), this['_lastOpenedAt'] = Date['now'](), this['eventBus']['publish'](EVENTS['STARTMENU_OPENED']);
            const _0x1f6b5d = document['querySelector']('.window.active');
            this['updateContentOverlay'](_0x1f6b5d?.['id']), this['attachIframeFocusListeners'](), this['attachWindowBlurListener']();
        } else this['closeStartMenu']();
    } ['closeStartMenu']() {
        const _0x19bb56 = this['startMenu']?.['classList']['contains']('active');
        if (!this['startMenu'] || !_0x19bb56) return;
        this['startMenu']['classList']['remove']('active'), this['hideAllProgramsMenu'](), this['updateContentOverlay'](null), this['removeIframeFocusListeners'](), this['removeWindowBlurListener'](), import('../utils/frameScheduler.js')['then'](({
            scheduleWrite: _0x2f9ee9
        }) => {
            _0x2f9ee9(() => {
                this['startMenu'] && (this['startMenu']['style']['visibility'] = 'hidden', this['startMenu']['style']['opacity'] = '0');
            });
        }), this['eventBus']['publish'](EVENTS['STARTMENU_CLOSED']), this['hideRecentlyUsedMenu']();
    } ['updateContentOverlay'](_0xbaf11f) {
        if (!this['startMenu']) return;
        this['activeWindowOverlay'] && (this['activeWindowOverlay']['style']['display'] = 'none', this['activeWindowOverlay']['style']['pointerEvents'] = 'none', this['activeWindowOverlay'] = null);
        let _0xf61934 = null;
        if (_0xbaf11f) {
            const _0x3f9a05 = document['getElementById'](_0xbaf11f);
            _0x3f9a05 && (_0xf61934 = _0x3f9a05['querySelector']('.start-menu-content-click-overlay'));
        }
        if (_0xf61934 && this['startMenu']?.['classList']['contains']('active')) _0xf61934['style']['display'] = 'block', _0xf61934['style']['pointerEvents'] = 'auto', this['activeWindowOverlay'] = _0xf61934;
        else _0xf61934 && (_0xf61934['style']['display'] = 'none', _0xf61934['style']['pointerEvents'] = 'none');
    } ['showRecentlyUsedMenu']() {
        if (!this['recentlyUsedMenu'] || !this['startMenu']) return;
        const _0x2ea1b4 = this['startMenu']['querySelector']('#menu-program4');
        if (!_0x2ea1b4) return;
        this['recentlyUsedMenu']['style']['visibility'] = 'hidden', this['recentlyUsedMenu']['style']['display'] = 'block';
        const _0x2af3c4 = _0x2ea1b4['getBoundingClientRect'](),
            _0x48cff9 = this['recentlyUsedMenu']['getBoundingClientRect']();
        let _0x5595d0 = _0x2af3c4['right'];
        _0x5595d0 + _0x48cff9['width'] > window['innerWidth'] && (_0x5595d0 = _0x2af3c4['left'] - _0x48cff9['width']);
        let _0xedde32 = _0x2af3c4['bottom'] - _0x48cff9['height'];
        _0xedde32 < 0x0 && (_0xedde32 = 0x0);
        _0xedde32 + _0x48cff9['height'] > window['innerHeight'] - 0x1e && (_0xedde32 = window['innerHeight'] - 0x1e - _0x48cff9['height']);
        const _0x3f3362 = {};
        _0x3f3362['left'] = _0x5595d0 + 'px', _0x3f3362['top'] = _0xedde32 + 'px', _0x3f3362['display'] = 'block', _0x3f3362['visibility'] = 'visible', Object['assign'](this['recentlyUsedMenu']['style'], _0x3f3362), this['recentlyUsedMenu']['addEventListener']('mouseleave', _0x1db712 => {
            if (_0x1db712['relatedTarget'] && (_0x1db712['relatedTarget'] === _0x2ea1b4 || _0x1db712['relatedTarget']['closest']('#menu-program4'))) return;
            this['hideRecentlyUsedMenu']();
        }), this['recentlyUsedMenu']['classList']['add']('mut-menu-active'), _0x2ea1b4['classList']['add']('active-submenu-trigger');
    } ['hideRecentlyUsedMenu']() {
        this['recentlyUsedMenu'] && (this['recentlyUsedMenu']['classList']['remove']('mut-menu-active'), this['recentlyUsedMenu']['style']['display'] = 'none'), !this['_cachedProgram4Button'] && (this['_cachedProgram4Button'] = this['startMenu']?.['querySelector']('#menu-program4')), this['_cachedProgram4Button']?.['classList']['remove']('active-submenu-trigger');
    } ['attachIframeFocusListeners']() {
        this['_iframeFocusHandler'] = () => this['closeStartMenu'](), this['_cachedIframes'] = document['querySelectorAll']('#windows-container\x20iframe'), this['_cachedIframes']['forEach'](_0x299254 => {
            try {
                _0x299254['addEventListener']('focus', this['_iframeFocusHandler']);
            } catch (_0x3847c4) {}
        });
    } ['removeIframeFocusListeners']() {
        if (!this['_iframeFocusHandler']) return;
        const _0x3fb861 = this['_cachedIframes'] || document['querySelectorAll']('iframe');
        _0x3fb861['forEach'](_0x3ed747 => {
            _0x3ed747['removeEventListener']('focus', this['_iframeFocusHandler']);
        }), this['_iframeFocusHandler'] = null, this['_cachedIframes'] = null;
    } ['attachWindowBlurListener']() {} ['removeWindowBlurListener']() {
        this['_windowBlurHandler'] && (window['removeEventListener']('blur', this['_windowBlurHandler']), this['_windowBlurHandler'] = null);
    }
}

function getAllProgramsItems() {
    const _0x2aa6d7 = [...ALL_PROGRAMS_ITEMS_BASE, ...SOCIALS['map'](_0x3e23ee => ({
        'type': 'url',
        'url': _0x3e23ee['url'],
        'icon': _0x3e23ee['icon'] ? './' + _0x3e23ee['icon']['replace'](/^\.\//, '')['replace'](/^\//, '') : '',
        'label': _0x3e23ee['name']
    }))];
    return _0x2aa6d7;
}