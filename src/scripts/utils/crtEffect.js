const SCANLINE_MIN_DELAY_MS = 0x3e8,
    SCANLINE_MAX_DELAY_MS = 0xbb8,
    SCANLINE_BASE_DURATION_MS = 0xbb8,
    SCANLINE_DURATION_RANDOM_ADDITION_MS = 0x3e8;
export function initRandomScanline() {
    const scanlineElement = document['querySelector']('.crt-scanline');
    if (!scanlineElement) return;
    let hasStarted = ![];
    scanlineElement['addEventListener']('transitionend', () => {
        scanlineElement['style']['willChange'] = 'auto', scanlineElement['style']['transition'] = 'none', scanlineElement['style']['transform'] = 'translateY(-20px)';
        const delay = SCANLINE_MIN_DELAY_MS + Math['random']() * SCANLINE_MAX_DELAY_MS;
        setTimeout(startScanline, delay);
    });

    function startScanline() {
        void scanlineElement['offsetWidth'];
        const duration = SCANLINE_BASE_DURATION_MS + Math['random']() * SCANLINE_DURATION_RANDOM_ADDITION_MS;
        scanlineElement['style']['willChange'] = 'transform', scanlineElement['style']['transition'] = 'transform\x20' + duration + 'ms\x20linear', scanlineElement['style']['transform'] = 'translateY(100vh)', hasStarted = !![];
    }
    const onceOption = {};
    onceOption['once'] = !![], document['querySelector']('.desktop')['addEventListener']('click', () => {
        !hasStarted && startScanline();
    }, onceOption), document['addEventListener']('reinitScanline', () => {
        setTimeout(startScanline, 0x1f4);
    }), sessionStorage['getItem']('logged_in') === 'true' && setTimeout(startScanline, 0x1f4);
}