import { useState, useEffect, useRef } from 'react';

const WORD_SPEAK_TIME = 200; // ms per word

/**
 * TypewriterText - Displays text word by word with a typing effect
 * Similar to the classic Clippy speech balloon
 */
function TypewriterText({ text, onComplete, speed = WORD_SPEAK_TIME }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef(null);
  const wordsRef = useRef([]);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    if (!text) {
      setIsComplete(true);
      return;
    }

    // Split text into words (preserving punctuation)
    wordsRef.current = text.split(/(\s+)/);

    const addWord = () => {
      if (indexRef.current >= wordsRef.current.length) {
        setIsComplete(true);
        onComplete?.();
        return;
      }

      indexRef.current++;
      setDisplayedText(wordsRef.current.slice(0, indexRef.current).join(''));
      timeoutRef.current = setTimeout(addWord, speed);
    };

    // Start typing
    timeoutRef.current = setTimeout(addWord, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  // Skip to end on click
  const handleClick = () => {
    if (!isComplete && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <span onClick={handleClick} style={{ cursor: isComplete ? 'default' : 'pointer' }}>
      {displayedText}
    </span>
  );
}

export default TypewriterText;
