import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BalloonTitle } from '../styles';

// Idle animation frames for Rover
const ROVER_IDLE_FRAMES = [
  [0, 0], [0, 0], [960, 800], [1040, 800], [0, 0],
  [1120, 800], [1200, 800], [1280, 800], [1360, 800],
];

const CHARACTERS = [
  {
    id: 'rover',
    name: 'Rover',
    spriteMap: '/agents/Rover/map.png',
    idleFrames: ROVER_IDLE_FRAMES,
    description: 'Rover will help you sniff out what you\'re looking for.',
  },
  // Additional characters can be added when their assets are available
];

function CharacterSelectView({ selectedCharacter, setSelectedCharacter }) {
  const currentIndex = CHARACTERS.findIndex(c => c.id === selectedCharacter);
  const character = CHARACTERS[currentIndex] || CHARACTERS[0];

  const [frameIndex, setFrameIndex] = useState(0);
  const [spritePos, setSpritePos] = useState(character.idleFrames[0]);

  // Animation loop
  useEffect(() => {
    const frames = character.idleFrames;
    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = (prev + 1) % frames.length;
        setSpritePos(frames[next]);
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [character]);

  const handlePrev = () => {
    const newIndex = currentIndex <= 0 ? CHARACTERS.length - 1 : currentIndex - 1;
    setSelectedCharacter(CHARACTERS[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex >= CHARACTERS.length - 1 ? 0 : currentIndex + 1;
    setSelectedCharacter(CHARACTERS[newIndex].id);
  };

  return (
    <>
      <BalloonTitle>Which character would you like to use?</BalloonTitle>

      <CharacterBox>
        <CharacterTab>{character.name}</CharacterTab>
        <CharacterPreview>
          <CharacterSprite
            style={{
              backgroundImage: `url(${character.spriteMap})`,
              backgroundPosition: `-${spritePos[0]}px -${spritePos[1]}px`,
            }}
          />
        </CharacterPreview>
        <NavButtonRow>
          <NavButton onClick={handlePrev}>Back</NavButton>
          <NavButton onClick={handleNext}>Next</NavButton>
        </NavButtonRow>
        <CharacterDescription>{character.description}</CharacterDescription>
      </CharacterBox>
    </>
  );
}

const CharacterBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #7f9db9;
  background: #fff;
  margin-bottom: 8px;
  padding: 8px;
`;

const CharacterTab = styled.div`
  background: linear-gradient(180deg, #4a7eba 0%, #3568a8 50%, #2d5a99 100%);
  padding: 4px 24px;
  font-size: 12px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-weight: bold;
  color: #fff;
  text-align: center;
  letter-spacing: 1px;
  align-self: center;
  min-width: 120px;
`;

const CharacterPreview = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  min-height: 80px;
  background: #fff;
`;

const CharacterSprite = styled.div`
  width: 80px;
  height: 80px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

const NavButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 8px;
`;

const NavButton = styled.button`
  min-width: 60px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  background: linear-gradient(180deg, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #d8d8d8 100%);
  border: 1px solid #7f9db9;
  border-radius: 3px;
  cursor: pointer;
  color: #000;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #e5f4fc 50%, #c4e5f6 51%, #d8e8f0 100%);
  }

  &:active {
    background: linear-gradient(180deg, #c4e5f6 0%, #98d1ef 50%, #68b8e3 51%, #8ccded 100%);
  }
`;

const CharacterDescription = styled.div`
  padding: 8px 12px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  border-top: 1px solid #e0e0e0;
  line-height: 1.4;
`;

export default CharacterSelectView;
