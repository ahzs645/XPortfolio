// --- THIS IS THE NEW search.js ---

const HELP_PAGES = [
    // Main Pages
    { url: 'updates.html', title: "What's New in Reborn XP", content: 'changelog version update fix improvement release notes' },
    { url: 'bundledapps.html', title: 'Included Applications Guide', content: 'explorer internet wmp msn pinball solitaire minesweeper paint notepad wordpad cmd calculator task manager regedit sndrec32' },
    { url: 'credits.html', title: 'Credits & External Resources', content: 'microsoft webamp jspaint pinball ruffle jszip jsmediatags' },
    // Guides
    { url: 'guides/vfs_guide.html', title: 'Using Files and Folders (VFS)', content: 'drive c d e persistent storage system save upload create delete my documents desktop recycle bin' },
    { url: 'guides/customization_guide.html', title: 'Customizing Your Desktop', content: 'theme wallpaper properties screen saver appearance classic start menu user accounts picture folder options hidden files' },
    { url: 'guides/making_apps_guide.html', title: 'Adding & Removing Programs', content: 'app market store web installer flash player swf vfs diy developer uninstall appwiz.cpl create shortcut launcher' }
];

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    const resultsWrapper = document.getElementById('search-results-container');
    const defaultContent = document.getElementById('default-content');

    // This part only runs on index.html, where the results are displayed
    if (resultsContainer && resultsWrapper && defaultContent) {
        defaultContent.style.display = 'none';
        resultsWrapper.style.display = 'block';
        resultsContainer.innerHTML = '';

        if (!query) {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        const results = HELP_PAGES.filter(page =>
            page.title.toLowerCase().includes(query) || page.content.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                // All results link from the root of helpUI
                item.innerHTML = `<a href="${result.url}"><h3>${result.title}</h3></a>`;
                resultsContainer.appendChild(item);
            });
        } else {
            resultsContainer.innerHTML = '<p>No results found for your query.</p>';
        }
    }
}

function setupSearch() {
    const goButton = document.getElementById('go');
    const searchInput = document.getElementById('search-input');

    const handleSearchAction = () => {
        if (!searchInput) return;
        const query = searchInput.value.trim();
        const searchUrl = `/res/sites/helpUI/index.html?search=${encodeURIComponent(query)}`;
        
        // This checks if we are already on the index page.
        // If so, it performs the search in-place. Otherwise, it navigates.
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('helpUI/')) {
            performSearch(query.toLowerCase());
        } else {
            window.location.href = searchUrl;
        }
    };

    if (goButton) goButton.onclick = handleSearchAction;
    if (searchInput) searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSearchAction();
    };

    // This part runs when a page loads, specifically to check if it's the search results page.
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        performSearch(searchQuery.toLowerCase());
    }
}