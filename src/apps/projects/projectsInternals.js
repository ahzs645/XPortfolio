export const CAROUSEL_DRAG_THRESHOLD = 60;
export const CAROUSEL_MAX_VERTICAL_DRIFT = 80;

export const SELECTORS = {
    grid: '#projects-grid-view',
    gridContainer: '#grid-container',
    detailContainer: '#detail-container',
    detailContent: '.detail-container',
    slider: '.cascade-slider_slides',
    sliderItem: '.cascade-slider_item',
    sliderDot: '.cascade-slider_dot',
    arrowLeft: '.cascade-slider_arrow-left',
    arrowRight: '.cascade-slider_arrow-right',
    mobileBlocker: 'mobile-interaction-blocker',
};

export const CLASSES = {
    loaded: 'loaded',
    visible: 'visible',
    hover: 'hover',
    dimmed: 'dimmed',
    empty: 'empty',
    now: 'now',
    next: 'next',
    prev: 'prev',
    cur: 'cur',
};

export const MESSAGE_TYPES = {
    SOFT_RESET: 'window:soft-reset',
    WINDOW_MINIMIZED: 'window:minimized',
    WINDOW_RESTORED: 'window:restored',
    SET_MAXIMIZED_STATE: 'set-maximized-state',
    WINDOW_MAXIMIZED: 'window:maximized',
    WINDOW_UNMAXIMIZED: 'window:unmaximized',
    WINDOW_FOCUSED: 'window:focused',
    WINDOW_BLURRED: 'window:blurred',
    TOOLBAR_ACTION: 'toolbar:action',
};

export const queryAll = (selector, parent = document) => (parent ? Array.from(parent.querySelectorAll(selector)) : []);

export const queryWorkLabels = (parent = document) => queryAll('.project-text .project-work-label', parent);

export const queryActiveHoverWorkLabels = (parent = document) => queryAll('.project.hover .project-text .project-work-label', parent);

export const queryProjectVideos = (parent = document) => queryAll('.project video', parent);

export const guardedCall = (callback) => {
    try {
        return callback();
    } catch (e) {
        // ignore
    }
    return undefined;
};

export const createElement = (tagName, className = '', textContent = '') => {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
};

export const formatWorkLabel = (workType, isCompact) => {
    const isClient = workType === 'client';
    if (isCompact) {
        return isClient ? 'Client' : 'Personal';
    }
    return isClient ? 'Client Work' : 'Personal Work';
};

export const isCompactViewport = () => window.innerHeight <= 500;

export const sendMessageToParent = (payload) => {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, '*');
    }
};

export const getHoverLabelForProject = (project) => {
    if (project.category) {
        return project.category;
    }
    const headerButton = project.headerButton || {};
    const url = headerButton.url || '';

    if (headerButton.programName === 'image-viewer' || headerButton.action === 'openImageViewer') {
        return 'Image';
    }
    if (headerButton.action === 'openMediaPlayer' || headerButton.programName === 'mediaPlayer') {
        return 'Video';
    }
    if (url.includes('github.com')) {
        return 'Web';
    }
    if (project.workType === 'client') {
        return 'Client';
    }
    return 'Personal';
};

export const resolveAssetPath = (path) => {
    if (!path || path === 'placeholder' || path.startsWith('../../../') || path.startsWith('http')) {
        return path;
    }
    return `../../../${path}`;
};

export const resolveOptimizedSrc = (project, srcType = 'src') => {
    const mobileSrc = project[`${srcType}Mobile`];
    const desktopSrc = project[srcType];
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('mobile-device') && mobileSrc) {
        return resolveAssetPath(mobileSrc);
    }
    return resolveAssetPath(desktopSrc);
};

