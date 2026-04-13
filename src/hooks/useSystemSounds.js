import { useRef, useCallback, useEffect } from 'react';
import { withBaseUrl } from '../utils/baseUrl';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { DEFAULT_SOUND_SCHEME, SOUND_FILE_CATALOG, getEffectiveSoundSchemes } from '../utils/systemSounds';

const DIRECT_SOUND_KEYS = {
  notify: 'notify',
  minimize: 'minimize',
  restore: 'restore',
};

const SYSTEM_EVENTS = {
  login: 'logon',
  logoff: 'logoff',
  balloon: 'windowsBalloon',
  shutdown: 'exitWindows',
  error: 'criticalStop',
  exclamation: 'exclamation',
  ding: 'defaultBeep',
  start: 'menuCommand',
  recycle: 'recycleEmpty',
};

let audioCache = {};
let audioCacheRefCount = 0;
let audioUnlocked = false;

// Unlock audio on first user interaction (required by browsers)
const unlockAudio = () => {
  if (audioUnlocked) return;
  audioUnlocked = true;

  const audioElement = new Audio();
  audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  audioElement.volume = 0.01;
  audioElement.play().then(() => {
    audioElement.pause();
  }).catch(() => {});
};

if (typeof window !== 'undefined') {
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('mousedown', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
}

function useSystemSounds() {
  const soundsRef = useRef({});
  const { soundSettings } = useUserSettings();

  useEffect(() => {
    audioCacheRefCount++;
    Object.values(SOUND_FILE_CATALOG).forEach(({ key, path }) => {
      if (!audioCache[key]) {
        const audio = new Audio(withBaseUrl(path));
        audio.preload = 'auto';
        audio.load();
        audioCache[key] = audio;
      }
      soundsRef.current[key] = audioCache[key];
    });

    return () => {
      audioCacheRefCount--;
      soundsRef.current = {};
      // Only destroy audio when the last consumer unmounts
      if (audioCacheRefCount <= 0) {
        Object.keys(audioCache).forEach((key) => {
          const audio = audioCache[key];
          if (audio) {
            audio.pause();
            audio.src = '';
          }
          delete audioCache[key];
        });
        audioCacheRefCount = 0;
      }
    };
  }, []);

  const getSchemeSoundKey = useCallback((eventId) => {
    const schemes = getEffectiveSoundSchemes(soundSettings);
    const activeScheme = schemes[soundSettings?.activeSchemeName] || DEFAULT_SOUND_SCHEME;
    return activeScheme?.sounds?.[eventId] || '';
  }, [soundSettings]);

  const getResolvedSoundKey = useCallback((soundName) => {
    return DIRECT_SOUND_KEYS[soundName] || getSchemeSoundKey(SYSTEM_EVENTS[soundName]);
  }, [getSchemeSoundKey]);

  const playByFileKey = useCallback((fileKey, volume = 1) => {
    if (!fileKey) return;

    const sound = soundsRef.current[fileKey] || audioCache[fileKey];
    if (!sound) return;

    try {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = volume;

      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      const delay = isFirefox ? 20 : 0;

      setTimeout(() => {
        sound.play().catch(() => {});
      }, delay);
    } catch {
      // Silently fail if audio playback fails
    }
  }, []);

  const getSoundDurationMs = useCallback((soundName, fallbackMs = 2000) => {
    const fileKey = getResolvedSoundKey(soundName);
    const sound = soundsRef.current[fileKey] || audioCache[fileKey];

    if (!sound) {
      return Promise.resolve(fallbackMs);
    }

    if (Number.isFinite(sound.duration) && sound.duration > 0) {
      return Promise.resolve(Math.ceil(sound.duration * 1000));
    }

    return new Promise((resolve) => {
      let settled = false;
      let timeoutId = null;

      const finalize = (durationMs) => {
        if (settled) return;
        settled = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        sound.removeEventListener('loadedmetadata', handleDurationReady);
        sound.removeEventListener('canplaythrough', handleDurationReady);
        resolve(durationMs);
      };

      const handleDurationReady = () => {
        const durationMs = Number.isFinite(sound.duration) && sound.duration > 0
          ? Math.ceil(sound.duration * 1000)
          : fallbackMs;
        finalize(durationMs);
      };

      sound.addEventListener('loadedmetadata', handleDurationReady);
      sound.addEventListener('canplaythrough', handleDurationReady);
      timeoutId = window.setTimeout(() => finalize(fallbackMs), 250);

      if (sound.readyState >= 1) {
        handleDurationReady();
      }
    });
  }, [getResolvedSoundKey]);

  const playSound = useCallback((soundName, volume = 1) => {
    const fileKey = getResolvedSoundKey(soundName);
    playByFileKey(fileKey, volume);
  }, [getResolvedSoundKey, playByFileKey]);

  const playLogin = useCallback(() => {
    playSound('login');
  }, [playSound]);

  const playLogoff = useCallback(() => {
    playSound('logoff');
  }, [playSound]);

  const playBalloon = useCallback(() => {
    playSound('balloon');
  }, [playSound]);

  const prewarmBalloon = useCallback(() => {
    const fileKey = getSchemeSoundKey(SYSTEM_EVENTS.balloon);
    const sound = soundsRef.current[fileKey] || audioCache[fileKey];
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
  }, [getSchemeSoundKey]);

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
    playLogin,
    playLogoff,
    playBalloon,
    prewarmBalloon,
    playSound,
    playByFileKey,
    getSoundDurationMs,
    playShutdown,
    playError,
    playExclamation,
    playDing,
    playNotify,
    playRecycle,
    playMinimize,
    playRestore,
    playStart,
  };
}

export default useSystemSounds;
