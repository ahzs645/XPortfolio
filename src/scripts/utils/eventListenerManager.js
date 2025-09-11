const listenerRegistry = new Map(),
    elementListeners = new WeakMap();
let nextListenerId = 0x1;
export function addManagedEventListener(element, eventType, handler, options = {}) {
    if (!element || typeof handler !== 'function') throw new Error('addManagedEventListener:\x20Invalid\x20element\x20or\x20handler');
    const listenerId = nextListenerId++,
        listenerOptions = options['listenerOptions'];
    element['addEventListener'](eventType, handler, listenerOptions);
    const removeListener = () => {
            element['removeEventListener'](eventType, handler, listenerOptions);
        },
        entry = {
            'id': listenerId,
            'element': element,
            'eventType': eventType,
            'handler': handler,
            'cleanup': removeListener,
            'timestamp': Date['now'](),
            'options': options
        };
    return listenerRegistry['set'](listenerId, entry), !elementListeners['has'](element) && elementListeners['set'](element, new Set()), elementListeners['get'](element)['add'](listenerId),
        function unlisten() {
            removeListener(), listenerRegistry['delete'](listenerId);
            const elementSet = elementListeners['get'](element);
            elementSet && (elementSet['delete'](listenerId), elementSet['size'] === 0x0 && elementListeners['delete'](element));
        };
}
export function addManagedResizeListener(resizeHandler, opts = {}) {
    const config = {
        'performanceOptimized': !![],
        'useDebounce': !![],
        ...opts
    };
    return addManagedEventListener(window, 'resize', resizeHandler, config);
}
export function addManagedOrientationListener(orientationHandler, opts = {}) {
    const config = {
        'performanceOptimized': !![],
        'immediate': !![],
        ...opts
    };
    return addManagedEventListener(window, 'orientationchange', orientationHandler, config);
}