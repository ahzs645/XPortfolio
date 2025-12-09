import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useAudioPlayer from './hooks/useAudioPlayer';
import {
  WMPContainer,
  MainFrame,
  NavPanel,
  NavItem,
  TopMetal,
  TopButton,
  ContentArea,
  PlaybackContainer,
  SongInfo,
  ArtistName,
  SongName,
  VisualizerCanvas,
  PlaylistContainer,
  PlaylistHeader,
  PlaylistItems,
  PlaylistItem,
  ControlsArea,
  SeekBarContainer,
  SeekBar,
  SeekFill,
  SeekPointer,
  TimeDisplay,
  ButtonsRow,
  PlayButton,
  StopButton,
  TrackButton,
  MuteButton,
  VolumeBar,
  VolumeFill,
  StatusBar,
  StatusText,
  VisControls,
  VisButton,
  VisName,
} from './styles/shared';

const VISUALIZERS = ['Bars', 'Scope', 'Cover Art'];

function MediaPlayerClassic({ onClose, isFocus, fileData, fileName }) {
  // State
  const [theme, setTheme] = useState('wmp8'); // 'wmp8' or 'wmp9'
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [selectedVis, setSelectedVis] = useState(0);
  const [statusText, setStatusText] = useState('Ready');

  // Refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Audio player hook
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isReady,
    progress,
    formattedCurrentTime,
    formattedDuration,
    loadSource,
    play,
    pause,
    togglePlay,
    stop,
    seekPercent,
    changeVolume,
    toggleMute,
    getAnalyser,
  } = useAudioPlayer();

  // Current track
  const currentTrack = useMemo(() => {
    return playlist[currentTrackIndex] || null;
  }, [playlist, currentTrackIndex]);

  // Convert base64 fileData to blob URL
  useEffect(() => {
    if (fileData) {
      try {
        const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          blobUrlRef.current = URL.createObjectURL(blob);

          // Add to playlist
          const newTrack = {
            name: fileName || 'Unknown Track',
            src: blobUrlRef.current,
          };
          setPlaylist([newTrack]);
          setCurrentTrackIndex(0);
          loadSource(blobUrlRef.current);
          setStatusText(`Loaded: ${fileName || 'Unknown Track'}`);
        }
      } catch (e) {
        console.error('Failed to create blob URL:', e);
        setStatusText('Error loading file');
      }
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [fileData, fileName, loadSource]);

  // Auto-play when track loaded
  useEffect(() => {
    if (isReady && currentTrack) {
      play();
      setStatusText(`Playing: ${currentTrack.name}`);
    }
  }, [isReady, currentTrack, play]);

  // Update status when playing state changes
  useEffect(() => {
    if (currentTrack) {
      if (isPlaying) {
        setStatusText(`Playing: ${currentTrack.name}`);
      } else {
        setStatusText(`Paused: ${currentTrack.name}`);
      }
    }
  }, [isPlaying, currentTrack]);

  // Visualizer rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const analyser = getAnalyser();

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      if (!analyser || !isPlaying || VISUALIZERS[selectedVis] === 'Cover Art') {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (VISUALIZERS[selectedVis] === 'Bars') {
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        const barColor = getComputedStyle(canvas).getPropertyValue('--visualizer-bars') || '#00f900';
        const peakColor = getComputedStyle(canvas).getPropertyValue('--visualizer-peaks') || '#e6e9e8';

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          ctx.fillStyle = barColor;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          // Peak indicator
          ctx.fillStyle = peakColor;
          ctx.fillRect(x, height - barHeight - 2, barWidth - 1, 2);

          x += barWidth;
        }
      } else if (VISUALIZERS[selectedVis] === 'Scope') {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--visualizer-bars') || '#00f900';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, selectedVis, getAnalyser]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [playlistVisible, navCollapsed]);

  // Seek bar click handler
  const handleSeekClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    seekPercent(percent);
  }, [seekPercent]);

  // Volume bar click handler
  const handleVolumeClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = x / rect.width;
    changeVolume(newVolume);
  }, [changeVolume]);

  // Previous track
  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      seekPercent(0);
    } else if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      loadSource(playlist[currentTrackIndex - 1].src);
    }
  }, [currentTime, currentTrackIndex, playlist, seekPercent, loadSource]);

  // Next track
  const handleNext = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      loadSource(playlist[currentTrackIndex + 1].src);
    }
  }, [currentTrackIndex, playlist, loadSource]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'wmp8' ? 'wmp9' : 'wmp8');
  }, []);

  // Visualizer navigation
  const prevVis = useCallback(() => {
    setSelectedVis(prev => prev === 0 ? VISUALIZERS.length - 1 : prev - 1);
  }, []);

  const nextVis = useCallback(() => {
    setSelectedVis(prev => prev === VISUALIZERS.length - 1 ? 0 : prev + 1);
  }, []);

  // Select track from playlist
  const selectTrack = useCallback((index) => {
    setCurrentTrackIndex(index);
    loadSource(playlist[index].src);
  }, [playlist, loadSource]);

  return (
    <WMPContainer $theme={theme}>
      <MainFrame $navCollapsed={navCollapsed}>
        {/* Navigation Panel */}
        <NavPanel $collapsed={navCollapsed} $theme={theme}>
          <NavItem $theme={theme} className="selected">Now Playing</NavItem>
          <NavItem $theme={theme}>Media Guide</NavItem>
          <NavItem $theme={theme}>Copy from CD</NavItem>
          <NavItem $theme={theme}>Media Library</NavItem>
          <NavItem $theme={theme}>Radio Tuner</NavItem>
          <NavItem $theme={theme}>Copy to CD or Device</NavItem>
          <NavItem $theme={theme}>Skin Chooser</NavItem>
        </NavPanel>

        {/* Top Metal Bar */}
        <TopMetal $theme={theme}>
          <TopButton
            $theme={theme}
            $iconOffset={0}
            onClick={() => setNavCollapsed(!navCollapsed)}
            title="Toggle Navigation"
          />
          <TopButton
            $theme={theme}
            $iconOffset={-17}
            onClick={toggleTheme}
            title="Switch Theme"
          />
          <div style={{ flex: 1 }} />
          <TopButton
            $theme={theme}
            $iconOffset={-34}
            className={playlistVisible ? 'active' : ''}
            onClick={() => setPlaylistVisible(!playlistVisible)}
            title="Toggle Playlist"
          />
        </TopMetal>

        {/* Content Area */}
        <ContentArea $playlistVisible={playlistVisible}>
          <PlaybackContainer>
            <SongInfo>
              <ArtistName>Windows Media Player</ArtistName>
              <SongName>{currentTrack?.name || 'No track loaded'}</SongName>
            </SongInfo>

            <VisualizerCanvas ref={canvasRef} />

            <VisControls>
              <VisButton $position={0} onClick={prevVis} title="Previous Visualization" />
              <VisButton $position={-18} onClick={nextVis} title="Next Visualization" />
              <VisName>{VISUALIZERS[selectedVis]}</VisName>
              <VisButton $position={-54} title="Fullscreen" />
            </VisControls>
          </PlaybackContainer>

          <PlaylistContainer $visible={playlistVisible} $theme={theme}>
            {theme === 'wmp9' && <PlaylistHeader />}
            <PlaylistItems>
              {playlist.map((track, index) => (
                <PlaylistItem
                  key={index}
                  $selected={index === currentTrackIndex}
                  onClick={() => selectTrack(index)}
                >
                  {track.name}
                </PlaylistItem>
              ))}
              {playlist.length === 0 && (
                <PlaylistItem>No tracks in playlist</PlaylistItem>
              )}
            </PlaylistItems>
          </PlaylistContainer>

          <StatusBar $theme={theme}>
            <StatusText>{statusText}</StatusText>
          </StatusBar>
        </ContentArea>

        {/* Controls Area */}
        <ControlsArea>
          <SeekBarContainer>
            <SeekBar $theme={theme} onClick={handleSeekClick}>
              <SeekFill $theme={theme} $progress={progress} />
              <SeekPointer $progress={progress} />
            </SeekBar>
            <TimeDisplay>
              {formattedCurrentTime} / {formattedDuration}
            </TimeDisplay>
          </SeekBarContainer>

          <ButtonsRow>
            <PlayButton $playing={isPlaying} onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'} />
            <StopButton onClick={stop} title="Stop" />
            <TrackButton onClick={handlePrev} title="Previous" />
            <TrackButton $next onClick={handleNext} title="Next" />
            <MuteButton $muted={isMuted} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'} />
            <VolumeBar onClick={handleVolumeClick} title="Volume">
              <VolumeFill $volume={volume * 100} />
            </VolumeBar>
          </ButtonsRow>
        </ControlsArea>
      </MainFrame>
    </WMPContainer>
  );
}

export default MediaPlayerClassic;
