const tooltipFrameBatch = (() => {
    let pendingJob = null;
    let writeScheduled = false;
    return {
        schedule(element, containerRect, compute) {
            const job = { el: element, containerRect, compute };
            pendingJob = job;
            if (writeScheduled) return;
            writeScheduled = true;
            import('../utils/frameScheduler.js').then(({ scheduleWrite }) => {
                scheduleWrite(() => {
                    writeScheduled = false;
                    if (!pendingJob) return;
                    const { el, containerRect, compute } = pendingJob;
                    pendingJob = null;
                    try {
                        compute(el, containerRect);
                    } catch (err) {
                        void err;
                    }
                });
            });
        }
    };
})();

export function setupTooltips(selector = '[data-tooltip]', container = document.body, hideDelay = 100, shouldDisplay = () => true) {
    let activeTooltipEl = null;
    let hideTimeoutId = null;
    const tooltipEl = (() => {
            const existingTooltip = container.querySelector('.dynamic-tooltip');
            if (existingTooltip) return existingTooltip;
            const tooltipDiv = document.createElement('div');
            tooltipDiv.className = 'dynamic-tooltip dynamic-tooltip-style';
            container.appendChild(tooltipDiv);
            return tooltipDiv;
        })(),
        hideTooltip = () => {
            clearTimeout(hideTimeoutId);
            if (activeTooltipEl) activeTooltipEl.style.display = 'none';
            activeTooltipEl = null;
        },
        scheduleHide = () => {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = setTimeout(hideTooltip, hideDelay);
        },
        showTooltip = targetEl => {
            const tooltipText = targetEl.getAttribute('data-tooltip') || targetEl.getAttribute('title');
            if (!tooltipText) return;
            if (!shouldDisplay(targetEl)) return;
            clearTimeout(hideTimeoutId);
            tooltipEl.textContent = tooltipText;
            tooltipEl.style.display = 'block';
            activeTooltipEl = tooltipEl;
            const zeroRect = { top: 0, left: 0 };
            const containerRect = container === document.body ? zeroRect : container.getBoundingClientRect();
            tooltipFrameBatch.schedule(targetEl, containerRect, (el, rect) => {
                if (tooltipEl !== activeTooltipEl || tooltipEl.style.display !== 'block') return;
                const { top, left } = _calculateTooltipPosition(el, tooltipEl, rect);
                const style = tooltipEl.style;
                if (style.top !== top + 'px') style.top = top + 'px';
                if (style.left !== left + 'px') style.left = left + 'px';
            });
        };
    !document.documentElement.classList.contains('mobile-device') && (
        document.body.addEventListener('mouseover', function (e) {
            const target = e.target.closest(selector);
            if (target) showTooltip(target);
        }),
        document.body.addEventListener('mouseout', function (e) {
            const target = e.target.closest(selector);
            if (target && !target.contains(e.relatedTarget)) scheduleHide();
        }),
        document.body.addEventListener('click', function (e) {
            const target = e.target.closest(selector);
            if (target) {
                if (target.classList.contains('tray-crt-toggle')) {
                    setTimeout(() => showTooltip(target), 50);
                    return;
                }
                hideTooltip();
            } else hideTooltip();
        })
    );
    document.documentElement.classList.contains('mobile-device') &&
        document.body.addEventListener('click', function (e) {
            const toggleTarget = e.target.closest('.tray-crt-toggle');
            if (toggleTarget) {
                clearTimeout(hideTimeoutId);
                const tooltipText = toggleTarget.getAttribute('data-tooltip') || toggleTarget.getAttribute('title');
                if (tooltipText) {
                    tooltipEl.textContent = tooltipText;
                    tooltipEl.style.display = 'block';
                    activeTooltipEl = tooltipEl;
                    const zeroRect = { top: 0, left: 0 };
                    const containerRect = container === document.body ? zeroRect : container.getBoundingClientRect(),
                        { top, left } = _calculateTooltipPosition(toggleTarget, tooltipEl, containerRect);
                    tooltipEl.style.top = top + 'px';
                    tooltipEl.style.left = left + 'px';
                    hideTimeoutId = setTimeout(hideTooltip, 1500);
                }
            }
        });
}

function _calculateTooltipPosition(targetEl, tooltipEl, containerRect) {
    const targetRect = targetEl.getBoundingClientRect(),
        tooltipHeight = tooltipEl.offsetHeight,
        tooltipWidth = tooltipEl.offsetWidth,
        viewportWidth = window.innerWidth,
        viewportHeight = window.innerHeight,
        offset = 5;
    let top = targetRect.bottom + offset,
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    top + tooltipHeight > viewportHeight && (top = targetRect.top - tooltipHeight - offset);
    left + tooltipWidth > viewportWidth && (left = viewportWidth - tooltipWidth - offset);
    left < 0 && (left = offset);
    const result = {};
    result.top = top - containerRect.top;
    result.left = left - containerRect.left;
    return result;
}