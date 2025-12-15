import { useState } from 'react';
import './GameButton.css';

function GameButton({ children, onClick, primary = false, disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Different button images for different states
  const getButtonImage = () => {
    if (isPressed) return '029_IEND'; // pressed state
    if (isHovered) return '027_IEND'; // hover state
    return '026_image_26'; // normal state
  };

  return (
    <button
      className={`wiz101-game-btn ${primary ? 'primary' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        backgroundImage: `url('/apps/wizard101/images/skin/${getButtonImage()}.png')`
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default GameButton;
