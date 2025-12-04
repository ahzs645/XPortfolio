import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import useSystemSounds from '../../hooks/useSystemSounds';

const SPRITE_SHEET_URL = '/clippy/map.png';
const FRAME_WIDTH = 124;
const FRAME_HEIGHT = 93;

const IDLE_ANIMATIONS = [
  'IdleFingerTap',
  'IdleHeadScratch',
  'IdleRopePile',
  'IdleSideToSide',
  'LookDown',
  'LookDownLeft',
  'LookDownRight',
  'LookLeft',
  'LookRight',
  'LookUp',
  'LookUpLeft',
  'LookUpRight',
];

const DEFAULT_CONFIG = {
  messageTagWeights: { normal: 95, unhinged: 5 },
  settings: {
    enableUnhingedMessages: true,
    idleAnimationInterval: 8000,
    messageDuration: 8000,
  },
};

function Clippy() {
  const [animationsData, setAnimationsData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('hidden'); // hidden, showing, idle
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showBalloon, setShowBalloon] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('0px 0px');

  const spriteRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const balloonTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isPlayingRef = useRef(false);

  const { playBalloon } = useSystemSounds();

  // Load animations data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [animRes, msgRes] = await Promise.all([
          fetch('/clippy/animations.json'),
          fetch('/clippy/messages.json'),
        ]);

        const animData = await animRes.json();
        const msgData = await msgRes.json();

        setAnimationsData(animData);
        setMessages(msgData.messages || []);
        setIsReady(true);

        // Show rest pose
        const restPose = animData.find((a) => a.Name === 'RestPose');
        if (restPose && restPose.Frames && restPose.Frames[0]) {
          const frame = restPose.Frames[0];
          const offsets = frame.ImagesOffsets || { Column: 0, Row: 0 };
          setBackgroundPosition(`${-offsets.Column * FRAME_WIDTH}px ${-offsets.Row * FRAME_HEIGHT}px`);
        }
      } catch (error) {
        console.error('Failed to load Clippy data:', error);
      }
    };

    loadData();
  }, []);

  const getAnimation = useCallback(
    (name) => {
      if (!animationsData) return null;
      return animationsData.find((anim) => anim.Name === name);
    },
    [animationsData]
  );

  const playAnimation = useCallback(
    (animationName, onComplete = null) => {
      const animation = getAnimation(animationName);
      if (!animation || !animation.Frames || animation.Frames.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      // Stop any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isPlayingRef.current = true;

      let currentFrameIndex = 0;
      let lastFrameTime = performance.now();

      const animate = () => {
        if (!isPlayingRef.current) return;

        const currentTime = performance.now();
        const currentFrame = animation.Frames[currentFrameIndex];

        if (!currentFrame) {
          isPlayingRef.current = false;
          if (onComplete) onComplete();
          return;
        }

        const frameDuration = currentFrame.Duration || 100;

        if (currentTime - lastFrameTime >= frameDuration) {
          currentFrameIndex++;

          if (currentFrameIndex >= animation.Frames.length) {
            isPlayingRef.current = false;
            if (onComplete) onComplete();
            return;
          }

          lastFrameTime = currentTime;
        }

        // Update sprite position
        const frame = animation.Frames[currentFrameIndex];
        if (frame) {
          const offsets = frame.ImagesOffsets || { Column: 0, Row: 0 };
          setBackgroundPosition(`${-offsets.Column * FRAME_WIDTH}px ${-offsets.Row * FRAME_HEIGHT}px`);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      // Show first frame immediately
      const firstFrame = animation.Frames[0];
      if (firstFrame) {
        const offsets = firstFrame.ImagesOffsets || { Column: 0, Row: 0 };
        setBackgroundPosition(`${-offsets.Column * FRAME_WIDTH}px ${-offsets.Row * FRAME_HEIGHT}px`);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [getAnimation]
  );

  const showRestPose = useCallback(() => {
    const restPose = getAnimation('RestPose');
    if (restPose && restPose.Frames && restPose.Frames[0]) {
      const frame = restPose.Frames[0];
      const offsets = frame.ImagesOffsets || { Column: 0, Row: 0 };
      setBackgroundPosition(`${-offsets.Column * FRAME_WIDTH}px ${-offsets.Row * FRAME_HEIGHT}px`);
    }
  }, [getAnimation]);

  const getWeightedRandomTag = useCallback(() => {
    const weights = config.messageTagWeights;
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [tag, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        if (tag === 'unhinged' && !config.settings.enableUnhingedMessages) {
          return 'normal';
        }
        return tag;
      }
    }
    return 'normal';
  }, [config]);

  const getRandomMessage = useCallback(
    (type = null) => {
      const selectedTag = getWeightedRandomTag();
      let filteredMessages = messages;

      if (type) {
        filteredMessages = filteredMessages.filter((m) => m.type === type);
      }

      const taggedMessages = filteredMessages.filter((m) => m.tag === selectedTag);
      const finalMessages = taggedMessages.length > 0 ? taggedMessages : filteredMessages;

      return finalMessages[Math.floor(Math.random() * finalMessages.length)];
    },
    [messages, getWeightedRandomTag]
  );

  const getRandomIdleAnimation = useCallback((currentAnimation = '') => {
    const available = IDLE_ANIMATIONS.filter((name) => name !== currentAnimation);
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const hideBalloon = useCallback(() => {
    setShowBalloon(false);
    setCurrentMessage(null);
    if (balloonTimeoutRef.current) {
      clearTimeout(balloonTimeoutRef.current);
      balloonTimeoutRef.current = null;
    }
  }, []);

  const showMessage = useCallback(
    (messageData) => {
      if (!messageData) return;

      const { text, animation } = messageData;

      if (animation) {
        playAnimation(animation, () => {
          if (status === 'idle') {
            showRestPose();
          }
        });
      }

      setCurrentMessage(text);
      setShowBalloon(true);

      // Play balloon notification sound
      playBalloon();

      if (balloonTimeoutRef.current) {
        clearTimeout(balloonTimeoutRef.current);
      }
      balloonTimeoutRef.current = setTimeout(() => {
        hideBalloon();
      }, config.settings.messageDuration);
    },
    [playAnimation, status, showRestPose, hideBalloon, config.settings.messageDuration, playBalloon]
  );

  const handleClick = useCallback(() => {
    const message = getRandomMessage();
    if (message) {
      showMessage(message);
    }
  }, [getRandomMessage, showMessage]);

  // Start idle animations
  useEffect(() => {
    if (status !== 'idle' || !isReady) return;

    const playRandomIdle = () => {
      if (status !== 'idle') return;

      const randomAnimationName = getRandomIdleAnimation();
      playAnimation(randomAnimationName, () => {
        showRestPose();
        idleTimeoutRef.current = setTimeout(playRandomIdle, config.settings.idleAnimationInterval);
      });
    };

    idleTimeoutRef.current = setTimeout(playRandomIdle, config.settings.idleAnimationInterval);

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [status, isReady, playAnimation, getRandomIdleAnimation, showRestPose, config.settings.idleAnimationInterval]);

  // Initial show animation
  useEffect(() => {
    if (!isReady || status !== 'hidden') return;

    const timer = setTimeout(() => {
      setStatus('showing');
      playAnimation('Show', () => {
        setStatus('idle');
        // Show welcome message
        setTimeout(() => {
          const welcomeMessage = getRandomMessage('welcome');
          if (welcomeMessage) {
            showMessage(welcomeMessage);
          }
        }, 500);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isReady, status, playAnimation, getRandomMessage, showMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (balloonTimeoutRef.current) {
        clearTimeout(balloonTimeoutRef.current);
      }
    };
  }, []);

  if (!isReady) return null;

  return (
    <Container onClick={handleClick}>
      {showBalloon && currentMessage && (
        <Balloon>
          <div className="balloon">
            <button
              className="balloon__close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                hideBalloon();
              }}
            />
            <div className="balloon__header">
              <img
                className="balloon__header__img"
                src="/icons/about.webp"
                alt="clippy"
              />
              <span className="balloon__header__text">Clippy the Assistant</span>
            </div>
            <p className="balloon__text">{currentMessage}</p>
          </div>
        </Balloon>
      )}
      <Sprite
        ref={spriteRef}
        style={{ backgroundPosition }}
      />
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  right: 20px;
  width: 124px;
  height: 93px;
  z-index: 50;
  cursor: pointer;
  user-select: none;
`;

const Sprite = styled.div`
  width: 124px;
  height: 93px;
  background-image: url(${SPRITE_SHEET_URL});
  background-repeat: no-repeat;
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  pointer-events: none;
  transition: transform 0.1s ease;

  ${Container}:hover & {
    transform: scale(1.1);
  }

  ${Container}:active & {
    transform: scale(0.95);
  }
`;

const Balloon = styled.div`
  position: absolute;
  right: 80px;
  bottom: 110px;
  z-index: 10;
  pointer-events: all;

  .balloon {
    width: 200px;
    background: #ffffcc;
    border: 1px solid #000;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      right: 20px;
      border-width: 10px 10px 0 10px;
      border-style: solid;
      border-color: #ffffcc transparent transparent transparent;
    }

    &::before {
      content: '';
      position: absolute;
      bottom: -12px;
      right: 19px;
      border-width: 11px 11px 0 11px;
      border-style: solid;
      border-color: #000 transparent transparent transparent;
    }
  }

  .balloon__close {
    all: unset;
    position: absolute;
    top: 4px;
    right: 4px;
    width: 14px;
    height: 14px;
    background-color: transparent;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    box-sizing: border-box;
    display: block;
    cursor: pointer;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 2px;
      height: 8px;
      background-color: #aaa;
    }

    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }

    &:hover {
      background-color: #dd0f0f;
      border-color: #fff;
      box-shadow: 1px 1px rgba(0, 0, 0, 0.1);

      &::before,
      &::after {
        background-color: #fff;
      }
    }

    &:active {
      background-color: #a00a0a;
    }
  }

  .balloon__header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding-right: 16px;
  }

  .balloon__header__img {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }

  .balloon__header__text {
    font-size: 11px;
    font-weight: bold;
    color: #000;
  }

  .balloon__text {
    font-size: 11px;
    color: #000;
    margin: 0;
    line-height: 1.4;
    word-wrap: break-word;
  }
`;

export default Clippy;
