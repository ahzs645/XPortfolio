import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * AddressBar Component - Windows XP style address bar with progress indicator
 *
 * @param {Object} props
 * @param {string} props.title - The current address/path title to display
 * @param {string} props.icon - Icon to display next to the title
 * @param {string} props.label - Label text (default: "Address")
 * @param {boolean} props.loading - Whether to show loading progress animation
 * @param {number} props.progress - Progress percentage (0-100) for manual control
 * @param {boolean} props.showGoButton - Whether to show the Go button (default: true)
 * @param {Function} props.onGoClick - Callback when Go button is clicked
 * @param {string} props.dropdownIcon - Custom dropdown icon path
 * @param {string} props.goIcon - Custom go button icon path
 *
 * @example
 * <AddressBar
 *   title="About Me"
 *   icon="/icons/about.webp"
 *   loading={false}
 *   showGoButton={true}
 * />
 */
function AddressBar({
  title = '',
  icon,
  label = 'Address',
  loading = false,
  progress: controlledProgress,
  showGoButton = true,
  onGoClick,
  dropdownIcon = '/gui/toolbar/tooldropdown.webp',
  goIcon = '/gui/toolbar/go.webp',
}) {
  const [progress, setProgress] = useState(0);
  const [progressState, setProgressState] = useState('idle'); // 'idle', 'loading', 'complete'

  // Handle loading state with animated progress
  useEffect(() => {
    if (loading) {
      setProgressState('loading');
      setProgress(0);

      // Animate progress from 0 to ~90%
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          // Slow down as we approach 90%
          const increment = Math.max(1, (90 - prev) / 10);
          return Math.min(90, prev + increment);
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (progressState === 'loading') {
      // Complete the progress when loading ends
      setProgress(100);
      setProgressState('complete');

      // Reset after animation
      const timeout = setTimeout(() => {
        setProgressState('idle');
        setProgress(0);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Handle controlled progress
  useEffect(() => {
    if (typeof controlledProgress === 'number') {
      setProgress(controlledProgress);
      if (controlledProgress === 100) {
        setProgressState('complete');
      } else if (controlledProgress > 0) {
        setProgressState('loading');
      } else {
        setProgressState('idle');
      }
    }
  }, [controlledProgress]);

  return (
    <AddressBarContainer>
      <AddressBarRow>
        <AddressLabel>
          <span>{label}</span>
        </AddressLabel>

        <AddressInput>
          <AddressContent>
            {icon && (
              <AddressIcon src={icon} alt="" width={14} height={14} draggable={false} />
            )}
            <AddressTitle>{title}</AddressTitle>
          </AddressContent>

          <DropdownIcon
            src={dropdownIcon}
            alt="dropdown"
            width={16}
            height={18}
            draggable={false}
          />

          <ProgressBar
            className={progressState}
            style={{ width: `${progress}%` }}
          />
        </AddressInput>

        {showGoButton && (
          <GoButton onClick={onGoClick}>
            <img src={goIcon} alt="go" width={20} height={20} draggable={false} />
            <span>Go</span>
          </GoButton>
        )}
      </AddressBarRow>
    </AddressBarContainer>
  );
}

const AddressBarContainer = styled.div`
  background: none;
  border: none;
  position: static;
  width: 100%;
  z-index: auto;
  font-family: Tahoma, Arial, sans-serif;
`;

const AddressBarRow = styled.div`
  align-items: center;
  background: #e9e9e9;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 34px;
  max-height: 34px;
  min-height: 34px;
  overflow: hidden;
  padding: 0 4px;
  position: static;
  width: 100%;
  box-sizing: border-box;
`;

const AddressLabel = styled.div`
  align-items: center;
  color: #7f7c73;
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  justify-content: center;
  min-width: 55px;
  width: 55px;
`;

const AddressInput = styled.div`
  align-items: center;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  flex: 1 1 auto;
  height: 22px;
  justify-content: space-between;
  margin: 0 4px;
  max-width: 100%;
  min-width: 150px;
  padding: 0 0 0 3px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const AddressContent = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
`;

const AddressIcon = styled.img`
  margin: 0 3px 0 0;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`;

const AddressTitle = styled.span`
  align-items: center;
  color: #222;
  display: flex;
  font-weight: 500;
  height: 100%;
  margin-left: 2px;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
  font-size: 11px;
`;

const DropdownIcon = styled.img`
  filter: grayscale(100%) opacity(0.6);
  flex-shrink: 0;
  pointer-events: none;
  position: relative;
  z-index: 1;
`;

const ProgressBar = styled.div`
  background: #316ac5;
  height: 100%;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: width 0.3s ease-out;
  z-index: 0;

  &.loading {
    opacity: 0.3;
  }

  &.complete {
    opacity: 0;
    transition: opacity 0.5s ease-out 0.3s;
  }
`;

const GoButton = styled.div`
  align-items: center;
  color: #a0a0a0;
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 3px;
  justify-content: center;
  min-width: 55px;
  white-space: nowrap;
  width: 55px;
  cursor: default;

  & > img {
    filter: grayscale(100%) opacity(0.6);
  }
`;

export default AddressBar;
