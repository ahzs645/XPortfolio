import { eventBus, EVENTS } from './eventBus.js';

const publishQueue = [];
const coalesceMap = new Map();
let rafScheduled = false;

const defaultConfig = {
    autoFrameFlush: true,
    frameSchedulerLazyImport: true,
    useMicrotaskPriming: true
};

let config = defaultConfig;

const coalescableEvents = new Set([
    EVENTS.WINDOW_FOCUSED,
    EVENTS.WINDOW_BLURRED,
    EVENTS.WINDOW_MAXIMIZED,
    EVENTS.WINDOW_UNMAXIMIZED,
    EVENTS.WINDOW_MINIMIZED,
    EVENTS.WINDOW_RESTORED,
    EVENTS.STARTMENU_TOGGLE,
    EVENTS.STARTMENU_CLOSE_REQUEST,
    EVENTS.STARTMENU_OPENED,
    EVENTS.STARTMENU_CLOSED,
    EVENTS.TASKBAR_ITEM_CLICKED,
    EVENTS.MUSIC_PLAYER_PLAYING,
    EVENTS.MUSIC_PLAYER_STOPPED,
    EVENTS.MEDIA_PLAYER_PLAYING,
    EVENTS.MEDIA_PLAYER_STOPPED
]);

function scheduleFlush() {
    if (rafScheduled || !config.autoFrameFlush) return;
    rafScheduled = true;
    if (config.frameSchedulerLazyImport) {
        import('./frameScheduler.js')
            .then(({ scheduleAfter }) => {
                scheduleAfter(flushEventBusQueue);
            })
            .catch(() => {
                requestAnimationFrame(flushEventBusQueue);
            });
    } else {
        requestAnimationFrame(flushEventBusQueue);
    }
}

export function batchedPublish(event, data) {
    const shouldCoalesce = coalescableEvents.has(event) || (data && data.__coalesce === true);
    if (shouldCoalesce) {
        coalesceMap.set(event, {
            event,
            data,
            ts: Date.now(),
            coalesced: true
        });
    } else {
        publishQueue.push({
            event,
            data,
            ts: Date.now(),
            coalesced: false
        });
    }
    scheduleFlush();
}

export function flushEventBusQueue() {
    rafScheduled = false;
    if (coalesceMap.size) {
        const coalescedEvents = Array.from(coalesceMap.values()).sort((a, b) => a.ts - b.ts);
        for (const entry of coalescedEvents) {
            publishQueue.push(entry);
        }
        coalesceMap.clear();
    }
    if (!publishQueue.length) return;
    while (publishQueue.length) {
        const { event, data } = publishQueue.shift();
        try {
            eventBus.publish(event, data);
        } catch (err) {}
    }
}