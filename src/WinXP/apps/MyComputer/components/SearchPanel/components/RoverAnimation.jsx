import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import { useClippyAnimation } from '../hooks';

// Rover animation data will be loaded dynamically
const ROVER_DATA_URL = '/agents/Rover/data.json';

const RoverAnimation = forwardRef(({ onExitComplete, onShowComplete }, ref) => {
  const [animationData, setAnimationData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading, show, idle, hide

  // Load animation data
  useEffect(() => {
    fetch(ROVER_DATA_URL)
      .then(res => res.json())
      .then(data => {
        setAnimationData(data);
        setPhase('show');
      })
      .catch(err => {
        console.error('Failed to load Rover animation data:', err);
      });
  }, []);

  const {
    spritePosition,
    frameSize,
    play,
    hasAnimation,
  } = useClippyAnimation(animationData, 'Show');

  // Handle animation completion
  const handleAnimationComplete = useCallback((animName, state) => {
    if (state === 'EXITED') {
      if (animName === 'Show') {
        setPhase('idle');
        play('Idle');
        onShowComplete?.(); // Notify parent that Show animation finished
      } else if (animName === 'Hide') {
        onExitComplete?.();
      }
    }
  }, [play, onExitComplete, onShowComplete]);

  // Play Show animation when data is loaded
  useEffect(() => {
    if (animationData && phase === 'show' && hasAnimation('Show')) {
      play('Show', handleAnimationComplete);
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
        onExitComplete?.();
      }
    }
  }));

  // Don't render until data is loaded
  if (!animationData) {
    return <RoverArea />;
  }

  return (
    <RoverArea>
      <RoverSprite
        $frameWidth={frameSize[0]}
        $frameHeight={frameSize[1]}
        style={{
          backgroundPosition: `-${spritePosition[0]}px -${spritePosition[1]}px`,
        }}
      />
    </RoverArea>
  );
});

const RoverArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
  height: 100px;
  flex-shrink: 0;
`;

const RoverSprite = styled.div`
  width: ${props => props.$frameWidth || 80}px;
  height: ${props => props.$frameHeight || 80}px;
  background-image: url('/agents/Rover/map.png');
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

export default RoverAnimation;
