import {
    queryWorkLabels,
    queryActiveHoverWorkLabels,
    queryProjectVideos,
    SELECTORS,
    sendMessageToParent,
    projectsDataManager,
} from './projectsInternals.js';

let desktopOverlayInterval = null;
let intersectionObserver = null;
let overlayLabelInterval = null;
const pausedVideos = new Set();

export const setupGridIntentPrefetch = (domCache) => {
    if (!domCache.grid || document.documentElement.classList.contains('mobile-device')) return;

    const prefetchProjectImage = (event) => {
        const projectElement = event.target.closest('.project');
        if (!projectElement || !domCache.grid.contains(projectElement)) return;
        if (projectElement.dataset.prefetched === '1') return;

        const projectIndex = parseInt(projectElement.dataset.idx || '-1', 10);
        const allProjects = projectsDataManager.getAllProjects();
        const projectData = Number.isFinite(projectIndex) ? allProjects[projectIndex] : null;

        if (!projectData) return;

        const images = Array.isArray(projectData.images) ? projectData.images : [];
        const imageToPrefetch = images.find(img => (img ? .type || 'image') === 'image' && (img ? .src || img));
        const src = imageToPrefetch ?
            (typeof imageToPrefetch === 'string' ? imageToPrefetch : (document.documentElement.classList.contains('mobile-device') && imageToPrefetch.srcMobile) ? imageToPrefetch.srcMobile : imageToPrefetch.src) :
            projectData.src;

        if (!src || /\.mp4($|\?)/i.test(src)) return;

        const prefetchUrl = src.startsWith('../../../') ? src : `../../../${src}`;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = prefetchUrl;
        link.fetchPriority = 'low';
        document.head.appendChild(link);
        projectElement.dataset.prefetched = '1';
    };

    domCache.grid.addEventListener('mouseenter', prefetchProjectImage, true);
    domCache.grid.addEventListener('focusin', prefetchProjectImage, true);
};

export const setupDesktopOverlayLabelAnimation = (domCache) => {
    try {
        if (document.documentElement.classList.contains('mobile-device')) return;
        const grid = domCache.grid;
        if (!grid) return;

        queryWorkLabels(grid).forEach(label => label.classList.remove('alt-active'));

        if (desktopOverlayInterval) clearInterval(desktopOverlayInterval);

        desktopOverlayInterval = setInterval(() => {
            if (document.hidden) return;
            const activeLabels = queryActiveHoverWorkLabels(grid);
            if (!activeLabels.length) return;
            activeLabels.forEach(label => label.classList.toggle('alt-active'));
        }, 3000);
    } catch (error) {
        // console.error('Error in setupDesktopOverlayLabelAnimation:', error);
    }
};

export const setupDesktopHoverOverlays = (domCache) => {
    if (document.documentElement.classList.contains('mobile-device')) return;
    const grid = domCache.grid;
    if (!grid) return;

    const projects = grid.querySelectorAll('.project');
    const areAllProjectsHovered = () => {
        const projectArray = Array.from(projects);
        return projectArray.length > 0 && projectArray.every(p => p.classList.contains('hover'));
    };

    projects.forEach((project) => {
        const onMouseEnter = () => {
            const projectIndex = parseInt(project.dataset.idx, 10);
            if (!Number.isNaN(projectIndex)) {
                const allProjects = projectsDataManager.getAllProjects();
                const projectData = allProjects[projectIndex];
                if (projectData && projectData.placeholder) return;
            }
            if (!areAllProjectsHovered()) {
                project.classList.add('hover');
            }
        };

        const onMouseLeave = () => {
            if (!areAllProjectsHovered()) {
                project.classList.remove('hover');
            }
        };

        project.addEventListener('mouseenter', onMouseEnter);
        project.addEventListener('mouseleave', onMouseLeave);
    });
};

export const initializeGridFeatures = (domCache) => {
    setupGridIntentPrefetch(domCache);
    setupDesktopOverlayLabelAnimation(domCache);
    setupDesktopHoverOverlays(domCache);
};

export const cleanupGridFeatures = () => {
    if (desktopOverlayInterval) {
        clearInterval(desktopOverlayInterval);
        desktopOverlayInterval = null;
    }
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
    }
    if (overlayLabelInterval) {
        clearInterval(overlayLabelInterval);
        overlayLabelInterval = null;
    }
    pausedVideos.clear();
};