export const createVideoElement = (project) => {
    const video = createElement('video');
    video.src = resolveOptimizedSrc(project, 'src');
    if (project.poster) {
        video.poster = resolveOptimizedSrc(project, 'poster');
    }

    Object.assign(video, {
        autoplay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: 'auto',
    });
    try {
        video.setAttribute('disablePictureInPicture', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('disableremoteplayback', '');
    } catch (e) {
        //
    }

    video.alt = project.alt || project.title || 'Project Video';

    try {
        video.load();
        video.play().catch(() => {});
    } catch (e) {
        //
    }
    return video;
};

export const createImageElement = (project) => {
    const img = createElement('img');
    img.src = resolveOptimizedSrc(project, 'src');
    img.alt = project.alt || project.title || 'Project Image';
    return img;
};

export const createTextOverlay = (project, {
    formatWorkLabelRef = formatWorkLabel,
    isCompactViewportRef = isCompactViewport
} = {}) => {
    const textContainer = createElement('div', 'project-text');
    const isCompact = (typeof document !== 'undefined' && document.documentElement.classList.contains('mobile-device')) || isCompactViewportRef();
    const workLabelText = formatWorkLabelRef(project.workType === 'client' ? 'client' : 'personal', isCompact);
    const workLabel = createElement('div', 'project-work-label', workLabelText);
    workLabel.setAttribute('data-work-type', project.workType === 'client' ? 'client' : 'personal');

    try {
        const headerButton = project.headerButton || {};
        const url = headerButton.url || '';
        const hoverLabel = project.category ?
            project.category :
            (headerButton.programName === 'image-viewer' || headerButton.action === 'openImageViewer') ?
            'Image' :
            (headerButton.action === 'openMediaPlayer' || headerButton.programName === 'mediaPlayer') ?
            'Video' :
            url.includes('github.com') ?
            'Web' :
            project.workType === 'client' ?
            'Client' :
            'Personal';
        workLabel.setAttribute('data-hover-label', hoverLabel);
    } catch (e) {
        //
    }

    const mainText = createElement('div', 'project-main-text');
    mainText.appendChild(createElement('div', 'project-title', project.title));
    if (project.subtitle && project.subtitle.trim()) {
        mainText.appendChild(createElement('div', 'project-subtitle', project.subtitle));
    }

    textContainer.appendChild(workLabel);
    textContainer.appendChild(mainText);

    let imageCount = (project.images && project.images.length ? project.images : [project.src]).length;
    const dotsContainer = createElement('div', 'project-dots');

    let defaultSlide = 0;
    if (typeof project.defaultSlide === 'number' && project.defaultSlide >= 0 && project.defaultSlide < Math.max(1, imageCount)) {
        defaultSlide = project.defaultSlide;
    }

    for (let i = 0; i < Math.max(1, imageCount); i++) {
        const dot = createElement('span', 'project-dot');
        if (i === defaultSlide) {
            dot.classList.add('cur');
        }
        dotsContainer.appendChild(dot);
    }
    textContainer.appendChild(dotsContainer);

    return textContainer;
};

export const createProject = (project, index, {
    isMobileDeviceRef = () => typeof document !== 'undefined' && document.documentElement.classList.contains('mobile-device')
} = {}) => {
    if (!project || !project.type || !project.title || (!project.src && !project.placeholder)) {
        return createElement('div', 'project error-project');
    }

    const isPlaceholder = !!project.placeholder;
    const projectClass = `project ${project.type}-project${isPlaceholder ? ' placeholder-project' : ''}`;
    const projectElement = createElement('div', projectClass);

    Object.assign(projectElement.dataset, {
        type: project.type,
        title: isPlaceholder ? 'Coming Soon' : project.title,
        subtitle: project.subtitle || '',
        workType: project.workType || 'personal',
        idx: index.toString(),
        orientation: project.orientation || 'landscape',
    });

    if (!isPlaceholder && project.description) {
        try {
            projectElement.setAttribute('data-full-description', project.description);
        } catch (e) {
            //
        }
    }

    try {
        let mediaElement;
        if (isPlaceholder) {
            mediaElement = createElement('div', 'placeholder-spinner-container');
            const spinner = createElement('div', 'media-spinner');
            mediaElement.appendChild(spinner);
        } else if (isMobileDeviceRef() && project.srcMobile) {
            const isVideo = project.srcMobile.match(/\.mp4($|\?)/i);
            const mobileProjectData = { ...project
            };
            mobileProjectData.src = project.srcMobile;
            mobileProjectData.poster = project.poster;
            const mobileImageProjectData = { ...project
            };
            mobileImageProjectData.src = project.srcMobile;
            mediaElement = isVideo ? createVideoElement(mobileProjectData) : createImageElement(mobileImageProjectData);
        } else {
            const srcIsVideo = project.src && project.src.match(/\.mp4($|\?)/i);
            if (project.type === 'video' && srcIsVideo) {
                mediaElement = createVideoElement(project);
            } else {
                mediaElement = createImageElement(project);
            }
        }
        projectElement.appendChild(mediaElement);

        if (isPlaceholder) {
            const textOverlay = createElement('div', 'project-text');
            const workLabel = createElement('div', 'project-work-label', 'Personal');
            workLabel.style.visibility = 'hidden';
            workLabel.setAttribute('aria-hidden', 'true');
            textOverlay.appendChild(workLabel);

            const mainText = createElement('div', 'project-main-text');
            mainText.appendChild(createElement('div', 'project-title', 'Coming Soon'));
            textOverlay.appendChild(mainText);

            const dotsContainer = createElement('div', 'project-dots');
            const dot = createElement('span', 'project-dot');
            dot.classList.add('cur');
            dotsContainer.appendChild(dot);
            textOverlay.appendChild(dotsContainer);

            projectElement.appendChild(textOverlay);
        } else {
            projectElement.appendChild(createTextOverlay(project));
        }
    } catch {
        projectElement.classList.add('error-project');
    }
    return projectElement;
};


export class SwipeGestureHandler {
    constructor(contentContainer, onSwipeLeft, onSwipeRight) {
        this.contentContainer = contentContainer;
        this.onSwipeLeft = onSwipeLeft;
        this.onSwipeRight = onSwipeRight;

        this.isEnabled = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isTracking = false;
        this.isTransitioning = false;
        this.gestureDirection = null;

        this.currentTouchX = 0;
        this.currentTouchY = 0;

        this.visualFeedbackElement = null;
        this.feedbackTimeout = null;
        this.isDestroyed = false;

        this.supportsTouch = this.checkTouchSupport();

        this.lastMoveTime = 0;

        this.gestureParams = {
            minDistance: CAROUSEL_DRAG_THRESHOLD * 0.8,
            maxVerticalDrift: CAROUSEL_MAX_VERTICAL_DRIFT * 0.6,
            maxTime: 600,
            minVelocity: 0.25,
            directionThreshold: 12,
            feedbackThreshold: 20,
        };

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handlePointerStart = this.handlePointerStart.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerEnd = this.handlePointerEnd.bind(this);
    }

    checkTouchSupport() {
        try {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        } catch (e) {
            return false;
        }
    }

    enable() {
        if (this.isEnabled || !this.contentContainer || this.isDestroyed) return;
        try {
            if (this.supportsTouch) {
                this.contentContainer.addEventListener('touchstart', this.handleTouchStart, {
                    passive: false,
                    capture: false
                });
                this.contentContainer.addEventListener('touchmove', this.handleTouchMove, {
                    passive: false,
                    capture: false
                });
                this.contentContainer.addEventListener('touchend', this.handleTouchEnd, {
                    passive: false,
                    capture: false
                });
            } else {
                this.contentContainer.addEventListener('pointerdown', this.handlePointerStart, {
                    passive: false,
                    capture: false
                });
                this.contentContainer.addEventListener('pointermove', this.handlePointerMove, {
                    passive: false,
                    capture: false
                });
                this.contentContainer.addEventListener('pointerup', this.handlePointerEnd, {
                    passive: false,
                    capture: false
                });
            }
            this.isEnabled = true;
        } catch (error) {
            this.isEnabled = false;
        }
    }

    disable() {
        if (!this.isEnabled || !this.contentContainer) return;
        try {
            if (this.supportsTouch) {
                this.contentContainer.removeEventListener('touchstart', this.handleTouchStart);
                this.contentContainer.removeEventListener('touchmove', this.handleTouchMove);
                this.contentContainer.removeEventListener('touchend', this.handleTouchEnd);
            } else {
                this.contentContainer.removeEventListener('pointerdown', this.handlePointerStart);
                this.contentContainer.removeEventListener('pointermove', this.handlePointerMove);
                this.contentContainer.removeEventListener('pointerup', this.handlePointerEnd);
            }
        } catch (e) {
            //
        }
        this.isEnabled = false;
        this.isTracking = false;
        this.isTransitioning = false;
        this.gestureDirection = null;
        this.cleanupVisualFeedback();
    }

    destroy() {
        if (this.isDestroyed) return;
        try {
            this.disable();
            this.cleanupVisualFeedback();
            if (this.feedbackTimeout) {
                clearTimeout(this.feedbackTimeout);
                this.feedbackTimeout = null;
            }
            this.contentContainer = null;
            this.onSwipeLeft = null;
            this.onSwipeRight = null;
            this.visualFeedbackElement = null;
            this.isDestroyed = true;
        } catch (e) {
            //
        }
    }

    setTransitioning(isTransitioning) {
        this.isTransitioning = isTransitioning;
        if (isTransitioning) {
            this.cleanupVisualFeedback();
        }
    }

    showVisualFeedback(direction, progress) {
        if (!this.contentContainer || typeof document === 'undefined' || this.isDestroyed) return;
        try {
            if (!this.visualFeedbackElement) {
                this.visualFeedbackElement = createElement('div', 'swipe-feedback-overlay');
                if (this.contentContainer && this.contentContainer.appendChild) {
                    this.contentContainer.appendChild(this.visualFeedbackElement);
                } else {
                    return;
                }
            }

            const opacity = Math.min(progress * 2.5, 0.25);
            const translateX = direction === 'left' ? -progress * 15 : progress * 15;
            const transform = `translate3d(${translateX}px, 0, 0)`;

            this.visualFeedbackElement.style.transform = transform;
            this.visualFeedbackElement.style.opacity = opacity;
            this.visualFeedbackElement.setAttribute('data-direction', direction);
            if (!this.visualFeedbackElement.classList.contains('active')) {
                this.visualFeedbackElement.classList.add('active');
            }
        } catch (e) {
            //
        }
    }

    showBounceBack(direction) {
        if (!this.contentContainer || !this.visualFeedbackElement || typeof document === 'undefined' || this.isDestroyed) return;

        try {
            this.visualFeedbackElement.style.setProperty('--bounce-direction', direction === 'left' ? '-12px' : '12px');
            this.visualFeedbackElement.classList.add('bounce-back');
            this.visualFeedbackElement.setAttribute('data-direction', direction);

            this.feedbackTimeout = setTimeout(() => {
                if (!this.isDestroyed) {
                    this.cleanupVisualFeedback();
                }
            }, 300);
        } catch (e) {
            this.cleanupVisualFeedback();
        }
    }

    cleanupVisualFeedback() {
        try {
            if (this.feedbackTimeout) {
                clearTimeout(this.feedbackTimeout);
                this.feedbackTimeout = null;
            }
            if (this.visualFeedbackElement && typeof document !== 'undefined') {
                this.visualFeedbackElement.classList.remove('active', 'bounce-back');
                this.visualFeedbackElement.style.opacity = '0';
                this.visualFeedbackElement.style.transform = 'translate3d(0, 0, 0)';

                const timeoutId = setTimeout(() => {
                    try {
                        if (this.visualFeedbackElement && this.visualFeedbackElement.parentNode) {
                            this.visualFeedbackElement.parentNode.removeChild(this.visualFeedbackElement);
                            this.visualFeedbackElement = null;
                        }
                    } catch (e) {
                        this.visualFeedbackElement = null;
                    }
                }, 150);
                if (!this.isDestroyed) {
                    this.feedbackTimeout = timeoutId;
                }
            }
        } catch (e) {
            this.visualFeedbackElement = null;
            this.feedbackTimeout = null;
        }
    }

    handleTouchStart(event) {
        if (this.isDestroyed) return;
        try {
            if (event.touches.length !== 1) return;
            if (this.isTransitioning) return;

            const touch = event.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.currentTouchX = touch.clientX;
            this.currentTouchY = touch.clientY;
            this.touchStartTime = Date.now();
            this.isTracking = true;
            this.gestureDirection = null;
        } catch (e) {
            this.isTracking = false;
        }
    }

    handlePointerStart(event) {
        if (this.isDestroyed) return;
        try {
            if (!event.isPrimary) return;
            if (this.isTransitioning) return;

            this.touchStartX = event.clientX;
            this.touchStartY = event.clientY;
            this.currentTouchX = event.clientX;
            this.currentTouchY = event.clientY;
            this.touchStartTime = Date.now();
            this.isTracking = true;
            this.gestureDirection = null;
        } catch (e) {
            this.isTracking = false;
        }
    }

    handleTouchMove(event) {
        if (!this.isTracking || this.isDestroyed) return;
        try {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                this.currentTouchX = touch.clientX;
                this.currentTouchY = touch.clientY;
            }

            const now = Date.now();
            if (now - this.lastMoveTime < this.moveThrottleDelay) {
                this.pendingMoveEvent = event;
                return;
            }
            this.lastMoveTime = now;

            if (event.touches.length !== 1) {
                this.isTracking = false;
                this.gestureDirection = null;
                this.cleanupVisualFeedback();
                return;
            }
            const touch = event.touches[0];
            this.processGestureMove(touch.clientX, touch.clientY, event);
        } catch (e) {
            this.isTracking = false;
            this.cleanupVisualFeedback();
        }
    }

    handlePointerMove(event) {
        if (!this.isTracking || this.isDestroyed) return;
        try {
            if (!event.isPrimary) return;
            this.currentTouchX = event.clientX;
            this.currentTouchY = event.clientY;
            this.processGestureMove(event.clientX, event.clientY, event);
        } catch (e) {
            this.isTracking = false;
            this.cleanupVisualFeedback();
        }
    }

    processGestureMove(x, y, event) {
        const deltaX = x - this.touchStartX;
        const deltaY = y - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (!this.gestureDirection && (absDeltaX > this.gestureParams.directionThreshold || absDeltaY > this.gestureParams.directionThreshold)) {
            if (absDeltaX > absDeltaY * 2.5 && absDeltaX > 20) {
                this.gestureDirection = 'horizontal';
            } else if (absDeltaY > absDeltaX && absDeltaY > 15) {
                this.gestureDirection = 'vertical';
            }
        }

        if (absDeltaY > this.gestureParams.maxVerticalDrift) {
            this.isTracking = false;
            this.gestureDirection = null;
            this.cleanupVisualFeedback();
            return;
        }

        if (this.gestureDirection === 'vertical') {
            this.isTracking = false;
            this.cleanupVisualFeedback();
            return;
        }

        if (this.gestureDirection === 'horizontal' && absDeltaX > this.gestureParams.feedbackThreshold) {
            try {
                event.preventDefault();
            } catch (e) {
                //
            }
            const progress = Math.min(absDeltaX / this.gestureParams.minDistance, 1);
            const direction = deltaX > 0 ? 'right' : 'left';
            this.showVisualFeedback(direction, progress);
        }
    }

    handleTouchEnd(event) {
        if (!this.isTracking || this.isDestroyed) return;
        try {
            this.isTracking = false;
            const touch = event.changedTouches[0];
            this.processGestureEnd(touch.clientX, touch.clientY);
        } catch (e) {
            this.isTracking = false;
            this.cleanupVisualFeedback();
        }
    }

    handlePointerEnd(event) {
        if (!this.isTracking || this.isDestroyed) return;
        try {
            if (!event.isPrimary) return;
            this.isTracking = false;
            this.processGestureEnd(event.clientX, event.clientY);
        } catch (e) {
            this.isTracking = false;
            this.cleanupVisualFeedback();
        }
    }

    processGestureEnd(x, y) {
        const deltaX = x - this.touchStartX;
        const deltaY = y - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        const elapsedTime = Date.now() - this.touchStartTime;

        if (!this.gestureDirection && (absDeltaX > this.gestureParams.directionThreshold || absDeltaY > this.gestureParams.directionThreshold)) {
            if (absDeltaX > absDeltaY) {
                this.gestureDirection = 'horizontal';
            } else {
                this.gestureDirection = 'vertical';
            }
        }
        const finalDirection = this.gestureDirection;
        this.gestureDirection = null;

        if (finalDirection !== 'horizontal') {
            this.cleanupVisualFeedback();
            return;
        }

        const distance = absDeltaX;
        const velocity = elapsedTime > 0 ? distance / elapsedTime : 0;
        const swipeDirection = deltaX > 0 ? 'right' : 'left';

        if (
            distance < this.gestureParams.minDistance ||
            absDeltaY > this.gestureParams.maxVerticalDrift ||
            elapsedTime > this.gestureParams.maxTime ||
            velocity < this.gestureParams.minVelocity ||
            this.isTransitioning
        ) {
            if (finalDirection === 'horizontal' && distance > this.gestureParams.feedbackThreshold) {
                this.showBounceBack(swipeDirection);
            } else {
                this.cleanupVisualFeedback();
            }
            return;
        }

        this.isTransitioning = true;
        this.cleanupVisualFeedback();

        try {
            if (deltaX > 0) {
                if (this.onSwipeRight && typeof this.onSwipeRight === 'function') {
                    this.onSwipeRight();
                }
            } else if (this.onSwipeLeft && typeof this.onSwipeLeft === 'function') {
                this.onSwipeLeft();
            }
        } catch (e) {
            //
        }

        setTimeout(() => {
            if (!this.isDestroyed) {
                this.isTransitioning = false;
            }
        }, 150);
    }
}

