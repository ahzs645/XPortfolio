import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import useSystemSounds from '../../../hooks/useSystemSounds';

/**
 * MessageBox Component - Windows XP style message box/confirmation dialog
 *
 * @param {Object} props
 * @param {string} props.title - Dialog title (default: "Windows")
 * @param {string} props.message - Message to display
 * @param {string} props.icon - Icon type: 'error', 'warning', 'info', 'question' (default: 'warning')
 * @param {Array} props.buttons - Array of button configs: [{label: 'Yes', value: 'yes', primary: true}]
 * @param {Function} props.onResult - Callback when a button is clicked, receives the button value
 * @param {Function} props.onClose - Callback when dialog is closed (X button)
 * @param {Function} props.onUpdateHeader - Callback to update window header
 */
function MessageBox({
  title = 'Windows',
  message = '',
  icon = 'warning',
  buttons = [{ label: 'OK', value: 'ok', primary: true }],
  onResult,
  onClose,
  onUpdateHeader,
  windowPosition, // Current window position from Window component
}) {
  const { playError, playExclamation, playDing } = useSystemSounds();
  const soundPlayedRef = useRef(false);
  const primaryButtonRef = useRef(null);

  // Play appropriate sound on mount based on icon type
  useEffect(() => {
    if (soundPlayedRef.current) return;
    soundPlayedRef.current = true;

    if (icon === 'error') {
      playError();
    } else if (icon === 'warning' || icon === 'question') {
      playExclamation();
    } else if (icon === 'info') {
      playDing();
    }
  }, [icon, playError, playExclamation, playDing]);

  // Focus primary button on mount
  useEffect(() => {
    if (primaryButtonRef.current) {
      primaryButtonRef.current.focus();
    }
  }, []);

  // Update window header with the provided title
  useEffect(() => {
    if (onUpdateHeader && title) {
      const iconMap = {
        warning: '/icons/xp/Critical.png',
        error: '/icons/xp/Error.png',
        info: '/icons/xp/HelpandSupport.png',
        question: '/icons/xp/HelpandSupport.png',
      };
      onUpdateHeader({
        title,
        icon: iconMap[icon] || iconMap.warning,
        buttons: ['close'],
      });
    }
  }, [title, icon, onUpdateHeader]);

  const handleButtonClick = (value) => {
    // Pass back the button value and current window position
    onResult?.(value, windowPosition);
    onClose?.();
  };

  const handleClose = () => {
    onResult?.('cancel', windowPosition);
    onClose?.();
  };

  // Use Luna icons for the dialog content (scales well)
  const iconSrcMap = {
    warning: '/icons/luna/dialog_warning.png',
    error: '/icons/luna/dialog_error.png',
    info: '/icons/luna/dialog_info.png',
    question: '/icons/luna/dialog_warning.png', // Use warning icon for question
  };
  const iconSrc = iconSrcMap[icon] || iconSrcMap.warning;

  return (
    <DialogContainer>
      <DialogContent>
        <IconWrapper>
          <DialogIcon src={iconSrc} alt={icon} />
        </IconWrapper>
        <MessageText>{message}</MessageText>
      </DialogContent>
      <ButtonRow>
        {buttons.map((btn) => (
          <DialogButton
            key={btn.value}
            ref={btn.primary ? primaryButtonRef : null}
            onClick={() => handleButtonClick(btn.value)}
            $primary={btn.primary}
            autoFocus={btn.primary}
          >
            {btn.label}
          </DialogButton>
        ))}
      </ButtonRow>
    </DialogContainer>
  );
}

const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 12px;
  min-width: 280px;
  max-width: 450px;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
`;

const DialogContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
`;

const DialogIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const MessageText = styled.div`
  flex: 1;
  color: #000;
  line-height: 1.4;
  padding-top: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const DialogButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  ${props => props.$primary && `
    border-width: 2px;
  `}

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
`;

export default MessageBox;
