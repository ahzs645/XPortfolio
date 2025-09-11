/* eslint-disable no-underscore-dangle */
import {
    isFirefox
} from '../../scripts/utils/device.js';
import {
    sanitizeHTML
} from '../../scripts/utils/sanitizer.js';
import AppLoader from '../../scripts/utils/appLoader.js';
import {
    SELECTORS,
    CLASSES,
    MESSAGE_TYPES,
    createElement,
    formatWorkLabel,
    isCompactViewport,
    sendMessageToParent,
    createProject,
    queryWorkLabels,
    queryProjectVideos,
    SwipeGestureHandler,
    projectsDataManager
} from './projectsInternals.js';
import {
    initMessageRouter,
    registerMessageHandler
} from '../../scripts/utils/messageRouter.js';
import {
    initializeGridFeatures,
    cleanupGridFeatures,
    setupVideoObserver,
    setMaximizedState,
    handleWindowFocus,
    handleWindowBlur,
    handleProjectClick,
    toggleProjectOverlays
} from './projects-grid.js';
import {
    updateAddressBar,
    navigateToNextProject as calculateNextProjectNavigation,
    navigateToPreviousProject as calculatePreviousProjectNavigation,
    getGlobalMutePreference,
    setGlobalMutePreference,
    createMediaItemsArray,
    createUnifiedCarouselContent,
    setupUnifiedCarousel,
    createCarouselController
} from './projects-detail.js';

let projectsData = [];
let validProjectIndices = [];
let currentFilteredProjectPos = 0;
let currentProjectIndex = 0;
let workLabelToggleInterval = null;

const domCache = {
    grid: null,
    gridContainer: null,
    detailContainer: null,
    mainLayout: null,
    mobileBlocker: null,
};

const initializeCachedElements = () => {
    domCache.grid = document.querySelector(SELECTORS.grid);
    domCache.gridContainer = document.querySelector(SELECTORS.gridContainer);
    domCache.detailContainer = document.querySelector(SELECTORS.detailContainer);
    domCache.mainLayout = document.querySelector('.main-layout');
    domCache.mobileBlocker = document.getElementById(SELECTORS.mobileBlocker);
};

const pauseVideos = (videos) => {
    videos.forEach((video) => {
        try {
            video.pause();
        } catch (error) {
            // Ignore errors if pausing fails
        }
    });
};

const cleanupContentSwitching = () => {
    const detailContainer = domCache.detailContainer;
    if (detailContainer && detailContainer._contentSwitchingCleanup) {
        detailContainer._contentSwitchingCleanup();
        detailContainer._contentSwitchingCleanup = null;
    }
};

const pauseAllVideos = () => {
    queryProjectVideos().forEach((video) => {
        try {
            video.pause();
        } catch (error) {
            // Ignore errors
        }
    });
};

const clearIntervals = () => {
    if (workLabelToggleInterval) {
        clearInterval(workLabelToggleInterval);
        workLabelToggleInterval = null;
    }
};

const removeMobileBlocker = () => {
    const mobileBlocker = domCache.mobileBlocker;
    if (mobileBlocker && mobileBlocker.parentNode) {
        mobileBlocker.parentNode.removeChild(mobileBlocker);
    }
};

const clearProjectClasses = () => {
    document.querySelectorAll('.project.hover, .project.dimmed').forEach((el) => {
        el.classList.remove('hover', 'dimmed');
    });
};

function softResetProjectsApp() {
    try {
        cleanupContentSwitching();
        pauseAllVideos();
        clearIntervals();
        cleanupGridFeatures();
        removeMobileBlocker();
        clearProjectClasses();
    } catch (error) {
        // Silently catch errors during soft reset
    }
}

const pauseProjectAppActivity = () => {
    if (workLabelToggleInterval) {
        clearInterval(workLabelToggleInterval);
        workLabelToggleInterval = null;
    }
    cleanupGridFeatures();
};

const resumeProjectAppActivity = () => {
    if (!workLabelToggleInterval) {
        const workLabel = document.querySelector('.project-detail-header .project-work-label');
        if (workLabel) {
            workLabel.classList.remove('alt-active');
            workLabelToggleInterval = setInterval(() => {
                if (document.hidden) return;
                workLabel.classList.toggle('alt-active');
            }, 3000);
        }
    }
};

initMessageRouter();
registerMessageHandler(MESSAGE_TYPES.SOFT_RESET, () => softResetProjectsApp());
registerMessageHandler(MESSAGE_TYPES.WINDOW_MINIMIZED, () => pauseProjectAppActivity());
registerMessageHandler(MESSAGE_TYPES.WINDOW_RESTORED, () => resumeProjectAppActivity());
registerMessageHandler(MESSAGE_TYPES.SET_MAXIMIZED_STATE, (message) => setMaximizedState(message.data.maximized));
registerMessageHandler(MESSAGE_TYPES.WINDOW_MAXIMIZED, () => setMaximizedState(true));
registerMessageHandler(MESSAGE_TYPES.WINDOW_UNMAXIMIZED, () => setMaximizedState(false));
registerMessageHandler(MESSAGE_TYPES.WINDOW_FOCUSED, () => handleWindowFocus());
registerMessageHandler(MESSAGE_TYPES.WINDOW_BLURRED, () => handleWindowBlur());
registerMessageHandler(MESSAGE_TYPES.TOOLBAR_ACTION, (message) => {
    const {
        action
    } = message.data;
    switch (action) {
        case 'navigateHome':
            hideProjectDetail();
            break;
        case 'nav:next':
            navigateToNextProject();
            break;
        case 'nav:prev':
            navigateToPreviousProject();
            break;
        case 'overlays:toggle':
            toggleProjectOverlays(domCache);
            break;
        default:
            break;
    }
});

