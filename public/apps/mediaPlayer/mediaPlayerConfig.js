// Media Player Configuration Loader
// This script loads the configuration from config.env and makes it available to the media player

(async function() {
    try {
        // Load the config.env file
        const response = await fetch('/config.env');
        const configText = await response.text();

        // Parse the config
        const config = {};
        const lines = configText.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();

            if (key && value) {
                config[key] = value;
            }
        }

        // Make the media player config available globally
        window.MEDIA_PLAYER_PRIMARY_PLAYLIST = config.MEDIA_PLAYER_PRIMARY_PLAYLIST || 'PLWoiCrWR5QfNd1s2WwJwjqBfWewzIszLb';
        window.MEDIA_PLAYER_ALT_PLAYLIST = config.MEDIA_PLAYER_ALT_PLAYLIST || 'PLgwcgfCVaMC1z5AqphnubDfIu_pp0Ok9O';

        console.log('Media Player Config Loaded:', {
            primary: window.MEDIA_PLAYER_PRIMARY_PLAYLIST,
            alt: window.MEDIA_PLAYER_ALT_PLAYLIST
        });
    } catch (error) {
        console.error('Failed to load media player config:', error);
        // Set defaults if loading fails
        window.MEDIA_PLAYER_PRIMARY_PLAYLIST = 'PLgwcgfCVaMC2H_T2lZMZpGebbBLJYmciq';
        window.MEDIA_PLAYER_ALT_PLAYLIST = 'PLgwcgfCVaMC1z5AqphnubDfIu_pp0Ok9O';
    }
})();