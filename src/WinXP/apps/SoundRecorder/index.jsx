import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';

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

function SoundRecorder({ onClose, isFocus }) {
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInput, setHasInput] = useState(false);

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
      analyserRef.current.fftSize = 256;
    }

    // Request microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaStreamRef.current = stream;
        setHasInput(true);
      })
      .catch(err => console.log('No mic access:', err));

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw center line
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw position indicator
    if (length > 0) {
      const posX = (position / length) * width;
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(posX, 0);
      ctx.lineTo(posX, height);
      ctx.stroke();
    }

    // Draw live waveform when recording
    if (isRecording && analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
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
      ctx.stroke();
    }

    animationRef.current = requestAnimationFrame(drawWaveform);
  }, [isRecording, position, length]);

  useEffect(() => {
    drawWaveform();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawWaveform]);

  // Record
  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current || !audioContextRef.current) return;

    audioContextRef.current.resume();

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
      } catch (e) {}
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
  const canRecord = hasInput && !isPlaying && !isRecording;

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
  width: 40px;
  height: 24px;
  padding: 2px;
  background: #c0c0c0;
  border: 2px outset #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active:not(:disabled) {
    border-style: inset;
  }

  &:disabled {
    cursor: default;
  }
`;

const BtnIcon = styled.div`
  width: 32px;
  height: 16px;
  background-image: url('/icons/xp/sound-recorder-buttons.png');
  background-repeat: no-repeat;
  background-position: ${props => -props.$index * 44}px 0;
  background-size: auto 20px;
  ${props => props.$disabled && 'opacity: 0.4; filter: grayscale(100%);'}
`;

export default SoundRecorder;