const applyProjectsHeightConstraintFromFontSizes = () => {
    try {
        const projectTitleElement = document.querySelector('.project-text .project-title') || document.querySelector('.project .project-title');
        if (!projectTitleElement) return;

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const constrainedRatio = 0.9;
        const constrainedFontSize = constrainedRatio * rootFontSize;
        const actualFontSize = parseFloat(getComputedStyle(projectTitleElement).fontSize) || 0;
        const tolerance = 0.5;

        if (actualFontSize <= constrainedFontSize + tolerance) {
            document.documentElement.classList.add('projects-height-constrained');
        } else {
            document.documentElement.classList.remove('projects-height-constrained');
        }
    } catch (error) {
        // Ignore error
    }
};

window.addEventListener('resize', () => {
    applyProjectsHeightConstraintFromFontSizes();
});

window.addEventListener('message', (event) => {
    try {
        if (!event || !event.data) return;
        if (event.data.type === 'window-resized' && typeof event.data.height !== 'undefined') {
            applyProjectsHeightConstraintFromFontSizes();
        }
    } catch (error) {
        // Ignore error
    }
});

const getAddressBarElement = () => window.parent && window.parent.document && window.parent.document.querySelector('#projects-window .addressbar');

if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
    const {
        eventBus: parentBus,
        EVENTS: PEV
    } = window.parent;
    parentBus.subscribe(PEV.MEDIA_GLOBAL_PAUSE, () => {
        queryProjectVideos().forEach((video) => {
            try {
                if (!video.paused) {
                    video.pause();
                }
            } catch (error) {
                // Ignore error
            }
        });
    });
}

