import _0x14fbdb from './startMenu.js';
import {
    EVENTS
} from '../utils/eventBus.js';
import {
    setupTooltips
} from './tooltip.js';
import {
    playBalloonSound
} from '../utils/audioManager.js';
import {
    updateTaskbarPlayingIndicator
} from '../utils/domUtils.js';
let taskbarSharedEventBus = null;
class Clock {
    constructor(_0x248339) {
        this['clockElement'] = document['querySelector'](_0x248339), this['intervalId'] = null, this['initialTimeoutId'] = null;
        const _0x174540 = {};
        _0x174540['hour'] = 'numeric', _0x174540['minute'] = '2-digit', _0x174540['hour12'] = !![], this['timeFormatter'] = new Intl['DateTimeFormat']('en-US', _0x174540);
        if (!this['clockElement']) return;
        this['setupClockUpdates']();
    } ['setupClockUpdates']() {
        clearTimeout(this['initialTimeoutId']), clearInterval(this['intervalId']);
        const _0x447ac1 = new Date(),
            _0x3b70a9 = (0x3c - _0x447ac1['getSeconds']()) * 0x3e8 - _0x447ac1['getMilliseconds']();
        this['updateClock'](), this['initialTimeoutId'] = setTimeout(() => {
            this['updateClock'](), this['intervalId'] = setInterval(() => this['updateClock'](), 0xea60);
        }, _0x3b70a9);
    } ['updateClock']() {
        if (!this['clockElement']) return;
        this['clockElement']['textContent'] = this['timeFormatter']['format'](new Date());
    } ['destroy']() {
        clearTimeout(this['initialTimeoutId']), clearInterval(this['intervalId']);
    }
}
export default class Taskbar {
    constructor(eventBus) {
        this['eventBus'] = eventBus, taskbarSharedEventBus = eventBus, this['startButton'] = document['getElementById']('start-button'), this['startMenuComponent'] = new _0x14fbdb(this['eventBus']), this['programsContainer'] = document['querySelector']('.taskbar-programs'), this['systemTray'] = document['querySelector']('.system-tray'), this['taskbar'] = document['querySelector']('.taskbar'), this['_lastStartToggleTs'] = 0x0, this['_setStartButtonImage'](), this['_setTaskbarBackground'](), window['addEventListener']('resize', () => {
            this['_setStartButtonImage']();
        }), this['setupStartButtonEffects'](), this['setupResponsiveTaskbar'](), setupTooltips('.tray-status-icon,\x20.tray-network-icon,\x20.tray-volume-icon,\x20.tray-crt-toggle,\x20.tray-fullscreen-icon', undefined, 0x64, () => !document['getElementById']('balloon-root')), new Clock('.time'), this['subscribeToEvents'](), document['addEventListener']('fullscreenchange', () => {});
    } ['subscribeToEvents']() {
        this['eventBus']['subscribe'](EVENTS['STARTMENU_OPENED'], () => {
            this['startButton']['classList']['add']('active');
        }), this['eventBus']['subscribe'](EVENTS['STARTMENU_CLOSED'], () => {
            this['startButton']['classList']['remove']('active');
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_CREATED'], () => {
            this['updateTaskbarLayout']();
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_CLOSED'], () => {
            this['updateTaskbarLayout']();
        }), this['eventBus']['subscribe'](EVENTS['MUSIC_PLAYER_PLAYING'], _0x5d8ff6 => {
            if (_0x5d8ff6 && _0x5d8ff6['programId'] === 'musicPlayer') {
                const _0x1efa5e = {};
                _0x1efa5e['programId'] = 'musicPlayer', _0x1efa5e['windowId'] = 'musicPlayer-window', _0x1efa5e['indicatorClass'] = 'music-playing-indicator', _0x1efa5e['isPlaying'] = !![], updateTaskbarPlayingIndicator(_0x1efa5e);
            }
        }), this['eventBus']['subscribe'](EVENTS['MUSIC_PLAYER_STOPPED'], _0x108171 => {
            if (_0x108171 && _0x108171['programId'] === 'musicPlayer') {
                const _0x41f531 = {};
                _0x41f531['programId'] = 'musicPlayer', _0x41f531['windowId'] = 'musicPlayer-window', _0x41f531['indicatorClass'] = 'music-playing-indicator', _0x41f531['isPlaying'] = ![], updateTaskbarPlayingIndicator(_0x41f531);
            }
        }), this['eventBus']['subscribe'](EVENTS['MEDIA_PLAYER_PLAYING'], _0x58a472 => {
            if (_0x58a472 && _0x58a472['programId'] === 'mediaPlayer') {
                const _0x56a8ff = {};
                _0x56a8ff['programId'] = 'mediaPlayer', _0x56a8ff['windowId'] = 'mediaPlayer-window', _0x56a8ff['indicatorClass'] = 'media-playing-indicator', _0x56a8ff['isPlaying'] = !![], updateTaskbarPlayingIndicator(_0x56a8ff);
            }
        }), this['eventBus']['subscribe'](EVENTS['MEDIA_PLAYER_STOPPED'], _0x4f0246 => {
            if (_0x4f0246 && _0x4f0246['programId'] === 'mediaPlayer') {
                const _0x178146 = {};
                _0x178146['programId'] = 'mediaPlayer', _0x178146['windowId'] = 'mediaPlayer-window', _0x178146['indicatorClass'] = 'media-playing-indicator', _0x178146['isPlaying'] = ![], updateTaskbarPlayingIndicator(_0x178146);
            }
        });
    } ['setupStartButtonEffects']() {
        const publishToggleDedupe = _0x20633e => {
            if (_0x20633e) _0x20633e['stopPropagation']();
            const _0x1f9a68 = Date['now']();
            if (_0x1f9a68 - this['_lastStartToggleTs'] < 0xc8) return;
            this['_lastStartToggleTs'] = _0x1f9a68;
            !this['startMenuComponent'] && (this['startMenuComponent'] = new _0x14fbdb(this['eventBus']));
            !this['startButton'] && (this['startButton'] = document['getElementById']('start-button'));
            let _0x17dc63 = !![];
            try {
                const _0x4fa5b1 = this['startMenuComponent'] && this['startMenuComponent']['startMenu'],
                    _0x521084 = !!(_0x4fa5b1 && _0x4fa5b1['classList'] && _0x4fa5b1['classList']['contains']('active'));
                _0x17dc63 = !_0x521084;
            } catch (_0x198aff) {}
            const _0x1e45da = {};
            _0x1e45da['__coalesce'] = !![], (window['batchedPublish'] || this['eventBus']['publish'])['call'](window['batchedPublish'] ? undefined : this['eventBus'], EVENTS['STARTMENU_TOGGLE'], _0x1e45da);
            const _0xedb37a = _0x143de9 => {
                setTimeout(() => {
                    try {
                        const _0x467fc6 = this['startMenuComponent'] && this['startMenuComponent']['startMenu'],
                            _0x315095 = !!(_0x467fc6 && _0x467fc6['classList'] && _0x467fc6['classList']['contains']('active'));
                        _0x17dc63 && !_0x315095 && this['startMenuComponent'] && typeof this['startMenuComponent']['toggleStartMenu'] === 'function' && this['startMenuComponent']['toggleStartMenu']();
                    } catch (_0x28c86b) {}
                }, _0x143de9);
            };
            _0xedb37a(0x40), _0xedb37a(0xa0);
        };
        this['startButton']['addEventListener']('click', publishToggleDedupe);
    } ['setupResponsiveTaskbar']() {
        this['updateTaskbarLayout'](), window['addEventListener']('resize', () => {
            this['updateTaskbarLayout']();
        });
        const _0x57b005 = new MutationObserver(() => {
                this['updateTaskbarLayout']();
            }),
            _0x165126 = {};
        _0x165126['childList'] = !![], _0x165126['subtree'] = ![], _0x57b005['observe'](this['programsContainer'], _0x165126);
    } ['updateTaskbarLayout']() {
        const _0x46d671 = document['querySelectorAll']('.taskbar-item');
        if (_0x46d671['length'] === 0x0) return;
        const _0x1e2830 = this['_calculateAvailableWidth'](),
            _0x319bdd = this['_determineLayoutMode'](_0x46d671['length'], _0x1e2830);
        this['_applyTaskbarLayout'](_0x46d671, _0x319bdd, _0x1e2830);
    } ['_calculateAvailableWidth']() {
        const _0xf8a861 = this['taskbar']['offsetWidth'],
            _0x47bcb1 = this['startButton']['offsetWidth'],
            _0x1cf638 = this['systemTray']['offsetWidth'];
        return _0xf8a861 - _0x47bcb1 - _0x1cf638;
    } ['_determineLayoutMode'](_0x56f48f, _0x473b28) {
        const _0x5963b4 = 0xa8,
            _0x5e8198 = 0x50,
            _0x225b0a = 0x24;
        if (_0x56f48f * _0x5963b4 <= _0x473b28) return 'default';
        if (_0x56f48f * _0x5e8198 <= _0x473b28) return 'reduced';
        if (_0x56f48f * _0x225b0a <= _0x473b28) return 'icon-only';
        return 'overflow';
    } ['_applyTaskbarLayout'](_0x201414, _0x1fc79b, _0x1af673) {
        const _0x34a245 = 0x24,
            _0x552e30 = 0xa8,
            _0x427255 = _0x201414['length'];
        let _0x4be494 = Math['floor'](_0x1af673 / _0x427255);
        if (_0x4be494 > _0x552e30) _0x4be494 = _0x552e30;
        if (_0x4be494 < _0x34a245) _0x4be494 = _0x34a245;
        const _0x4f2623 = _0x4be494 === _0x34a245;
        _0x201414['forEach'](_0x5209c8 => {
            _0x5209c8['style']['display'] = 'flex', _0x5209c8['style']['width'] = _0x4be494 + 'px', _0x5209c8['classList']['toggle']('icon-only', _0x4f2623);
        });
    } ['_setStartButtonImage']() {
        const _0x4ec4cf = this['startButton']['querySelector']('img');
        if (!_0x4ec4cf) return;
        _0x4ec4cf['src'] = 'assets/gui/taskbar/start-button.webp';
    } ['_setTaskbarBackground']() {
        try {
            if (!this['taskbar']) return;
            const preload = document['querySelector']('link[rel=\x22preload\x22][href$=\x22assets/gui/taskbar/taskbar-bg.webp\x22]'),
                _0x2e7f1b = 'assets/gui/taskbar/taskbar-bg.webp',
                _0x266b72 = preload?.['href'] || _0x2e7f1b;
            this['taskbar']['style']['backgroundImage'] = 'url(\x27' + _0x266b72 + '\x27)', this['taskbar']['style']['backgroundRepeat'] = 'repeat-x', this['taskbar']['style']['backgroundSize'] = 'auto\x20100%';
        } catch (_0x64cb6c) {}
    }
}
let balloonTimeouts = [];
export function hideBalloon(_0x56d488 = ![]) {
    const _0x4e5566 = document['getElementById']('balloon-root');
    if (!_0x4e5566) return;
    const _0x10e1fd = _0x4e5566['querySelector']('.balloon');
    balloonTimeouts['forEach'](_0x15599d => clearTimeout(_0x15599d)), balloonTimeouts = [];
    if (_0x56d488) {
        if (_0x4e5566['parentNode']) _0x4e5566['parentNode']['removeChild'](_0x4e5566);
        return;
    }
    if (_0x10e1fd) _0x10e1fd['classList']['add']('hide');
    setTimeout(() => {
        if (_0x4e5566['parentNode']) _0x4e5566['parentNode']['removeChild'](_0x4e5566);
    }, 0x3e8);
}
export async function showWelcomeBalloon() {
    const _0x13f268 = document['getElementById']('login-screen');
    if (_0x13f268 && _0x13f268['style']['display'] !== 'none' && _0x13f268['style']['opacity'] !== '0') return;
    if (document['getElementById']('balloon-root')) return;
    balloonTimeouts['forEach'](_0x35575c => clearTimeout(_0x35575c)), balloonTimeouts = [];
    const _0x14a217 = document['querySelector']('.tray-network-icon');
    if (!_0x14a217) return;
    const _0x36fdbb = document['createElement']('div');
    _0x36fdbb['id'] = 'balloon-root', _0x36fdbb['style']['position'] = 'absolute', _0x36fdbb['style']['zIndex'] = '1400', document['body']['appendChild'](_0x36fdbb);
    let _0x5301c4 = '',
        _0x4b45ba = '';
    try {
        const _0x2e03e7 = await fetch('./ui.json'),
            _0x1c82c3 = await _0x2e03e7['json']();
        if (_0x1c82c3['balloon']) {
            if (_0x1c82c3['balloon']['title']) _0x5301c4 = _0x1c82c3['balloon']['title'];
            if (_0x1c82c3['balloon']['body']) _0x4b45ba = _0x1c82c3['balloon']['body'];
        }
    } catch (_0x4439f5) {}
    _0x36fdbb['innerHTML'] = '\x0a\x20\x20\x20\x20<div\x20class=\x22balloon\x22>\x0a\x20\x20\x20\x20\x20\x20<button\x20class=\x22balloon__close\x22\x20aria-label=\x22Close\x22></button>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22balloon__header\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20class=\x22balloon__header__img\x22\x20src=\x22assets/gui/taskbar/welcome.webp\x22\x20alt=\x22welcome\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22balloon__header__text\x22\x20style=\x22font-weight:\x20bold;\x22>' + _0x5301c4 + '</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<p\x20class=\x22balloon__text__first\x22\x20style=\x22padding:\x200\x208px\x200\x202px;\x22>' + _0x4b45ba + '</p>\x0a\x20\x20\x20\x20\x20\x20<p\x20class=\x22balloon__text__second\x22\x20style=\x22padding:\x200\x208px\x200\x202px;\x20margin-top:\x208px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20Get\x20Started:\x20<a\x20href=\x22#\x22\x20id=\x22balloon-about-link\x22\x20style=\x22color:\x20blue;\x20text-decoration:\x20underline;\x22>About\x20Me</a>\x20|\x20<a\x20href=\x22#\x22\x20id=\x22balloon-projects-link\x22\x20style=\x22color:\x20blue;\x20text-decoration:\x20underline;\x22>My\x20Projects</a>\x0a\x20\x20\x20\x20\x20\x20</p>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22balloon-pointer-anchor\x22\x20style=\x22position:absolute;bottom:-19px;right:24px;width:0;height:0;\x22></div>\x0a\x20\x20\x20\x20</div>\x0a\x20\x20';
    const _0x20c916 = _0x36fdbb['querySelector']('#balloon-projects-link');
    _0x20c916 && _0x20c916['addEventListener']('click', _0x1c5f82 => {
        _0x1c5f82['preventDefault']();
        if (taskbarSharedEventBus && EVENTS) {
            const _0x4520a3 = {};
            _0x4520a3['programName'] = 'projects', taskbarSharedEventBus['publish'](EVENTS['PROGRAM_OPEN'], _0x4520a3);
        }
    });
    const _0x1192e2 = _0x36fdbb['querySelector']('#balloon-about-link');
    _0x1192e2 && _0x1192e2['addEventListener']('click', _0x1c4f10 => {
        _0x1c4f10['preventDefault']();
        if (taskbarSharedEventBus && EVENTS) {
            const _0x443991 = {};
            _0x443991['programName'] = 'about', taskbarSharedEventBus['publish'](EVENTS['PROGRAM_OPEN'], _0x443991);
        }
    });
    const _0x1b2d22 = () => {
        return new Promise(_0x3f86af => {
            setTimeout(() => {
                const _0x27da77 = _0x14a217['getBoundingClientRect'](),
                    _0x5958c5 = _0x36fdbb['querySelector']('.balloon'),
                    _0x1917d9 = _0x5958c5['querySelector']('.balloon-pointer-anchor');
                import('../utils/frameScheduler.js')['then'](({
                    scheduleWrite: _0x41593f
                }) => {
                    _0x41593f(() => {
                        const _0x599981 = _0x1917d9['getBoundingClientRect'](),
                            _0x4f0198 = _0x27da77['left'] + _0x27da77['width'] / 0x2 + window['scrollX'],
                            _0x616f62 = _0x599981['left'] + _0x599981['width'] / 0x2 + window['scrollX'],
                            _0x3036f1 = _0x4f0198 - _0x616f62 - 0x8;
                        _0x36fdbb['style']['left'] = _0x36fdbb['offsetLeft'] + _0x3036f1 + 'px', _0x36fdbb['style']['top'] = _0x27da77['top'] - _0x5958c5['offsetHeight'] - 0x8 - 0xc + window['scrollY'] + 'px';
                        const _0x516373 = document['documentElement']['classList']['contains']('mobile-device'),
                            _0x4bf8b4 = _0x516373 ? 0x96 : 0x32;
                        setTimeout(_0x3f86af, _0x4bf8b4);
                    });
                });
            }, 0x0);
        });
    };
    playBalloonSound(), await _0x1b2d22();
    const _0x51d59f = _0x36fdbb['querySelector']('.balloon'),
        _0x31762e = _0x36fdbb['querySelector']('.balloon__close');
    _0x31762e['onclick'] = () => hideBalloon(), _0x51d59f['classList']['remove']('hide');
    const _0x4d131b = document['documentElement']['classList']['contains']('mobile-device'),
        _0x1cce4f = _0x4d131b ? 0x1b58 : 0x2710,
        removeDelay = _0x4d131b ? 0x1f40 : 0x2af8;
    balloonTimeouts['push'](setTimeout(() => _0x51d59f['classList']['add']('hide'), _0x1cce4f)), balloonTimeouts['push'](setTimeout(() => hideBalloon(), removeDelay));
}
const setupBalloonClick = () => {
    const _0x41496c = document['querySelector']('.tray-network-icon');
    if (!_0x41496c) return;
    _0x41496c['addEventListener']('click', showWelcomeBalloon), _0x41496c['addEventListener']('keydown', _0x42ebd6 => {
        (_0x42ebd6['key'] === 'Enter' || _0x42ebd6['key'] === '\x20') && (_0x42ebd6['preventDefault'](), showWelcomeBalloon());
    });
};
window['addEventListener']('DOMContentLoaded', () => {
    setupBalloonClick();
    const _0x3004ff = document['querySelector']('.tray-crt-toggle');
    if (_0x3004ff) {
        let _0x421927 = !![];
        const _0x239bba = () => {
            _0x421927 = !_0x421927, document['body']['classList']['remove']('crt-turning-on', 'crt-turning-off');
            _0x421927 ? (document['body']['classList']['add']('crt-turning-on'), setTimeout(() => {
                document['body']['classList']['remove']('crt-turning-on');
            }, 0x12c)) : (document['body']['classList']['add']('crt-turning-off'), setTimeout(() => {
                document['body']['classList']['remove']('crt-turning-off');
            }, 0xfa));
            const _0x43be98 = ['.crt-effect', '.crt-scanline', '.crt-vignette', '.crt-noise', '.crt-flicker', '.crt-aberration', '.crt-persistence'];
            _0x43be98['forEach'](_0x180862 => {
                const _0x4b82e2 = document['querySelector'](_0x180862);
                _0x4b82e2 && (_0x4b82e2['style']['display'] = _0x421927 ? 'block' : 'none', _0x180862 === '.crt-scanline' && _0x421927 && (_0x4b82e2['style']['transition'] = 'none', _0x4b82e2['style']['transform'] = 'translateY(-20px)', void _0x4b82e2['offsetHeight'], setTimeout(() => {
                    document['dispatchEvent'](new CustomEvent('reinitScanline'));
                }, 0x64)));
            }), _0x421927 ? document['body']['classList']['add']('crt-brightness') : document['body']['classList']['remove']('crt-brightness'), _0x3004ff['src'] = _0x421927 ? './assets/gui/taskbar/crt.webp' : './assets/gui/taskbar/crt-off.webp', _0x3004ff['setAttribute']('data-tooltip', _0x421927 ? 'CRT\x20Effects:\x20ON' : 'CRT\x20Effects:\x20OFF');
        };
        document['body']['classList']['add']('crt-brightness'), _0x3004ff['setAttribute']('data-tooltip', 'CRT\x20Effects:\x20ON'), _0x3004ff['addEventListener']('click', _0x239bba);
    }
    const _0xe20ed6 = document['querySelector']('.tray-fullscreen-icon');
    if (_0xe20ed6) {
        const _0xee0a0d = () => {
            hideBalloon(!![]);
            const _0x2c3f94 = document['documentElement'];
            if (document['fullscreenElement']) document['exitFullscreen']();
            else {
                if (_0x2c3f94['requestFullscreen']) _0x2c3f94['requestFullscreen']();
                else {
                    if (_0x2c3f94['mozRequestFullScreen']) _0x2c3f94['mozRequestFullScreen']();
                    else {
                        if (_0x2c3f94['webkitRequestFullscreen']) _0x2c3f94['webkitRequestFullscreen']();
                        else {
                            if (_0x2c3f94['msRequestFullscreen']) _0x2c3f94['msRequestFullscreen']();
                            else {}
                        }
                    }
                }
            }
        };
        _0xe20ed6['addEventListener']('click', _0xee0a0d);
    }
});