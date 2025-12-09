import React, { useState, useEffect, useRef, useCallback } from 'react';
import './wmp.css';

// Navigation items matching quenq
const NAV_ITEMS = [
  { id: 'nowplaying', label: 'Now Playing', expands: true, selected: true },
  { id: 'skins', label: 'Skin Chooser' },
  { id: 'guide', label: 'Media Guide' },
  { id: 'rip', label: 'Copy from CD' },
  { id: 'library', label: 'Media Library' },
  { id: 'radio', label: 'Radio Tuner' },
  { id: 'burn', label: 'Copy to CD or Device' },
  { id: 'premium', label: 'Premium Services', expands: true },
];

// Visualization names
const VISUALIZERS = ['Bars and waves: Ocean Mist', 'Bars and waves: Fire Storm', 'Scope: Lightning', 'Album Art'];

function MediaPlayerClassic({
  onClose,
  onMinimize,
  onMaximize,
  isFocus,
  fileData,
  fileName,
  onUpdateHeader,
  isMaximized
}) {
  // State
  const [theme, setTheme] = useState('wmp8'); // 'wmp8' or 'wmp9'
  const [frameless, setFrameless] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [playlistHidden, setPlaylistHidden] = useState(false);
  const [selectedNav, setSelectedNav] = useState('nowplaying');
  const [selectedVis, setSelectedVis] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState([
    { name: 'Windows Welcome Music', url: '' },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [statusText, setStatusText] = useState('Ready');

  // Refs
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  // Update window header when frameless changes
  useEffect(() => {
    if (onUpdateHeader) {
      onUpdateHeader({
        icon: '/icons/xp/WindowsMediaPlayer9.png',
        title: 'Windows Media Player',
        buttons: ['minimize', 'maximize', 'close'],
        invisible: frameless,
      });
    }
  }, [frameless, onUpdateHeader]);

  // Load CSS for theme
  useEffect(() => {
    const linkId = 'wmp-theme-css';
    let link = document.getElementById(linkId);

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
    }

    link.href = `/ui/wmp/${theme}-fixed.css`;

    return () => {
      // Don't remove on cleanup - other instances might use it
    };
  }, [theme]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (playlist.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(nextIndex);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [playlist, currentTrackIndex]);

  // Initialize audio context for visualizer
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      if (audioRef.current && !sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
    }
  }, []);

  // Visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width - 6;
        canvas.height = rect.height - 70;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let peaks = [];

    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      if (!analyserRef.current || VISUALIZERS[selectedVis] === 'Album Art') {
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (VISUALIZERS[selectedVis].includes('Bars')) {
        // Bars visualization
        const barCount = 24;
        const barWidth = Math.floor(canvas.width / barCount) - 2;
        const barSpacing = 2;

        if (peaks.length !== barCount) {
          peaks = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor(i * bufferLength / barCount);
          const value = dataArray[dataIndex];
          const barHeight = (value / 255) * canvas.height;

          if (barHeight > peaks[i]) {
            peaks[i] = barHeight;
          } else {
            peaks[i] = Math.max(0, peaks[i] - 2);
          }

          const x = i * (barWidth + barSpacing);

          ctx.fillStyle = '#00f900';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          ctx.fillStyle = '#e6e9e8';
          ctx.fillRect(x, canvas.height - peaks[i] - 2, barWidth, 2);
        }
      } else if (VISUALIZERS[selectedVis].includes('Scope')) {
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f900';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      }
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedVis]);

  // Handle file data passed to component
  useEffect(() => {
    if (fileData && fileName) {
      const blob = new Blob([fileData]);
      const url = URL.createObjectURL(blob);
      setPlaylist([{ name: fileName, url }]);
      setCurrentTrackIndex(0);
      loadTrackUrl(url, fileName);
    }
  }, [fileData, fileName]);

  // Load track by index
  const loadTrack = useCallback((index) => {
    if (playlist[index]) {
      setCurrentTrackIndex(index);
      if (playlist[index].url) {
        loadTrackUrl(playlist[index].url, playlist[index].name);
      }
    }
  }, [playlist]);

  // Load track by URL
  const loadTrackUrl = useCallback((url, name) => {
    if (!audioRef.current) return;

    audioRef.current.src = url;
    audioRef.current.load();
    setStatusText(`Loading: ${name}`);

    audioRef.current.oncanplay = () => {
      setStatusText(`Ready: ${name}`);
    };
  }, []);

  // Playback controls
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    initAudioContext();

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      await audioRef.current.play();
      setStatusText(`Playing: ${playlist[currentTrackIndex]?.name || 'Unknown'}`);
    } catch (e) {
      console.error('Playback failed:', e);
      setStatusText('Playback error');
    }
  }, [initAudioContext, playlist, currentTrackIndex]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setStatusText(`Paused: ${playlist[currentTrackIndex]?.name || ''}`);
  }, [playlist, currentTrackIndex]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setStatusText('Stopped');
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const newIndex = currentTrackIndex - 1 < 0 ? playlist.length - 1 : currentTrackIndex - 1;
    loadTrack(newIndex);
  }, [playlist, currentTrackIndex, loadTrack]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const newIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(newIndex);
  }, [playlist, currentTrackIndex, loadTrack]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Seek handling
  const handleSeek = useCallback((e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  }, [duration]);

  // Volume handling
  const handleVolume = useCallback((e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.volume = percent;
    setVolume(percent);
    if (percent > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  // Toggle frameless mode
  const toggleFrameless = useCallback(() => {
    setFrameless(prev => !prev);
  }, []);

  // Toggle nav collapsed
  const toggleNav = useCallback(() => {
    setNavCollapsed(prev => !prev);
  }, []);

  // Toggle playlist visibility
  const togglePlaylistVisible = useCallback(() => {
    setPlaylistHidden(prev => !prev);
  }, []);

  // Cycle visualization
  const cycleVis = useCallback((backwards = false) => {
    setSelectedVis(prev => {
      if (backwards) {
        return prev - 1 < 0 ? VISUALIZERS.length - 1 : prev - 1;
      }
      return (prev + 1) % VISUALIZERS.length;
    });
  }, []);

  // Format time
  const formatTime = (time) => {
    if (!isFinite(time) || time < 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Build class names for the app element
  const appClasses = [
    'wmp',
    frameless ? 'framehidden' : '',
    navCollapsed ? 'collapsed' : '',
    playlistHidden ? 'playlisthidden' : '',
    isMaximized ? 'maximized' : '',
  ].filter(Boolean).join(' ');

  return (
    <app className={appClasses}>
      <appcontents>
        <appcontentholder>
          <appnavigation>
            <ul className="appmenus">
              <li id="wmp-file-menu">File
                <ul className="submenu">
                  <li data-action="open-media-files">Open Media File(s)...</li>
                  <li className="divider"></li>
                  <li data-action="clear-playlist">Clear Current Playlist</li>
                  <li className="divider"></li>
                  <li data-action="exit-wmp" onClick={onClose}>Exit</li>
                </ul>
              </li>
              <li id="viewmenu" title="Change WMP Appearance" onClick={() => setTheme(t => t === 'wmp8' ? 'wmp9' : 'wmp8')}>Skin</li>
              <li title="Not Implemented">Play</li>
              <li title="Not Implemented">Tools</li>
              <li id="helpmenu">Help</li>
            </ul>
          </appnavigation>

          <wmpmainframe className={navCollapsed ? 'collapsed' : ''}>
            <wmpcolorifier>
              {/* Shape shaders and holders for metallic frame */}
              <div className="shapeshader hideable" id="topleft">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder hideable" id="topleft">
                <div className="wmpshape"></div>
              </div>
              <div className="shapeshader" id="topright">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder" id="topright">
                <div className="wmpshape"></div>
                <select className="hasicons" id="playlistselector" title="Current Playlist">
                  <option id="wmp-currentplaylist-option">Current Playlist</option>
                </select>
                <div id="windowcontrols">
                  <div id="minimize" title="Minimize" onClick={onMinimize}>_</div>
                  <div id="maximize" title="Maximize" onClick={onMaximize}>🗖</div>
                  <div id="close" title="Close" onClick={onClose}>✕</div>
                </div>
              </div>
              <div className="shapeshader hideable" id="bottomleft">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder hideable" id="bottomleft">
                <div className="wmpshape"></div>
              </div>

              {/* Brand logo outside nav */}
              <div id="brand"><img src="/ui/wmp/xplogo_small.png" alt="" /></div>

              {/* Control area shapes */}
              <div className="shapeshader" id="ctrlleft">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder" id="ctrlleft">
                <div className="wmpshape"></div>
              </div>
              <div className="shapeshader" id="ctrlmid">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder" id="ctrlmid">
                <div className="wmpshape"></div>
              </div>
              <div className="shapeshader" id="ctrlright">
                <div className="wmpshape"></div>
              </div>
              <div className="wmpshapeholder" id="ctrlright">
                <div className="wmpshape"></div>
              </div>

              {/* Collapsed nav indicator */}
              <div id="navcollapsed" className={navCollapsed ? 'collapsed' : ''}></div>

              {/* Navigation panel */}
              <div id="nav" className="hideable">
                {NAV_ITEMS.map(item => (
                  <div
                    key={item.id}
                    id={item.id}
                    className={`navitem${item.expands ? ' expands' : ''}${selectedNav === item.id ? ' selected' : ''}`}
                    onClick={() => setSelectedNav(item.id)}
                  >
                    {item.label}
                    {item.expands && <div className="expander"></div>}
                  </div>
                ))}
                <div id="brand"><img src="/ui/wmp/xplogo_small.png" alt="" /></div>
              </div>

              {/* Nav toggle button */}
              <div
                id="navtoggle"
                className={navCollapsed ? 'collapsed' : ''}
                title="Toggle Navigation Pane"
                onClick={toggleNav}
              >
                <div id="arrow">{navCollapsed ? '<' : '>'}</div>
              </div>

              {/* Top metal bar */}
              <div id="topmetal">
                <div className="metaledge left"></div>
                <fnbutton
                  id="toggleUIFrame"
                  className={!frameless ? 'active' : ''}
                  title="Show/Hide Menu Bar and Frame"
                  onClick={toggleFrameless}
                ></fnbutton>
                <div className="metaledge right"></div>
                <fnbutton id="shuffle" title="Shuffle (Not Implemented)"></fnbutton>
                <fnbutton id="equalizer" title="Equalizer (Not Implemented)"></fnbutton>
                <fnbutton
                  id="playlist"
                  className={!playlistHidden ? 'active' : ''}
                  title="Show/Hide Playlist"
                  onClick={togglePlaylistVisible}
                ></fnbutton>
              </div>

              {/* Side elements */}
              <div id="tinyblue"></div>
              <div id="sidemetal">
                <div className="metaledge top"></div>
              </div>

              {/* Lower metal bar */}
              <div id="lowermetal">
                <div className="metaledge left"></div>
                <fnbutton id="colorswitch" title="Cycle Color Scheme"></fnbutton>
                <fnbutton id="skinmode" title="Switch to Skin Mode (Mini Player)" onClick={toggleFrameless}></fnbutton>
              </div>

              {/* Corner metal with resizer */}
              <div id="cornermetal">
                <div id="wmpresizer"></div>
              </div>

              {/* Main content area */}
              <wmpcontent className={playlistHidden ? 'playlisthidden' : ''}>
                {/* Playback container with visualizer */}
                <div id="playbackcontainer">
                  <span id="artistname"></span>
                  <span id="songname">{playlist[currentTrackIndex]?.name || ''}</span>

                  <canvas
                    id="visualizer"
                    ref={canvasRef}
                    style={{ display: 'block' }}
                  ></canvas>

                  <video
                    id="playbackHolder"
                    crossOrigin="anonymous"
                    style={{ display: 'none', width: '100%', height: '100%', objectFit: 'contain' }}
                  ></video>

                  <div id="viscontrols">
                    <fnbutton id="visgroups" title="Cycle Visualization Group (Not Implemented)">
                      <buttonbody></buttonbody>
                    </fnbutton>
                    <fnbutton id="prevvis" title="Previous Visualization" onClick={() => cycleVis(true)}>
                      <buttonbody></buttonbody>
                    </fnbutton>
                    <fnbutton id="nextvis" title="Next Visualization" onClick={() => cycleVis(false)}>
                      <buttonbody></buttonbody>
                    </fnbutton>
                    <span id="visName">{VISUALIZERS[selectedVis]}</span>
                    <fnbutton id="fullscreen" title="Toggle Fullscreen Visualization/Video">
                      <buttonbody></buttonbody>
                    </fnbutton>
                  </div>
                </div>

                {/* Playlist container */}
                <div id="playlistcontainer">
                  <ul>
                    {playlist.map((track, index) => (
                      <li
                        key={index}
                        data-index={index}
                        className={index === currentTrackIndex ? 'selected' : ''}
                        onClick={() => loadTrack(index)}
                      >
                        {track.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status bar */}
                <div id="statusbar">
                  <span id="info">{statusText}</span>
                </div>
              </wmpcontent>

              {/* Playback controls */}
              <playbackcontrols>
                <div id="rewind" title="Rewind (Previous Track)" onClick={prevTrack}></div>

                <div id="seekbar" onClick={handleSeek}>
                  <div id="seekbg"></div>
                  <div id="seekfill" style={{ width: `${progressPercent}%` }}></div>
                  <div id="seekpointer" style={{ left: `${progressPercent}%` }}></div>
                </div>

                <div id="ffwd" title="Fast Forward (Next Track)" onClick={nextTrack}></div>

                <fnbutton
                  id="playpause"
                  title="Play/Pause"
                  className={isPlaying ? 'playing' : ''}
                  onClick={togglePlay}
                >
                  <buttonbody></buttonbody>
                </fnbutton>

                <fnbutton id="stop" title="Stop" onClick={stop}>
                  <buttonbody></buttonbody>
                </fnbutton>

                <fnbutton id="prev" title="Previous Track" onClick={prevTrack}>
                  <buttonbody></buttonbody>
                </fnbutton>

                <fnbutton id="next" title="Next Track" onClick={nextTrack}>
                  <buttonbody></buttonbody>
                </fnbutton>

                <fnbutton
                  id="mute"
                  title="Mute/Unmute"
                  className={isMuted ? 'active' : ''}
                  onClick={toggleMute}
                >
                  <buttonbody></buttonbody>
                </fnbutton>

                <div id="volbar" onClick={handleVolume}>
                  <div id="volbg"></div>
                  <div id="volfill" style={{ width: `${volume * 100}%` }}></div>
                  <div id="volpointer" style={{ left: `${volume * 100}%` }}></div>
                </div>
              </playbackcontrols>

              {/* Progress/time display */}
              <div id="progress">{formatTime(currentTime)}</div>
            </wmpcolorifier>
          </wmpmainframe>

          {/* WMP9 brand logo */}
          <div id="wmp9brand"><img src="/ui/wmp/xplogo_small.png" alt="" /></div>
        </appcontentholder>
      </appcontents>
    </app>
  );
}

export default MediaPlayerClassic;
