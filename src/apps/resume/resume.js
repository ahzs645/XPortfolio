window['addEventListener']('message', function(_0x5df08e) {
    const _0xf0286f = document['getElementById']('appRoot');
    if (!_0xf0286f || !_0x5df08e['data']) return;
    const {
        type: _0x42e2d1
    } = _0x5df08e['data'];
    if (_0x42e2d1 === 'window:maximized') _0xf0286f['classList']['add']('maximized-mode');
    else {
        if (_0x42e2d1 === 'window:unmaximized') _0xf0286f['classList']['remove']('maximized-mode');
        else {
            if (_0x42e2d1 === 'window-resized') _0xf0286f['classList']['add']('resizing-window'), document['body']['classList']['add']('resizing-window');
            else _0x42e2d1 === 'window-resize-end' && (_0xf0286f['classList']['remove']('resizing-window'), document['body']['classList']['remove']('resizing-window'));
        }
    }
});

function transformAssetPath(_0x3b2209) {
    if (!_0x3b2209) return _0x3b2209;
    if (_0x3b2209['startsWith']('http:') || _0x3b2209['startsWith']('https:') || _0x3b2209['startsWith']('../../../')) return _0x3b2209;
    let _0x424c7d = _0x3b2209;
    _0x424c7d['startsWith']('/') && (_0x424c7d = _0x424c7d['substring'](0x1));
    if (_0x424c7d['startsWith']('assets/')) return '../../../' + _0x424c7d;
    return _0x424c7d;
}
document['addEventListener']('DOMContentLoaded', async () => {
    const _0x292447 = document['getElementById']('resumeImage'),
        _0x21c259 = document['getElementById']('appRoot');
    let _0x5a0b4d = null;
    try {
        const _0x1882fd = await fetch('../../../ui.json');
        _0x5a0b4d = await _0x1882fd['json']();
    } catch (_0x4b7209) {
        return;
    }
    if (!_0x5a0b4d || !_0x5a0b4d['resume']) return;
    _0x292447 && (_0x292447['src'] = transformAssetPath(_0x5a0b4d['resume']['webp']));

    function initializeZoomPan() {
        let _0x4d551b = ![],
            _0x306905, _0x49c793, _0x3c784e, _0x3f7576, _0x4dedb6 = ![];
        _0x292447['addEventListener']('dragstart', _0x3a26a0 => _0x3a26a0['preventDefault']()), _0x292447['addEventListener']('click', _0x23997b => {
            if (_0x4dedb6 || document['body']['classList']['contains']('resizing-window')) {
                _0x4dedb6 = ![];
                return;
            }
            const _0x4ac2db = _0x292447['classList']['contains']('zoomed');
            if (!_0x4ac2db) {
                const _0x2c6c3f = _0x23997b['offsetX'],
                    _0x23410c = _0x23997b['offsetY'],
                    _0x54da94 = _0x292447['clientWidth'],
                    _0xe5590c = _0x292447['clientHeight'];
                if (_0x54da94 === 0x0 || _0xe5590c === 0x0) return;
                _0x292447['classList']['add']('zoomed'), notifyToolbarZoomState(!![]), import('../../scripts/utils/frameScheduler.js')['then'](({
                    scheduleAfter: _0xb09ed1
                }) => _0xb09ed1(() => {
                    const _0x12421a = _0x292447['clientWidth'],
                        _0x30807b = _0x12421a / _0x54da94,
                        _0x3f4776 = _0x2c6c3f * _0x30807b,
                        _0x53e2c1 = _0x23410c * _0x30807b,
                        _0x2a4b8e = _0x21c259['clientWidth'],
                        _0x41c9e3 = _0x21c259['clientHeight'];
                    let _0x1d8b12 = _0x3f4776 - _0x2a4b8e / 0x2,
                        _0xf89e8a = _0x53e2c1 - _0x41c9e3 / 0x2;
                    _0x1d8b12 = Math['max'](0x0, Math['min'](_0x1d8b12, _0x21c259['scrollWidth'] - _0x2a4b8e)), _0xf89e8a = Math['max'](0x0, Math['min'](_0xf89e8a, _0x21c259['scrollHeight'] - _0x41c9e3));
                    const _0x4f6882 = {};
                    _0x4f6882['left'] = _0x1d8b12, _0x4f6882['top'] = _0xf89e8a, _0x4f6882['behavior'] = 'auto', _0x21c259['scrollTo'](_0x4f6882);
                }));
            } else {
                _0x292447['classList']['remove']('zoomed');
                const _0x85d271 = {};
                _0x85d271['left'] = 0x0, _0x85d271['top'] = 0x0, _0x85d271['behavior'] = 'auto', _0x21c259['scrollTo'](_0x85d271), notifyToolbarZoomState(![]);
            }
            if (window['parent'] && window['parent'] !== window) {
                const _0x5bb67d = {};
                _0x5bb67d['type'] = 'resume-interaction', window['parent']['postMessage'](_0x5bb67d, '*');
            }
        }), _0x292447['addEventListener']('mousedown', _0x62ee82 => {
            if (!_0x292447['classList']['contains']('zoomed') || document['body']['classList']['contains']('resizing-window')) return;
            _0x4d551b = !![], _0x4dedb6 = ![], _0x292447['classList']['add']('dragging'), _0x306905 = _0x62ee82['clientX'], _0x49c793 = _0x62ee82['clientY'], _0x3c784e = _0x21c259['scrollLeft'], _0x3f7576 = _0x21c259['scrollTop'], _0x62ee82['preventDefault']();
        }), document['addEventListener']('mousemove', _0x128e6f => {
            if (!_0x4d551b || document['body']['classList']['contains']('resizing-window')) return;
            _0x128e6f['preventDefault'](), _0x4dedb6 = !![];
            const _0x46d6e7 = _0x128e6f['clientX'] - _0x306905,
                _0x3f1df8 = _0x128e6f['clientY'] - _0x49c793;
            _0x21c259['scrollLeft'] = _0x3c784e - _0x46d6e7, _0x21c259['scrollTop'] = _0x3f7576 - _0x3f1df8;
        }), document['addEventListener']('mouseup', () => {
            if (!_0x4d551b) return;
            _0x4d551b = ![], _0x292447['classList']['remove']('dragging');
        }), document['addEventListener']('mouseleave', () => {
            _0x4d551b && (_0x4d551b = ![], _0x292447['classList']['remove']('dragging'));
        });
    }
    _0x292447['complete'] && _0x292447['naturalWidth'] !== 0x0 ? initializeZoomPan() : _0x292447['addEventListener']('load', initializeZoomPan);
}), document['addEventListener']('click', () => {
    if (window['parent'] && window['parent'] !== window) {
        const _0x33931f = {};
        _0x33931f['type'] = 'window:iframe-interaction', window['parent']['postMessage'](_0x33931f, '*');
    }
});

