import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

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
    if (appRoot && appRoot.classList.contains('app-scroll')) {
        appRoot.classList.remove('app-scroll');
    }
    
    try {
        const portfolio = new PortfolioManager();
        await portfolio.initialize();
        
        // Get CV PDF URL for resume display
        const cvPdfUrl = portfolio.getCVPDFUrl();
        const displayMode = portfolio.getPDFDisplayMode();
        
        if (displayMode === 'image' && resumeImage) {
            // If we have a resume image asset, use it
            resumeImage.src = '../../../assets/apps/resume/resume.webp';
        } else if (displayMode === 'embed') {
            // Check if PDF.js should be used for better control
            const shouldUsePDFJS = portfolio.shouldUsePDFJS();
            
            if (shouldUsePDFJS) {
                // Render with PDF.js for crisp zoom
                const viewer = document.createElement('div');
                viewer.className = 'pdf-viewer window-body';
                viewer.id = 'resumePdfViewer';
                if (resumeImage && resumeImage.parentNode) {
                    resumeImage.parentNode.replaceChild(viewer, resumeImage);
                }

                if (appRoot) {
                    appRoot.style.overflow = 'hidden';
                    appRoot.classList.add('pdf-mode');
                }

                await initPDFJSViewer(cvPdfUrl, viewer);
                return; // Skip image zoom/pan functionality
            } else {
                // Fallback to direct PDF embed with Chrome control hiding attempts
                const pdfEmbed = document.createElement('iframe');
                const baseSrc = cvPdfUrl;
                const buildPdfSrc = (zoom) => `${baseSrc}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=${zoom}`;
                const pdfUrl = buildPdfSrc('page-width');
                
                pdfEmbed.src = pdfUrl;
                pdfEmbed.style.width = '100%';
                pdfEmbed.style.height = '100%';
                pdfEmbed.style.border = 'none';
                pdfEmbed.style.overflow = 'hidden';
                
                pdfEmbed.setAttribute('scrolling', 'auto');
                pdfEmbed.setAttribute('allowfullscreen', 'false');
                pdfEmbed.id = 'resumePdf';
                pdfEmbed.dataset.viewer = 'native';
                pdfEmbed.dataset.baseSrc = baseSrc;
                pdfEmbed.dataset.zoomed = 'false';
                
                if (resumeImage && resumeImage.parentNode) {
                    resumeImage.parentNode.replaceChild(pdfEmbed, resumeImage);
                }
                
                if (appRoot) {
                    appRoot.style.overflow = 'hidden';
                    appRoot.classList.add('pdf-mode');
                }
                
                return; // Skip zoom/pan functionality for PDF
            }
        } else if (resumeImage) {
            // Default to existing resume image
            resumeImage.src = '../../../assets/apps/resume/resume.webp';
        }
    } catch (error) {
        console.error('Failed to load portfolio data for resume:', error);
        // Fallback to default resume image
        if (resumeImage) {
            resumeImage.src = '../../../assets/apps/resume/resume.webp';
        }
    }
    
    if (!resumeImage) return;

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
    if (event && event.data && event.data.type === 'window:soft-reset') {
        softResetResumeApp();
    }
    if (event && event.data && event.data.type === 'toolbar:action') {
        if (event.data.action === 'toggleZoom') {
            const resumeImage = document.getElementById('resumeImage');
            const pdfIframe = document.getElementById('resumePdf');
            const pdfViewer = document.getElementById('resumePdfViewer');
            if (resumeImage) {
                // Image mode zoom toggle
                resumeImage.click();
            } else if (pdfViewer && window.__RESUME_PDF_VIEWER__) {
                // PDF.js viewer: toggle between fit width and 150%
                window.__RESUME_PDF_VIEWER__.toggleZoom();
            } else if (pdfViewer && !window.__RESUME_PDF_VIEWER__) {
                // Viewer exists but not ready yet — queue the action
                window.__RESUME_PDF_PENDING_TOGGLE__ = true;
            } else if (pdfIframe && pdfIframe.dataset.viewer === 'native') {
                // Native PDF viewer: use built-in zoom (crisp text)
                const baseSrc = pdfIframe.dataset.baseSrc || '';
                const zoomed = pdfIframe.dataset.zoomed === 'true';
                const nextZoom = zoomed ? 'page-width' : '150';
                const nextSrc = `${baseSrc}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=${nextZoom}`;
                try {
                    pdfIframe.src = nextSrc;
                    pdfIframe.dataset.zoomed = (!zoomed).toString();
                    notifyToolbarZoomState(!zoomed);
                } catch (_) {
                    // ignore
                }
            }
        }
    }
});

// ===== PDF.js minimal viewer =====
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function initPDFJSViewer(pdfUrl, container) {
    try {
        const base = 'https://unpkg.com/pdfjs-dist@3.11.174/build';
        await loadScript(base + '/pdf.min.js');
        if (window['pdfjsLib']) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + '/pdf.worker.min.js';
        }
        const pdfjs = window['pdfjsLib'];
        const doc = await pdfjs.getDocument(pdfUrl).promise;

        const state = {
            doc,
            scaleMode: 'fit', // 'fit' or 'zoomed'
            baseScale: 1.0,
            currentScale: 1.0,
            container,
        };

        async function renderPages() {
            container.innerHTML = '';
            const probe = await doc.getPage(1);
            const probeViewport = probe.getViewport({ scale: 1.0 });
            const fitScale = Math.min((container.clientWidth - 24) / probeViewport.width, 3);
            state.baseScale = fitScale > 0 ? fitScale : 1.0;
            state.currentScale = state.scaleMode === 'fit' ? state.baseScale : state.baseScale * 1.5;

            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: state.currentScale });
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const ctx = canvas.getContext('2d');
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                container.appendChild(canvas);
                await page.render({ canvasContext: ctx, viewport }).promise;
            }

            notifyToolbarZoomState(state.scaleMode !== 'fit');
            // Toggle container class to control scrollbars
            container.classList.toggle('zoomed', state.scaleMode !== 'fit');
        }

        state.toggleZoom = async () => {
            state.scaleMode = state.scaleMode === 'fit' ? 'zoomed' : 'fit';
            await renderPages();
        };

        window.__RESUME_PDF_VIEWER__ = state;
        window.__RESUME_PDF_VIEWER_READY__ = true;

        await renderPages();
        // Apply any queued zoom toggle
        if (window.__RESUME_PDF_PENDING_TOGGLE__) {
            window.__RESUME_PDF_PENDING_TOGGLE__ = false;
            await state.toggleZoom();
        }
        window.addEventListener('resize', () => {
            if (state.scaleMode === 'fit') renderPages();
        });
    } catch (err) {
        console.error('Failed to initialize PDF.js viewer:', err);
        try {
            // Fallback to native iframe embed if PDF.js fails (e.g., offline CDN)
            const iframe = document.createElement('iframe');
            const baseSrc = pdfUrl;
            const buildPdfSrc = (zoom) => `${baseSrc}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=${zoom}`;
            iframe.src = buildPdfSrc('page-width');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden';
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('allowfullscreen', 'false');
            iframe.id = 'resumePdf';
            iframe.dataset.viewer = 'native';
            iframe.dataset.baseSrc = baseSrc;
            iframe.dataset.zoomed = 'false';
            container.innerHTML = '';
            container.appendChild(iframe);
            notifyToolbarZoomState(false);
        } catch (_) {
            // give up silently
        }
    }
}
