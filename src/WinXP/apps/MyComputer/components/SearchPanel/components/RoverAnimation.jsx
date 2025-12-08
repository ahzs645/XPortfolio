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
    frameSize,
    play,
    hasAnimation,
  } = useClippyAnimation(animationData, 'Show', soundsData);

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

  return (
    <CharacterArea $height={characterAreaHeight}>
      <CharacterSprite
        $frameWidth={frameSize[0]}
        $frameHeight={frameSize[1]}
        style={{
          backgroundImage: `url(${character.spriteMap})`,
          backgroundPosition: `-${spritePosition[0]}px -${spritePosition[1]}px`,
        }}
      />
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
  width: ${props => props.$frameWidth || 80}px;
  height: ${props => props.$frameHeight || 80}px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

export default RoverAnimation;
