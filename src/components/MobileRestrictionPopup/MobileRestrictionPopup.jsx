import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * MobileRestrictionPopup - Shows when user tries to open a mobile-restricted app
 * Uses standard XP window styling
 */
function MobileRestrictionPopup({ isOpen, title, icon, onClose }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <PopupWindow className="window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">
            {icon && <TitleIcon src={icon} alt="" />}
            {title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">
          <Content>
            <IconSection>
              {icon && <AppIcon src={icon} alt={title} />}
            </IconSection>
            <MessageSection>
              <Message>
                This program is only available on desktop devices.
              </Message>
            </MessageSection>
          </Content>
          <ButtonContainer>
            <OkButton onClick={onClose} autoFocus>
              OK
            </OkButton>
          </ButtonContainer>
        </div>
      </PopupWindow>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation: ${fadeIn} 0.1s ease-out;
`;

const PopupWindow = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 320px;
  max-width: 90vw;
  animation: ${scaleIn} 0.15s ease-out;

  .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
  }

  .title-bar-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .window-body {
    padding: 12px;
    margin: 0 3px 3px 3px;
  }
`;

const TitleIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const Content = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

const IconSection = styled.div`
  flex-shrink: 0;
`;

const AppIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const MessageSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 32px;
`;

const Message = styled.div`
  font-size: 11px;
  color: #000;
  line-height: 1.4;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const OkButton = styled.button`
  min-width: 75px;
  height: 23px;
  padding: 0 12px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-size: 11px;
`;

export default MobileRestrictionPopup;