const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const showProjectDetail = async (projectIndex) => {
    const project = projectsData[projectIndex];
    if (!project) return;

    currentProjectIndex = projectIndex;
    projectsDataManager.setCurrentIndex(projectIndex);

    const filteredPos = validProjectIndices.indexOf(projectIndex);
    if (filteredPos !== -1) {
        currentFilteredProjectPos = filteredPos;
        projectsDataManager.setCurrentFilteredPos(filteredPos);
    }

    const gridContainer = document.getElementById('grid-container');
    const detailContainer = document.getElementById(SELECTORS.detailContainer.slice(1));
    const detailInnerContainer = detailContainer && detailContainer.querySelector('.detail-container');
    const detailContent = (detailContainer && detailContainer.closest('.detail-content')) || document.querySelector('.detail-content');

    if (!gridContainer || !detailContainer || !detailInnerContainer) return;

    try {
        pauseVideos(detailContainer.querySelectorAll('video'));
        if (detailContainer._carouselController && typeof detailContainer._carouselController.destroy === 'function') {
            detailContainer._carouselController.destroy();
            detailContainer._carouselController = null;
        }
        if (detailContainer._contentSwitchingCleanup && typeof detailContainer._contentSwitchingCleanup === 'function') {
            detailContainer._contentSwitchingCleanup();
            detailContainer._contentSwitchingCleanup = null;
        }
        if (detailContainer._headerLabelResizeHandler) {
            window.removeEventListener('resize', detailContainer._headerLabelResizeHandler);
            detailContainer._headerLabelResizeHandler = null;
        }
    } catch (error) {
        // ignore error
    }

    try {
        [
            document.querySelector('.detail-content-container'),
            document.querySelector('.detail-content'),
            document.querySelector('.detail-container'),
        ].filter(Boolean).forEach((element) => {
            if (element && element.scrollTop > 0) {
                element.scrollTop = 0;
            }
        });

        if (document.documentElement.classList.contains('mobile-device')) {
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }
    } catch (error) {
        // ignore error
    }

    const addressBarElement = getAddressBarElement();
    let appLoader = null;
    if (addressBarElement) {
        appLoader = new AppLoader(`project-${project.title}`, addressBarElement);
        appLoader.reset();
        appLoader.startLoading(5);
    }

    detailInnerContainer.innerHTML = '';

    try {
        pauseVideos(document.querySelectorAll('#projects-grid-view video'));
    } catch (error) {
        // ignore error
    }

    gridContainer.style.display = 'none';
    detailContainer.style.display = 'flex';

    const mobileInteractionBlocker = document.getElementById('mobile-interaction-blocker');
    if (mobileInteractionBlocker) {
        mobileInteractionBlocker.style.display = 'none';
    }

    const loadProjectContent = async () => {
        if (!appLoader) return null;

        appLoader.setProgress(10);
        await delay(50);

        try {
            if (document.documentElement.classList.contains('mobile-device')) {
                document.body.classList.add('detail-view-active');
            }
        } catch (error) {
            // ignore error
        }

        appLoader.setProgress(20);
        await delay(75);

        const mediaItems = createMediaItemsArray(project);
        appLoader.setProgress(35);
        await delay(60);

        const assetsToLoad = [];
        mediaItems.forEach((item) => {
            if (item.src) {
                const src = document.documentElement.classList.contains('mobile-device') && item.srcMobile ? item.srcMobile : item.src;
                assetsToLoad.push(`../../../${src}`);
            }
            if (item.poster) {
                const poster = document.documentElement.classList.contains('mobile-device') && item.posterMobile ? item.posterMobile : item.poster;
                assetsToLoad.push(`../../../${poster}`);
            }
        });

        appLoader.setProgress(50);
        await delay(80);

        if (assetsToLoad.length > 0) {
            await appLoader.loadAssets(assetsToLoad, 60, 80);
        } else {
            appLoader.setProgress(80);
            await delay(100);
        }

        appLoader.setProgress(85);
        await delay(40);

        detailInnerContainer.innerHTML = createUnifiedCarouselContent(project, mediaItems);
        appLoader.setProgress(90);
        await delay(30);

        return mediaItems;
    };

    const mediaItems = await loadProjectContent();
    if (!mediaItems) return;

    setupContentSwitching(detailContainer);

    if (workLabelToggleInterval) {
        clearInterval(workLabelToggleInterval);
        workLabelToggleInterval = null;
    }

    try {
        if (detailContainer._carouselController && typeof detailContainer._carouselController.destroy === 'function') {
            detailContainer._carouselController.destroy();
        }
    } catch (error) {
        // ignore error
    }

    const carouselController = setupUnifiedCarousel(detailContainer, project, mediaItems);
    detailContainer._carouselController = carouselController;

    if (appLoader) {
        appLoader.setProgress(95);
        await delay(50);
    }

    try {
        if (document.documentElement.classList.contains('mobile-device')) {
            setTimeout(() => {
                const sliderItems = detailContainer.querySelectorAll('.cascade-slider_item');
                if (sliderItems && sliderItems.length) {
                    const mobileCarouselController = createCarouselController(detailContainer, project, mediaItems);
                    if (mobileCarouselController && typeof mobileCarouselController.getCurrentIndex === 'function') {
                        const currentIndex = mobileCarouselController.getCurrentIndex();
                        mobileCarouselController.navigateToSlide(currentIndex);
                    }
                }
            }, 30);
        }
    } catch (error) {
        // ignore error
    }

    const headerButton = detailInnerContainer.querySelector('.project-header-button');
    const speakerButton = detailInnerContainer.querySelector('.project-speaker-button');
    const workTypeHeader = detailInnerContainer.querySelector('.work-type-header');

    if (speakerButton) {
        try {
            const getCurrentVideo = () => {
                const currentSlide = detailInnerContainer.querySelector('.cascade-slider_item.now');
                if (!currentSlide) return null;
                return currentSlide.querySelector('video');
            };

            const updateSpeakerIcon = () => {
                speakerButton.setAttribute('data-muted', getGlobalMutePreference() ? 'true' : 'false');
            };

            const updateSpeakerVisibility = () => {
                const currentSlide = detailInnerContainer.querySelector('.cascade-slider_item.now');
                if (!currentSlide) {
                    speakerButton.style.visibility = 'hidden';
                    return;
                }
                const hasVideo = !!currentSlide.querySelector('video');
                speakerButton.style.visibility = hasVideo ? 'visible' : 'hidden';
            };

            updateSpeakerIcon();
            updateSpeakerVisibility();

            const toggleMute = () => {
                setGlobalMutePreference(!getGlobalMutePreference());
                const allVideos = detailInnerContainer.querySelectorAll('.cascade-slider_item video');
                allVideos.forEach((video) => {
                    video.muted = getGlobalMutePreference();
                    if (!getGlobalMutePreference()) {
                        video.volume = 0.35;
                    }
                });

                const currentVideo = getCurrentVideo();
                if (currentVideo && !currentVideo.muted && currentVideo.paused && currentVideo.readyState >= 2) {
                    currentVideo.play().catch(() => {});
                }
                updateSpeakerIcon();
            };

            speakerButton.addEventListener('click', toggleMute);
            speakerButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleMute();
                }
            });

            const slidesContainer = detailInnerContainer.querySelector('.cascade-slider_slides');
            if (slidesContainer && window.MutationObserver) {
                const observer = new MutationObserver(() => {
                    requestAnimationFrame(() => {
                        const currentVideo = getCurrentVideo();
                        if (currentVideo) {
                            currentVideo.muted = getGlobalMutePreference();
                            if (!getGlobalMutePreference()) {
                                currentVideo.volume = 0.75;
                            }
                        }
                        updateSpeakerIcon();
                        updateSpeakerVisibility();
                    });
                });
                observer.observe(slidesContainer, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['class']
                });
            }
        } catch (error) {
            // ignore error
        }
    }

    if (headerButton) {
        const onHeaderButtonClick = () => {
            const isMediaPlayer = project.headerButton && (project.headerButton.programName === 'mediaPlayer' || project.headerButton.action === 'openMediaPlayer');
            if (document.documentElement.classList.contains('mobile-device')) {
                const isImageViewer = project.headerButton && (project.headerButton.programName === 'image-viewer' || project.headerButton.action === 'openImageViewer');
                if (isMediaPlayer) {
                    sendMessageToParent({
                        type: 'open-program',
                        programName: 'mediaPlayer'
                    });
                    return;
                }
                if (isImageViewer) {
                    let initialIndex = 0;
                    try {
                        const sliderContainer = document.querySelector('.cascade-slider_container');
                        if (sliderContainer && sliderContainer.hasAttribute('data-current-index')) {
                            initialIndex = parseInt(sliderContainer.getAttribute('data-current-index'), 10) || 0;
                        }
                    } catch (e) {
                        //
                    }
                    sendMessageToParent({
                        type: 'confirm-open-program',
                        programName: 'image-viewer',
                        title: 'Image Viewer',
                        icon: './assets/gui/start-menu/photos.webp',
                        initialIndex,
                        projectTitle: project.title,
                    });
                    return;
                }
                if (project.headerButton && project.headerButton.url) {
                    sendMessageToParent({
                        type: 'confirm-open-link',
                        label: project.headerButton.label || project.title || 'External link',
                        url: project.headerButton.url,
                    });
                    return;
                }
            }

            if (project.headerButton && project.headerButton.url) {
                const {
                    url
                } = project.headerButton;
                if (url.includes('keepthescore.com') || url.includes('github.com/mitchivin')) {
                    sendMessageToParent({
                        type: 'confirm-open-link',
                        label: project.headerButton.label || project.title || 'External link',
                        url,
                    });
                } else {
                    window.open(url, '_blank');
                }
                return;
            }

            const defaultProgram = project.headerButton && project.headerButton.programName || 'mediaPlayer';
            const actionToProgramMap = {
                openMediaPlayer: 'mediaPlayer',
                openImageViewer: 'image-viewer',
            };
            const programName = actionToProgramMap[project.headerButton && project.headerButton.action || ''] || defaultProgram;

            const message = {
                type: 'open-program',
                programName
            };
            if (programName === 'image-viewer') {
                let initialIndex = 0;
                try {
                    const sliderContainer = document.querySelector('.cascade-slider_container');
                    if (sliderContainer && sliderContainer.hasAttribute('data-current-index')) {
                        initialIndex = parseInt(sliderContainer.getAttribute('data-current-index'), 10) || 0;
                    }
                } catch (e) {
                    //
                }
                message.initialIndex = initialIndex;
                message.projectTitle = project.title;
            }
            sendMessageToParent(message);
        };

        headerButton.addEventListener('click', onHeaderButtonClick);
        headerButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onHeaderButtonClick();
            }
        });
    }

    if (workTypeHeader) {
        workTypeHeader.classList.remove('alt-active');
        const toggleWorkLabel = () => {
            workTypeHeader.classList.toggle('alt-active');
        };
        workLabelToggleInterval = setInterval(toggleWorkLabel, 3000);

        const updateWorkLabel = () => {
            const isCompact = document.documentElement.classList.contains('mobile-device') || isCompactViewport();
            const workType = workTypeHeader.getAttribute('data-work-type') === 'client' ? 'client' : 'personal';
            workTypeHeader.textContent = formatWorkLabel(workType, isCompact);
        };
        updateWorkLabel();
        window.addEventListener('resize', updateWorkLabel, {
            passive: true
        });
        try {
            detailContainer._headerLabelResizeHandler = updateWorkLabel;
        } catch (e) {
            //
        }
    }

    if (isFirefox()) {
        const scrollableContainer = detailInnerContainer || detailContent || detailContainer;
        if (scrollableContainer) {
            setTimeout(() => {
                try {
                    const {
                        scrollTop
                    } = scrollableContainer;
                    if (typeof scrollableContainer.scrollTo === 'function') {
                        scrollableContainer.scrollTo({
                            top: scrollTop + 1,
                            behavior: 'auto'
                        });
                        setTimeout(() => scrollableContainer.scrollTo({
                            top: scrollTop,
                            behavior: 'auto'
                        }), 10);
                    } else {
                        scrollableContainer.scrollTop = scrollTop + 1;
                        setTimeout(() => {
                            scrollableContainer.scrollTop = scrollTop;
                        }, 10);
                    }
                } catch (error) {
                    // ignore error
                }
            }, 100);
        }
    }

    if (document.documentElement.classList.contains('mobile-device')) {
        const container = detailContainer;
        if (container) {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchMoveX = 0;
            let touchMoveY = 0;
            let isSwiping = false;

            const onTouchStart = (event) => {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                touchMoveX = 0;
                touchMoveY = 0;
                isSwiping = false;
            };

            const onTouchMove = (event) => {
                if (!touchStartX || !touchStartY) return;
                touchMoveX = event.touches[0].clientX - touchStartX;
                touchMoveY = event.touches[0].clientY - touchStartY;
                if (Math.abs(touchMoveX) > 10 && Math.abs(touchMoveX) > Math.abs(touchMoveY)) {
                    isSwiping = true;
                    event.preventDefault();
                }
            };

            const onTouchEnd = () => {
                if (isSwiping && Math.abs(touchMoveX) > 50) {
                    container.style.transform = 'translateX(0)';
                }
                touchStartX = 0;
                touchStartY = 0;
                touchMoveX = 0;
                touchMoveY = 0;
                isSwiping = false;
            };

            container.addEventListener('touchstart', onTouchStart, {
                passive: false
            });
            container.addEventListener('touchmove', onTouchMove, {
                passive: false
            });
            container.addEventListener('touchend', onTouchEnd, {
                passive: false
            });

            const rightContent = container.querySelector('.detail-content-right');
            if (rightContent) {
                rightContent.addEventListener('touchstart', onTouchStart, {
                    passive: false
                });
                rightContent.addEventListener('touchmove', onTouchMove, {
                    passive: false
                });
                rightContent.addEventListener('touchend', onTouchEnd, {
                    passive: false
                });
            }
        }
    }

    if (document.documentElement.classList.contains('mobile-device')) {
        const scrollableContainer = detailInnerContainer;
        if (scrollableContainer) {
            setTimeout(() => {
                try {
                    const {
                        scrollTop
                    } = scrollableContainer;
                    scrollableContainer.scrollTop = scrollTop + 1;
                    setTimeout(() => {
                        scrollableContainer.scrollTop = scrollTop;
                    }, 10);
                } catch (error) {
                    // ignore error
                }
            }, 100);
        }
    }

    updateAddressBar(project.title);
    sendMessageToParent({
        type: 'project:view-state',
        inDetailView: true,
        hasPrevious: currentFilteredProjectPos > 0,
        hasNext: currentFilteredProjectPos < validProjectIndices.length - 1,
    });
    sendMessageToParent({
        type: 'ui:home-enabled',
        enabled: true
    });
    sendMessageToParent({
        type: 'nav:enabled',
        enabled: true
    });

    if (appLoader) appLoader.complete();
};

