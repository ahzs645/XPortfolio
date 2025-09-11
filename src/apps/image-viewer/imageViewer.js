(function() {
    'use strict';
    const SWIPE_THRESHOLD = 0x19,
        VERTICAL_SWIPE_THRESHOLD = 0x64,
        ZOOM_SCALE_PORTRAIT = 1.5,
        ZOOM_SCALE_LANDSCAPE = 1.8;
    class ImageViewer {
        constructor() {
            this.currentImageIndex = 0x0, this.images = [], this.refreshTimer = null, this.lastImageSignature = '', this.touchStartX = 0x0, this.touchStartY = 0x0, this.isDragging = ![], this.didDrag = ![], this.isZoomed = ![], this.zoomScale = ZOOM_SCALE_PORTRAIT, this.panStart = null;
            const imageOffset = {};
            imageOffset.x = 0x0, imageOffset.y = 0x0, this.imageOffset = imageOffset;
            const accumulatedOffset = {};
            accumulatedOffset.x = 0x0, accumulatedOffset.y = 0x0, this.accumulatedOffset = accumulatedOffset, this.waitingForInitialIndex = ![], this.currentLoadingId = 0x0, this.isProjectMode = ![], this.currentProjectTitle = null, this.init();
        }
        async init() {
            const addressBarElement = window.parent?.document?.querySelector('#image-viewer-window .addressbar');
            let appLoader = null;
            if (addressBarElement) try {
                const appLoaderModule = await import('../../scripts/utils/appLoader.js'),
                    AppLoader = appLoaderModule.default;
                appLoader = new AppLoader('image-viewer', addressBarElement, () => {
                    if (window.parent && window.parent !== window) {
                        const message = {};
                        message.type = 'app-fully-loaded', message.appId = 'image-viewer-window', window.parent.postMessage(message, '*');
                    }
                }), appLoader.startLoading(0x5);
            } catch (error) {
                console.warn('AppLoader not available, continuing without progressive loading');
            }
            this.showLoading(), this.waitingForInitialIndex = !![], setTimeout(async () => {
                if (this.waitingForInitialIndex) {
                    this.waitingForInitialIndex = ![], await this.loadImagesFromProjectsJson();
                    if (this.images.length > 0x0) {
                        const initialImages = this.images.slice(0x0, 0x5).map(image => image.src);
                        appLoader && await appLoader.loadAssets(initialImages, 0x28, 0x5a);
                    }
                    this.loadImage(0x0);
                }
            }, 0x258), appLoader && await appLoader.loadAssets(['../../../projects.json'], 0xa, 0x1e), appLoader && appLoader.complete(), this.setupEventListeners(), this.startAutoRefresh(), this.setupResizeMessageListener();
        }
        showLoading() {
            const contentElement = document.querySelector('.image-viewer-content');
            contentElement && (contentElement.innerHTML = '<div class="iv-loading">Loading images...</div>');
        }
        async loadImagesFromProjectsJson() {
            try {
                const response = await fetch('../../../projects.json?ts=' + Date.now());
                if (!response.ok) throw new Error('Failed to fetch projects.json');
                const projects = await response.json(),
                    allImages = [],
                    imageExtensionRegex = /\.(webp|png|jpe?g|gif|avif)$/i;
                projects.forEach(project => {
                    Array.isArray(project.images) && project.images.forEach(image => {
                        if (!image || !image.src) return;
                        if (!imageExtensionRegex.test(image.src)) return;
                        const src = image.src.startsWith('assets/') ? '../../../' + image.src : image.src,
                            alt = typeof image.alt === 'string' && image.alt.trim().length ? image.alt.trim() : this.deriveAltFromFilename(image.src),
                            imageData = {};
                        imageData.src = src, imageData.alt = alt, imageData.orientation = project.orientation || 'portrait', allImages.push(imageData);
                    });
                });
                const uniqueSources = new Set(),
                    uniqueImages = [];
                for (const image of allImages) {
                    !uniqueSources.has(image.src) && (uniqueSources.add(image.src), uniqueImages.push(image));
                }
                this.images = uniqueImages, this.updateSignature();
                if (!this.images.length) this.showEmpty();
                this.isProjectMode = ![], this.currentProjectTitle = null;
            } catch (error) {
                this.showError(error.message || 'Error loading images');
            }
        }
        async filterImagesForProject(projectTitle) {
            try {
                const response = await fetch('../../../projects.json?ts=' + Date.now());
                if (!response.ok) throw new Error('Failed to fetch projects.json');
                const projects = await response.json(),
                    project = projects.find(p => p.title === projectTitle);
                if (!project) throw new Error('Project "' + projectTitle + '" not found');
                const projectImages = [],
                    imageExtensionRegex = /\.(webp|png|jpe?g|gif|avif)$/i;
                Array.isArray(project.images) && project.images.forEach(image => {
                    if (!image || !image.src) return;
                    if (!imageExtensionRegex.test(image.src)) return;
                    const src = image.src.startsWith('assets/') ? '../../../' + image.src : image.src,
                        alt = typeof image.alt === 'string' && image.alt.trim().length ? image.alt.trim() : this.deriveAltFromFilename(image.src),
                        imageData = {};
                    imageData.src = src, imageData.alt = alt, imageData.orientation = project.orientation || 'portrait', projectImages.push(imageData);
                });
                const uniqueSources = new Set(),
                    uniqueImages = [];
                for (const image of projectImages) {
                    !uniqueSources.has(image.src) && (uniqueSources.add(image.src), uniqueImages.push(image));
                }
                this.images = uniqueImages, this.updateSignature(), !this.images.length ? this.showEmpty() : (this.isProjectMode = !![], this.currentProjectTitle = projectTitle, this.updateAddressBar(projectTitle));
            } catch (error) {
                this.showError(error.message || 'Error filtering images for project');
            }
        }
        deriveAltFromFilename(filename) {
            const baseFilename = filename.split('/').pop() || filename;
            return baseFilename.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '').trim();
        }
        updateSignature() {
            this.lastImageSignature = this.images.map(image => image.src).join('|');
        }
        async refreshIfChanged() {
            const oldSignature = this.lastImageSignature;
            this.isProjectMode && this.currentProjectTitle ? await this.filterImagesForProject(this.currentProjectTitle) : await this.loadImagesFromProjectsJson();
            if (this.lastImageSignature !== oldSignature) {
                const currentImageSrc = this.images[this.currentImageIndex]?.src;
                !currentImageSrc && (this.currentImageIndex = 0x0), this.loadImage(this.currentImageIndex || 0x0);
            }
        }
        startAutoRefresh() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                this.refreshIfChanged();
            }, 0x7530);
        }
        showEmpty() {
            const contentElement = document.querySelector('.image-viewer-content');
            contentElement && (contentElement.innerHTML = '<div class="iv-empty">No project images found.</div>', this.updateStatusBar('No images available'));
        }
        showError(errorMessage) {
            const contentElement = document.querySelector('.image-viewer-content');
            contentElement && (contentElement.innerHTML = '<div class="iv-error">' + errorMessage + '</div>', this.updateStatusBar(errorMessage));
        }
        loadImage(index, forceReload = ![]) {
            if (!(index >= 0x0 && index < this.images.length)) return;
            this.currentImageIndex = index;
            const image = this.images[index],
                contentElement = document.querySelector('.image-viewer-content');
            if (contentElement) {
                if (forceReload) {
                    const loadingId = ++this.currentLoadingId;
                    !contentElement.querySelector('.iv-loading') && (contentElement.innerHTML = '<div class="iv-loading">Loading image...</div>');
                    const imgElement = document.createElement('img');
                    imgElement.decoding = 'async', imgElement.loading = 'eager', imgElement.src = image.src, imgElement.alt = image.alt, imgElement.style.transform = '', imgElement.style.transition = '', imgElement.style.cursor = '', imgElement.draggable = ![], imgElement.addEventListener('load', () => {
                        loadingId === this.currentLoadingId && contentElement && (contentElement.innerHTML = '', contentElement.appendChild(imgElement));
                    }), imgElement.addEventListener('error', () => {
                        loadingId === this.currentLoadingId && contentElement && (contentElement.innerHTML = '<div class="iv-error">Failed to load image</div>');
                    }), imgElement.addEventListener('dragstart', event => event.preventDefault()), imgElement.style.userSelect = 'none', imgElement.style.webkitUserDrag = 'none', imgElement.style.webkitUserSelect = 'none', imgElement.style.MozUserSelect = 'none', imgElement.addEventListener('click', () => {
                        if (this.didDrag) {
                            this.didDrag = ![];
                            return;
                        }!this.isZoomed ? this.toggleZoom() : this.toggleZoom();
                    });
                } else {
                    contentElement.innerHTML = '<img decoding="async" loading="lazy" src="' + image.src + '" alt="' + image.alt + '" />';
                    const imgElement = contentElement.querySelector('img');
                    imgElement && (imgElement.style.transform = '', imgElement.style.transition = '', imgElement.draggable = ![], imgElement.addEventListener('dragstart', event => event.preventDefault()), imgElement.style.userSelect = 'none', imgElement.style.webkitUserDrag = 'none', imgElement.style.webkitUserSelect = 'none', imgElement.style.MozUserSelect = 'none', imgElement.addEventListener('click', () => {
                        if (this.didDrag) {
                            this.didDrag = ![];
                            return;
                        }!this.isZoomed ? this.toggleZoom() : this.toggleZoom();
                    }));
                }
            }
            this.isZoomed = ![];
            const imageOffset = {};
            imageOffset.x = 0x0, imageOffset.y = 0x0, this.imageOffset = imageOffset;
            const accumulatedOffset = {};
            accumulatedOffset.x = 0x0, accumulatedOffset.y = 0x0, this.accumulatedOffset = accumulatedOffset, this.didDrag = ![], this.notifyToolbarZoomState(![]), this.updateStatusBar(image.alt);
        }
        updateStatusBar(statusText) {
            if (window.parent && window.parent !== window) {
                const message = {};
                message.type = 'update-status-bar', message.text = statusText, window.parent.postMessage(message, '*');
            }
        }
        nextImage() {
            const nextIndex = (this.currentImageIndex + 0x1) % this.images.length;
            this.loadImage(nextIndex);
        }
        previousImage() {
            const prevIndex = this.currentImageIndex === 0x0 ? this.images.length - 0x1 : this.currentImageIndex - 0x1;
            this.loadImage(prevIndex);
        }
        setupEventListeners() {
            window.addEventListener('message', async event => {
                if (event.data && event.data.type === 'toolbar:action') switch (event.data.action) {
                    case 'nextImage':
                        this.nextImage();
                        break;
                    case 'nav:back':
                        this.previousImage();
                        break;
                    case 'toggleZoom':
                        this.toggleZoom();
                        break;
                }
                event.data && event.data.type === 'projects:updated' && this.refreshIfChanged();
                if (event.data && event.data.type === 'set-initial-index') {
                    const initialIndex = parseInt(event.data.initialIndex, 0xa),
                        projectTitle = event.data.projectTitle;
                    this.waitingForInitialIndex = ![], projectTitle ? await this.filterImagesForProject(projectTitle) : await this.loadImagesFromProjectsJson(), !isNaN(initialIndex) && initialIndex >= 0x0 && initialIndex < this.images.length ? (this.currentImageIndex = initialIndex, this.loadImage(initialIndex, !![])) : this.loadImage(0x0, !![]);
                }
            }), this.setupTouchHandling();
        }
        setupResizeMessageListener() {
            window.addEventListener('message', event => {
                if (event.data && event.data.type === 'window-resized') document.body.classList.add('resizing-window');
                else {
                    if (event.data && event.data.type === 'window-resize-end') document.body.classList.remove('resizing-window'), this.handleWindowLayoutChange();
                    else event.data && (event.data.type === 'window:maximized' || event.data.type === 'window:unmaximized') && requestAnimationFrame(() => this.handleWindowLayoutChange());
                }
            });
        }
        handleWindowLayoutChange() {
            if (!this.isZoomed) return;
            const imgElement = document.querySelector('.image-viewer-content img');
            if (!imgElement) return;
            const oldBounds = this.computePanBounds(imgElement),
                oldMaxPanX = Math.max(Math.abs(oldBounds.minX), Math.abs(oldBounds.maxX)),
                oldMaxPanY = Math.max(Math.abs(oldBounds.minY), Math.abs(oldBounds.maxY));
            let panRatioX = 0x0,
                panRatioY = 0x0;
            if (oldMaxPanX > 0x0) panRatioX = this.imageOffset.x / oldMaxPanX;
            if (oldMaxPanY > 0x0) panRatioY = this.imageOffset.y / oldMaxPanY;
            const newBounds = this.computePanBounds(imgElement),
                newMaxPanX = Math.max(Math.abs(newBounds.minX), Math.abs(newBounds.maxX)),
                newMaxPanY = Math.max(Math.abs(newBounds.minY), Math.abs(newBounds.maxY));
            let newPanX = panRatioX * newMaxPanX,
                newPanY = panRatioY * newMaxPanY;
            newPanX = Math.max(newBounds.minX, Math.min(newBounds.maxX, newPanX)), newPanY = Math.max(newBounds.minY, Math.min(newBounds.maxY, newPanY));
            const newImageOffset = {};
            newImageOffset.x = newPanX, newImageOffset.y = newPanY, this.imageOffset = newImageOffset, this.accumulatedOffset = {
                ...this.imageOffset
            }, imgElement.style.transform = 'scale(' + this.zoomScale + ') translate(' + newPanX / this.zoomScale + 'px, ' + newPanY / this.zoomScale + 'px)';
        }
        setupTouchHandling() {
            const contentElement = document.querySelector('.image-viewer-content');
            if (!contentElement) return;
            const touchStartHandler = event => {
                    if (this.isZoomed) {
                        this.touchStartX = 0x0, this.touchStartY = 0x0, this.isDragging = ![];
                        return;
                    }
                    this.touchStartX = event.touches[0x0].clientX, this.touchStartY = event.touches[0x0].clientY, this.isDragging = ![];
                },
                touchMoveHandler = event => {
                    if (this.isZoomed) return;
                    if (!this.touchStartX) return;
                    const currentX = event.touches[0x0].clientX,
                        currentY = event.touches[0x0].clientY,
                        diffX = currentX - this.touchStartX,
                        diffY = Math.abs(currentY - this.touchStartY);
                    if (Math.abs(diffX) > 0xa && diffY < VERTICAL_SWIPE_THRESHOLD) {
                        this.isDragging = !![], event.preventDefault();
                        const imgElement = contentElement.querySelector('img');
                        imgElement && (imgElement.style.transform = 'translateX(' + diffX * 0.5 + 'px)', imgElement.style.transition = 'none');
                    }
                },
                touchEndHandler = event => {
                    if (this.isZoomed) return;
                    if (!this.touchStartX || !this.isDragging) return;
                    const diffX = event.changedTouches[0x0].clientX - this.touchStartX;
                    if (Math.abs(diffX) > SWIPE_THRESHOLD) diffX > 0x0 ? this.previousImage() : this.nextImage();
                    else {
                        const imgElement = contentElement.querySelector('img');
                        imgElement && (imgElement.style.transform = '', imgElement.style.transition = 'transform 0.3s ease');
                    }
                    this.touchStartX = 0x0, this.touchStartY = 0x0, this.isDragging = ![];
                },
                touchStartOptions = {};
            touchStartOptions.passive = !![], contentElement.addEventListener('touchstart', touchStartHandler, touchStartOptions);
            const touchMoveOptions = {};
            touchMoveOptions.passive = ![], contentElement.addEventListener('touchmove', touchMoveHandler, touchMoveOptions);
            const touchEndOptions = {};
            touchEndOptions.passive = !![], contentElement.addEventListener('touchend', touchEndHandler, touchEndOptions);
        }
        toggleZoom() {
            const imgElement = document.querySelector('.image-viewer-content img');
            if (!imgElement) return;
            this.isZoomed = !this.isZoomed;
            const imageOffset = {};
            imageOffset.x = 0x0, imageOffset.y = 0x0, this.imageOffset = imageOffset;
            const accumulatedOffset = {};
            accumulatedOffset.x = 0x0, accumulatedOffset.y = 0x0, this.accumulatedOffset = accumulatedOffset;
            if (this.isZoomed) {
                const image = this.images[this.currentImageIndex],
                    orientation = image && image.orientation ? image.orientation : 'portrait';
                this.zoomScale = orientation === 'landscape' ? ZOOM_SCALE_LANDSCAPE : ZOOM_SCALE_PORTRAIT, imgElement.style.transform = 'scale(' + this.zoomScale + ')', imgElement.classList.add('zoomed'), this.enablePan(imgElement), this.notifyToolbarZoomState(!![]);
            } else this.zoomScale = ZOOM_SCALE_PORTRAIT, imgElement.style.transform = '', imgElement.classList.remove('zoomed'), this.disablePan(imgElement), this.notifyToolbarZoomState(![]);
        }
        notifyToolbarZoomState(isZoomed) {
            if (window.parent && window.parent !== window) {
                const message = {};
                message.type = 'toolbar:zoom-state', message.active = isZoomed, window.parent.postMessage(message, '*');
            }
        }
        updateAddressBar(projectTitle = null) {
            if (window.parent && window.parent !== window) {
                const addressBarTitle = projectTitle ? 'C:\\Users\\Mitch\\Projects\\' + projectTitle.replace(/\s+/g, '') : 'C:\\Users\\Mitch\\Assets',
                    message = {};
                message.type = 'update-address-bar', message.title = addressBarTitle, window.parent.postMessage(message, '*');
            }
        }
        enablePan(imgElement) {
            const onPointerDown = event => {
                    if (!this.isZoomed || event.button !== 0x0) return;
                    const panStart = {};
                    panStart.x = event.clientX, panStart.y = event.clientY, this.panStart = panStart, this.didDrag = ![], imgElement.classList.add('dragging');
                    try {
                        imgElement.setPointerCapture(event.pointerId);
                    } catch (error) {
                        void error;
                    }
                },
                onPointerMove = event => {
                    if (!this.isZoomed || !this.panStart) return;
                    const dx = event.clientX - this.panStart.x,
                        dy = event.clientY - this.panStart.y;
                    (Math.abs(dx) > 0x1 || Math.abs(dy) > 0x1) && (this.didDrag = !![]);
                    let newX = this.accumulatedOffset.x + dx,
                        newY = this.accumulatedOffset.y + dy;
                    const bounds = this.computePanBounds(imgElement);
                    newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX)), newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
                    const imageOffset = {};
                    imageOffset.x = newX, imageOffset.y = newY, this.imageOffset = imageOffset, imgElement.style.transform = 'scale(' + this.zoomScale + ') translate(' + newX / this.zoomScale + 'px, ' + newY / this.zoomScale + 'px)';
                },
                onPointerUp = event => {
                    this.panStart && (this.accumulatedOffset = {
                        ...this.imageOffset
                    });
                    this.panStart = null, imgElement.classList.remove('dragging');
                    try {
                        imgElement.releasePointerCapture(event.pointerId);
                    } catch (error) {
                        void error;
                    }
                },
                onTouchStart = event => {
                    if (!this.isZoomed || event.touches.length !== 0x1) return;
                    const touch = event.touches[0x0],
                        panStart = {};
                    panStart.x = touch.clientX, panStart.y = touch.clientY, this.panStart = panStart, this.didDrag = ![], imgElement.classList.add('dragging');
                },
                onTouchMove = event => {
                    if (!this.isZoomed || !this.panStart || event.touches.length !== 0x1) return;
                    const touch = event.touches[0x0],
                        dx = touch.clientX - this.panStart.x,
                        dy = touch.clientY - this.panStart.y;
                    (Math.abs(dx) > 0x1 || Math.abs(dy) > 0x1) && (this.didDrag = !![]);
                    let newX = this.accumulatedOffset.x + dx,
                        newY = this.accumulatedOffset.y + dy;
                    const bounds = this.computePanBounds(imgElement);
                    newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX)), newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
                    const imageOffset = {};
                    imageOffset.x = newX, imageOffset.y = newY, this.imageOffset = imageOffset, imgElement.style.transform = 'scale(' + this.zoomScale + ') translate(' + newX / this.zoomScale + 'px, ' + newY / this.zoomScale + 'px)', event.preventDefault();
                },
                onTouchEnd = () => {
                    if (!this.isZoomed) return;
                    this.accumulatedOffset = {
                        ...this.imageOffset
                    }, this.panStart = null, imgElement.classList.remove('dragging');
                },
                onTouchCancel = () => {
                    if (!this.isZoomed) return;
                    this.panStart = null, imgElement.classList.remove('dragging');
                },
                zoomHandlers = {};
            zoomHandlers.onPointerDown = onPointerDown, zoomHandlers.onPointerMove = onPointerMove, zoomHandlers.onPointerUp = onPointerUp, zoomHandlers.onTouchStart = onTouchStart, zoomHandlers.onTouchMove = onTouchMove, zoomHandlers.onTouchEnd = onTouchEnd, zoomHandlers.onTouchCancel = onTouchCancel, this._zoomHandlers = zoomHandlers, imgElement.addEventListener('pointerdown', onPointerDown), imgElement.addEventListener('pointermove', event => {
                if (this.isZoomed) event.preventDefault();
                onPointerMove(event);
            }), imgElement.addEventListener('pointerup', onPointerUp), imgElement.addEventListener('pointerleave', onPointerUp), imgElement.addEventListener('pointercancel', onPointerUp);
            const touchStartOptions = {};
            touchStartOptions.passive = !![], imgElement.addEventListener('touchstart', onTouchStart, touchStartOptions);
            const touchMoveOptions = {};
            touchMoveOptions.passive = ![], imgElement.addEventListener('touchmove', onTouchMove, touchMoveOptions);
            const touchEndOptions = {};
            touchEndOptions.passive = !![], imgElement.addEventListener('touchend', onTouchEnd, touchEndOptions);
            const touchCancelOptions = {};
            touchCancelOptions.passive = !![], imgElement.addEventListener('touchcancel', onTouchCancel, touchCancelOptions);
        }
        disablePan(imgElement) {
            if (this._zoomHandlers) {
                const {
                    onPointerDown: onPointerDown,
                    onPointerMove: onPointerMove,
                    onPointerUp: onPointerUp,
                    onTouchStart: onTouchStart,
                    onTouchMove: onTouchMove,
                    onTouchEnd: onTouchEnd,
                    onTouchCancel: onTouchCancel
                } = this._zoomHandlers;
                imgElement.removeEventListener('pointerdown', onPointerDown), imgElement.removeEventListener('pointermove', onPointerMove), imgElement.removeEventListener('pointerup', onPointerUp), imgElement.removeEventListener('pointerleave', onPointerUp), imgElement.removeEventListener('pointercancel', onPointerUp), imgElement.removeEventListener('touchstart', onTouchStart), imgElement.removeEventListener('touchmove', onTouchMove), imgElement.removeEventListener('touchend', onTouchEnd), imgElement.removeEventListener('touchcancel', onTouchCancel);
            }
            this._zoomHandlers = null;
        }
        computePanBounds(imgElement) {
            const container = imgElement.parentElement,
                bounds = {};
            bounds.minX = 0x0, bounds.maxX = 0x0, bounds.minY = 0x0, bounds.maxY = 0x0;
            if (!container) return bounds;
            const containerRect = container.getBoundingClientRect(),
                naturalWidth = imgElement.naturalWidth,
                naturalHeight = imgElement.naturalHeight,
                defaultBounds = {};
            defaultBounds.minX = 0x0, defaultBounds.maxX = 0x0, defaultBounds.minY = 0x0, defaultBounds.maxY = 0x0;
            if (!naturalWidth || !naturalHeight) return defaultBounds;
            const containerRatio = containerRect.width / containerRect.height,
                imageRatio = naturalWidth / naturalHeight;
            let baseDisplayW, baseDisplayH;
            imageRatio > containerRatio ? (baseDisplayW = containerRect.width, baseDisplayH = baseDisplayW / imageRatio) : (baseDisplayH = containerRect.height, baseDisplayW = baseDisplayH * imageRatio);
            const zoomedWidth = baseDisplayW * this.zoomScale,
                zoomedHeight = baseDisplayH * this.zoomScale,
                overflowX = Math.max(0x0, zoomedWidth - containerRect.width),
                overflowY = Math.max(0x0, zoomedHeight - containerRect.height),
                panBias = 0x0,
                panOffsetX = overflowX * panBias,
                panOffsetY = overflowY * panBias,
                panBounds = {};
            return panBounds.minX = -(overflowX / 0x2) - panOffsetX, panBounds.maxX = overflowX / 0x2 + panOffsetX, panBounds.minY = -(overflowY / 0x2) - panOffsetY, panBounds.maxY = overflowY / 0x2 + panOffsetY, panBounds;
        }
    }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => {
        new ImageViewer();
    }) : new ImageViewer();
}());
