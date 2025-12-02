class YouTubeMediaPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.internals = this.attachInternals();
        this.youtubePlayer = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 100;
        this.isMuted = false;

        // YouTube Playlist IDs - these will be replaced with config values
        this.primaryPlaylistId = window.MEDIA_PLAYER_PRIMARY_PLAYLIST || 'PLWoiCrWR5QfNd1s2WwJwjqBfWewzIszLb';
        this.altPlaylistId = window.MEDIA_PLAYER_ALT_PLAYLIST || 'PLgwcgfCVaMC1z5AqphnubDfIu_pp0Ok9O';

        this.isUsingAltPlaylist = false;
        this._timeInterval = null;
        this._playlistErrorTimeout = null;
        this._resumeAfterRestore = false;
        this._isMinimized = false;

        this._onVisibilityChange = this._onVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this._onVisibilityChange);

        // Set up event bus subscriptions
        this.setupEventBusSubscriptions();
        this.init();

        // Listen for window messages
        window.addEventListener('message', (event) => {
            if (event?.data?.type === 'window:soft-reset') {
                this.softReset();
            } else if (event?.data?.type === 'swap-playlist') {
                this.togglePlaylist();
            }
        });
    }

    setupEventBusSubscriptions() {
        try {
            if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
                const { eventBus: parentBus, EVENTS } = window.parent;

                // Handle global media pause
                this._unsubscribeMediaPause = parentBus.subscribe(EVENTS.MEDIA_GLOBAL_PAUSE, () => {
                    if (this.youtubePlayer && this.isPlaying && !this.isMuted) {
                        try {
                            this.youtubePlayer.pauseVideo();
                        } catch (e) {}
                    }
                });

                // Handle global media visible
                this._unsubscribeMediaVisible = parentBus.subscribe(EVENTS.MEDIA_GLOBAL_VISIBLE, () => {
                    if (this.youtubePlayer && this._resumeAfterRestore && !this.isMuted && !this._isMinimized) {
                        try {
                            this.youtubePlayer.playVideo();
                        } catch (e) {}
                    }
                });

                // Handle logoff request
                this._unsubscribeLogoffReq = parentBus.subscribe(EVENTS.LOG_OFF_REQUESTED, () => {
                    if (this.youtubePlayer && this.isPlaying && !this.isMuted) {
                        try {
                            this.youtubePlayer.pauseVideo();
                        } catch (e) {}
                    }
                });

                // Handle window minimize/restore
                const windowId = window.name || 'mediaPlayer-window';

                this._unsubscribeMin = parentBus.subscribe(EVENTS.WINDOW_MINIMIZED, (data) => {
                    if (!data || data.windowId !== windowId) return;

                    this._isMinimized = true;
                    this._resumeAfterRestore = this.isPlaying && !this.isMuted;

                    try {
                        this.youtubePlayer?.pauseVideo();
                    } catch (e) {}

                    this._stopTimeUpdates();

                    try {
                        performance.mark('mediaPlayer-timer-paused');
                    } catch (e) {}
                });

                this._unsubscribeRest = parentBus.subscribe(EVENTS.WINDOW_RESTORED, (data) => {
                    if (!data || data.windowId !== windowId) return;

                    this._isMinimized = false;

                    if (this._resumeAfterRestore && !this.isMuted) {
                        try {
                            this.youtubePlayer?.playVideo();
                        } catch (e) {}
                    }

                    this._resumeAfterRestore = false;
                    this.updateTimeDisplay();

                    if (this.isPlaying) {
                        this._startTimeUpdates();
                    }

                    try {
                        performance.mark('mediaPlayer-timer-resumed');
                    } catch (e) {}
                });

                // Handle music player playing
                try {
                    parentBus.subscribe(EVENTS.MUSIC_PLAYER_PLAYING, () => {
                        if (this.youtubePlayer && this.isPlaying) {
                            try {
                                this.youtubePlayer.pauseVideo();
                            } catch (e) {}
                        }
                    });
                } catch (e) {}
            }
        } catch (e) {}
    }

    init() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="mediaPlayer.css" />
            <div class="main">
                <div class="content">
                    <div id="youtube-iframe" style="width: 100%; height: 100%;"></div>
                </div>
                <div class="tray-background" style="position: absolute; bottom: 0; left: 0; right: 0; height: 69px; z-index: 5;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="69" viewBox="0 0 558 69" preserveAspectRatio="xMidYMid slice" color-interpolation="linearrgb">
                        <defs>
                            <linearGradient id="outer-fill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stop-color="#636c87" />
                                <stop offset="0.25" stop-color="#3f4557" />
                                <stop offset="0.375" stop-color="#2e333f" />
                                <stop offset="0.45" stop-color="#272b35" />
                                <stop offset="0.5" stop-color="#17181d" />
                                <stop offset="0.54" stop-color="#0a0a0b" />
                                <stop offset="0.75" stop-color="#060609" />
                                <stop offset="0.78" stop-color="#050608" />
                                <stop offset="0.88" stop-color="#050608" />
                                <stop offset="0.93" stop-color="#141929" />
                                <stop offset="0.98" stop-color="#2c3555" />
                            </linearGradient>
                            <linearGradient id="tray-fill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0.02" stop-color="#959fb9" />
                                <stop offset="0.04" stop-color="#616b87" />
                                <stop offset="0.125" stop-color="#576077" />
                                <stop offset="0.25" stop-color="#4c5568" />
                                <stop offset="0.48" stop-color="#3c4352" />
                                <stop offset="0.51" stop-color="#111111" />
                                <stop offset="0.80" stop-color="#121212" />
                                <stop offset="0.90" stop-color="#141a2a" />
                                <stop offset="0.98" stop-color="#424c74" />
                            </linearGradient>
                            <linearGradient id="tray-edge-o" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0.39" stop-color="#5e677f" />
                                <stop offset="0.70" stop-color="#15161d" />
                                <stop offset="0.75" stop-color="#0d0d0e" />
                            </linearGradient>
                            <linearGradient id="tray-edge-i" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0.70" stop-color="#0d0d0e" />
                                <stop offset="0.75" stop-color="#15161d" />
                                <stop offset="0.98" stop-color="#414c73" />
                            </linearGradient>
                            <path id="tray-boundary-path" d="M -10 12.5 L 0 12.5 Q 32 12.5 55 40 C 71 61 73 69 95 69 L 463 69 C 485 69 487 61 503 40 Q 526 12.5 556 12.5 L 566 12.5 l 0 -12.5 L -10 0 z" />
                            <clipPath id="no-borders"><rect y="1" width="100%" height="67" /></clipPath>
                            <mask id="tray-area"><use href="#tray-boundary-path" fill="#FFF" /></mask>
                            <mask id="non-tray-area"><rect width="558" height="69" fill="#FFF" /><use href="#tray-boundary-path" fill="#000" /></mask>
                        </defs>
                        <rect width="558" height="69" mask="url(#non-tray-area)" fill="url(#outer-fill)" />
                        <rect width="558" height="69" mask="url(#tray-area)" fill="url(#tray-fill)" />
                        <use href="#tray-boundary-path" fill="none" stroke="url(#tray-edge-o)" stroke-width="3" clip-path="url(#no-borders)" mask="url(#non-tray-area)" />
                        <use href="#tray-boundary-path" fill="none" stroke="url(#tray-edge-i)" stroke-width="1" clip-path="url(#no-borders)" />
                        <g stroke-width="2">
                            <line x1="-5%" x2="100%" y1="0" y2="0" stroke="#212224" />
                            <line x1="-5%" x2="100%" y1="69" y2="69" stroke="#161a20" />
                            <line x1="95" x2="463" y1="69" y2="69" stroke="#191d25" />
                        </g>
                    </svg>
                </div>
                <wm-slider class="seek" title="Seek" aria-label="Seek"></wm-slider>
                <div class="controls">
                    <div class="left">
                        <time class="current-time" aria-label="Current time">0:00</time>
                        <button class="prev-rw" disabled title="Previous">Previous</button>
                    </div>
                    <button class="play-pause">Play</button>
                    <div class="right">
                        <button class="next-ff" disabled title="Next">Next</button>
                        <input type="checkbox" aria-label="Mute" aria-role="switch" class="basic-button mute" />
                        <wm-slider aria-label="Volume" class="volume constant-thumb circular-thumb" min="0" max="100" value="100" step="1" title="Volume"></wm-slider>
                    </div>
                </div>
            <div class="gutter-right" style="z-index: 10, position: relative;">
              <div class="rearrangeables">
                <button class="basic-button loop" title="Swap playlist" aria-label="Swap playlist"></button>
              </div>
            </div>

            </div>
        `;

        this.setupControls();
        this.loadYouTubeAPI();
    }

    setupControls() {
        this._muteEnableTimerId = null;

        const playPauseBtn = this.shadowRoot.querySelector('.play-pause');
        const nextBtn = this.shadowRoot.querySelector('.next-ff');
        const prevBtn = this.shadowRoot.querySelector('.prev-rw');
        const muteBtn = this.shadowRoot.querySelector('.mute');
        const seekSlider = this.shadowRoot.querySelector('.seek');
        const volumeSlider = this.shadowRoot.querySelector('.volume');

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        nextBtn.addEventListener('click', () => this.nextVideo());
        prevBtn.addEventListener('click', () => this.previousVideo());

        if (muteBtn) {
            muteBtn.disabled = true;
            this._muteUnlockDone = false;
        }

        muteBtn.addEventListener('click', () => this.toggleMute());

        const playlistBtn = this.shadowRoot.querySelector('.loop');
        if (playlistBtn) {
            playlistBtn.addEventListener('click', () => this.togglePlaylist());
            this._updatePlaylistButton();
        }

        volumeSlider.addEventListener('change', (e) => {
            this.setVolume(e.detail);
        });

        seekSlider.addEventListener('change', (e) => {
            this.seekTo(e.detail);
        });
    }

    togglePlaylist() {
        this.isPlaying = false;

        if (this._playlistErrorTimeout) {
            clearTimeout(this._playlistErrorTimeout);
            this._playlistErrorTimeout = null;
        }

        this._errorShown = false;
        this.isUsingAltPlaylist = !this.isUsingAltPlaylist;
        this._updatePlaylistButton();

        if (this.youtubePlayer && typeof this.youtubePlayer.destroy === 'function') {
            this.youtubePlayer.destroy();
            this.youtubePlayer = null;

            setTimeout(() => {
                this.initYouTubePlayer();
            }, 150);
        }
    }

    _updatePlaylistButton() {
        try {
            const btn = this.shadowRoot.querySelector('.loop');
            if (!btn) return;
            btn.classList.remove('active');
        } catch (e) {}
    }

    loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            this.initYouTubePlayer();
            return;
        }

        if (!window._ytApiPromise) {
            window._ytApiPromise = new Promise((resolve) => {
                const existingCallback = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (existingCallback) existingCallback();
                    resolve();
                };

                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                const firstScript = document.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(script, firstScript);
            });
        }

        window._ytApiPromise.then(() => this.initYouTubePlayer());
    }

    initYouTubePlayer() {
        const playlistId = this.isUsingAltPlaylist ? this.altPlaylistId : this.primaryPlaylistId;

        const playerVars = {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            fs: 0,
            disablekb: 1,
            playsinline: 1,
            listType: 'playlist',
            list: playlistId,
            origin: window.location.origin
        };

        this.youtubePlayer = new YT.Player(this.shadowRoot.getElementById('youtube-iframe'), {
            height: '100%',
            width: '100%',
            playerVars: playerVars,
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event)
            }
        });
    }

    onPlayerReady() {
        const nextBtn = this.shadowRoot.querySelector('.next-ff');
        const prevBtn = this.shadowRoot.querySelector('.prev-rw');

        if (nextBtn) nextBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = false;

        this.setVolume(this.volume);

        // Handle mute state
        try {
            const muteBtn = this.shadowRoot.querySelector('.mute');
            if (this.isMuted && this.youtubePlayer?.mute) {
                this.youtubePlayer.mute();
                if (muteBtn) muteBtn.checked = true;
            } else if (!this.isMuted && this.youtubePlayer?.unMute) {
                this.youtubePlayer.unMute();
                if (muteBtn) muteBtn.checked = false;
            }
        } catch (e) {}

        this.updateTimeDisplay();
        this.updatePlayPauseButton();

        // Set up error timeout to handle browser compatibility issues
        if (this._playlistErrorTimeout) {
            clearTimeout(this._playlistErrorTimeout);
        }

        let checkCount = 0;
        const maxChecks = 60;
        const checkInterval = 300;

        const checkPlaylistStatus = () => {
            checkCount++;

            const isPlayingOrBuffering = this.isPlaying ||
                (this.youtubePlayer && (
                    this.youtubePlayer.getPlayerState() === 3 || // Buffering
                    this.youtubePlayer.getPlayerState() === 5 || // Cued
                    this.youtubePlayer.getPlayerState() === 1    // Playing
                ));

            if (isPlayingOrBuffering) {
                this._playlistErrorTimeout = null;
                return;
            }

            // Check for error states
            if (checkCount >= 2 && this.youtubePlayer) {
                const playerState = this.youtubePlayer.getPlayerState();
                if (playerState === -1 || (playerState === 0 && checkCount >= 3)) {
                    if (this._playlistErrorTimeout) {
                        clearTimeout(this._playlistErrorTimeout);
                        this._playlistErrorTimeout = null;
                    }
                    this.showPlaylistError();
                    return;
                }
            }

            if (checkCount >= maxChecks) {
                if (this._playlistErrorTimeout) {
                    clearTimeout(this._playlistErrorTimeout);
                    this._playlistErrorTimeout = null;
                }
                this.showPlaylistError();
            } else {
                this._playlistErrorTimeout = setTimeout(checkPlaylistStatus, checkInterval);
            }
        };

        this._playlistErrorTimeout = setTimeout(checkPlaylistStatus, 300);
    }

    onPlayerStateChange(event) {
        // Clear error timeout if player starts working
        if (event.data === YT.PlayerState.PLAYING ||
            event.data === 3 || // Buffering
            event.data === 5) { // Cued
            if (this._playlistErrorTimeout) {
                clearTimeout(this._playlistErrorTimeout);
                this._playlistErrorTimeout = null;
            }
        }

        if (event.data === YT.PlayerState.PLAYING) {
            // Enable mute button after a delay
            try {
                const muteBtn = this.shadowRoot.querySelector('.mute');
                if (muteBtn && !this._muteUnlockDone) {
                    if (this._muteEnableTimerId) {
                        clearTimeout(this._muteEnableTimerId);
                    }
                    muteBtn.disabled = true;
                    this._muteEnableTimerId = setTimeout(() => {
                        muteBtn.disabled = false;
                        this._muteUnlockDone = true;
                    }, 1000);
                }
            } catch (e) {}

            this.isPlaying = true;
            this.setAttribute('data-state', 'playing');
            this._startTimeUpdates();

            // Publish playing event
            if (window.parent && window.parent.eventBus && window.parent.EVENTS && !this.isMuted) {
                window.parent.eventBus.publish(window.parent.EVENTS.MEDIA_PLAYER_PLAYING, {
                    programId: 'mediaPlayer'
                });
            }
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.removeAttribute('data-state');
            this._stopTimeUpdates();

            // Publish stopped event
            if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
                window.parent.eventBus.publish(window.parent.EVENTS.MEDIA_PLAYER_STOPPED, {
                    programId: 'mediaPlayer'
                });
            }
        } else if (event.data === YT.PlayerState.ENDED) {
            // Loop to beginning of playlist
            try {
                const player = this.youtubePlayer;
                if (player &&
                    typeof player.getPlaylistIndex === 'function' &&
                    typeof player.getPlaylist === 'function' &&
                    typeof player.playVideoAt === 'function') {
                    const playlist = player.getPlaylist();
                    if (Array.isArray(playlist) && playlist.length > 0) {
                        const currentIndex = player.getPlaylistIndex();
                        if (currentIndex === playlist.length - 1) {
                            player.playVideoAt(0);
                            return;
                        }
                    }
                }
            } catch (e) {}

            this.isPlaying = false;
            this.removeAttribute('data-state');
            this._stopTimeUpdates();

            // Publish stopped event
            if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
                window.parent.eventBus.publish(window.parent.EVENTS.MEDIA_PLAYER_STOPPED, {
                    programId: 'mediaPlayer'
                });
            }
        }

        this.updatePlayPauseButton();
    }

    showPlaylistError() {
        if (this._errorShown) return;
        this._errorShown = true;

        try {
            if (window.parent) {
                window.parent.postMessage({
                    type: 'show-youtube-error',
                    message: 'Browser compatibility issue detected'
                }, '*');
            }
        } catch (e) {
            console.error('YouTube playlist failed to start playing');
        }
    }

    updatePlayPauseButton() {
        if (this.internals) {
            if (this.isPlaying) {
                this.internals.states?.add('playing');
            } else {
                this.internals.states?.delete('playing');
            }
        }
    }

    updateTimeDisplay() {
        if (!this.youtubePlayer || !this.youtubePlayer.getCurrentTime) return;

        const currentTime = this.youtubePlayer.getCurrentTime();
        const duration = this.youtubePlayer.getDuration();
        const timeDisplay = this.shadowRoot.querySelector('.current-time');
        const seekSlider = this.shadowRoot.querySelector('.seek');

        if (timeDisplay && duration > 0) {
            const currentTimeStr = this.formatTime(currentTime);
            const durationStr = this.formatTime(duration);
            const displayText = `${currentTimeStr} / ${durationStr}`;

            if (timeDisplay.textContent !== displayText) {
                timeDisplay.textContent = displayText;
            }

            const percentage = (currentTime / duration) * 100;
            if (seekSlider) {
                const currentValue = parseFloat(seekSlider.style.getPropertyValue('--value'));
                if (isNaN(currentValue) || Math.abs(currentValue - percentage) >= 0.5) {
                    seekSlider.style.setProperty('--value', percentage);
                }
            }
        }
    }

    _startTimeUpdates() {
        if (this._timeInterval != null) return;
        if (document.hidden || this._isMinimized || !this.isPlaying) return;

        this.updateTimeDisplay();
        this._timeInterval = setInterval(() => {
            if (document.hidden || this._isMinimized || !this.isPlaying) {
                this._stopTimeUpdates();
                return;
            }
            this.updateTimeDisplay();
        }, 1000);
    }

    _stopTimeUpdates() {
        if (this._timeInterval != null) {
            clearInterval(this._timeInterval);
            this._timeInterval = null;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    togglePlayPause() {
        if (!this.youtubePlayer) return;

        if (this.isPlaying) {
            this.youtubePlayer.pauseVideo();
        } else {
            this.youtubePlayer.playVideo();
        }
    }

    nextVideo() {
        if (this.youtubePlayer) {
            // Handle playlist looping
            try {
                const player = this.youtubePlayer;
                if (player &&
                    typeof player.getPlaylistIndex === 'function' &&
                    typeof player.getPlaylist === 'function' &&
                    typeof player.playVideoAt === 'function') {
                    const playlist = player.getPlaylist();
                    if (Array.isArray(playlist) && playlist.length > 0) {
                        const currentIndex = player.getPlaylistIndex();
                        if (currentIndex === playlist.length - 1) {
                            player.playVideoAt(0);
                            return;
                        }
                    }
                }
            } catch (e) {}

            this.youtubePlayer.nextVideo();
        }
    }

    previousVideo() {
        if (this.youtubePlayer) {
            this.youtubePlayer.previousVideo();
        }
    }

    toggleMute() {
        if (!this.youtubePlayer) return;

        const muteBtn = this.shadowRoot.querySelector('.mute');

        if (this.isMuted) {
            this.youtubePlayer.unMute();
            this.isMuted = false;
            muteBtn.checked = false;

            // Publish playing event if playing
            if (this.isPlaying && window.parent && window.parent.eventBus && window.parent.EVENTS) {
                window.parent.eventBus.publish(window.parent.EVENTS.MEDIA_PLAYER_PLAYING, {
                    programId: 'mediaPlayer'
                });
            }
        } else {
            this.youtubePlayer.mute();
            this.isMuted = true;
            muteBtn.checked = true;

            // Publish stopped event if playing
            if (this.isPlaying && window.parent && window.parent.eventBus && window.parent.EVENTS) {
                window.parent.eventBus.publish(window.parent.EVENTS.MEDIA_PLAYER_STOPPED, {
                    programId: 'mediaPlayer'
                });
            }
        }
    }

    setVolume(volume) {
        if (!this.youtubePlayer) return;

        this.volume = Math.max(0, Math.min(100, volume));
        this.youtubePlayer.setVolume(this.volume);

        const volumeSlider = this.shadowRoot.querySelector('.volume');
        if (volumeSlider) {
            volumeSlider.style.setProperty('--value', this.volume);
        }
    }

    seekTo(percentage) {
        if (!this.youtubePlayer) return;

        const duration = this.youtubePlayer.getDuration();
        if (duration > 0) {
            const seekTime = (percentage / 100) * duration;
            this.youtubePlayer.seekTo(seekTime);
        }
    }

    disconnectedCallback() {
        try {
            if (this._muteEnableTimerId) {
                clearTimeout(this._muteEnableTimerId);
                this._muteEnableTimerId = null;
            }
        } catch (e) {}

        this._stopTimeUpdates();
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
        window.removeEventListener('blur', this._onWindowBlur);
        window.removeEventListener('focus', this._onWindowFocus);

        // Unsubscribe from events
        try {
            if (this._unsubscribeMin) this._unsubscribeMin();
            if (this._unsubscribeRest) this._unsubscribeRest();
            if (this._unsubscribeMediaPause) this._unsubscribeMediaPause();
            if (this._unsubscribeMediaVisible) this._unsubscribeMediaVisible();
            if (this._unsubscribeMediaResume) this._unsubscribeMediaResume();
            if (this._unsubscribeSessionLogin) this._unsubscribeSessionLogin();
            if (this._unsubscribeLogoffReq) this._unsubscribeLogoffReq();
        } catch {}
    }

    softReset() {
        try {
            this._stopTimeUpdates();
            if (this.youtubePlayer && this.youtubePlayer.pauseVideo) {
                this.youtubePlayer.pauseVideo();
            }
            this._resumeAfterRestore = false;
        } catch (e) {}
    }

    _onVisibilityChange() {
        if (document.hidden) {
            this._stopTimeUpdates();
        } else if (this.isPlaying && !this._isMinimized) {
            this._startTimeUpdates();
        }
    }
}

// Slider component for volume and seek controls
class WMPlayerSliderElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.value = 0;
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.isDragging = false;

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="mediaPlayer.css" />
            <div class="track-bare"></div>
            <div class="track-full"></div>
            <div class="thumb"></div>
        `;

        this.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.addEventListener('click', this.handleClick.bind(this));
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    handleMouseDown(event) {
        this.isDragging = true;
        this.updateValue(event);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        event.preventDefault();
    }

    handleMouseMove(event) {
        if (this.isDragging) {
            this.updateValue(event);
        }
    }

    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
        }
    }

    handleClick(event) {
        if (!this.isDragging) {
            this.updateValue(event);
        }
    }

    updateValue(event) {
        const rect = this.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        this.value = this.min + percentage * (this.max - this.min);
        this.style.setProperty('--value', this.value);
        this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
    }

    connectedCallback() {
        const maxAttr = this.getAttribute('max');
        const minAttr = this.getAttribute('min');
        const valueAttr = this.getAttribute('value');
        const stepAttr = this.getAttribute('step');

        if (maxAttr) this.max = parseFloat(maxAttr);
        if (minAttr) this.min = parseFloat(minAttr);
        if (valueAttr) this.value = parseFloat(valueAttr);
        if (stepAttr) this.step = parseFloat(stepAttr);

        this.style.setProperty('--value', this.value);
        this.style.setProperty('--minimum', this.min);
        this.style.setProperty('--maximum', this.max);
    }
}

// Register custom elements
customElements.define('wm-slider', WMPlayerSliderElement);
customElements.define('wm-player', YouTubeMediaPlayer);