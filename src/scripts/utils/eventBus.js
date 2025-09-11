export const EVENTS = {
    PROGRAM_OPEN: 'program:open',
    WINDOW_CREATED: 'window:created',
    WINDOW_CLOSED: 'window:closed',
    WINDOW_FOCUSED: 'window:focused',
    WINDOW_BLURRED: 'window:blurred',
    WINDOW_MAXIMIZED: 'window:maximized',
    WINDOW_UNMAXIMIZED: 'window:unmaximized',
    WINDOW_MINIMIZED: 'window:minimized',
    WINDOW_RESTORED: 'window:restored',
    LOG_OFF_CONFIRMATION_REQUESTED: 'logOffConfirmationRequested',
    SHUTDOWN_REQUESTED: 'shutdownRequested',
    TASKBAR_ITEM_CLICKED: 'taskbar:item:clicked',
    STARTMENU_TOGGLE: 'startMenuToggle',
    STARTMENU_OPENED: 'startmenu:opened',
    STARTMENU_CLOSED: 'startmenu:closed',
    STARTMENU_CLOSE_REQUEST: 'startmenu:close-request',
    LOG_OFF_REQUESTED: 'logoff:requested',
    MUSIC_PLAYER_PLAYING: 'musicplayer:playing',
    MUSIC_PLAYER_STOPPED: 'musicplayer:stopped',
    MUSIC_PLAYER_PRELOAD_READY: 'musicplayer:preloadready',
    MEDIA_PLAYER_PLAYING: 'mediaplayer:playing',
    MEDIA_PLAYER_STOPPED: 'mediaplayer:stopped',
    MEDIA_GLOBAL_PAUSE: 'media:global:pause',
    MEDIA_GLOBAL_VISIBLE: 'media:global:visible',
    PROGRAM_CLOSE_REQUESTED: 'program:close_requested'
};

class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(eventName, handler) {
        (this.events[eventName] ??= []).push(handler);
        return () => this.unsubscribe(eventName, handler);
    }

    unsubscribe(eventName, handler) {
        if (this.events[eventName] && this.events[eventName].length > 0) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== handler);
        }
    }

    publish(eventName, data) {
        const handlers = this.events[eventName];
        if (!handlers || handlers.length === 0) return;
        const length = handlers.length;
        for (let i = 0; i < length; i++) {
            const cb = handlers[i];
            try {
                cb(data);
            } catch (err) {
                console.error('Error in event handler for ' + eventName + ':', err);
            }
        }
    }
}

export const eventBus = new EventBus();