import { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useClippyAnimation } from '../hooks';

const RoverAnimation = forwardRef(({ character, onExitComplete, onShowComplete, onHeightChange }, ref) => {
  const [animationData, setAnimationData] = useState(null);
  const [soundsData, setSoundsData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading, show, idle, hide

  // Use refs for callbacks to always have the latest value
  const onExitCompleteRef = useRef(onExitComplete);
  const onShowCompleteRef = useRef(onShowComplete);
  const onHeightChangeRef = useRef(onHeightChange);

  useEffect(() => {
    onExitCompleteRef.current = onExitComplete;
  }, [onExitComplete]);

  useEffect(() => {
    onShowCompleteRef.current = onShowComplete;
  }, [onShowComplete]);

  useEffect(() => {
    onHeightChangeRef.current = onHeightChange;
  }, [onHeightChange]);

  // Track if we need to play Show animation
  const needsShowAnimation = useRef(true);

  // Load animation data and sounds for the character
  useEffect(() => {
    if (!character) return;

    setAnimationData(null);
    setSoundsData(null);
    setPhase('loading');
    needsShowAnimation.current = true; // Reset for new character

    // Load animation data
    fetch(character.dataUrl)
      .then(res => res.json())
      .then(data => {
        setAnimationData(data);
        setPhase('show');
      })
      .catch(err => {
        console.error('Failed to load character animation data:', err);
      });

    // Load sounds
    fetch(character.soundsUrl)
      .then(res => res.json())
      .then(data => setSoundsData(data))
      .catch(() => {}); // Sounds are optional
  }, [character]);

  const {
    spritePosition,
    overlayPositions,
    frameSize,
    play,
    hasAnimation,
    animations,
  } = useClippyAnimation(animationData, soundsData);

  // Notify parent of height changes
  useEffect(() => {
    if (frameSize[1] > 0) {
      const characterAreaHeight = Math.max(frameSize[1] + 16, 100);
      onHeightChangeRef.current?.(characterAreaHeight);
    }
  }, [frameSize]);

  // Handle animation completion - use refs to always get latest callbacks
  const handleAnimationComplete = useCallback((animName, state) => {
    if (state === 'EXITED') {
      if (animName === 'Show') {
        setPhase('idle');
        play('Idle');
        onShowCompleteRef.current?.(); // Use ref for latest callback
      } else if (animName === 'Hide') {
        onExitCompleteRef.current?.(); // Use ref for latest callback
      }
    }
  }, [play]);

  // Play Show animation when data is loaded
  useEffect(() => {
    if (animationData && phase === 'show' && needsShowAnimation.current) {
      needsShowAnimation.current = false; // Only play once per character load
      if (hasAnimation('Show')) {
        play('Show', handleAnimationComplete);
      } else {
        // No Show animation, go straight to Idle
        setPhase('idle');
        if (hasAnimation('Idle')) {
          play('Idle', handleAnimationComplete);
        }
        onShowCompleteRef.current?.();
      }
    }
  }, [animationData, phase, hasAnimation, play, handleAnimationComplete]);

  // Play Idle animation after Show completes
  useEffect(() => {
    if (phase === 'idle' && hasAnimation('Idle')) {
      play('Idle', handleAnimationComplete);
    }
  }, [phase, hasAnimation, play, handleAnimationComplete]);

  // Random idle animations - periodically play random idle variants
  useEffect(() => {
    if (phase !== 'idle') return;

    const playRandomIdle = () => {
      const allAnims = animations();
      const idleAnims = allAnims.filter(a => a.startsWith('Idle'));
      if (idleAnims.length > 0) {
        const randomIdle = idleAnims[Math.floor(Math.random() * idleAnims.length)];
        play(randomIdle);
      }
    };

    // Play random idle animation every 5-10 seconds
    const interval = setInterval(() => {
      playRandomIdle();
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [phase, animations, play]);

  // Handle click on character - play ClickedOn animation or random animation
  const handleClick = useCallback(() => {
    if (phase !== 'idle') return;

    if (hasAnimation('ClickedOn')) {
      play('ClickedOn');
    } else {
      // Play a random non-idle animation
      const allAnims = animations();
      const nonIdleAnims = allAnims.filter(a => !a.startsWith('Idle') && a !== 'Show' && a !== 'Hide');
      if (nonIdleAnims.length > 0) {
        const randomAnim = nonIdleAnims[Math.floor(Math.random() * nonIdleAnims.length)];
        play(randomAnim);
      }
    }
  }, [phase, hasAnimation, play, animations]);

  // Expose triggerExit method to parent
  useImperativeHandle(ref, () => ({
    triggerExit: () => {
      if (hasAnimation('Hide')) {
        setPhase('hide');
        play('Hide', handleAnimationComplete);
      } else {
        onExitCompleteRef.current?.(); // Use ref for latest callback
      }
    }
  }), [hasAnimation, play, handleAnimationComplete]);

  // Don't render until data is loaded
  if (!animationData || !character) {
    return <CharacterArea $height={100} />;
  }

  // Calculate character area height based on frame size (min 100px)
  const characterAreaHeight = Math.max(frameSize[1] + 16, 100);

  // Render nested overlay layers
  const renderOverlays = (index = 0) => {
    if (index >= overlayPositions.length) return null;
    const pos = overlayPositions[index];
    return (
      <OverlaySprite
        $frameWidth={frameSize[0]}
        $frameHeight={frameSize[1]}
        style={{
          backgroundImage: `url(${character.spriteMap})`,
          backgroundPosition: `-${pos[0]}px -${pos[1]}px`,
        }}
      >
        {renderOverlays(index + 1)}
      </OverlaySprite>
    );
  };

  return (
    <CharacterArea $height={characterAreaHeight} onClick={handleClick}>
      <CharacterSprite
        $frameWidth={frameSize[0]}
        $frameHeight={frameSize[1]}
        style={{
          backgroundImage: `url(${character.spriteMap})`,
          backgroundPosition: `-${spritePosition[0]}px -${spritePosition[1]}px`,
          cursor: phase === 'idle' ? 'pointer' : 'default',
        }}
      >
        {renderOverlays()}
      </CharacterSprite>
    </CharacterArea>
  );
});

const CharacterArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
  height: ${props => props.$height || 100}px;
  flex-shrink: 0;
`;

const CharacterSprite = styled.div`
  position: relative;
  width: ${props => props.$frameWidth || 80}px;
  height: ${props => props.$frameHeight || 80}px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

const OverlaySprite = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => props.$frameWidth || 80}px;
  height: ${props => props.$frameHeight || 80}px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

export default RoverAnimation;
