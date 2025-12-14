import { useRef, useCallback, useEffect } from 'react';
import { withBaseUrl } from '../utils/baseUrl';

const SOUNDS = {
  // Existing sounds
  login: withBaseUrl('/sounds/login.wav'),
  logoff: withBaseUrl('/sounds/logoff.wav'),
  balloon: withBaseUrl('/sounds/balloon.wav'),
  // New sounds - always enabled
  shutdown: withBaseUrl('/sounds/shutdown.wav'),
  error: withBaseUrl('/sounds/error.wav'),
  exclamation: withBaseUrl('/sounds/exclamation.wav'),
  ding: withBaseUrl('/sounds/ding.wav'),
  notify: withBaseUrl('/sounds/notify.wav'),
  recycle: withBaseUrl('/sounds/recycle.wav'),
  // New sounds - optional (respect windowSoundsEnabled setting)
  minimize: withBaseUrl('/sounds/minimize.wav'),
  restore: withBaseUrl('/sounds/restore.wav'),
  start: withBaseUrl('/sounds/start.wav'),
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
    } catch {
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

  // New sound functions - always enabled
  const playShutdown = useCallback(() => {
    playSound('shutdown');
  }, [playSound]);

  const playError = useCallback(() => {
    playSound('error');
  }, [playSound]);

  const playExclamation = useCallback(() => {
    playSound('exclamation');
  }, [playSound]);

  const playDing = useCallback(() => {
    playSound('ding');
  }, [playSound]);

  const playNotify = useCallback(() => {
    playSound('notify');
  }, [playSound]);

  const playRecycle = useCallback(() => {
    playSound('recycle');
  }, [playSound]);

  // Optional sound functions - callers should check windowSoundsEnabled setting
  const playMinimize = useCallback(() => {
    playSound('minimize');
  }, [playSound]);

  const playRestore = useCallback(() => {
    playSound('restore');
  }, [playSound]);

  const playStart = useCallback(() => {
    playSound('start');
  }, [playSound]);

  return {
    // Existing
    playLogin,
    playLogoff,
    playBalloon,
    prewarmBalloon,
    playSound,
    // New - always enabled
    playShutdown,
    playError,
    playExclamation,
    playDing,
    playNotify,
    playRecycle,
    // New - optional (caller should check windowSoundsEnabled)
    playMinimize,
    playRestore,
    playStart,
  };
}

export default useSystemSounds;
