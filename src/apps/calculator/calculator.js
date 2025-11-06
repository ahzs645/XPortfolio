// Simple menu bar handler for Calculator (similar to minesweeper)
(function() {
    let activeMenu = null;

    function closeAllMenus() {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.style.display = 'none';
        });
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        activeMenu = null;
    }

    function openMenu(menuName, menuItem) {
        closeAllMenus();
        const dropdown = document.getElementById(menuName + '-menu');
        if (dropdown) {
            dropdown.style.display = 'block';
            menuItem.classList.add('active');
            activeMenu = menuName;

            // Position the dropdown
            const rect = menuItem.getBoundingClientRect();
            const containerRect = menuItem.closest('.menu-bar-container').getBoundingClientRect();
            dropdown.style.left = (rect.left - containerRect.left) + 'px';
        }
    }

    // Initialize menu system when DOM is ready
    function init() {
        // Menu bar click handlers
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (this.classList.contains('disabled')) return;

                const menuName = this.getAttribute('data-menu');
                if (activeMenu === menuName) {
                    closeAllMenus();
                } else {
                    openMenu(menuName, this);
                }
                e.stopPropagation();
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.menu-bar-container')) {
                closeAllMenus();
            }
        });

        // Menu item actions
        document.querySelectorAll('.menu-dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (this.classList.contains('disabled')) return;

                const action = this.getAttribute('data-action');
                // Handle menu actions here if needed
                console.log('Menu action:', action);

                closeAllMenus();
                e.stopPropagation();
            });
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
