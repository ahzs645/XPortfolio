import React from 'react';
import styled from 'styled-components';

export function DesktopDropOverlay() {
  return (
    <Overlay>
      <Message>
        <Icon src="/icons/xp/FolderOpened.png" alt="" />
        <span>Drop files here to upload to My Documents</span>
      </Message>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 84, 227, 0.3);
  border: 3px dashed #0054e3;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #0054e3;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  span {
    font-size: 16px;
    font-weight: 600;
    color: #0054e3;
  }
`;

const Icon = styled.img`
  width: 64px;
  height: 64px;
`;

export default DesktopDropOverlay;
