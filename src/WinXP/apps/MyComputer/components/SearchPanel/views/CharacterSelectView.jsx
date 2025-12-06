import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BalloonTitle } from '../styles';
import { useClippyAnimation } from '../hooks';

// Export CHARACTERS so it can be used by other components
export const CHARACTERS = [
  {
    id: 'rover',
    name: 'Rover',
    spriteMap: '/agents/Rover/map.png',
    dataUrl: '/agents/Rover/data.json',
    soundsUrl: '/agents/Rover/sounds.json',
    description: 'Rover will help you sniff out what you\'re looking for.',
  },
  {
    id: 'clippy',
    name: 'Clippy',
    spriteMap: '/agents/Clippy/map.png',
    dataUrl: '/agents/Clippy/data.json',
    soundsUrl: '/agents/Clippy/sounds.json',
    description: 'Hi! I\'m Clippy, your office assistant. Would you like help?',
  },
  {
    id: 'merlin',
    name: 'Merlin',
    spriteMap: '/agents/Merlin/map.png',
    dataUrl: '/agents/Merlin/data.json',
    soundsUrl: '/agents/Merlin/sounds.json',
    description: 'Merlin will conjure up answers to your questions.',
  },
  {
    id: 'genie',
    name: 'Genie',
    spriteMap: '/agents/Genie/map.png',
    dataUrl: '/agents/Genie/data.json',
    soundsUrl: '/agents/Genie/sounds.json',
    description: 'Your wish is my command!',
  },
  {
    id: 'genius',
    name: 'Genius',
    spriteMap: '/agents/Genius/map.png',
    dataUrl: '/agents/Genius/data.json',
    soundsUrl: '/agents/Genius/sounds.json',
    description: 'Genius will help you find brilliant solutions.',
  },
  {
    id: 'bonzi',
    name: 'Bonzi',
    spriteMap: '/agents/Bonzi/map.png',
    dataUrl: '/agents/Bonzi/data.json',
    soundsUrl: '/agents/Bonzi/sounds.json',
    description: 'Bonzi is here to be your friendly guide.',
  },
  {
    id: 'peedy',
    name: 'Peedy',
    spriteMap: '/agents/Peedy/map.png',
    dataUrl: '/agents/Peedy/data.json',
    soundsUrl: '/agents/Peedy/sounds.json',
    description: 'Peedy the parrot will help you find what you need.',
  },
  {
    id: 'rocky',
    name: 'Rocky',
    spriteMap: '/agents/Rocky/map.png',
    dataUrl: '/agents/Rocky/data.json',
    soundsUrl: '/agents/Rocky/sounds.json',
    description: 'Rocky is ready to help you on your adventure.',
  },
  {
    id: 'links',
    name: 'Links',
    spriteMap: '/agents/Links/map.png',
    dataUrl: '/agents/Links/data.json',
    soundsUrl: '/agents/Links/sounds.json',
    description: 'Links the cat will help you prowl for information.',
  },
  {
    id: 'f1',
    name: 'F1',
    spriteMap: '/agents/F1/map.png',
    dataUrl: '/agents/F1/data.json',
    soundsUrl: '/agents/F1/sounds.json',
    description: 'F1 the robot is programmed to assist you.',
  },
];

function CharacterSelectView({ previewCharacter, setPreviewCharacter }) {
  const currentIndex = CHARACTERS.findIndex(c => c.id === previewCharacter);
  const character = CHARACTERS[currentIndex] || CHARACTERS[0];

  const [animationData, setAnimationData] = useState(null);
  const [soundsData, setSoundsData] = useState(null);

  // Load animation data and sounds for current character preview
  useEffect(() => {
    setAnimationData(null);
    setSoundsData(null);

    fetch(character.dataUrl)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Failed to load character data:', err));

    fetch(character.soundsUrl)
      .then(res => res.json())
      .then(data => setSoundsData(data))
      .catch(() => {});
  }, [character.dataUrl, character.soundsUrl]);

  const { spritePosition, frameSize, play, hasAnimation } = useClippyAnimation(animationData, 'Idle', soundsData);

  // Play Idle animation when data loads
  useEffect(() => {
    if (animationData && hasAnimation('Idle')) {
      play('Idle');
    }
  }, [animationData, hasAnimation, play]);

  const handlePrev = () => {
    const newIndex = currentIndex <= 0 ? CHARACTERS.length - 1 : currentIndex - 1;
    setPreviewCharacter(CHARACTERS[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex >= CHARACTERS.length - 1 ? 0 : currentIndex + 1;
    setPreviewCharacter(CHARACTERS[newIndex].id);
  };

  return (
    <>
      <BalloonTitle>Which character would you like to use?</BalloonTitle>

      <CharacterBox>
        <CharacterTab>{character.name}</CharacterTab>
        <CharacterPreview>
          <CharacterSprite
            $width={frameSize[0]}
            $height={frameSize[1]}
            style={{
              backgroundImage: `url(${character.spriteMap})`,
              backgroundPosition: `-${spritePosition[0]}px -${spritePosition[1]}px`,
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
  min-height: 120px;
  background: #fff;
`;

const CharacterSprite = styled.div`
  width: ${props => props.$width || 80}px;
  height: ${props => props.$height || 80}px;
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
  line-height: 1.4;
`;

export default CharacterSelectView;
