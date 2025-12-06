import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * React hook for ClippyJS-style sprite animations
 * Uses the same animation data format as clippyjs agent.js files
 */
export function useClippyAnimation(animationData, initialAnimation = 'Idle', soundsData = null) {
  const [currentAnimation, setCurrentAnimation] = useState(null); // Start null, set by play()
  const [frameIndex, setFrameIndex] = useState(0);
  const [spritePosition, setSpritePosition] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const [isExiting, setIsExiting] = useState(false);
  const [triggerStep, setTriggerStep] = useState(0); // Force step to run

  const timeoutRef = useRef(null);
  const callbackRef = useRef(null);
  const animationDataRef = useRef(animationData);
  const soundsRef = useRef({});

  // Update ref when data changes
  useEffect(() => {
    animationDataRef.current = animationData;
  }, [animationData]);

  // Load sounds
  useEffect(() => {
    if (soundsData) {
      const sounds = {};
      for (const [key, dataUri] of Object.entries(soundsData)) {
        sounds[key] = new Audio(dataUri);
      }
      soundsRef.current = sounds;
    }
  }, [soundsData]);

  // Play sound helper
  const playSound = useCallback((soundId) => {
    const audio = soundsRef.current[soundId];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Ignore autoplay errors
    }
  }, []);

  // Get frame size
  const frameSize = animationData?.framesize || [80, 80];

  // Get available animations
  const animations = useCallback(() => {
    if (!animationData?.animations) return [];
    return Object.keys(animationData.animations);
  }, [animationData]);

  // Check if animation exists
  const hasAnimation = useCallback((name) => {
    return !!animationData?.animations?.[name];
  }, [animationData]);

  // Get next frame index based on branching logic
  const getNextFrameIndex = useCallback((animation, currentFrame, currentIndex, exiting) => {
    if (!animation?.frames) return 0;

    const frames = animation.frames;

    // No current frame, start at 0
    if (!currentFrame) return 0;

    // If exiting and has exitBranch, use it
    if (exiting && currentFrame.exitBranch !== undefined) {
      return currentFrame.exitBranch;
    }

    // Handle branching
    if (currentFrame.branching) {
      const rnd = Math.random() * 100;
      let accumulated = 0;

      for (const branch of currentFrame.branching.branches) {
        accumulated += branch.weight;
        if (rnd <= accumulated) {
          return branch.frameIndex;
        }
      }
    }

    // Default: next frame
    return currentIndex + 1;
  }, []);

  // Animation step
  const step = useCallback(() => {
    const data = animationDataRef.current;
    if (!data?.animations || !isPlaying) return;

    const animation = data.animations[currentAnimation];
    if (!animation?.frames) return;

    const frames = animation.frames;
    const currentFrame = frames[frameIndex];

    if (!currentFrame) {
      // Animation complete
      if (callbackRef.current) {
        callbackRef.current(currentAnimation, 'EXITED');
        callbackRef.current = null;
      }
      return;
    }

    // Set sprite position
    if (currentFrame.images?.[0]) {
      setSpritePosition(currentFrame.images[0]);
    }

    // Play sound if frame has one
    if (currentFrame.sound) {
      playSound(currentFrame.sound);
    }

    // Calculate next frame
    const nextIndex = getNextFrameIndex(animation, currentFrame, frameIndex, isExiting);

    // Check if at last frame
    const atLastFrame = frameIndex >= frames.length - 1;

    // Schedule next step
    const duration = currentFrame.duration || 100;

    timeoutRef.current = setTimeout(() => {
      if (atLastFrame || nextIndex >= frames.length) {
        // Animation complete
        if (callbackRef.current) {
          callbackRef.current(currentAnimation, 'EXITED');
          callbackRef.current = null;
        }
        // For Idle, loop back
        if (currentAnimation === 'Idle' && !isExiting) {
          setFrameIndex(0);
          step();
        }
      } else {
        setFrameIndex(nextIndex);
      }
    }, duration);
  }, [currentAnimation, frameIndex, isPlaying, isExiting, getNextFrameIndex, playSound]);

  // Run animation step when frame changes or play is triggered
  useEffect(() => {
    if (isPlaying && currentAnimation) {
      step();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [frameIndex, isPlaying, step, triggerStep, currentAnimation]);

  // Play animation
  const play = useCallback((animationName, callback) => {
    if (!hasAnimation(animationName)) {
      console.warn(`Animation "${animationName}" not found`);
      return false;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    callbackRef.current = callback;
    setIsExiting(false);
    setCurrentAnimation(animationName);
    setFrameIndex(0);
    setIsPlaying(true);
    setTriggerStep(t => t + 1); // Force step to run

    return true;
  }, [hasAnimation]);

  // Exit current animation
  const exitAnimation = useCallback(() => {
    setIsExiting(true);
  }, []);

  // Pause animation
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Resume animation
  const resume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // Stop and reset
  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    callbackRef.current = null;
    setFrameIndex(0);
    setSpritePosition([0, 0]);
  }, []);

  // Get a random idle animation
  const getIdleAnimation = useCallback(() => {
    const anims = animations();
    const idleAnims = anims.filter(a => a.startsWith('Idle'));
    if (idleAnims.length === 0) return 'Idle';
    return idleAnims[Math.floor(Math.random() * idleAnims.length)];
  }, [animations]);

  // Play idle animation
  const playIdle = useCallback(() => {
    const idleAnim = getIdleAnimation();
    play(idleAnim);
  }, [getIdleAnimation, play]);

  return {
    // State
    currentAnimation,
    frameIndex,
    spritePosition,
    isPlaying,
    frameSize,

    // Methods
    play,
    pause,
    resume,
    stop,
    exitAnimation,
    playIdle,

    // Utils
    animations,
    hasAnimation,
  };
}

export default useClippyAnimation;
