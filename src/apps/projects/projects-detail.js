import {
    isFirefox
} from '../../scripts/utils/device.js';
import {
    sanitizeHTML
} from '../../scripts/utils/sanitizer.js';
import {
    CAROUSEL_DRAG_THRESHOLD,
    CAROUSEL_MAX_VERTICAL_DRIFT,
    SELECTORS,
    CLASSES,
    formatWorkLabel,
    isCompactViewport,
    projectsDataManager,
    getHoverLabelForProject
} from './projectsInternals.js';
let globalMutePreference = !![];
export const getGlobalMutePreference = () => globalMutePreference;
export const setGlobalMutePreference = _0x48ebfd => {
    globalMutePreference = _0x48ebfd;
};
export const updateAddressBar = _0x3012ea => {
    if (window['parent'] && window['parent'] !== window) {
        const _0xfc6f07 = _0x3012ea['toLowerCase']()['replace'](/[^a-z0-9\s]/g, '')['split']('\x20')['filter'](_0x3bdab0 => _0x3bdab0['length'] > 0x0)['join']('-'),
            addressBarTitle = 'https://www.myprojects.com/' + _0xfc6f07,
            _0x5dd4cb = {};
        _0x5dd4cb['type'] = 'update-address-bar', _0x5dd4cb['title'] = addressBarTitle, window['parent']['postMessage'](_0x5dd4cb, '*');
    }
};
export const navigateToNextProject = (_0xc96967, _0x1c77f7, _0x348bdc) => {
    if (!Array['isArray'](_0xc96967) || _0xc96967['length'] === 0x0) return null;
    const _0x4d8a82 = projectsDataManager['getAllProjects'](),
        _0xb20133 = _0xc96967['indexOf'](_0x1c77f7),
        _0x5e6344 = _0xb20133 === -0x1 ? _0x348bdc : _0xb20133,
        _0x26dc0e = (_0x5e6344 + 0x1) % _0xc96967['length'],
        _0x461686 = _0xc96967[_0x26dc0e];
    if (typeof _0x461686 === 'number') {
        globalMutePreference = !![];
        const _0x23965c = _0x4d8a82[_0x461686];
        _0x23965c && updateAddressBar(_0x23965c['title']);
        const _0x4960da = {};
        return _0x4960da['nextIndex'] = _0x461686, _0x4960da['newFilteredPos'] = _0x26dc0e, _0x4960da;
    }
    return null;
};
export const navigateToPreviousProject = (_0x1ec638, _0x1c48a8, _0x551516) => {
    if (!Array['isArray'](_0x1ec638) || _0x1ec638['length'] === 0x0) return null;
    const _0x110af8 = projectsDataManager['getAllProjects'](),
        _0x2ceeaa = _0x1ec638['indexOf'](_0x1c48a8),
        _0x3c147e = _0x2ceeaa === -0x1 ? _0x551516 : _0x2ceeaa,
        _0x38121f = (_0x3c147e - 0x1 + _0x1ec638['length']) % _0x1ec638['length'],
        _0x195db7 = _0x1ec638[_0x38121f];
    if (typeof _0x195db7 === 'number') {
        globalMutePreference = !![];
        const _0x4d04ed = _0x110af8[_0x195db7];
        _0x4d04ed && updateAddressBar(_0x4d04ed['title']);
        const _0x5d631a = {};
        return _0x5d631a['prevIndex'] = _0x195db7, _0x5d631a['newFilteredPos'] = _0x38121f, _0x5d631a;
    }
    return null;
};
export const hideProjectDetail = () => {
    const _0x1e8808 = document['getElementById']('grid-container'),
        _0x2079de = document['getElementById']('detail-container');
    if (!_0x1e8808 || !_0x2079de) return;
    try {
        _0x2079de['querySelectorAll']('video')['forEach'](_0x208640 => {
            try {
                _0x208640['pause']();
            } catch (_0x1c70ff) {}
        }), _0x2079de['_carouselController'] && typeof _0x2079de['_carouselController']['destroy'] === 'function' && (_0x2079de['_carouselController']['destroy'](), _0x2079de['_carouselController'] = null), _0x2079de['_contentSwitchingCleanup'] && typeof _0x2079de['_contentSwitchingCleanup'] === 'function' && (_0x2079de['_contentSwitchingCleanup'](), _0x2079de['_contentSwitchingCleanup'] = null), _0x2079de['_headerLabelResizeHandler'] && (window['removeEventListener']('resize', _0x2079de['_headerLabelResizeHandler']), delete _0x2079de['_headerLabelResizeHandler']);
    } catch (_0x34a22a) {}
    _0x1e8808['style']['display'] = 'block', _0x2079de['style']['display'] = 'none';
    try {
        document['documentElement']['classList']['contains']('mobile-device') && document['body']['classList']['remove']('detail-view-active');
    } catch (_0x4b2178) {}
    updateAddressBar('');
};
export const createMediaItemsArray = _0x146944 => {
    const _0x31d29e = [];
    if (_0x146944['images'] && _0x146944['images']['length']) _0x146944['images']['forEach'](_0x2cdff5 => {
        const _0x53715f = typeof _0x2cdff5 === 'object' ? _0x2cdff5 : {
            'src': _0x2cdff5
        };
        _0x53715f['type'] = _0x53715f['type'] || (_0x53715f['src']['toLowerCase']()['includes']('.mp4') || _0x53715f['src']['toLowerCase']()['includes']('.webm') || _0x53715f['src']['toLowerCase']()['includes']('.mov') ? 'video' : 'image'), _0x31d29e['push'](_0x53715f);
    });
    else {
        const _0x5616f0 = {};
        _0x5616f0['src'] = _0x146944['src'];
        const _0x35c210 = _0x5616f0;
        _0x35c210['type'] = _0x35c210['src']['toLowerCase']()['includes']('.mp4') || _0x35c210['src']['toLowerCase']()['includes']('.webm') || _0x35c210['src']['toLowerCase']()['includes']('.mov') ? 'video' : 'image', _0x31d29e['push'](_0x35c210);
    }
    return _0x31d29e;
};
export const createUnifiedCarouselContent = (_0x3b083c, _0x14f45b) => {
    const _0x2c4eb7 = document['documentElement']['classList']['contains']('mobile-device') || isCompactViewport(),
        _0x47ccf3 = formatWorkLabel(_0x3b083c['workType'] === 'client' ? 'client' : 'personal', _0x2c4eb7),
        _0x6cfd4b = document['documentElement']['classList']['contains']('mobile-device'),
        _0x3dc363 = isFirefox() && !_0x6cfd4b;
    let _0x127a65 = '';
    _0x3b083c['type'] === 'video' && (!_0x6cfd4b || _0x3dc363) && (_0x127a65 = '\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22project-speaker-button\x22\x20role=\x22button\x22\x20tabindex=\x220\x22\x20data-action=\x22speakerToggle\x22\x20aria-label=\x22Toggle\x20Audio\x22\x20title=\x22Toggle\x20Audio\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20🔊\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20');
    let _0x44bd49 = '';
    if (_0x3b083c['headerButton'] && _0x3b083c['headerButton']['enabled']) {
        const _0x223864 = _0x3b083c['headerButton']['label'] || 'Open',
            _0x582b93 = _0x3b083c['headerButton']['tooltip'] || _0x223864,
            _0x118401 = _0x3b083c['headerButton']['url'] || '',
            _0x211d6a = _0x118401['includes']('github.com') ? 'github' : _0x118401 ? 'external' : 'app';
        _0x44bd49 = '\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22project-header-button\x22\x20role=\x22button\x22\x20tabindex=\x220\x22\x20data-action=\x22headerButton\x22\x20data-icon=\x22' + _0x211d6a + '\x22\x20aria-label=\x22' + _0x582b93 + '\x22\x20title=\x22' + _0x582b93 + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22button-label\x22>' + _0x223864 + '</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20';
    }
    const _0x34be09 = _0x6cfd4b && !_0x3dc363,
        _0x502a0c = _0x34be09 ? '' : _0x44bd49,
        _0x307204 = _0x34be09 ? _0x44bd49 : '',
        _0x12e001 = typeof _0x3b083c['defaultSlide'] === 'number' && _0x3b083c['defaultSlide'] >= 0x0 && _0x3b083c['defaultSlide'] < _0x14f45b['length'] ? _0x3b083c['defaultSlide'] : 0x0;
    return '\x0a\x20\x20<div\x20class=\x22detail-blue-container\x22>\x0a\x20\x20\x20\x20<div\x20class=\x22project-header-group\x22>\x0a\x20\x20\x20\x20\x20\x20<h1\x20class=\x22project-title\x22\x20data-work-type=\x22' + (_0x3b083c['workType'] || 'personal') + '\x22\x20title=\x22' + _0x3b083c['title'] + '\x22>' + _0x3b083c['title'] + '</h1>\x0a\x20\x20\x20\x20\x20\x20<span\x20class=\x22work-type-text\x20work-type-header\x22\x20data-work-type=\x22' + (_0x3b083c['workType'] || 'personal') + '\x22\x20data-hover-label=\x22' + getHoverLabelForProject(_0x3b083c) + '\x22>' + _0x47ccf3 + '</span>\x0a\x20\x20\x20\x20\x20\x20' + (_0x34be09 ? _0x307204 : '') + '\x0a\x20\x20\x20\x20</div>\x0a\x20\x20</div>\x0a\x0a\x20\x20<div\x20class=\x22cascade-slider_container\x22\x20id=\x22cascade-slider\x22>\x0a\x20\x20\x20\x20<div\x20class=\x22cascade-slider_slides\x22>\x0a\x20\x20\x20\x20\x20\x20' + _0x14f45b['map']((_0x182670, _0x460bb3) => {
        const src = _0x182670['src'],
            _0x195ad6 = _0x182670['poster'],
            _0x2667d4 = _0x182670['posterMobile'],
            srcMobile = _0x182670['srcMobile'],
            _0x2b600c = _0x182670['alt'] || _0x3b083c['title'] + '\x20' + (_0x460bb3 + 0x1),
            _0x2047a7 = _0x182670['type'],
            _0x56bcf6 = document['documentElement']['classList']['contains']('mobile-device') && srcMobile ? srcMobile : src,
            _0x429bba = document['documentElement']['classList']['contains']('mobile-device') && _0x2667d4 ? _0x2667d4 : _0x195ad6;
        if (_0x2047a7 === 'video') {
            const _0x179188 = _0x460bb3 === _0x12e001,
                autoplayAttrs = _0x179188 ? 'autoplay\x20muted\x20loop\x20preload=\x22auto\x22' : 'muted\x20loop\x20preload=\x22auto\x22\x20data-preload=\x22ready\x22';
            let _0x2e0df3 = '';
            if (_0x429bba) {
                const _0x185bf5 = _0x429bba['includes']('../../../') ? _0x429bba : '../../../' + _0x429bba;
                _0x2e0df3 = 'poster=\x22' + _0x185bf5 + '\x22\x20data-poster-loaded=\x22false\x22';
            }
            const _0x138d31 = _0x56bcf6['startsWith']('../../../') ? _0x56bcf6 : '../../../' + _0x56bcf6;
            return '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22cascade-slider_item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22media-spinner\x22\x20aria-hidden=\x22true\x22\x20hidden></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<video\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20src=\x22' + _0x138d31 + '\x22\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x2e0df3 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + autoplayAttrs + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20playsinline\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20webkit-playsinline\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20disablePictureInPicture\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20disableremoteplayback\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</video>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20';
        } else return '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22cascade-slider_item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20src=\x22' + (_0x56bcf6['includes']('../../../') ? _0x56bcf6 : '../../../' + _0x56bcf6) + '\x22\x20alt=\x22' + _0x2b600c + '\x22\x20loading=\x22eager\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20';
    })['join']('') + '\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20</div>\x0a\x0a\x20\x20<div\x20class=\x22detail-content-wrapper\x22>\x0a\x20\x20\x20\x20<div\x20class=\x22detail-content-left\x22>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22detail-content-title\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22detail-content-titles\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3\x20class=\x22brief-title\x20active\x22\x20data-content=\x22brief\x22>Overview</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3\x20class=\x22description-title\x22\x20data-content=\x22description\x22>Details</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22detail-nav-dots\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x14f45b['map']((_0x29ccce, _0x40e5df) => '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22cascade-slider_dot' + (_0x40e5df === (_0x3b083c['defaultSlide'] || 0x0) ? '\x20cur' : '') + '\x22\x20data-slide=\x22' + _0x40e5df + '\x22></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20')['join']('') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22detail-action-buttons\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x127a65 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x34be09 ? '' : _0x502a0c) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22detail-content-container\x22>\x0a\x20\x20<div\x20class=\x22brief-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + ((() => {
        let _0x57d5fe = (_0x3b083c['brief'] || _0x3b083c['subtitle'] || '')['trim']();
        _0x57d5fe = _0x57d5fe['replace'](/\s+/g, '\x20');
        const _0xa2974f = _0x57d5fe['match'](/[^.!?]*[.!?]/);
        let _0x1e2463 = _0xa2974f ? _0xa2974f[0x0]['trim']() : _0x57d5fe['slice'](0x0, 0x8c)['replace'](/\s+\S*$/, '');
        if (_0x1e2463['length'] < _0x57d5fe['length']) _0x1e2463 = _0x1e2463['replace'](/[.!?]?$/, '') + '.';
        const _0x10e61e = _0x3b083c['role'] && typeof _0x3b083c['role'] === 'string' && _0x3b083c['role']['trim']()['length'] ? _0x3b083c['role']['trim']() : _0x3b083c['workType'] ? _0x3b083c['workType'] === 'client' ? 'Client\x20Project' : 'Personal\x20Project' : '',
            _0x17186d = Array['isArray'](_0x3b083c['toolsUsed']) && _0x3b083c['toolsUsed']['length'] ? _0x3b083c['toolsUsed'] : [],
            _0x2b03ff = Array['isArray'](_0x3b083c['bulletPoints']) ? _0x3b083c['bulletPoints']['slice'](0x0, 0x5) : [],
            _0x3f56f7 = _0x10e61e ? '<p\x20class=\x22detail-role-line\x22><span\x20class=\x22ov-label\x22>Role:</span>\x20<span\x20class=\x22ov-text\x22>' + sanitizeHTML(_0x10e61e) + '</span></p>' : '',
            _0x294042 = _0x2b03ff['length'] ? '<div\x20class=\x22detail-features-line\x22><span\x20class=\x22ov-label\x22>Key\x20Features:</span><ul\x20class=\x22detail-bullets-list\x22>' + _0x2b03ff['map'](_0x14f482 => '<li>' + sanitizeHTML(_0x14f482) + '</li>')['join']('') + '</ul></div>' : '';
        let _0x4a569f = '';
        if (_0x17186d['length']) {
            if (!_0x6cfd4b && _0x17186d['length'] > 0x3) {
                const _0x3c0f6d = [];
                for (let _0x32a9f1 = 0x0; _0x32a9f1 < _0x17186d['length']; _0x32a9f1 += 0x3) {
                    const _0x4c88d9 = _0x17186d['slice'](_0x32a9f1, _0x32a9f1 + 0x3);
                    _0x3c0f6d['push']('<ul\x20class=\x22detail-bullets-list\x20tools-list\x22>' + _0x4c88d9['map'](_0x5ca1cf => '<li>' + sanitizeHTML(_0x5ca1cf) + '</li>')['join']('') + '</ul>');
                }
                _0x4a569f = '<div\x20class=\x22detail-tools-line\x22><span\x20class=\x22ov-label\x22>Tools:</span><div\x20class=\x22tools-columns\x22>' + _0x3c0f6d['join']('') + '</div></div>';
            } else _0x4a569f = '<div\x20class=\x22detail-tools-line\x22><span\x20class=\x22ov-label\x22>Tools:</span><ul\x20class=\x22detail-bullets-list\x20tools-list\x22>' + _0x17186d['map'](_0x40ae25 => '<li>' + sanitizeHTML(_0x40ae25) + '</li>')['join']('') + '</ul></div>';
        }
        let _0x273178 = '';
        return _0x294042 && _0x4a569f ? _0x273178 = '<div\x20class=\x22detail-overview-split-row\x22>' + _0x294042 + _0x4a569f + '</div>' : _0x273178 = _0x294042 + _0x4a569f, '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x3f56f7 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x273178 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (!_0x10e61e && !_0x17186d['length'] && !_0x2b03ff['length'] ? '<p\x20class=\x22detail-brief\x22>Overview\x20details\x20coming\x20soon...</p>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20';
    })()) + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20<div\x20class=\x22description-content\x20hidden\x22\x20data-lazy-description=\x22pending\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<!--\x20Description\x20will\x20be\x20injected\x20on\x20first\x20reveal\x20to\x20reduce\x20initial\x20parse\x20cost\x20-->\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22detail-description\x20placeholder\x22>Loading\x20description...</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20</div>\x0a\x20\x20</div>\x0a';
};
export const setupUnifiedCarousel = (_0x1c74b7, _0x293722, _0x145d83) => {
    const _0x357744 = _0x1c74b7['querySelector']('.cascade-slider_container');
    if (!_0x357744) return;
    const _0x15abab = _0x357744['querySelectorAll']('.cascade-slider_arrow-container');
    _0x15abab['forEach'](_0x38e521 => _0x38e521['remove']());
    const _0x2a259f = _0x293722['orientation'] || 'landscape';
    _0x357744['classList']['add']('carousel-' + _0x2a259f);
    const _0x5a1208 = setupMultiItemCarousel(_0x1c74b7, _0x293722, _0x145d83);
    return _0x5a1208;
};
export const setupMultiItemCarousel = (_0x396db4, _0x56cafe, _0x49fd8d) => {
    const _0x5e55d3 = _0x396db4['querySelector']('.cascade-slider_container');
    if (!_0x5e55d3) return;
    if (_0x49fd8d['length'] > 0x1) {
        const _0x5072ab = document['createElement']('div');
        _0x5072ab['className'] = 'cascade-slider_arrow-container';
        const _0x393b09 = document['createElement']('span');
        _0x393b09['className'] = 'cascade-slider_arrow\x20cascade-slider_arrow-left', _0x393b09['innerHTML'] = '<svg\x20width=\x2256\x22\x20height=\x2256\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M15\x2018L9\x2012L15\x206\x22\x20stroke=\x22currentColor\x22\x20stroke-width=\x222.5\x22\x20stroke-linecap=\x22round\x22\x20stroke-linejoin=\x22round\x22/></svg>';
        const _0x2b5127 = document['createElement']('span');
        _0x2b5127['className'] = 'cascade-slider_arrow\x20cascade-slider_arrow-right', _0x2b5127['innerHTML'] = '<svg\x20width=\x2256\x22\x20height=\x2256\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M9\x206L15\x2012L9\x2018\x22\x20stroke=\x22currentColor\x22\x20stroke-width=\x222.5\x22\x20stroke-linecap=\x22round\x22\x20stroke-linejoin=\x22round\x22/></svg>', _0x5072ab['appendChild'](_0x393b09), _0x5072ab['appendChild'](_0x2b5127), _0x5e55d3['appendChild'](_0x5072ab);
    }
    if (_0x49fd8d['length'] > 0x1) try {
        if (!document['documentElement']['classList']['contains']('mobile-device')) {
            const _0xa9629 = _0x5e55d3['querySelector']('.cascade-slider_arrow-left'),
                _0x1e7793 = _0x5e55d3['querySelector']('.cascade-slider_arrow-right');
            if (_0xa9629 && _0x1e7793) {
                const _0x540f88 = () => {
                    const _0x5822f5 = window['innerWidth'],
                        _0x45a791 = _0x5e55d3['getBoundingClientRect'](),
                        _0x21a663 = _0x45a791['left'],
                        _0x189252 = _0x5822f5 - _0x45a791['right'],
                        _0x16c589 = Math['max'](-0x2a - _0x21a663, -0x2a),
                        _0x3c2c3d = Math['max'](-0x2a - _0x189252, -0x2a);
                    _0xa9629['style']['left'] = _0x16c589 + 'px', _0x1e7793['style']['right'] = _0x3c2c3d + 'px', _0xa9629['style']['position'] = 'absolute', _0x1e7793['style']['position'] = 'absolute';
                };
                _0x540f88();
                const _0x1ac2cb = () => _0x540f88();
                window['addEventListener']('resize', _0x1ac2cb), _0x396db4['_arrowResizeCleanup'] && window['removeEventListener']('resize', _0x396db4['_arrowResizeCleanup']), _0x396db4['_arrowResizeCleanup'] = _0x1ac2cb;
            }
        }
    } catch {}
    return initializeCarousel(_0x396db4, _0x56cafe, _0x49fd8d);
};
export const createCarouselController = (_0x1f5020, _0x83e2cd, _0x5e7104) => {
    const _0x2418a0 = {
            'container': _0x1f5020['querySelector']('.cascade-slider_container'),
            'slider': _0x1f5020['querySelector'](SELECTORS['slider']),
            'items': _0x1f5020['querySelectorAll'](SELECTORS['sliderItem']),
            'dots': _0x1f5020['querySelectorAll']('.detail-nav-dots\x20.cascade-slider_dot'),
            'leftArrow': _0x1f5020['querySelector'](SELECTORS['arrowLeft']),
            'rightArrow': _0x1f5020['querySelector'](SELECTORS['arrowRight'])
        },
        _0x49244d = {
            'activeIndex': -0x1,
            'signatures': new WeakMap()
        };
    let _0x1c5cd7 = 0x0;
    _0x2418a0['items']['length'] > 0x1 && (_0x1c5cd7 = _0x83e2cd['defaultSlide'] !== undefined && _0x83e2cd['defaultSlide'] >= 0x0 && _0x83e2cd['defaultSlide'] < _0x2418a0['items']['length'] ? _0x83e2cd['defaultSlide'] : 0x0);
    _0x2418a0['container'] && _0x2418a0['container']['setAttribute']('data-current-index', _0x1c5cd7['toString']());
    const _0x27ed6d = () => {
            _0x2418a0['items']['forEach'](_0x5171a9 => {
                _0x5171a9['style']['transform'] = '', _0x5171a9['style']['transition'] = '', _0x5171a9['style']['opacity'] = '';
            });
        },
        _0xa1bbc3 = _0x42cc58 => {
            if (_0x42cc58 === _0x49244d['activeIndex']) return;
            _0x1c5cd7 = _0x42cc58, _0x27ed6d();
            const _0x29618d = _0x2418a0['items']['length'],
                _0x3d090a = (_0x42cc58 + 0x1) % _0x29618d,
                _0x58976e = (_0x42cc58 - 0x1 + _0x29618d) % _0x29618d;
            _0x2418a0['items']['forEach']((_0x32fbfe, _0x3890fb) => {
                const _0x2666ef = _0x29618d === 0x1 || _0x3890fb === _0x42cc58,
                    _0x4bc98b = _0x29618d > 0x1 && _0x3890fb === _0x3d090a,
                    _0x2b4dfb = _0x29618d > 0x1 && _0x3890fb === _0x58976e,
                    _0x5d31b0 = '' + (_0x2666ef ? 0x1 : 0x0) + (_0x4bc98b ? 0x1 : 0x0) + (_0x2b4dfb ? 0x1 : 0x0);
                if (_0x49244d['signatures']['get'](_0x32fbfe) === _0x5d31b0) return;
                _0x49244d['signatures']['set'](_0x32fbfe, _0x5d31b0);
                if (_0x2666ef) _0x32fbfe['classList']['add'](CLASSES['now']);
                else _0x32fbfe['classList']['remove'](CLASSES['now']);
                if (_0x4bc98b) _0x32fbfe['classList']['add'](CLASSES['next']);
                else _0x32fbfe['classList']['remove'](CLASSES['next']);
                if (_0x2b4dfb) _0x32fbfe['classList']['add'](CLASSES['prev']);
                else _0x32fbfe['classList']['remove'](CLASSES['prev']);
            });
            if (_0x49244d['activeIndex'] !== -0x1 && _0x49244d['activeIndex'] !== _0x42cc58) {
                const _0xe93200 = _0x2418a0['dots'][_0x49244d['activeIndex']];
                if (_0xe93200) _0xe93200['classList']['remove'](CLASSES['cur']);
            }
            const _0x1436de = _0x2418a0['dots'][_0x42cc58];
            if (_0x1436de && !_0x1436de['classList']['contains'](CLASSES['cur'])) _0x1436de['classList']['add'](CLASSES['cur']);
            !_0x49244d['videoElements'] && (_0x49244d['videoElements'] = Array['from'](_0x2418a0['items'])['map'](_0x93f4c => _0x93f4c['querySelector']('video'))['filter'](Boolean), _0x49244d['videoItems'] = Array['from'](_0x2418a0['items'])['map']((_0x3db378, _0x56af85) => ({
                'video': _0x3db378['querySelector']('video'),
                'index': _0x56af85
            }))['filter'](_0x39230e => _0x39230e['video']));
            !_0x49244d['imageElements'] && (_0x49244d['imageElements'] = Array['from'](_0x2418a0['items'])['map'](_0x47af57 => _0x47af57['querySelector']('img'))['filter'](Boolean), _0x49244d['imageItems'] = Array['from'](_0x2418a0['items'])['map']((_0x52faa9, _0x35f9fc) => ({
                'img': _0x52faa9['querySelector']('img'),
                'index': _0x35f9fc
            }))['filter'](_0x13d8b0 => _0x13d8b0['img']));
            _0x49244d['imageItems']['forEach'](({
                img: _0x1aa246
            }) => {
                if (!_0x1aa246['hasAttribute']('data-loading-configured')) {
                    _0x1aa246['setAttribute']('data-loading-configured', '');
                    const _0x2d8f85 = () => {
                            _0x1aa246['classList']['add']('loaded');
                        },
                        _0x4b5671 = () => {
                            if (_0x1aa246['complete'] && _0x1aa246['naturalWidth'] > 0x0 && _0x1aa246['naturalHeight'] > 0x0) return _0x2d8f85(), !![];
                            return ![];
                        };
                    if (!_0x4b5671()) {
                        const _0x674e33 = {};
                        _0x674e33['once'] = !![], _0x1aa246['addEventListener']('load', _0x2d8f85, _0x674e33);
                        const _0x51fedd = {};
                        _0x51fedd['once'] = !![], _0x1aa246['addEventListener']('error', () => {
                            console['warn']('Image\x20failed\x20to\x20load:', _0x1aa246['src']), _0x1aa246['classList']['add']('loaded');
                        }, _0x51fedd);
                    }
                }
            }), _0x49244d['videoItems']['forEach'](({
                video: _0x1929ae,
                index: _0x5c2145
            }) => {
                if (!_0x1929ae['hasAttribute']('data-carousel-configured')) {
                    _0x1929ae['muted'] = getGlobalMutePreference(), _0x1929ae['setAttribute']('playsinline', ''), _0x1929ae['setAttribute']('webkit-playsinline', ''), _0x1929ae['loop'] = !![], _0x1929ae['setAttribute']('data-carousel-configured', '');
                    const _0xdde736 = () => {
                        _0x1929ae['classList']['add']('loaded');
                    };
                    if (_0x1929ae['readyState'] >= 0x2) _0xdde736();
                    else {
                        const _0x189618 = {};
                        _0x189618['once'] = !![], _0x1929ae['addEventListener']('loadeddata', _0xdde736, _0x189618);
                        const _0x1eee0f = {};
                        _0x1eee0f['once'] = !![], _0x1929ae['addEventListener']('canplay', _0xdde736, _0x1eee0f);
                    }
                    _0x1929ae['poster'] && !_0x1929ae['hasAttribute']('data-poster-preload-started') && (_0x1929ae['setAttribute']('data-poster-preload-started', 'true'), setTimeout(() => {
                        const _0x1a400e = new Image();
                        _0x1a400e['onload'] = () => {
                            _0x1929ae['setAttribute']('data-poster-loaded', 'true');
                        }, _0x1a400e['onerror'] = () => {
                            console['warn']('Poster\x20failed\x20to\x20load:', _0x1929ae['poster']), _0x1929ae['setAttribute']('data-poster-loaded', 'error');
                        }, _0x1a400e['src'] = _0x1929ae['poster'];
                    }, 0x64));
                }
                _0x1929ae['muted'] !== getGlobalMutePreference() && (_0x1929ae['muted'] = getGlobalMutePreference());
                if (_0x5c2145 === _0x42cc58) {
                    if (_0x1929ae['paused']) {
                        if (_0x1929ae['readyState'] >= 0x2) _0x1929ae['play']()['catch'](() => {});
                        else {
                            const playWhenReady = () => {
                                    _0x1929ae['paused'] && _0x5c2145 === _0x42cc58 && _0x1929ae['play']()['catch'](() => {});
                                },
                                _0xed5b7e = {};
                            _0xed5b7e['once'] = !![], _0x1929ae['addEventListener']('canplay', playWhenReady, _0xed5b7e);
                            const _0x4cb40b = {};
                            _0x4cb40b['once'] = !![], _0x1929ae['addEventListener']('loadeddata', playWhenReady, _0x4cb40b);
                        }
                    }
                } else(_0x49244d['activeIndex'] === -0x1 || _0x5c2145 === _0x49244d['activeIndex']) && (!_0x1929ae['paused'] && _0x1929ae['pause']());
                _0x1929ae['_syncTapOverlay']?.();
            }), _0x49244d['activeIndex'] = _0x42cc58;
            const _0x2ee68f = _0x86ef35 => (_0x86ef35 + _0x2418a0['items']['length']) % _0x2418a0['items']['length'],
                _0x44a84b = _0x66f08d => {
                    const _0x4c9c00 = _0x5e7104[_0x66f08d];
                    if (!_0x4c9c00 || _0x4c9c00['type'] === 'video') return;
                    const _0x2d8ae2 = document['documentElement']['classList']['contains']('mobile-device') && _0x4c9c00['srcMobile'] ? _0x4c9c00['srcMobile'] : _0x4c9c00['src'];
                    if (!_0x2d8ae2) return;
                    const _0x27dd41 = _0x2d8ae2['startsWith']('../../../') ? _0x2d8ae2 : '../../../' + _0x2d8ae2,
                        _0x43b6b4 = document['createElement']('link');
                    _0x43b6b4['rel'] = 'prefetch', _0x43b6b4['as'] = 'image', _0x43b6b4['href'] = _0x27dd41, _0x43b6b4['fetchPriority'] = 'low', document['head']['appendChild'](_0x43b6b4);
                };
            _0x44a84b(_0x2ee68f(_0x42cc58 + 0x1)), _0x44a84b(_0x2ee68f(_0x42cc58 - 0x1));
        },
        _0x28710f = _0x2f95c0 => {
            if (_0x2f95c0 < 0x0 || _0x2f95c0 >= _0x2418a0['items']['length']) return;
            _0x1c5cd7 = _0x2f95c0, _0x2418a0['container'] && _0x2418a0['container']['setAttribute']('data-current-index', _0x1c5cd7['toString']()), _0xa1bbc3(_0x2f95c0);
        },
        _0x53116f = () => {
            _0x1c5cd7 = (_0x1c5cd7 - 0x1 + _0x2418a0['items']['length']) % _0x2418a0['items']['length'], _0x2418a0['container'] && _0x2418a0['container']['setAttribute']('data-current-index', _0x1c5cd7['toString']()), _0xa1bbc3(_0x1c5cd7);
        },
        _0x2081c2 = () => {
            _0x1c5cd7 = (_0x1c5cd7 + 0x1) % _0x2418a0['items']['length'], _0x2418a0['container'] && _0x2418a0['container']['setAttribute']('data-current-index', _0x1c5cd7['toString']()), _0xa1bbc3(_0x1c5cd7);
        };
    let initializedOnce = ![];
    const _0x40c7c2 = () => {
        if (initializedOnce) return;
        initializedOnce = !![];
        try {
            import('../../scripts/utils/frameScheduler.js')['then'](({
                scheduleAfter: _0x322eed
            }) => {
                _0x322eed(() => _0x322eed(() => _0xa1bbc3(_0x1c5cd7)));
            });
        } catch (_0x188b47) {
            setTimeout(() => _0xa1bbc3(_0x1c5cd7), 0x10);
        }
    };
    _0x40c7c2(), _0x2418a0['dots']['forEach']((_0x2a4c6b, _0x293fa0) => {
        _0x2a4c6b['addEventListener']('click', () => _0x28710f(_0x293fa0));
    });
    _0x2418a0['leftArrow'] && _0x2418a0['leftArrow']['addEventListener']('click', _0x53116f);
    _0x2418a0['rightArrow'] && _0x2418a0['rightArrow']['addEventListener']('click', _0x2081c2);
    const _0x34b997 = setupCarouselTouchHandling(_0x2418a0, _0x53116f, _0x2081c2, _0xa1bbc3);
    return {
        'navigateToSlide': _0x28710f,
        'navPrev': _0x53116f,
        'navNext': _0x2081c2,
        'getCurrentIndex': () => _0x1c5cd7,
        'destroy': () => {
            _0x34b997(), _0x2418a0['dots']['forEach'](_0x1b19ca => {
                const _0x4dc501 = _0x1b19ca['cloneNode'](!![]);
                _0x1b19ca['parentNode']['replaceChild'](_0x4dc501, _0x1b19ca);
            });
            if (_0x2418a0['leftArrow']) {
                const _0x5d0d52 = _0x2418a0['leftArrow']['cloneNode'](!![]);
                _0x2418a0['leftArrow']['parentNode']['replaceChild'](_0x5d0d52, _0x2418a0['leftArrow']);
            }
            if (_0x2418a0['rightArrow']) {
                const _0x18636b = _0x2418a0['rightArrow']['cloneNode'](!![]);
                _0x2418a0['rightArrow']['parentNode']['replaceChild'](_0x18636b, _0x2418a0['rightArrow']);
            }
            _0x49244d['videoElements'] && (_0x49244d['videoElements'] = null, _0x49244d['videoItems'] = null);
        }
    };
};
export const setupCarouselTouchHandling = (_0x4dd27d, _0x5a38b1, _0xc62453, _0x41ecad) => {
    let _0x5b6553 = 0x0,
        _0x4c4ce6 = 0x0,
        _0x3fe66a = ![],
        _0x33891d = 0x0,
        _0x5189c2 = null;
    const _0x409155 = () => {
            const _0x580148 = _0x4dd27d['slider']['querySelector']('.' + CLASSES['now']);
            _0x33891d = _0x580148 ? Array['from'](_0x4dd27d['items'])['indexOf'](_0x580148) : 0x0;
        },
        _0x6c4cb3 = _0x605a61 => {
            _0x5b6553 = _0x605a61['touches'][0x0]['clientX'], _0x4c4ce6 = _0x605a61['touches'][0x0]['clientY'], _0x3fe66a = ![], _0x409155();
        },
        _0x155500 = _0x141032 => {
            if (!_0x5b6553) return;
            if (_0x5189c2) return;
            _0x5189c2 = requestAnimationFrame(() => {
                const _0x3ccd34 = _0x141032['touches'][0x0]['clientX'],
                    _0x51e48e = _0x141032['touches'][0x0]['clientY'],
                    _0x14eff2 = _0x3ccd34 - _0x5b6553,
                    _0xeeffb1 = _0x51e48e - _0x4c4ce6,
                    _0x398c5d = Math['abs'](_0x14eff2),
                    _0x135e14 = Math['abs'](_0xeeffb1),
                    _0x5b494e = _0x398c5d > 0xa,
                    _0x5859d7 = _0x135e14 < CAROUSEL_MAX_VERTICAL_DRIFT,
                    _0x2f45f3 = _0x135e14 > _0x398c5d * 0x3 && _0x135e14 > 0x1e && _0x398c5d < 0xf;
                if (_0x5b494e && _0x5859d7 && !_0x2f45f3) {
                    _0x3fe66a = !![], _0x141032['preventDefault']();
                    const _0x521e04 = _0x4dd27d['items'][_0x33891d];
                    if (_0x521e04) {
                        const _0x54cd8a = 'calc(-50%\x20+\x20' + _0x14eff2 * 0.5 + 'px)',
                            _0x4c88f2 = 'translateX(' + _0x54cd8a + ')\x20scale(var(--slider-scale-active))';
                        _0x521e04['style']['transform'] = _0x4c88f2, _0x521e04['style']['transition'] = 'none';
                    }
                } else _0x2f45f3 && (_0x5b6553 = 0x0, _0x4c4ce6 = 0x0, _0x3fe66a = ![]);
                _0x5189c2 = null;
            });
        },
        _0x287deb = _0xb39cdc => {
            _0x5189c2 && (cancelAnimationFrame(_0x5189c2), _0x5189c2 = null);
            const _0x37fd01 = _0x4dd27d['items'][_0x33891d];
            _0x37fd01 && (_0x37fd01['style']['transform'] = '', _0x37fd01['style']['transition'] = '');
            if (_0x5b6553 && _0x3fe66a) {
                const _0x18dd9f = _0xb39cdc['changedTouches'][0x0]['clientX'] - _0x5b6553;
                Math['abs'](_0x18dd9f) > CAROUSEL_DRAG_THRESHOLD ? _0x18dd9f < 0x0 ? _0xc62453() : _0x5a38b1() : _0x41ecad(_0x33891d);
            } else _0x41ecad(_0x33891d);
            _0x5b6553 = 0x0, _0x4c4ce6 = 0x0, _0x3fe66a = ![];
        },
        _0x5d189b = {};
    _0x5d189b['passive'] = !![], _0x4dd27d['slider']['addEventListener']('touchstart', _0x6c4cb3, _0x5d189b);
    const _0x534815 = {};
    _0x534815['passive'] = ![], _0x4dd27d['slider']['addEventListener']('touchmove', _0x155500, _0x534815);
    const _0x5e43a5 = {};
    _0x5e43a5['passive'] = !![], _0x4dd27d['slider']['addEventListener']('touchend', _0x287deb, _0x5e43a5);
    const _0xb2d119 = {};
    return _0xb2d119['passive'] = !![], _0x4dd27d['slider']['addEventListener']('touchcancel', _0x287deb, _0xb2d119), () => {
        _0x5189c2 && (cancelAnimationFrame(_0x5189c2), _0x5189c2 = null), _0x4dd27d['slider']['removeEventListener']('touchstart', _0x6c4cb3), _0x4dd27d['slider']['removeEventListener']('touchmove', _0x155500), _0x4dd27d['slider']['removeEventListener']('touchend', _0x287deb), _0x4dd27d['slider']['removeEventListener']('touchcancel', _0x287deb), _0x5b6553 = 0x0, _0x4c4ce6 = 0x0, _0x3fe66a = ![];
    };
};
export const initializeCarousel = (_0x3af71e, _0x1ea75b, _0x3dacb5) => {
    return createCarouselController(_0x3af71e, _0x1ea75b, _0x3dacb5);
};