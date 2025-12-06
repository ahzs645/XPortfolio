import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BalloonTitle } from '../styles';
import { useClippyAnimation } from '../hooks';

const CHARACTERS = [
  {
    id: 'rover',
    name: 'Rover',
    spriteMap: '/agents/Rover/map.png',
    dataUrl: '/agents/Rover/data.json',
    description: 'Rover will help you sniff out what you\'re looking for.',
  },
  {
    id: 'clippy',
    name: 'Clippy',
    spriteMap: '/agents/Clippy/map.png',
    dataUrl: '/agents/Clippy/data.json',
    description: 'Hi! I\'m Clippy, your office assistant. Would you like help?',
  },
  {
    id: 'merlin',
    name: 'Merlin',
    spriteMap: '/agents/Merlin/map.png',
    dataUrl: '/agents/Merlin/data.json',
    description: 'Merlin will conjure up answers to your questions.',
  },
  {
    id: 'genie',
    name: 'Genie',
    spriteMap: '/agents/Genie/map.png',
    dataUrl: '/agents/Genie/data.json',
    description: 'Your wish is my command!',
  },
  {
    id: 'genius',
    name: 'Genius',
    spriteMap: '/agents/Genius/map.png',
    dataUrl: '/agents/Genius/data.json',
    description: 'Genius will help you find brilliant solutions.',
  },
  {
    id: 'bonzi',
    name: 'Bonzi',
    spriteMap: '/agents/Bonzi/map.png',
    dataUrl: '/agents/Bonzi/data.json',
    description: 'Bonzi is here to be your friendly guide.',
  },
  {
    id: 'peedy',
    name: 'Peedy',
    spriteMap: '/agents/Peedy/map.png',
    dataUrl: '/agents/Peedy/data.json',
    description: 'Peedy the parrot will help you find what you need.',
  },
  {
    id: 'rocky',
    name: 'Rocky',
    spriteMap: '/agents/Rocky/map.png',
    dataUrl: '/agents/Rocky/data.json',
    description: 'Rocky is ready to help you on your adventure.',
  },
  {
    id: 'links',
    name: 'Links',
    spriteMap: '/agents/Links/map.png',
    dataUrl: '/agents/Links/data.json',
    description: 'Links the cat will help you prowl for information.',
  },
  {
    id: 'f1',
    name: 'F1',
    spriteMap: '/agents/F1/map.png',
    dataUrl: '/agents/F1/data.json',
    description: 'F1 the robot is programmed to assist you.',
  },
];

function CharacterSelectView({ selectedCharacter, setSelectedCharacter }) {
  const currentIndex = CHARACTERS.findIndex(c => c.id === selectedCharacter);
  const character = CHARACTERS[currentIndex] || CHARACTERS[0];

  const [animationData, setAnimationData] = useState(null);
  const [soundsData, setSoundsData] = useState(null);

  // Load animation data and sounds for current character
  useEffect(() => {
    setAnimationData(null); // Reset when character changes
    setSoundsData(null);

    // Load animation data
    fetch(character.dataUrl)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Failed to load character data:', err));

    // Load sounds
    const soundsUrl = character.dataUrl.replace('data.json', 'sounds.json');
    fetch(soundsUrl)
      .then(res => res.json())
      .then(data => setSoundsData(data))
      .catch(() => {}); // Sounds are optional
  }, [character.dataUrl]);

  const { spritePosition, frameSize, play, hasAnimation } = useClippyAnimation(animationData, 'Idle', soundsData);

  // Play a greeting animation when data loads, then switch to Idle
  useEffect(() => {
    if (animationData) {
      // Try to play a greeting animation first for a more lively preview
      const greetingAnims = ['Greet', 'Greeting', 'Wave', 'Show'];
      const greetAnim = greetingAnims.find(name => hasAnimation(name));

      if (greetAnim) {
        play(greetAnim, (animName, state) => {
          if (state === 'EXITED' && hasAnimation('Idle')) {
            play('Idle');
          }
        });
      } else if (hasAnimation('Idle')) {
        play('Idle');
      }
    }
  }, [animationData, hasAnimation, play]);

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