import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

class ProjectsDataManager {
    constructor() {
        this.projectsData = [];
        this.validProjectIndices = [];
        this.currentProjectIndex = 0;
        this.currentFilteredProjectPos = 0;
        this.portfolioManager = null;
    }

    async loadProjects(appLoader = null) {
        if (appLoader) appLoader.setProgress(15);
        
        try {
            // Initialize PortfolioManager if not already done
            if (!this.portfolioManager) {
                this.portfolioManager = new PortfolioManager();
                await this.portfolioManager.initialize();
            }
            
            if (appLoader) appLoader.setProgress(25);
            
            // Get projects from CV.yaml via PortfolioManager
            const cvProjects = await this.portfolioManager.getProjects();
            if (appLoader) appLoader.setProgress(35);
            
            // Transform CV projects to match existing projects.json format
            this.projectsData = cvProjects.map(project => ({
                type: "mixed", // Default type for CV projects
                category: "Personal", // Default category
                title: project.name,
                role: "Developer",
                subtitle: project.summary || "",
                brief: project.summary || "",
                description: project.hasMarkdown ? project.markdown.html : (project.summary || ""),
                workType: "personal",
                orientation: "landscape",
                alt: project.name,
                defaultSlide: 0,
                headerButton: project.url ? {
                    enabled: true,
                    label: "View Project",
                    url: project.url
                } : {
                    enabled: false
                },
                // Use placeholder images for now - could be extended to use project-specific assets
                src: "assets/apps/projects/mitchivinxp/image1.webp",
                images: [{
                    src: "assets/apps/projects/mitchivinxp/image1.webp",
                    alt: project.name
                }]
            }));
            
        } catch (error) {
            console.error('Failed to load projects from CV, falling back to projects.json:', error);
            // Fallback to original behavior
            try {
                const response = await fetch('../../../projects.json');
                this.projectsData = await response.json();
            } catch (fallbackError) {
                console.error('Failed to load projects.json as well:', fallbackError);
                this.projectsData = [];
            }
        }
        
        if (appLoader) appLoader.setProgress(40);

        try {
            this.projectsData = Array.isArray(this.projectsData) ?
                this.projectsData.map((project) => {
                    if (!project || typeof project !== 'object') return project;
                    const newProject = { ...project
                    };
                    const proj = newProject;
                    if (typeof proj.type === 'string') {
                        proj.type = proj.type.toLowerCase();
                    }
                    if (Array.isArray(proj.images) && proj.images.length && typeof proj.defaultSlide === 'number') {
                        if (proj.defaultSlide < 0 || proj.defaultSlide >= proj.images.length) {
                            proj.defaultSlide = 0;
                        }
                    }
                    return proj;
                }) :
                this.projectsData;
        } catch (e) {
            //
        }

        const initialProjects = this.projectsData.slice(0, 6);
        this.validProjectIndices = initialProjects
            .map((p, i) => ({
                p,
                i
            }))
            .filter(item => !item.p || !item.p.placeholder)
            .map(item => item.i);
        this.currentFilteredProjectPos = 0;
        return this.projectsData;
    }

    getAllProjects() {
        return this.projectsData;
    }

    getProject(index) {
        return this.projectsData[index];
    }

    getCurrentProject() {
        return this.projectsData[this.currentProjectIndex];
    }

    getValidIndices() {
        return this.validProjectIndices;
    }

    getCurrentIndex() {
        return this.currentProjectIndex;
    }

    setCurrentIndex(index) {
        this.currentProjectIndex = index;
    }

    getCurrentFilteredPos() {
        return this.currentFilteredProjectPos;
    }

    setCurrentFilteredPos(pos) {
        this.currentFilteredProjectPos = pos;
    }
}

export const projectsDataManager = new ProjectsDataManager();