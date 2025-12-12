import { useRef, useCallback, useEffect } from 'react';
import { withBaseUrl } from '../utils/baseUrl';

const SOUNDS = {
  login: withBaseUrl('/sounds/login.wav'),
  logoff: withBaseUrl('/sounds/logoff.wav'),
  balloon: withBaseUrl('/sounds/balloon.wav'),
};

let audioCache = {};
let audioUnlocked = false;

// Unlock audio on first user interaction (required by browsers)
const unlockAudio = () => {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Play a tiny silent sound to unlock audio context
  const audioElement = new Audio();
  audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  audioElement.volume = 0.01;
  audioElement.play().then(() => {
    audioElement.pause();
  }).catch(() => {});
};

// Set up unlock listeners once
if (typeof window !== 'undefined') {
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('mousedown', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
}

function useSystemSounds() {
  const soundsRef = useRef({});

  // Preload all sounds on mount
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, src]) => {
      if (!audioCache[key]) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.load();
        audioCache[key] = audio;
      }
      soundsRef.current[key] = audioCache[key];
    });
  }, []);

  // Volume is now handled globally by audioManager.js
  const playSound = useCallback((soundName, volume = 1) => {
    const sound = soundsRef.current[soundName] || audioCache[soundName];
    if (!sound) return;

    try {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = volume; // audioManager will apply master volume

      // Firefox needs a small delay
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      const delay = isFirefox ? 20 : 0;

      setTimeout(() => {
        sound.play().catch(() => {});
      }, delay);
    } catch (err) {
      // Silently fail if audio playback fails
    }
  }, []);

  const playLogin = useCallback(() => {
    playSound('login');
  }, [playSound]);

  const playLogoff = useCallback(() => {
    playSound('logoff');
  }, [playSound]);

  const playBalloon = useCallback(() => {
    playSound('balloon');
  }, [playSound]);

  // Prewarm balloon sound (silent play to prevent delay on first use)
  const prewarmBalloon = useCallback(() => {
    const sound = soundsRef.current.balloon || audioCache.balloon;
    if (!sound) return;

    sound.volume = 0.01;
    sound.currentTime = 0;
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = 1;
    }).catch(() => {
      sound.volume = 1;
    });
  }, []);

  return {
    playLogin,
    playLogoff,
    playBalloon,
    prewarmBalloon,
    playSound,
  };
}

export default useSystemSounds;
