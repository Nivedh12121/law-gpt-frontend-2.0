import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  startDelay?: number;
  typingMode?: 'character' | 'word'; // New option for typing mode
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 20, // Faster typing speed
  onComplete,
  startDelay = 100, // Shorter delay
  typingMode = 'character' // Default to character mode
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [textArray, setTextArray] = useState<string[]>([]);

  useEffect(() => {
    // Start typing after initial delay
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  // Initialize text array based on typing mode
  useEffect(() => {
    if (typingMode === 'word') {
      setTextArray(text.split(' '));
    } else {
      setTextArray(text.split(''));
    }
  }, [text, typingMode]);

  useEffect(() => {
    if (!hasStarted || currentIndex >= textArray.length) {
      if (currentIndex >= textArray.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      if (typingMode === 'word') {
        setDisplayedText(prev => prev + (prev ? ' ' : '') + textArray[currentIndex]);
      } else {
        setDisplayedText(prev => prev + textArray[currentIndex]);
      }
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, textArray, speed, hasStarted, onComplete, typingMode]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setHasStarted(false);
    
    // Start typing after delay when text changes
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, startDelay]);

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {displayedText}
      {hasStarted && currentIndex < textArray.length && (
        <span 
          style={{
            animation: 'blink 1s infinite',
            fontWeight: 'bold',
            color: '#2563eb'
          }}
        >
          |
        </span>
      )}
    </span>
  );
};

// CSS animation for cursor blink (add to your CSS or use styled-components)
export const typingAnimationStyles = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;