export const setupVideoObserver = () => {
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    const videos = queryProjectVideos();
    if (!videos.length) return;

    intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            } else if (!video.paused) {
                video.pause();
            }
        });
    }, {
        root: document.querySelector(SELECTORS.grid),
        threshold: 0.1,
    });

    videos.forEach(video => intersectionObserver.observe(video));
};

export const setMaximizedState = (isMaximized) => {
    const videos = queryProjectVideos();
    if (isMaximized) {
        videos.forEach(video => video.play().catch(() => {}));
    } else {
        videos.forEach(video => video.pause());
        setupVideoObserver();
    }
};

export const handleWindowFocus = () => {
    pausedVideos.forEach((video) => {
        if (video.paused) {
            video.play().catch(() => {});
        }
    });
    pausedVideos.clear();
};

export const handleWindowBlur = () => {
    const currentVideos = document.querySelectorAll('.cascade-slider_item.now video');
    currentVideos.forEach((video) => {
        if (!video.paused) {
            pausedVideos.add(video);
            video.pause();
        }
    });
};

export const handleProjectClick = (event, showProjectDetail) => {
    if (event.target.tagName === 'A') return;

    if (event.currentTarget.dataset.preventClick === 'true') {
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    const projectIndex = parseInt(event.currentTarget.dataset.idx, 10);
    if (Number.isNaN(projectIndex)) return;

    const allProjects = projectsDataManager.getAllProjects();
    const projectData = allProjects[projectIndex];

    if (projectData && projectData.placeholder) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    showProjectDetail(projectIndex);
};

export const toggleProjectOverlays = (domCache) => {
    const grid = domCache.grid;
    if (!grid) return;

    const projects = grid.querySelectorAll('.project');
    const videos = grid.querySelectorAll('video');
    let isAnyHovered = false;

    projects.forEach((project) => {
        if (project.classList.contains('hover')) {
            isAnyHovered = true;
        }
    });

    projects.forEach((project) => {
        const projectIndex = parseInt(project.dataset.idx, 10);
        if (!Number.isNaN(projectIndex)) {
            const allProjects = projectsDataManager.getAllProjects();
            const projectData = allProjects[projectIndex];
            if (projectData && projectData.placeholder) return;
        }
        if (isAnyHovered) {
            project.classList.remove('hover');
        } else {
            project.classList.add('hover');
        }
    });

    if (!isAnyHovered) {
        videos.forEach((video) => {
            if (!video.paused) {
                video.pause();
            }
        });
    } else if (intersectionObserver) {
        videos.forEach((video) => {
            const videoRect = video.getBoundingClientRect();
            const gridRect = grid.getBoundingClientRect();
            const isInView = videoRect.top < gridRect.bottom &&
                videoRect.bottom > gridRect.top &&
                videoRect.left < gridRect.right &&
                videoRect.right > gridRect.left;

            if (isInView && video.paused) {
                video.play().catch(() => {});
            }
        });
    }

    const overlaysVisible = !isAnyHovered;
    sendMessageToParent({
        type: 'update-overlay-button-state',
        active: overlaysVisible
    });

    try {
        const isMobile = document.documentElement.classList.contains('mobile-device');
        if (isMobile) {
            grid.querySelectorAll('.project-text .project-work-label').forEach(label => label.classList.remove('alt-active'));
            if (overlayLabelInterval) {
                clearInterval(overlayLabelInterval);
                overlayLabelInterval = null;
            }
            if (overlaysVisible) {
                overlayLabelInterval = setInterval(() => {
                    if (document.hidden) return;
                    const workLabels = queryWorkLabels(grid);
                    if (!workLabels.length) return;
                    workLabels.forEach(label => label.classList.toggle('alt-active'));
                }, 3000);
            }
        } else {
            grid.querySelectorAll('.project-text .project-work-label').forEach(label => label.classList.remove('alt-active'));
            if (overlayLabelInterval) {
                clearInterval(overlayLabelInterval);
                overlayLabelInterval = null;
            }
        }
    } catch (error) {
        // console.error('Error in toggleProjectOverlays label animation:', error);
    }
};