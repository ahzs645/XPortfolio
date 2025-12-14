import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import useSystemSounds from '../../../hooks/useSystemSounds';

/**
 * ErrorDialog Component - Windows XP style error dialog
 *
 * @param {Object} props
 * @param {string} props.title - Dialog title (default: "Error")
 * @param {string} props.message - Error message to display
 * @param {string} props.icon - Icon type: 'error', 'warning', 'info' (default: 'error')
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onUpdateHeader - Callback to update window header
 */
function ErrorDialog({ title = 'Error', message = '', icon = 'error', onClose, onUpdateHeader }) {
  const { playError, playExclamation, playDing } = useSystemSounds();
  const soundPlayedRef = useRef(false);

  // Play appropriate sound on mount based on icon type
  useEffect(() => {
    if (soundPlayedRef.current) return;
    soundPlayedRef.current = true;

    if (icon === 'error') {
      playError();
    } else if (icon === 'warning') {
      playExclamation();
    } else if (icon === 'info') {
      playDing();
    }
  }, [icon, playError, playExclamation, playDing]);

  // Update window header with the provided title
  useEffect(() => {
    if (onUpdateHeader && title) {
      onUpdateHeader({
        title,
        icon: icon === 'warning'
          ? '/icons/xp/Warning.png'
          : icon === 'info'
          ? '/icons/xp/Info.png'
          : '/icons/xp/Error.png',
        buttons: ['close'],
      });
    }
  }, [title, icon, onUpdateHeader]);

  const handleOk = () => {
    onClose?.();
  };

  // Use Luna icons for the dialog content (48x48, scales well)
  const iconSrc = icon === 'warning'
    ? '/icons/luna/dialog_warning.png'
    : icon === 'info'
    ? '/icons/luna/dialog_info.png'
    : '/icons/luna/dialog_error.png';

  return (
    <DialogContainer>
      <DialogContent>
        <IconWrapper>
          <DialogIcon src={iconSrc} alt={icon} />
        </IconWrapper>
        <MessageText>{message}</MessageText>
      </DialogContent>
      <ButtonRow>
        <OkButton onClick={handleOk} autoFocus>
          OK
        </OkButton>
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
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const OkButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

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

export default ErrorDialog;
