import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

const MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New', action: 'new' },
      { label: 'Open...', action: 'open' },
      { label: 'Save', action: 'save' },
      { type: 'separator' },
      { label: 'Exit', action: 'exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Delete Before Current Position', action: 'deleteBefore' },
      { label: 'Delete After Current Position', action: 'deleteAfter' },
    ],
  },
  {
    id: 'effects',
    label: 'Effects',
    items: [
      { label: 'Increase Volume (by 25%)', action: 'increaseVolume' },
      { label: 'Decrease Volume', action: 'decreaseVolume' },
      { type: 'separator' },
      { label: 'Increase Speed (by 100%)', action: 'increaseSpeed' },
      { label: 'Decrease Speed', action: 'decreaseSpeed' },
      { type: 'separator' },
      { label: 'Reverse', action: 'reverse' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

function SoundRecorder({ onClose }) {
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setHasInput] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);

  // Initialize audio context
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Draw waveform (matching original 98-master style)
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const middle = Math.floor(height / 2);
    const data = new Uint8Array(2048);

    if (isRecording && analyserRef.current) {
      // Get live audio data when recording
      analyserRef.current.getByteTimeDomainData(data);
    } else {
      // Flat line when not recording
      for (let i = 0; i < data.length; i++) {
        data[i] = 128;
      }
    }

    // Draw vertical bars for each x position
    ctx.fillStyle = 'lime';
    for (let x = 0; x < width; x++) {
      const loudness = data[Math.floor(data.length * x / width)] / 128.0 - 1;
      const h = Math.floor(loudness * height / 2);
      ctx.fillRect(x, middle - h, 1, h * 2 + 1);
    }

    animationRef.current = requestAnimationFrame(drawWaveform);
  }, [isRecording]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawWaveform);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawWaveform]);

  // Record
  const startRecording = useCallback(async () => {
    if (!audioContextRef.current) return;

    // Request microphone permission on first record click
    if (!mediaStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setHasInput(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Please allow microphone access to record audio.');
        return;
      }
    }

    await audioContextRef.current.resume();

    const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
    source.connect(analyserRef.current);

    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      try {
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setLength(audioBufferRef.current.duration);
        setPosition(0);
      } catch (err) {
        console.error('Error decoding audio:', err);
      }
    };

    mediaRecorder.start(100);
    setIsRecording(true);
    startTimeRef.current = audioContextRef.current.currentTime;

    const updatePosition = () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setPosition(elapsed);
        setLength(elapsed);
        requestAnimationFrame(updatePosition);
      }
    };
    updatePosition();
  }, []);

  // Stop
  const stopPlayback = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Ignore stop errors (already stopped/disposed)
      }
      sourceNodeRef.current = null;
    }
    setIsRecording(false);
    setIsPlaying(false);
  }, []);

  // Play
  const startPlayback = useCallback(() => {
    if (!audioBufferRef.current || !audioContextRef.current) return;

    audioContextRef.current.resume();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      setIsPlaying(false);
      setPosition(length);
    };

    const startOffset = position >= length ? 0 : position;
    if (position >= length) setPosition(0);

    source.start(0, startOffset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime - startOffset;
    setIsPlaying(true);

    const updatePosition = () => {
      if (sourceNodeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        if (elapsed < length) {
          setPosition(elapsed);
          requestAnimationFrame(updatePosition);
        }
      }
    };
    updatePosition();
  }, [position, length]);

  // Seek
  const seekToStart = useCallback(() => setPosition(0), []);
  const seekToEnd = useCallback(() => setPosition(length), [length]);

  const handleSliderChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setPosition(val);
    pausedAtRef.current = val;
  }, []);

  // File operations
  const fileNew = useCallback(() => {
    stopPlayback();
    audioBufferRef.current = null;
    audioChunksRef.current = [];
    setPosition(0);
    setLength(0);
  }, [stopPlayback]);

  const fileOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && audioContextRef.current) {
        const arrayBuffer = await file.arrayBuffer();
        try {
          audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
          setLength(audioBufferRef.current.duration);
          setPosition(0);
        } catch (err) {
          console.error('Error loading audio:', err);
        }
      }
    };
    input.click();
  }, []);

  const fileSave = useCallback(() => {
    if (audioChunksRef.current.length === 0) return;
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Menu handler
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'new': fileNew(); break;
      case 'open': fileOpen(); break;
      case 'save': fileSave(); break;
      case 'exit': onClose?.(); break;
      default: break;
    }
  }, [fileNew, fileOpen, fileSave, onClose]);

  const canPlay = length > 0 && !isPlaying && !isRecording;
  const canStop = isPlaying || isRecording;
  const canRecord = !isPlaying && !isRecording;

  return (
    <Container>
      <MenuBar menus={MENUS} onAction={handleMenuAction} windowActions={{ onClose }} />

      <Content>
        <DisplayRow>
          <InfoBox>
            <InfoLabel>Position:</InfoLabel>
            <InfoValue>{position.toFixed(2)} sec.</InfoValue>
          </InfoBox>

          <WaveformBox>
            <canvas ref={canvasRef} width={120} height={32} />
          </WaveformBox>

          <InfoBox>
            <InfoLabel>Length:</InfoLabel>
            <InfoValue>{length.toFixed(2)} sec.</InfoValue>
          </InfoBox>
        </DisplayRow>

        <SliderRow>
          <Slider
            type="range"
            min={0}
            max={length || 1}
            step={0.01}
            value={position}
            onChange={handleSliderChange}
            disabled={isPlaying || isRecording}
          />
        </SliderRow>

        <ControlsRow>
          <CtrlBtn onClick={seekToStart} disabled={!canPlay || position === 0} title="Seek to Start">
            <BtnIcon $index={0} $disabled={!canPlay || position === 0} />
          </CtrlBtn>
          <CtrlBtn onClick={seekToEnd} disabled={!canPlay || position >= length} title="Seek to End">
            <BtnIcon $index={1} $disabled={!canPlay || position >= length} />
          </CtrlBtn>
          <CtrlBtn onClick={startPlayback} disabled={!canPlay} title="Play">
            <BtnIcon $index={2} $disabled={!canPlay} />
          </CtrlBtn>
          <CtrlBtn onClick={stopPlayback} disabled={!canStop} title="Stop">
            <BtnIcon $index={3} $disabled={!canStop} />
          </CtrlBtn>
          <CtrlBtn onClick={startRecording} disabled={!canRecord} title="Record">
            <BtnIcon $index={4} $disabled={!canRecord} />
          </CtrlBtn>
        </ControlsRow>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
`;

const Content = styled.div`
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DisplayRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: stretch;
  min-height: 44px;
`;

const InfoBox = styled.div`
  background: #fff;
  border: 2px inset #808080;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 58px;
`;

const InfoLabel = styled.div`
  color: #000;
  font-size: 11px;
`;

const InfoValue = styled.div`
  color: #000;
  font-size: 11px;
  white-space: nowrap;
`;

const WaveformBox = styled.div`
  flex: 1;
  background: #000;
  border: 2px inset #808080;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;

  canvas {
    width: 100%;
    height: 100%;
  }
`;

const SliderRow = styled.div`
  padding: 4px 0;
`;

const Slider = styled.input`
  width: 100%;
  height: 20px;
  cursor: pointer;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
`;

const CtrlBtn = styled.button`
  width: 48px;
  min-width: 48px;
  min-height: unset;
  height: 24px;
  padding: 0;
  background: #c0c0c0;
  border: 2px outset #fff;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:active:not(:disabled) {
    border-style: inset;
  }

  &:disabled {
    cursor: default;
  }
`;

const BtnIcon = styled.div`
  width: 44px;
  height: 20px;
  background-image: url(${withBaseUrl('/icons/xp/sound-recorder-buttons.png')});
  background-repeat: no-repeat;
  background-position: ${props => -props.$index * 44}px 0;
  ${props => props.$disabled && 'opacity: 0.4; filter: grayscale(100%);'}
`;

export default SoundRecorder;
