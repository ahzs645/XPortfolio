window.addEventListener('message', (event) => {
    const appRoot = document.getElementById('appRoot');
    if (!appRoot || !event.data) return;

    const {
        type
    } = event.data;
    switch (type) {
        case 'window:maximized':
            appRoot.classList.add('maximized-mode');
            break;
        case 'window:unmaximized':
            appRoot.classList.remove('maximized-mode');
            break;
        case 'window-resized':
            appRoot.classList.add('resizing-window');
            document.body.classList.add('resizing-window');
            break;
        case 'window-resize-end':
            appRoot.classList.remove('resizing-window');
            document.body.classList.remove('resizing-window');
            break;
        default:
            break;
    }
});

function transformAssetPath(path) {
    if (!path) return path;
    if (path.startsWith('http:') || path.startsWith('https:') || path.startsWith('../../../')) {
        return path;
    }
    let correctedPath = path;
    if (correctedPath.startsWith('/')) {
        correctedPath = correctedPath.substring(1);
    }
    if (correctedPath.startsWith('assets/')) {
        return `../../../${correctedPath}`;
    }
    return correctedPath;
}

document.addEventListener('DOMContentLoaded', async () => {
    const resumeImage = document.getElementById('resumeImage');
    const appRoot = document.getElementById('appRoot');
    let uiConfig = null;

    try {
        const response = await fetch('../../../ui.json');
        uiConfig = await response.json();
    } catch (error) {
        console.error('Failed to load ui.json', error);
        return;
    }

    if (!uiConfig || !uiConfig.resume) return;

    if (resumeImage) {
        resumeImage.src = transformAssetPath(uiConfig.resume.webp);
    }

    function initializeZoomPan() {
        let isDragging = false;
        let startX;
        let startY;
        let scrollLeft;
        let scrollTop;
        let hasDragged = false;

        resumeImage.addEventListener('dragstart', (event) => event.preventDefault());

        resumeImage.addEventListener('click', (event) => {
            if (hasDragged || document.body.classList.contains('resizing-window')) {
                hasDragged = false;
                return;
            }

            const isZoomed = resumeImage.classList.contains('zoomed');
            if (!isZoomed) {
                const offsetX = event.offsetX;
                const offsetY = event.offsetY;
                const originalWidth = resumeImage.clientWidth;
                const originalHeight = resumeImage.clientHeight;

                if (originalWidth === 0 || originalHeight === 0) return;

                resumeImage.classList.add('zoomed');
                notifyToolbarZoomState(true);

                import('../../scripts/utils/frameScheduler.js').then(({
                    scheduleAfter
                }) => {
                    scheduleAfter(() => {
                        const newWidth = resumeImage.clientWidth;
                        const zoomFactor = newWidth / originalWidth;

                        const newOffsetX = offsetX * zoomFactor;
                        const newOffsetY = offsetY * zoomFactor;

                        const containerWidth = appRoot.clientWidth;
                        const containerHeight = appRoot.clientHeight;

                        let newScrollLeft = newOffsetX - containerWidth / 2;
                        let newScrollTop = newOffsetY - containerHeight / 2;

                        newScrollLeft = Math.max(0, Math.min(newScrollLeft, appRoot.scrollWidth - containerWidth));
                        newScrollTop = Math.max(0, Math.min(newScrollTop, appRoot.scrollHeight - containerHeight));

                        appRoot.scrollTo({
                            left: newScrollLeft,
                            top: newScrollTop,
                            behavior: 'auto',
                        });
                    });
                });
            } else {
                resumeImage.classList.remove('zoomed');
                appRoot.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'auto'
                });
                notifyToolbarZoomState(false);
            }

            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'resume-interaction'
                }, '*');
            }
        });

        resumeImage.addEventListener('mousedown', (event) => {
            if (!resumeImage.classList.contains('zoomed') || document.body.classList.contains('resizing-window')) return;
            isDragging = true;
            hasDragged = false;
            resumeImage.classList.add('dragging');
            startX = event.clientX;
            startY = event.clientY;
            scrollLeft = appRoot.scrollLeft;
            scrollTop = appRoot.scrollTop;
            event.preventDefault();
        });

        document.addEventListener('mousemove', (event) => {
            if (!isDragging || document.body.classList.contains('resizing-window')) return;
            event.preventDefault();
            hasDragged = true;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            appRoot.scrollLeft = scrollLeft - dx;
            appRoot.scrollTop = scrollTop - dy;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            resumeImage.classList.remove('dragging');
        });

        document.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                resumeImage.classList.remove('dragging');
            }
        });
    }

    if (resumeImage.complete && resumeImage.naturalWidth !== 0) {
        initializeZoomPan();
    } else {
        resumeImage.addEventListener('load', initializeZoomPan);
    }
});

document.addEventListener('click', () => {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'window:iframe-interaction'
        }, '*');
    }
});

function softResetResumeApp() {
    try {
        const resumeImage = document.getElementById('resumeImage');
        const appRoot = document.getElementById('appRoot');
        if (resumeImage) {
            resumeImage.classList.remove('zoomed', 'dragging');
        }
        if (appRoot) {
            appRoot.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            });
        }
    } catch (e) {
        //
    }
}

function notifyToolbarZoomState(isZoomed) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'toolbar:zoom-state',
            active: isZoomed,
        }, '*');
    }
}

window.addEventListener('message', (event) => {
    if (event ? .data ? .type === 'window:soft-reset') {
        softResetResumeApp();
    }
    if (event ? .data ? .type === 'toolbar:action') {
        if (event.data.action === 'toggleZoom') {
            const resumeImage = document.getElementById('resumeImage');
            if (resumeImage) {
                resumeImage.click();
            }
        }
    }
});