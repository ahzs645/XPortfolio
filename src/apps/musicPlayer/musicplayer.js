window.MusicPlayer = {
    init: function() {
        try {
            if (!document.getElementById("gesture-suppression-style")) {
                const style = document.createElement("style");
                style.id = "gesture-suppression-style", style.textContent = "html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none;}", document.head.appendChild(style)
            }
        } catch (_) {}
        if (!window.__GESTURE_SUPPRESSION_V2) {
            window.__GESTURE_SUPPRESSION_V2 = !0;
            const state = {
                    lastTouchEnd: 0
                },
                handler = e => {
                    switch (e.type) {
                        case "gesturestart":
                        case "gesturechange":
                        case "gestureend":
                            e.preventDefault();
                            break;
                        case "touchstart":
                        case "touchmove":
                            e.touches && e.touches.length > 1 && e.preventDefault();
                            break;
                        case "touchend": {
                            const now = Date.now();
                            now - state.lastTouchEnd <= 300 && e.preventDefault(), state.lastTouchEnd = now;
                            break
                        }
                        case "wheel":
                            e.ctrlKey && e.preventDefault()
                    }
                };
            ["gesturestart", "gesturechange", "gestureend", "touchstart", "touchmove", "touchend", "wheel"].forEach(t => document.addEventListener(t, handler, {
                passive: !1,
                capture: !0
            }))
        }
        const songs = [{
                band: "Chiddy Bang ft. Icona Pop",
                song: "Mind Your Manners",
                filePath: "../../../assets/apps/musicPlayer/audio/song1.mp3",
                artPath: "../../../assets/apps/musicPlayer/art/album1.webp"
            }, {
                band: "Natasha Bedingfield",
                song: "Unwritten",
                filePath: "../../../assets/apps/musicPlayer/audio/song2.mp3",
                artPath: "../../../assets/apps/musicPlayer/art/album2.webp"
            }, {
                band: "B.O.B. ft. Rivers Cuomo",
                song: "Magic",
                filePath: "../../../assets/apps/musicPlayer/audio/song3.mp3",
                artPath: "../../../assets/apps/musicPlayer/art/album3.webp"
            }],
            playButton = document.querySelector(".play-btn"),
            backButton = document.querySelector(".skip-left"),
            forwardButton = document.querySelector(".skip-right"),
            volumeUpButton = document.querySelector(".vol-up"),
            volumeDownButton = document.querySelector(".vol-down"),
            controlButtonOverlay = document.querySelector(".btn-overlay"),
            artworkElement = document.querySelector(".album-artwork"),
            songTitleElement = document.querySelector("#song-title"),
            artistNameElement = document.querySelector("#artist-name"),
            audioElement = document.getElementById("audio-player");
        let preloadReadyPublished = !1,
            currentSongIndex = 0,
            isPlaying = !1;

        function loadSong(songIndex) {
            if (!songs[songIndex]) return;
            const currentTrack = songs[songIndex];
            artworkElement && currentTrack.artPath ? artworkElement.style.backgroundImage = `url('${currentTrack.artPath}')` : artworkElement && (artworkElement.style.backgroundImage = ""), songTitleElement && (songTitleElement.innerText = currentTrack.song || "Unknown Song"), artistNameElement && (artistNameElement.innerText = currentTrack.band || "Unknown Artist"), audioElement && currentTrack.filePath ? (audioElement.src = currentTrack.filePath, audioElement.load(), isPlaying && audioElement.play().catch(() => {}), !preloadReadyPublished && window.parent && window.parent.eventBus && window.parent.EVENTS && window.parent.EVENTS.MUSIC_PLAYER_PRELOAD_READY && (window.parent.eventBus.publish(window.parent.EVENTS.MUSIC_PLAYER_PRELOAD_READY, {
                programId: "musicPlayer"
            }), preloadReadyPublished = !0)) : audioElement && (audioElement.src = "")
        }

        function playSong() {
            if (audioElement) {
                if (!audioElement.src && songs[currentSongIndex] && songs[currentSongIndex].filePath) loadSong(currentSongIndex);
                else if (!audioElement.src) return;
                audioElement.play().then(() => {
                    if (isPlaying = !0, playButton.classList.add("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                        const EV = window.parent.EVENTS.MUSIC_PLAYER_PLAYING;
                        (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                            programId: "musicPlayer",
                            __coalesce: !0
                        })
                    }
                }).catch(() => {})
            }
        }
        if (audioElement && (audioElement.addEventListener("ended", () => {
                if (isPlaying = !1, playButton.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
                currentSongIndex++, currentSongIndex >= songs.length && (currentSongIndex = 0), loadSong(currentSongIndex), playSong()
            }), audioElement.addEventListener("pause", () => {
                if (isPlaying = !1, playButton.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
            })), playButton) {
            playButton.addEventListener("click", function() {
                if (audioElement)
                    if (audioElement.paused || audioElement.ended) {
                        if (!audioElement.src && songs[currentSongIndex] && songs[currentSongIndex].filePath) loadSong(currentSongIndex);
                        else if (!audioElement.src) return;
                        audioElement.play().then(() => {
                            if (isPlaying = !0, playButton.classList.add("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                                const EV = window.parent.EVENTS.MUSIC_PLAYER_PLAYING;
                                (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                                    programId: "musicPlayer",
                                    __coalesce: !0
                                })
                            }
                        }).catch(() => {})
                    } else if (audioElement.pause(), isPlaying = !1, playButton.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
            });
            const onDown = e => {
                    try {
                        playButton.setPointerCapture && playButton.setPointerCapture(e.pointerId)
                    } catch {}
                    playButton.classList.add("pressed")
                },
                onUpCancelLeave = () => playButton.classList.remove("pressed");
            playButton.addEventListener("pointerdown", onDown), playButton.addEventListener("pointerup", onUpCancelLeave), playButton.addEventListener("pointercancel", onUpCancelLeave), playButton.addEventListener("pointerleave", onUpCancelLeave)
        }
        if (backButton) {
            backButton.addEventListener("click", () => {
                currentSongIndex--, currentSongIndex < 0 && (currentSongIndex = songs.length - 1), loadSong(currentSongIndex), playSong()
            });
            const add = () => controlButtonOverlay && controlButtonOverlay.classList.add("left"),
                remove = () => controlButtonOverlay && controlButtonOverlay.classList.remove("left");
            backButton.addEventListener("pointerdown", add), backButton.addEventListener("pointerup", remove), backButton.addEventListener("pointercancel", remove), backButton.addEventListener("pointerleave", remove)
        }
        if (forwardButton) {
            forwardButton.addEventListener("click", () => {
                currentSongIndex++, currentSongIndex >= songs.length && (currentSongIndex = 0), loadSong(currentSongIndex), playSong()
            });
            const add = () => controlButtonOverlay && controlButtonOverlay.classList.add("right"),
                remove = () => controlButtonOverlay && controlButtonOverlay.classList.remove("right");
            forwardButton.addEventListener("pointerdown", add), forwardButton.addEventListener("pointerup", remove), forwardButton.addEventListener("pointercancel", remove), forwardButton.addEventListener("pointerleave", remove)
        }
        if (audioElement) {
            if (audioElement.volume = .3, audioElement.preload = "metadata", volumeUpButton) {
                volumeUpButton.addEventListener("click", () => {
                    const newVolume = Math.min(1, Math.max(0, parseFloat((audioElement.volume + .1).toFixed(2))));
                    audioElement.volume = newVolume
                });
                const add = () => controlButtonOverlay && controlButtonOverlay.classList.add("up"),
                    remove = () => controlButtonOverlay && controlButtonOverlay.classList.remove("up");
                volumeUpButton.addEventListener("pointerdown", add), volumeUpButton.addEventListener("pointerup", remove), volumeUpButton.addEventListener("pointercancel", remove), volumeUpButton.addEventListener("pointerleave", remove)
            }
            if (volumeDownButton) {
                volumeDownButton.addEventListener("click", () => {
                    const newVolume = Math.min(1, Math.max(0, parseFloat((audioElement.volume - .1).toFixed(2))));
                    audioElement.volume = newVolume
                });
                const add = () => controlButtonOverlay && controlButtonOverlay.classList.add("down"),
                    remove = () => controlButtonOverlay && controlButtonOverlay.classList.remove("down");
                volumeDownButton.addEventListener("pointerdown", add), volumeDownButton.addEventListener("pointerup", remove), volumeDownButton.addEventListener("pointercancel", remove), volumeDownButton.addEventListener("pointerleave", remove)
            }
        }
        let wasPlayingBeforeHide = !1,
            isMinimized = !1;
        document.addEventListener("visibilitychange", () => {
            audioElement && (document.hidden ? (wasPlayingBeforeHide = !audioElement.paused, wasPlayingBeforeHide && audioElement.pause()) : wasPlayingBeforeHide && audioElement.play().catch(() => {}))
        });
        try {
            if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
                const {
                    eventBus: parentBus,
                    EVENTS: PEV
                } = window.parent;
                parentBus.subscribe(PEV.MEDIA_GLOBAL_PAUSE, () => {
                    audioElement && (audioElement.paused || audioElement.pause())
                }), parentBus.subscribe(PEV.MEDIA_GLOBAL_VISIBLE, () => {
                    audioElement && wasPlayingBeforeHide && !isMinimized && audioElement.play().catch(() => {})
                }), parentBus.subscribe(PEV.LOG_OFF_REQUESTED, () => {
                    audioElement && (audioElement.paused || audioElement.pause())
                }), parentBus.subscribe(PEV.MEDIA_PLAYER_PLAYING, () => {
                    if (audioElement && !audioElement.paused) try {
                        audioElement.pause()
                    } catch (e) {}
                });
                const windowId = window.name || "musicPlayer-window";
                parentBus.subscribe(PEV.WINDOW_MINIMIZED, data => {
                    data && data.windowId === windowId && (isMinimized = !0)
                }), parentBus.subscribe(PEV.WINDOW_RESTORED, data => {
                    data && data.windowId === windowId && (isMinimized = !1)
                })
            }
        } catch (_) {}
        requestAnimationFrame(() => {
            loadSong(currentSongIndex)
        })
    }
}, "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", window.MusicPlayer.init) : window.MusicPlayer.init();