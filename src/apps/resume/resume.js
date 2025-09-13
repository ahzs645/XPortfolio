import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

// Minimal window resize state hook (optional styling)
window.addEventListener('message', (event) => {
    const appRoot = document.getElementById('appRoot');
    if (!appRoot || !event.data) return;
    const { type } = event.data;
    if (type === 'window-resized') {
        appRoot.classList.add('resizing-window');
        document.body.classList.add('resizing-window');
    } else if (type === 'window-resize-end') {
        appRoot.classList.remove('resizing-window');
        document.body.classList.remove('resizing-window');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const appRoot = document.getElementById('appRoot');
    const viewer = document.getElementById('resumePdfViewer');
    try {
        const portfolio = new PortfolioManager();
        await portfolio.initialize();
        const cvPdfUrl = portfolio.getCVPDFUrl();

        // Always use the PDF.js viewer to keep behavior consistent and simple
        if (appRoot) appRoot.style.overflow = 'hidden';
        await initPDFJSViewer(cvPdfUrl, viewer);
    } catch (error) {
        console.error('Failed to load resume PDF:', error);
        // Fallback to a native iframe if PDF.js/CDN fails in init function
        try {
            await initPDFJSViewer(null, viewer);
        } catch (_) {}
    }
});

function softResetResumeApp() {
    try {
        const viewer = document.getElementById('resumePdfViewer');
        if (viewer) viewer.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {}
}

function notifyToolbarZoomState(isZoomed) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'toolbar:zoom-state',
            active: isZoomed,
        }, '*');
    }
}

// Toolbar integration: toggle between fit-width and 150%
window.addEventListener('message', (event) => {
    if (event && event.data && event.data.type === 'window:soft-reset') {
        softResetResumeApp();
    }
    if (event && event.data && event.data.type === 'toolbar:action') {
        if (event.data.action === 'toggleZoom') {
            const pdfViewer = document.getElementById('resumePdfViewer');
            if (pdfViewer && window.__RESUME_PDF_VIEWER__) {
                window.__RESUME_PDF_VIEWER__.toggleZoom();
            } else if (pdfViewer && !window.__RESUME_PDF_VIEWER__) {
                window.__RESUME_PDF_PENDING_TOGGLE__ = true;
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
        const url = pdfUrl || '';
        const doc = await pdfjs.getDocument(url).promise;

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
            const cs = getComputedStyle(container);
            const paddingX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            const fitScale = Math.min((container.clientWidth - paddingX) / probeViewport.width, 3);
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
                canvas.style.width = `${Math.ceil(viewport.width)}px`;
                canvas.style.height = `${Math.ceil(viewport.height)}px`;
                container.appendChild(canvas);
                await page.render({ canvasContext: ctx, viewport }).promise;
            }

            notifyToolbarZoomState(state.scaleMode !== 'fit');
            container.classList.toggle('zoomed', state.scaleMode !== 'fit');
        }

        state.toggleZoom = async () => {
            state.scaleMode = state.scaleMode === 'fit' ? 'zoomed' : 'fit';
            await renderPages();
        };

        window.__RESUME_PDF_VIEWER__ = state;
        window.__RESUME_PDF_VIEWER_READY__ = true;

        await renderPages();
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
            const baseSrc = pdfUrl || '';
            const buildPdfSrc = (zoom) => `${baseSrc}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=${zoom}`;
            iframe.src = buildPdfSrc('page-width');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'auto';
            iframe.setAttribute('scrolling', 'auto');
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