function softResetResumeApp() {
    try {
        const _0x191333 = document['getElementById']('resumeImage'),
            _0x4a7765 = document['getElementById']('appRoot');
        _0x191333 && _0x191333['classList']['remove']('zoomed', 'dragging');
        if (_0x4a7765) {
            const _0x4d2a85 = {};
            _0x4d2a85['top'] = 0x0, _0x4d2a85['left'] = 0x0, _0x4d2a85['behavior'] = 'auto', _0x4a7765['scrollTo'](_0x4d2a85);
        }
    } catch (_0x3f2667) {}
}

function notifyToolbarZoomState(_0x37ffe8) {
    if (window['parent'] && window['parent'] !== window) {
        const _0x3c7d23 = {};
        _0x3c7d23['type'] = 'toolbar:zoom-state', _0x3c7d23['active'] = _0x37ffe8, window['parent']['postMessage'](_0x3c7d23, '*');
    }
}
window['addEventListener']('message', _0x2d1eeb => {
    _0x2d1eeb?.['data']?.['type'] === 'window:soft-reset' && softResetResumeApp();
    if (_0x2d1eeb?.['data']?.['type'] === 'toolbar:action') {
        if (_0x2d1eeb['data']['action'] === 'toggleZoom') {
            const _0x3ee955 = document['getElementById']('resumeImage');
            _0x3ee955 && _0x3ee955['click']();
        }
    }
});