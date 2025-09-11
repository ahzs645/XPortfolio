let scheduled = false;
const readQueue = [];
const writeQueue = [];
const afterQueue = [];

function flush() {
    scheduled = false;

    for (const task of readQueue) {
        try {
            task();
        } catch (err) {}
    }
    readQueue.length = 0;

    for (const task of writeQueue) {
        try {
            task();
        } catch (err) {}
    }
    writeQueue.length = 0;

    for (const task of afterQueue) {
        try {
            task();
        } catch (err) {}
    }
    afterQueue.length = 0;
}

function ensure() {
    if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
    }
}

export function scheduleWrite(task) {
    if (typeof task !== 'function') return;
    writeQueue.push(task);
    ensure();
}

export function scheduleAfter(task) {
    if (typeof task !== 'function') return;
    afterQueue.push(task);
    ensure();
}