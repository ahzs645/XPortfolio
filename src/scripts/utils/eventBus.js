const _0x4ed6a4 = {};
_0x4ed6a4['PROGRAM_OPEN'] = 'program:open', _0x4ed6a4['WINDOW_CREATED'] = 'window:created', _0x4ed6a4['WINDOW_CLOSED'] = 'window:closed', _0x4ed6a4['WINDOW_FOCUSED'] = 'window:focused', _0x4ed6a4['WINDOW_BLURRED'] = 'window:blurred', _0x4ed6a4['WINDOW_MAXIMIZED'] = 'window:maximized', _0x4ed6a4['WINDOW_UNMAXIMIZED'] = 'window:unmaximized', _0x4ed6a4['WINDOW_MINIMIZED'] = 'window:minimized', _0x4ed6a4['WINDOW_RESTORED'] = 'window:restored', _0x4ed6a4['LOG_OFF_CONFIRMATION_REQUESTED'] = 'logOffConfirmationRequested', _0x4ed6a4['SHUTDOWN_REQUESTED'] = 'shutdownRequested', _0x4ed6a4['TASKBAR_ITEM_CLICKED'] = 'taskbar:item:clicked', _0x4ed6a4['STARTMENU_TOGGLE'] = 'startMenuToggle', _0x4ed6a4['STARTMENU_OPENED'] = 'startmenu:opened', _0x4ed6a4['STARTMENU_CLOSED'] = 'startmenu:closed', _0x4ed6a4['STARTMENU_CLOSE_REQUEST'] = 'startmenu:close-request', _0x4ed6a4['LOG_OFF_REQUESTED'] = 'logoff:requested', _0x4ed6a4['MUSIC_PLAYER_PLAYING'] = 'musicplayer:playing', _0x4ed6a4['MUSIC_PLAYER_STOPPED'] = 'musicplayer:stopped', _0x4ed6a4['MUSIC_PLAYER_PRELOAD_READY'] = 'musicplayer:preloadready', _0x4ed6a4['MEDIA_PLAYER_PLAYING'] = 'mediaplayer:playing', _0x4ed6a4['MEDIA_PLAYER_STOPPED'] = 'mediaplayer:stopped', _0x4ed6a4['MEDIA_GLOBAL_PAUSE'] = 'media:global:pause', _0x4ed6a4['MEDIA_GLOBAL_VISIBLE'] = 'media:global:visible', _0x4ed6a4['PROGRAM_CLOSE_REQUESTED'] = 'program:close_requested';
export const EVENTS = _0x4ed6a4;
class EventBus {
    constructor() {
        this['events'] = {};
    } ['subscribe'](_0x354027, _0x4fedf4) {
        return (this['events'][_0x354027] ??= [])['push'](_0x4fedf4), () => this['unsubscribe'](_0x354027, _0x4fedf4);
    } ['unsubscribe'](_0x2d8d98, _0x3a445e) {
        this['events'][_0x2d8d98] && this['events'][_0x2d8d98]['length'] > 0x0 && (this['events'][_0x2d8d98] = this['events'][_0x2d8d98]['filter'](_0x51310b => _0x51310b !== _0x3a445e));
    } ['publish'](_0x5c0796, _0x46b4c1) {
        const _0x2ccb88 = this['events'][_0x5c0796];
        if (!_0x2ccb88 || _0x2ccb88['length'] === 0x0) return;
        const _0x250de0 = _0x2ccb88['length'];
        for (let _0x39c87d = 0x0; _0x39c87d < _0x250de0; _0x39c87d += 0x1) {
            const _0x41dde2 = _0x2ccb88[_0x39c87d];
            try {
                _0x41dde2(_0x46b4c1);
            } catch (_0x340791) {
                console['error']('Error\x20in\x20event\x20handler\x20for\x20' + _0x5c0796 + ':', _0x340791);
            }
        }
    }
}
export const eventBus = new EventBus();