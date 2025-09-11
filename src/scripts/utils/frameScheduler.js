let scheduled = ![];
const readQueue = [],
    writeQueue = [],
    afterQueue = [];

function flush() {
    scheduled = ![];
    for (let _0x578a0d = 0x0; _0x578a0d < readQueue['length']; _0x578a0d++) {
        const _0x5b08ed = readQueue[_0x578a0d];
        try {
            _0x5b08ed();
        } catch (_0x48d070) {}
    }
    readQueue['length'] = 0x0;
    for (let _0x2d7ae3 = 0x0; _0x2d7ae3 < writeQueue['length']; _0x2d7ae3++) {
        const _0x30e489 = writeQueue[_0x2d7ae3];
        try {
            _0x30e489();
        } catch (_0x153684) {}
    }
    writeQueue['length'] = 0x0;
    for (let _0xb37066 = 0x0; _0xb37066 < afterQueue['length']; _0xb37066++) {
        const _0x10e5c5 = afterQueue[_0xb37066];
        try {
            _0x10e5c5();
        } catch (_0x5bb313) {}
    }
    afterQueue['length'] = 0x0;
}

function ensure() {
    !scheduled && (scheduled = !![], requestAnimationFrame(flush));
}
export function scheduleWrite(_0xd9e69c) {
    if (typeof _0xd9e69c !== 'function') return;
    writeQueue['push'](_0xd9e69c), ensure();
}
export function scheduleAfter(_0x27d1d0) {
    if (typeof _0x27d1d0 !== 'function') return;
    afterQueue['push'](_0x27d1d0), ensure();
}