const hideProjectDetail = () => {
    const {
        gridContainer,
        detailContainer
    } = domCache;
    if (!gridContainer || !detailContainer) return;

    try {
        pauseVideos(detailContainer.querySelectorAll('video'));
        if (detailContainer._carouselController && typeof detailContainer._carouselController.destroy === 'function') {
            detailContainer._carouselController.destroy();
        }
        detailContainer._carouselController = null;
        if (detailContainer._arrowResizeCleanup) {
            window.removeEventListener('resize', detailContainer._arrowResizeCleanup);
            detailContainer._arrowResizeCleanup = null;
        }
        setGlobalMutePreference(true);
    } catch (error) {
        // ignore error
    }

    try {
        if (detailContainer._contentSwitchingCleanup && typeof detailContainer._contentSwitchingCleanup === 'function') {
            detailContainer._contentSwitchingCleanup();
            detailContainer._contentSwitchingCleanup = null;
        }
    } catch (error) {
        // ignore error
    }

    gridContainer.style.display = 'flex';
    detailContainer.style.display = 'none';

    if (document.documentElement.classList.contains('mobile-device')) {
        const mobileBlocker = domCache.mobileBlocker;
        if (mobileBlocker && !mobileBlocker.parentNode) {
            document.body.appendChild(mobileBlocker);
            mobileBlocker.style.display = 'block';
        }
    }

    try {
        if (document.documentElement.classList.contains('mobile-device')) {
            document.body.classList.remove('detail-view-active');
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }
    } catch (error) {
        // ignore error
    }

    sendMessageToParent({
        type: 'project:view-state',
        inDetailView: false,
        hasPrevious: false,
        hasNext: false,
    });
    sendMessageToParent({
        type: 'ui:home-enabled',
        enabled: false
    });
    sendMessageToParent({
        type: 'nav:enabled',
        enabled: false
    });

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'update-address-bar',
            title: 'https://www.myprojects.com'
        }, '*');
    }

    try {
        setupVideoObserver();
    } catch (error) {
        // ignore error
    }
};

