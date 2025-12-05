import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Balloon from '../../components/Balloon';
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

  const handleBalloonClose = useCallback((e) => {
    e?.stopPropagation?.();
    hideBalloon();
  }, [hideBalloon]);

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
        <BalloonWrapper>
          <Balloon
            title="Clippy the Assistant"
            icon="/icons/about.webp"
            iconAlt="clippy"
            width={220}
            arrowOffset={20}
            onClose={handleBalloonClose}
          >
            <p className="balloon__text">{currentMessage}</p>
          </Balloon>
        </BalloonWrapper>
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

const BalloonWrapper = styled.div`
  position: absolute;
  right: 80px;
  bottom: 110px;
  z-index: 10;
  pointer-events: all;
`;

export default Clippy;
