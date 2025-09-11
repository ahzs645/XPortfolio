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
        const songData = [{
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
            playBtn = document.querySelector(".play-btn"),
            backBtn = document.querySelector(".skip-left"),
            forwardBtn = document.querySelector(".skip-right"),
            volUpBtn = document.querySelector(".vol-up"),
            volDownBtn = document.querySelector(".vol-down"),
            controlBtnOverlay = document.querySelector(".btn-overlay"),
            artworkEl = document.querySelector(".album-artwork"),
            songTitleEl = document.querySelector("#song-title"),
            artistNameEl = document.querySelector("#artist-name"),
            audioPlayer = document.getElementById("audio-player");
        let preloadReadyPublished = !1,
            currentSongIndex = 0,
            isPlaying = !1;

        function loadSong(songIndex) {
            if (!songData[songIndex]) return;
            const currentTrack = songData[songIndex];
            artworkEl && currentTrack.artPath ? artworkEl.style.backgroundImage = `url('${currentTrack.artPath}')` : artworkEl && (artworkEl.style.backgroundImage = ""), songTitleEl && (songTitleEl.innerText = currentTrack.song || "Unknown Song"), artistNameEl && (artistNameEl.innerText = currentTrack.band || "Unknown Artist"), audioPlayer && currentTrack.filePath ? (audioPlayer.src = currentTrack.filePath, audioPlayer.load(), isPlaying && audioPlayer.play().catch(() => {}), !preloadReadyPublished && window.parent && window.parent.eventBus && window.parent.EVENTS && window.parent.EVENTS.MUSIC_PLAYER_PRELOAD_READY && (window.parent.eventBus.publish(window.parent.EVENTS.MUSIC_PLAYER_PRELOAD_READY, {
                programId: "musicPlayer"
            }), preloadReadyPublished = !0)) : audioPlayer && (audioPlayer.src = "")
        }

        function playSong() {
            if (audioPlayer) {
                if (!audioPlayer.src && songData[currentSongIndex] && songData[currentSongIndex].filePath) loadSong(currentSongIndex);
                else if (!audioPlayer.src) return;
                audioPlayer.play().then(() => {
                    if (isPlaying = !0, playBtn.classList.add("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                        const EV = window.parent.EVENTS.MUSIC_PLAYER_PLAYING;
                        (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                            programId: "musicPlayer",
                            __coalesce: !0
                        })
                    }
                }).catch(() => {})
            }
        }
        if (audioPlayer && (audioPlayer.addEventListener("ended", () => {
                if (isPlaying = !1, playBtn.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
                currentSongIndex++, currentSongIndex >= songData.length && (currentSongIndex = 0), loadSong(currentSongIndex), playSong()
            }), audioPlayer.addEventListener("pause", () => {
                if (isPlaying = !1, playBtn.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
            })), playBtn) {
            playBtn.addEventListener("click", function() {
                if (audioPlayer)
                    if (audioPlayer.paused || audioPlayer.ended) {
                        if (!audioPlayer.src && songData[currentSongIndex] && songData[currentSongIndex].filePath) loadSong(currentSongIndex);
                        else if (!audioPlayer.src) return;
                        audioPlayer.play().then(() => {
                            if (isPlaying = !0, playBtn.classList.add("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                                const EV = window.parent.EVENTS.MUSIC_PLAYER_PLAYING;
                                (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                                    programId: "musicPlayer",
                                    __coalesce: !0
                                })
                            }
                        }).catch(() => {})
                    } else if (audioPlayer.pause(), isPlaying = !1, playBtn.classList.remove("playing"), window.parent && window.parent.eventBus && window.parent.EVENTS) {
                    const EV = window.parent.EVENTS.MUSIC_PLAYER_STOPPED;
                    (window.parent.batchedPublish || window.parent.eventBus.publish).call(window.parent.batchedPublish ? void 0 : window.parent.eventBus, EV, {
                        programId: "musicPlayer",
                        __coalesce: !0
                    })
                }
            });
            const onDown = e => {
                    try {
                        playBtn.setPointerCapture && playBtn.setPointerCapture(e.pointerId)
                    } catch {}
                    playBtn.classList.add("pressed")
                },
                onUpCancelLeave = () => playBtn.classList.remove("pressed");
            playBtn.addEventListener("pointerdown", onDown), playBtn.addEventListener("pointerup", onUpCancelLeave), playBtn.addEventListener("pointercancel", onUpCancelLeave), playBtn.addEventListener("pointerleave", onUpCancelLeave)
        }
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                currentSongIndex--, currentSongIndex < 0 && (currentSongIndex = songData.length - 1), loadSong(currentSongIndex), playSong()
            });
            const add = () => controlBtnOverlay && controlBtnOverlay.classList.add("left"),
                remove = () => controlBtnOverlay && controlBtnOverlay.classList.remove("left");
            backBtn.addEventListener("pointerdown", add), backBtn.addEventListener("pointerup", remove), backBtn.addEventListener("pointercancel", remove), backBtn.addEventListener("pointerleave", remove)
        }
        if (forwardBtn) {
            forwardBtn.addEventListener("click", () => {
                currentSongIndex++, currentSongIndex >= songData.length && (currentSongIndex = 0), loadSong(currentSongIndex), playSong()
            });
            const add = () => controlBtnOverlay && controlBtnOverlay.classList.add("right"),
                remove = () => controlBtnOverlay && controlBtnOverlay.classList.remove("right");
            forwardBtn.addEventListener("pointerdown", add), forwardBtn.addEventListener("pointerup", remove), forwardBtn.addEventListener("pointercancel", remove), forwardBtn.addEventListener("pointerleave", remove)
        }
        if (audioPlayer) {
            if (audioPlayer.volume = .3, audioPlayer.preload = "metadata", volUpBtn) {
                volUpBtn.addEventListener("click", () => {
                    const newVolume = Math.min(1, Math.max(0, parseFloat((audioPlayer.volume + .1).toFixed(2))));
                    audioPlayer.volume = newVolume
                });
                const add = () => controlBtnOverlay && controlBtnOverlay.classList.add("up"),
                    remove = () => controlBtnOverlay && controlBtnOverlay.classList.remove("up");
                volUpBtn.addEventListener("pointerdown", add), volUpBtn.addEventListener("pointerup", remove), volUpBtn.addEventListener("pointercancel", remove), volUpBtn.addEventListener("pointerleave", remove)
            }
            if (volDownBtn) {
                volDownBtn.addEventListener("click", () => {
                    const newVolume = Math.min(1, Math.max(0, parseFloat((audioPlayer.volume - .1).toFixed(2))));
                    audioPlayer.volume = newVolume
                });
                const add = () => controlBtnOverlay && controlBtnOverlay.classList.add("down"),
                    remove = () => controlBtnOverlay && controlBtnOverlay.classList.remove("down");
                volDownBtn.addEventListener("pointerdown", add), volDownBtn.addEventListener("pointerup", remove), volDownBtn.addEventListener("pointercancel", remove), volDownBtn.addEventListener("pointerleave", remove)
            }
        }
        let wasPlayingBeforeHide = !1,
            isMinimized = !1;
        document.addEventListener("visibilitychange", () => {
            audioPlayer && (document.hidden ? (wasPlayingBeforeHide = !audioPlayer.paused, wasPlayingBeforeHide && audioPlayer.pause()) : wasPlayingBeforeHide && audioPlayer.play().catch(() => {}))
        });
        try {
            if (window.parent && window.parent.eventBus && window.parent.EVENTS) {
                const {
                    eventBus: parentBus,
                    EVENTS: PEV
                } = window.parent;
                parentBus.subscribe(PEV.MEDIA_GLOBAL_PAUSE, () => {
                    audioPlayer && (audioPlayer.paused || audioPlayer.pause())
                }), parentBus.subscribe(PEV.MEDIA_GLOBAL_VISIBLE, () => {
                    audioPlayer && wasPlayingBeforeHide && !isMinimized && audioPlayer.play().catch(() => {})
                }), parentBus.subscribe(PEV.LOG_OFF_REQUESTED, () => {
                    audioPlayer && (audioPlayer.paused || audioPlayer.pause())
                }), parentBus.subscribe(PEV.MEDIA_PLAYER_PLAYING, () => {
                    if (audioPlayer && !audioPlayer.paused) try {
                        audioPlayer.pause()
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