const navigateToNextProject = () => {
    const navResult = calculateNextProjectNavigation(validProjectIndices, currentProjectIndex, currentFilteredProjectPos);
    if (navResult) {
        currentFilteredProjectPos = navResult.newFilteredPos;
        projectsDataManager.setCurrentFilteredPos(navResult.newFilteredPos);
        showProjectDetail(navResult.nextIndex);
    }
};

const navigateToPreviousProject = () => {
    const navResult = calculatePreviousProjectNavigation(validProjectIndices, currentProjectIndex, currentFilteredProjectPos);
    if (navResult) {
        currentFilteredProjectPos = navResult.newFilteredPos;
        projectsDataManager.setCurrentFilteredPos(navResult.newFilteredPos);
        showProjectDetail(navResult.prevIndex);
    }
};

window.hideProjectDetail = hideProjectDetail;
window.navigateToNextProject = navigateToNextProject;
window.navigateToPreviousProject = navigateToPreviousProject;

const setupSideAreaScrolling = () => {
    const sideContainers = document.querySelectorAll('.side-container');
    const detailContent = document.querySelector('.detail-content');

    if (detailContent) {
        sideContainers.forEach((container) => {
            container.addEventListener('wheel', (event) => {
                event.preventDefault();
                const scrollAmount = event.deltaY * 0.5;
                detailContent.scrollBy({
                    top: scrollAmount,
                    behavior: 'auto'
                });
            }, {
                passive: false
            });
        });
        return;
    }

    const gridView = document.querySelector('.projects-grid-view');
    if (gridView) {
        sideContainers.forEach((container) => {
            container.addEventListener('wheel', (event) => {
                event.preventDefault();
                const scrollAmount = event.deltaY * 0.5;
                gridView.scrollBy({
                    top: scrollAmount,
                    behavior: 'auto'
                });
            }, {
                passive: false
            });
        });
    }
};

