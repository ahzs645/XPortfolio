import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';

// Rover sprite sheet is 2160x2160, each frame is 80x80
// Show animation - Rover appears/digs up from ground
const ROVER_SHOW_FRAMES = [
  [1440, 1440], [1520, 1440], [1600, 1440], [1680, 1440], [1760, 1440],
  [1840, 1440], [1920, 1440], [2000, 1440], [2080, 1440], [0, 1520],
  [80, 1520], [160, 1520], [240, 1520], [320, 1520], [400, 1520],
  [480, 1520], [560, 1520], [640, 1520], [720, 1520], [800, 1520],
  [0, 0], // End on idle pose
];

// Idle animation frames
const ROVER_IDLE_FRAMES = [
  [0, 0], [0, 0], [960, 800], [1040, 800], [0, 0],
  [1120, 800], [1200, 800], [1280, 800], [1360, 800],
];

// Hide/exit animation - Rover walks off (from clippyjs agent.js)
const ROVER_HIDE_FRAMES = [
  [0, 0], [1040, 0], [1120, 0], [1200, 0], [1280, 0], [1360, 0],
  [1440, 0], [1520, 0], [1600, 0], [1680, 0], [1760, 0], [1840, 0],
  [1920, 0], [2000, 0], [2080, 0], [0, 80], [80, 80], [160, 80],
  [240, 80], [320, 80], [400, 80], [480, 80], [560, 80], [640, 80],
  [720, 80], [800, 80], [880, 80], [960, 80], [1040, 80], [1120, 80],
  [1200, 80], [1280, 80],
];

const RoverAnimation = forwardRef(({ onExitComplete }, ref) => {
  const [animationState, setAnimationState] = useState('show');
  const [frameIndex, setFrameIndex] = useState(0);
  const [roverPosition, setRoverPosition] = useState(ROVER_SHOW_FRAMES[0]);

  // Expose triggerExit method to parent
  useImperativeHandle(ref, () => ({
    triggerExit: () => {
      setAnimationState('hide');
      setFrameIndex(0);
    }
  }));

  useEffect(() => {
    const duration = animationState === 'show' ? 100 : animationState === 'hide' ? 100 : 300;

    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = prev + 1;

        if (animationState === 'show') {
          if (next >= ROVER_SHOW_FRAMES.length) {
            setAnimationState('idle');
            setRoverPosition([0, 0]);
            return 0;
          }
          setRoverPosition(ROVER_SHOW_FRAMES[next]);
          return next;
        } else if (animationState === 'hide') {
          // Hide animation - Rover digs down and disappears
          if (next >= ROVER_HIDE_FRAMES.length) {
            onExitComplete?.();
            return prev;
          }
          setRoverPosition(ROVER_HIDE_FRAMES[next]);
          return next;
        } else {
          const loopIndex = next % ROVER_IDLE_FRAMES.length;
          setRoverPosition(ROVER_IDLE_FRAMES[loopIndex]);
          return loopIndex;
        }
      });
    }, duration);

    return () => clearInterval(interval);
  }, [animationState, onExitComplete]);

  return (
    <RoverArea>
      <RoverSprite
        style={{
          backgroundPosition: `-${roverPosition[0]}px -${roverPosition[1]}px`,
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
  width: 80px;
  height: 80px;
  background-image: url('/agents/Rover/map.png');
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

export default RoverAnimation;
