import React, { useState, useEffect } from 'react';
import { RoverArea, RoverSprite } from '../styles';

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

function RoverAnimation() {
  const [animationState, setAnimationState] = useState('show');
  const [frameIndex, setFrameIndex] = useState(0);
  const [roverPosition, setRoverPosition] = useState(ROVER_SHOW_FRAMES[0]);

  useEffect(() => {
    const duration = animationState === 'show' ? 100 : 300;

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
        } else {
          const loopIndex = next % ROVER_IDLE_FRAMES.length;
          setRoverPosition(ROVER_IDLE_FRAMES[loopIndex]);
          return loopIndex;
        }
      });
    }, duration);

    return () => clearInterval(interval);
  }, [animationState]);

  return (
    <RoverArea>
      <RoverSprite
        style={{
          backgroundPosition: `-${roverPosition[0]}px -${roverPosition[1]}px`,
        }}
      />
    </RoverArea>
  );
}

export default RoverAnimation;