const setupMobileInteraction = () => {
    if (document.documentElement.classList.contains('mobile-device')) {
        const blocker = document.createElement('div');
        blocker.id = 'mobile-interaction-blocker';
        blocker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        background: transparent;
        pointer-events: none;
        touch-action: pan-y pinch-zoom;
      `;

        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let hasMoved = false;

        blocker.addEventListener('touchstart', (event) => {
            touchStartTime = Date.now();
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            hasMoved = false;
            blocker.style.pointerEvents = 'auto';

            const grid = domCache.grid;
            const projects = grid ? grid.querySelectorAll('.project') : [];
            const allHovered = projects.length > 0 && Array.from(projects).every(p => p.classList.contains('hover'));

            if (allHovered) {
                const element = document.elementFromPoint(touchStartX, touchStartY);
                const project = element ? element.closest('.project') : null;
                if (project && !project.classList.contains('hover')) {
                    project.classList.add('hover');
                }
            }
        }, {
            passive: true
        });

        blocker.addEventListener('touchmove', (event) => {
            const moveX = event.touches[0].clientX;
            const moveY = event.touches[0].clientY;
            const deltaX = Math.abs(moveX - touchStartX);
            const deltaY = Math.abs(moveY - touchStartY);

            if (deltaX > 10 || deltaY > 10) {
                hasMoved = true;
                const grid = domCache.grid;
                const projects = grid ? grid.querySelectorAll('.project') : [];
                const allHovered = projects.length > 0 && Array.from(projects).every(p => p.classList.contains('hover'));

                if (allHovered) {
                    projects.forEach((p) => {
                        if (!p.classList.contains('hover')) {
                            p.classList.add('hover');
                        }
                    });
                }
            }
        }, {
            passive: true
        });

        blocker.addEventListener('touchend', (event) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const deltaX = Math.abs(event.changedTouches[0].clientX - touchStartX);
            const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY);
            blocker.style.pointerEvents = 'none';

            if (touchDuration < 300 && deltaX < 10 && deltaY < 10 && !hasMoved) {
                const endX = event.changedTouches[0].clientX;
                const endY = event.changedTouches[0].clientY;
                const element = document.elementFromPoint(endX, endY);

                if (element) {
                    let projectElement = element.closest('.project');
                    if (!projectElement) {
                        const grid = domCache.grid;
                        if (grid) {
                            const projects = grid.querySelectorAll('.project');
                            // eslint-disable-next-line no-restricted-syntax
                            for (const p of projects) {
                                const rect = p.getBoundingClientRect();
                                if (endX >= rect.left && endX <= rect.right && endY >= rect.top && endY <= rect.bottom) {
                                    projectElement = p;
                                    break;
                                }
                            }
                        }
                    }

                    if (projectElement) {
                        const projectIndex = parseInt(projectElement.dataset.idx, 10);
                        if (!Number.isNaN(projectIndex) && projectsData[projectIndex] && !projectsData[projectIndex].placeholder) {
                            event.preventDefault();
                            event.stopPropagation();
                            showProjectDetail(projectIndex);
                            return;
                        }
                    }
                }
            }
            event.preventDefault();
            event.stopPropagation();
        }, {
            passive: false
        });

        blocker.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        blocker.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        const toggleBlocker = () => {
            const detailContainer = document.getElementById(SELECTORS.detailContainer.slice(1));
            const inDetailView = detailContainer && detailContainer.style.display !== 'none';
            if (inDetailView) {
                if (blocker.parentNode) {
                    blocker.parentNode.removeChild(blocker);
                }
            } else if (!blocker.parentNode) {
                document.body.appendChild(blocker);
            }
        };

        toggleBlocker();

        const observer = new MutationObserver(toggleBlocker);
        const detailContainer = document.getElementById(SELECTORS.detailContainer.slice(1));
        if (detailContainer) {
            observer.observe(detailContainer, {
                attributes: true,
                attributeFilter: ['style']
            });
        }

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'project:view-state') {
                setTimeout(toggleBlocker, 100);
            }
        });
    }
};

const setupContentSwitching = (container) => {
    const briefTitle = container.querySelector('.brief-title');
    const descriptionTitle = container.querySelector('.description-title');
    const briefContent = container.querySelector('.brief-content');
    const descriptionContent = container.querySelector('.description-content');

    if (!briefTitle || !descriptionTitle || !briefContent || !descriptionContent) return;

    const loadLazyDescription = () => {
        if (!descriptionContent || descriptionContent.getAttribute('data-lazy-description') !== 'pending') return;

        const project = (typeof currentProjectIndex === 'number') ? projectsData[currentProjectIndex] : null;
        let description = project && project.description ? project.description : 'Project details will go here...';
        if (/[<>]/.test(description)) {
            try {
                description = sanitizeHTML(description);
            } catch (e) {
                //
            }
        }
        let briefForDesc = '';
        let truncatedBrief = '';
        try {
            let fullBrief = (project && (project.brief || project.subtitle) ? (project.brief || project.subtitle) : '').trim();
            fullBrief = fullBrief.replace(/\s+/g, ' ');
            const firstSentenceMatch = fullBrief.match(/[^.!?]*[.!?]/);
            truncatedBrief = firstSentenceMatch ? firstSentenceMatch[0].trim() : fullBrief.slice(0, 140).replace(/\s+\S*$/, '');
            if (truncatedBrief && truncatedBrief.length < fullBrief.length) {
                truncatedBrief = `${truncatedBrief.replace(/[.!?]?$/, '')}.`;
            }
            if (truncatedBrief) {
                briefForDesc = `<p class="detail-brief-line desc-tab has-label maybe-hide-mobile"><span class="ov-label">Brief:</span> <span class="ov-text">${sanitizeHTML(truncatedBrief)}</span></p>`;
            }
        } catch (e) {
            //
        }

        const descHtml = `<p class="detail-description-line has-label maybe-hide-mobile"><span class="ov-label">Desc:</span> <span class="ov-text">${description}</span></p>`;
        const mobileDescHtml = `<p class="detail-description mobile-only-desc">${description}</p>`;
        descriptionContent.innerHTML = `${briefForDesc}${descHtml}${mobileDescHtml}`;
        descriptionContent.setAttribute('data-lazy-description', 'loaded');
    };


    let lastSwitchTime = 0;
    let isSwitching = false;

    const switchContent = (target) => {
        const now = Date.now();
        if (isSwitching && (now - lastSwitchTime < 100)) return;

        lastSwitchTime = now;
        isSwitching = true;
        if (swipeHandler) swipeHandler.setTransitioning(true);

        const isMobile = document.documentElement.classList.contains('mobile-device');

        if (isMobile) {
            const containerEl = document.querySelector('.detail-content-container');
            const {
                scrollTop
            } = containerEl || {
                scrollTop: 0
            };
            briefTitle.classList.remove('active');
            descriptionTitle.classList.remove('active');

            if (target === 'brief') {
                briefTitle.classList.add('active');
                briefContent.style.display = 'block';
                descriptionContent.style.display = 'none';
            } else if (target === 'description') {
                descriptionTitle.classList.add('active');
                loadLazyDescription();
                descriptionContent.style.display = 'block';
                briefContent.style.display = 'none';
            }
            if (containerEl) containerEl.scrollTop = scrollTop;

            setTimeout(() => {
                isSwitching = false;
                if (swipeHandler) swipeHandler.setTransitioning(false);
            }, 50);
        } else {
            briefTitle.classList.remove('active');
            descriptionTitle.classList.remove('active');
            briefContent.classList.add('hidden');
            descriptionContent.classList.add('hidden');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (target === 'brief') {
                        briefTitle.classList.add('active');
                        briefContent.classList.remove('hidden');
                    } else if (target === 'description') {
                        descriptionTitle.classList.add('active');
                        loadLazyDescription();
                        descriptionContent.classList.remove('hidden');
                    }
                    setTimeout(() => {
                        isSwitching = false;
                        if (swipeHandler) swipeHandler.setTransitioning(false);
                    }, 300);
                });
            });
        }
    };

    const isMobile = document.documentElement.classList.contains('mobile-device');
    if (isMobile) {
        briefContent.style.display = 'block';
        descriptionContent.style.display = 'none';
        briefTitle.classList.add('active');
    }

    briefTitle.addEventListener('click', () => switchContent('brief'));
    descriptionTitle.addEventListener('click', () => switchContent('description'));

    let swipeHandler = null;
    const swipeContainer = container.querySelector('.detail-content-container');
    const setupSwipeHandler = () => {
        try {
            const isMobileDevice = document.documentElement.classList.contains('mobile-device');
            if (isMobileDevice && !swipeHandler && swipeContainer) {
                swipeHandler = new SwipeGestureHandler(swipeContainer,
                    () => {
                        switchContent('description');
                    },
                    () => {
                        switchContent('brief');
                    });
                swipeHandler.enable();
            } else if (!isMobileDevice && swipeHandler) {
                swipeHandler.destroy();
                swipeHandler = null;
            }
        } catch (error) {
            if (swipeHandler) {
                try {
                    swipeHandler.destroy();
                } catch (e) {
                    //
                }
                swipeHandler = null;
            }
        }
    };

    setupSwipeHandler();

    let resizeTimeout = null;
    const onResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupSwipeHandler();
            resizeTimeout = null;
        }, 150);
    };

    window.addEventListener('resize', onResize, {
        passive: true
    });

    const cleanup = () => {
        try {
            window.removeEventListener('resize', onResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
                resizeTimeout = null;
            }
            if (swipeHandler) {
                swipeHandler.destroy();
                swipeHandler = null;
            }
        } catch (error) {
            // ignore error
        }
    };

    if (container) {
        container._contentSwitchingCleanup = cleanup;
    }

    if (descriptionTitle.classList.contains('active')) {
        import('../../scripts/utils/frameScheduler.js').then(({
            scheduleAfter
        }) => {
            scheduleAfter(() => setTimeout(loadLazyDescription, 40));
        });
    }

    return {
        cleanup,
        swipeHandler
    };
};

const init = async () => {
    const addressBarElement = getAddressBarElement();
    let appLoader = null;
    if (addressBarElement) {
        appLoader = new AppLoader('projects', addressBarElement, () => {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'app-fully-loaded',
                    appId: 'projects-window'
                }, '*');
            }
        });
        appLoader.startLoading(5);
    }

    try {
        initializeCachedElements();
        projectsData = await projectsDataManager.loadProjects(appLoader);
        validProjectIndices = projectsDataManager.getValidIndices();
        currentFilteredProjectPos = projectsDataManager.getCurrentFilteredPos();

        const grid = domCache.grid;
        if (!grid) throw new Error('Projects grid not found');

        const initialProjects = projectsData.slice(0, 6);
        const maxInitialProjects = 6;
        const assetsToLoad = [];

        initialProjects.forEach((project) => {
            if (project && !project.placeholder) {
                if (document.documentElement.classList.contains('mobile-device') && project.srcMobile) {
                    assetsToLoad.push(`../../../${project.srcMobile}`);
                } else if (project.src) {
                    assetsToLoad.push(`../../../${project.src}`);
                }
            }
        });

        if (appLoader && assetsToLoad.length > 0) {
            await appLoader.loadAssets(assetsToLoad, 50, 70);
        } else if (appLoader) {
            appLoader.setProgress(70);
        }

        for (let i = 0; i < maxInitialProjects; i += 1) {
            let projectElement;
            if (i < initialProjects.length) {
                projectElement = createProject(initialProjects[i], i);
                projectElement.addEventListener('click', (event) => handleProjectClick(event, showProjectDetail));
            } else {
                projectElement = createElement('div', `project ${CLASSES.empty}`);
            }
            grid.appendChild(projectElement);
        }

        if (appLoader) {
            appLoader.setProgress(75);
        }

        const centerGridVertically = () => {
            try {
                if (!domCache.grid || document.documentElement.classList.contains('mobile-device')) {
                    if (domCache.grid) {
                        domCache.grid.classList.remove('center-vertically');
                    }
                    return;
                }
                const gridEl = domCache.grid;
                const projectElements = Array.from(gridEl.children).filter(el => !el.classList.contains('empty'));
                const contentBottom = projectElements.reduce((max, p) => {
                    const rect = p.getBoundingClientRect();
                    return Math.max(max, rect.bottom);
                }, 0);
                const gridRect = gridEl.getBoundingClientRect();
                const contentHeight = contentBottom ? (contentBottom - gridRect.top) : gridEl.scrollHeight;
                const unusedSpace = gridRect.height - contentHeight;

                if (unusedSpace > 8) {
                    gridEl.classList.add('center-vertically');
                } else {
                    gridEl.classList.remove('center-vertically');
                }
            } catch (error) {
                // ignore
            }
        };

        import('../../scripts/utils/frameScheduler.js').then(({
            scheduleAfter
        }) => scheduleAfter(centerGridVertically));
        window.addEventListener('resize', centerGridVertically, {
            passive: true
        });

        initializeGridFeatures(domCache);
        setupMobileInteraction();
        setupVideoObserver();
        setupSideAreaScrolling();
        grid.classList.add(CLASSES.loaded);

        import('../../scripts/utils/frameScheduler.js').then(({
            scheduleAfter
        }) => scheduleAfter(centerGridVertically));

        const updateWorkLabels = () => {
            const isCompact = document.documentElement.classList.contains('mobile-device') || isCompactViewport();
            queryWorkLabels().forEach((label) => {
                const workType = label.getAttribute('data-work-type') === 'client' ? 'client' : 'personal';
                label.textContent = formatWorkLabel(workType, isCompact);
            });
        };
        updateWorkLabels();
        window.addEventListener('resize', updateWorkLabels, {
            passive: true
        });

        if (appLoader) {
            appLoader.setProgress(95);
            setTimeout(() => {
                appLoader.complete();
            }, 300);
        }
        sendMessageToParent({
            type: 'projects-ready'
        });
    } catch (error) {
        if (appLoader) appLoader.complete();
        sendMessageToParent({
            type: 'projects-ready'
        });
    }
};

document.addEventListener('DOMContentLoaded', init);