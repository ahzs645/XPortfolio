/**
 * Global Audio Manager
 * Controls master volume for ALL audio in the application
 */

// Master volume state
let masterVolume = (() => {
  try {
    const saved = localStorage.getItem('xp-volume');
    return saved !== null ? parseInt(saved, 10) / 100 : 0.5;
  } catch {
    return 0.5;
  }
})();

let masterMuted = (() => {
  try {
    const saved = localStorage.getItem('xp-muted');
    return saved !== null ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
})();

// Track all audio elements
const audioElements = new Set();

// Store original volumes for each audio element
const originalVolumes = new WeakMap();

/**
 * Apply master volume to an audio/video element
 */
function applyVolume(element) {
  if (!originalVolumes.has(element)) {
    originalVolumes.set(element, element.volume);
  }
  const originalVol = originalVolumes.get(element);
  element.volume = masterMuted ? 0 : originalVol * masterVolume;
}

/**
 * Update all tracked audio elements with current master volume
 */
function updateAllVolumes() {
  audioElements.forEach(element => {
    if (element) {
      applyVolume(element);
    }
  });
}

/**
 * Track a new audio element
 */
function trackAudio(element) {
  audioElements.add(element);
  applyVolume(element);

  // Clean up when audio is removed or errors
  element.addEventListener('error', () => audioElements.delete(element), { once: true });
}

// Override Audio constructor to track all new Audio instances
const OriginalAudio = window.Audio;
window.Audio = function(src) {
  const audio = new OriginalAudio(src);
  trackAudio(audio);
  return audio;
};
window.Audio.prototype = OriginalAudio.prototype;

// Patch HTMLAudioElement and HTMLVideoElement play methods
const originalAudioPlay = HTMLAudioElement.prototype.play;
HTMLAudioElement.prototype.play = function() {
  if (!audioElements.has(this)) {
    trackAudio(this);
  } else {
    applyVolume(this);
  }
  return originalAudioPlay.call(this);
};

const originalVideoPlay = HTMLVideoElement.prototype.play;
HTMLVideoElement.prototype.play = function() {
  if (!audioElements.has(this)) {
    trackAudio(this);
  } else {
    applyVolume(this);
  }
  return originalVideoPlay.call(this);
};

// Intercept volume property changes to maintain original volume reference
const audioVolumeDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
  get: function() {
    return audioVolumeDescriptor.get.call(this);
  },
  set: function(value) {
    // Store as original volume
    originalVolumes.set(this, value);
    // Apply with master volume
    const effectiveVolume = masterMuted ? 0 : value * masterVolume;
    audioVolumeDescriptor.set.call(this, effectiveVolume);
  }
});

// Listen for volume changes from the taskbar
if (typeof window !== 'undefined') {
  window.addEventListener('xp:volume-change', (e) => {
    const { volume, muted } = e.detail;
    masterVolume = volume / 100;
    masterMuted = muted;
    updateAllVolumes();
  });

  // Also observe DOM for audio/video elements added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') {
          trackAudio(node);
        }
        // Check children too (e.g., iframes content)
        if (node.querySelectorAll) {
          node.querySelectorAll('audio, video').forEach(trackAudio);
        }
      });
    });
  });

  // Start observing once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      // Track existing elements
      document.querySelectorAll('audio, video').forEach(trackAudio);
    });
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('audio, video').forEach(trackAudio);
  }
}

/**
 * Patch an iframe's audio system (same-origin only)
 */
function patchIframe(iframe) {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    // Check if we can access (same-origin check)
    // This will throw if cross-origin
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Patch iframe's Audio constructor
    const IframeOriginalAudio = iframeWindow.Audio;
    if (IframeOriginalAudio && !iframeWindow._audioPatched) {
      iframeWindow._audioPatched = true;

      iframeWindow.Audio = function(src) {
        const audio = new IframeOriginalAudio(src);
        trackAudio(audio);
        return audio;
      };
      iframeWindow.Audio.prototype = IframeOriginalAudio.prototype;

      // Patch iframe's HTMLMediaElement play methods
      const iframeAudioProto = iframeWindow.HTMLAudioElement?.prototype;
      const iframeVideoProto = iframeWindow.HTMLVideoElement?.prototype;

      if (iframeAudioProto && !iframeAudioProto._playPatched) {
        iframeAudioProto._playPatched = true;
        const origPlay = iframeAudioProto.play;
        iframeAudioProto.play = function() {
          if (!audioElements.has(this)) {
            trackAudio(this);
          } else {
            applyVolume(this);
          }
          return origPlay.call(this);
        };
      }

      if (iframeVideoProto && !iframeVideoProto._playPatched) {
        iframeVideoProto._playPatched = true;
        const origPlay = iframeVideoProto.play;
        iframeVideoProto.play = function() {
          if (!audioElements.has(this)) {
            trackAudio(this);
          } else {
            applyVolume(this);
          }
          return origPlay.call(this);
        };
      }

      // Track existing audio/video in iframe
      iframeDoc.querySelectorAll('audio, video').forEach(trackAudio);
    }
  } catch {
    // Cross-origin iframe - can't access, try messaging instead
    try {
      iframe.contentWindow?.postMessage({
        type: 'xp:volume-change',
        volume: masterVolume * 100,
        muted: masterMuted
      }, '*');
    } catch {
      // Silently fail
    }
  }
}

/**
 * Broadcast volume to all iframes (for cross-origin that listen)
 */
function broadcastVolumeToIframes() {
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      iframe.contentWindow?.postMessage({
        type: 'xp:volume-change',
        volume: masterVolume * 100,
        muted: masterMuted
      }, '*');
    } catch {
      // Silently fail
    }
  });
}

// Observe for iframes
if (typeof window !== 'undefined') {
  const iframeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IFRAME') {
          // Wait for iframe to load
          node.addEventListener('load', () => patchIframe(node), { once: true });
          // Also try immediately in case already loaded
          patchIframe(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe.addEventListener('load', () => patchIframe(iframe), { once: true });
            patchIframe(iframe);
          });
        }
      });
    });
  });

  const initIframeObserver = () => {
    iframeObserver.observe(document.body, { childList: true, subtree: true });
    // Patch existing iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.addEventListener('load', () => patchIframe(iframe), { once: true });
      patchIframe(iframe);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIframeObserver);
  } else {
    initIframeObserver();
  }

  // Also broadcast on volume change
  window.addEventListener('xp:volume-change', broadcastVolumeToIframes);
}

// Export for direct usage if needed
export const audioManager = {
  getVolume: () => masterVolume * 100,
  getMuted: () => masterMuted,
  setVolume: (vol) => {
    masterVolume = vol / 100;
    localStorage.setItem('xp-volume', String(vol));
    updateAllVolumes();
    broadcastVolumeToIframes();
  },
  setMuted: (muted) => {
    masterMuted = muted;
    localStorage.setItem('xp-muted', JSON.stringify(muted));
    updateAllVolumes();
    broadcastVolumeToIframes();
  },
};

export default audioManager;
