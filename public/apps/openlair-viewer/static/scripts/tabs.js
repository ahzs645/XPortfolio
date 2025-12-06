document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('.tabs .list li');
        if (!tab) return;

        const tabsContainer = tab.closest('.tabs');
        if (!tabsContainer) return;

        tabsContainer.querySelectorAll('.list li').forEach(li => li.classList.remove('active'));
        tab.classList.add('active');

        const tabIndex = Array.from(tab.parentNode.children).indexOf(tab);

        tabsContainer.querySelectorAll('.panel').forEach((panel, i) => {
            panel.classList.toggle('active', i === tabIndex);

            if (i === tabIndex) {
                panel.querySelectorAll('iframe').forEach(iframe => {
                    if (!iframe.src && iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                    }
                });
            }
        });
    });
});
