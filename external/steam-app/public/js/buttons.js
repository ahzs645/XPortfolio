const games = {
    tf2: {
        title: 'Team Fortress 2',
        state: 'Browser-ready',
        subtitle: 'TF2 jump practice, powered by playsrc.',
        hero: '../images/games/tf2-library-hero.jpg',
        primaryLabel: 'Play TF2',
        sourceUrl: 'https://github.com/Hona/playsrc',
        launchLabel: 'Opens in Windows XP',
        launchCopy: 'Runs in its own XP-managed game window',
        overviewTitle: 'Your browser is the console',
        overviewCopy: 'Practice TF2 jump maps through an independent, clean-room Source 1 engine project. The launcher now keeps the game inside the portfolio desktop.',
        platform: 'WEB',
        featureOneTitle: 'XP game window',
        featureOneCopy: 'Steam launches a separate, movable game window without navigating away from the portfolio.',
        featureTwoTitle: 'Open source runtime',
        featureTwoCopy: 'Original playsrc code is available under MIT with separate Valve notices.',
        projectTitle: 'Powered by playsrc',
        projectCopy: 'An independent fan project by Hona. This launcher integration is maintained by ahzs645.',
        availability: 'Browser preview',
        contentPolicy: 'Not bundled',
        projectLinkLabel: 'View upstream project',
        projectLink: 'https://github.com/Hona/playsrc',
        legal: 'Team Fortress, Source, Steam, Valve, and related trademarks belong to Valve Corporation. This independent portfolio project is not affiliated with or endorsed by Valve.'
    },
    hl2: {
        title: 'Half-Life 2',
        state: 'Steam required',
        subtitle: 'The landmark Source adventure stays native.',
        hero: '../images/games/hl2-library-hero.jpg',
        primaryLabel: 'Open details',
        sourceUrl: 'https://store.steampowered.com/app/220/HalfLife_2/',
        launchLabel: 'Native game',
        launchCopy: 'A browser port is not available in playsrc',
        overviewTitle: 'Return to City 17',
        overviewCopy: 'Half-Life 2 is represented here as a library title, but it is not part of the current playsrc browser target. Launch through Steam to play the official native release.',
        platform: 'STEAM',
        featureOneTitle: 'Official release',
        featureOneCopy: 'The XP window explains the native requirement instead of claiming an unsupported web build.',
        featureTwoTitle: 'Clear project boundary',
        featureTwoCopy: 'No Half-Life 2 game files, Valve assets, or engine binaries are bundled with this UI.',
        projectTitle: 'Native Steam handoff',
        projectCopy: 'Half-Life 2 remains visible beside TF2 without implying that the current browser runtime supports it.',
        availability: 'Steam installation',
        contentPolicy: 'Not bundled',
        projectLinkLabel: 'Open Half-Life 2 store page',
        projectLink: 'https://store.steampowered.com/app/220/HalfLife_2/',
        legal: 'Half-Life, Source, Steam, Valve, and related trademarks belong to Valve Corporation. This independent portfolio project is not affiliated with or endorsed by Valve.'
    }
};

const refs = {
    detail: document.querySelector('#game-detail'),
    hero: document.querySelector('#game-hero'),
    state: document.querySelector('#game-state'),
    title: document.querySelector('#game-title'),
    subtitle: document.querySelector('#game-subtitle'),
    primaryAction: document.querySelector('#primary-action'),
    primaryLabel: document.querySelector('#primary-label'),
    sourceAction: document.querySelector('#source-action'),
    launchLabel: document.querySelector('#launch-status-label'),
    launchCopy: document.querySelector('#launch-status-copy'),
    overviewTitle: document.querySelector('#overview-title'),
    overviewCopy: document.querySelector('#overview-copy'),
    platform: document.querySelector('#platform-chip'),
    featureOneTitle: document.querySelector('#feature-one-title'),
    featureOneCopy: document.querySelector('#feature-one-copy'),
    featureTwoTitle: document.querySelector('#feature-two-title'),
    featureTwoCopy: document.querySelector('#feature-two-copy'),
    projectTitle: document.querySelector('#project-title'),
    projectCopy: document.querySelector('#project-copy'),
    availability: document.querySelector('#availability'),
    contentPolicy: document.querySelector('#content-policy'),
    projectLink: document.querySelector('#project-link'),
    legal: document.querySelector('#legal-note'),
    search: document.querySelector('#game-search'),
    noResults: document.querySelector('#no-results')
};

let selectedGame = 'tf2';

function openExternal(url) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
}

function launchInXp(gameId) {
    window.top.postMessage(
        { type: 'xportfolio:steam-launch', gameId },
        window.location.origin
    );
}

function selectGame(gameId) {
    const game = games[gameId];
    if (!game) return;

    selectedGame = gameId;
    refs.detail.classList.add('is-switching');

    window.setTimeout(() => {
        refs.hero.style.backgroundImage = `url("${game.hero}")`;
        refs.state.textContent = game.state;
        refs.title.textContent = game.title;
        refs.subtitle.textContent = game.subtitle;
        refs.primaryLabel.textContent = game.primaryLabel;
        refs.launchLabel.textContent = game.launchLabel;
        refs.launchCopy.textContent = game.launchCopy;
        refs.overviewTitle.textContent = game.overviewTitle;
        refs.overviewCopy.textContent = game.overviewCopy;
        refs.platform.textContent = game.platform;
        refs.featureOneTitle.textContent = game.featureOneTitle;
        refs.featureOneCopy.textContent = game.featureOneCopy;
        refs.featureTwoTitle.textContent = game.featureTwoTitle;
        refs.featureTwoCopy.textContent = game.featureTwoCopy;
        refs.projectTitle.textContent = game.projectTitle;
        refs.projectCopy.textContent = game.projectCopy;
        refs.availability.textContent = game.availability;
        refs.contentPolicy.textContent = game.contentPolicy;
        refs.projectLink.textContent = game.projectLinkLabel;
        refs.projectLink.href = game.projectLink;
        refs.legal.textContent = game.legal;

        document.querySelectorAll('[data-game]').forEach((button) => {
            const isSelected = button.dataset.game === gameId;
            button.classList.toggle('active', isSelected);
            button.setAttribute('aria-pressed', String(isSelected));
        });

        refs.detail.classList.remove('is-switching');
    }, 120);
}

document.querySelectorAll('[data-game]').forEach((button) => {
    button.addEventListener('click', () => selectGame(button.dataset.game));
});

refs.primaryAction.addEventListener('click', () => {
    launchInXp(selectedGame);
});

refs.sourceAction.addEventListener('click', () => {
    openExternal(games[selectedGame].sourceUrl);
});

refs.search.addEventListener('input', (event) => {
    const query = event.currentTarget.value.trim().toLowerCase();
    let matches = 0;

    document.querySelectorAll('[data-game]').forEach((button) => {
        const isMatch = button.textContent.toLowerCase().includes(query);
        button.hidden = !isMatch;
        if (isMatch) matches += 1;
    });

    refs.noResults.hidden = matches !== 0;
});

document.addEventListener('keydown', (event) => {
    if (event.target === refs.search) return;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        selectGame(selectedGame === 'tf2' ? 'hl2' : 'tf2');
    }

    if (event.key === 'Enter') {
        refs.primaryAction.click();
    }
});

selectGame('tf2');
