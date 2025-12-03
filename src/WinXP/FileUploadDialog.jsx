import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

function FileUploadDialog({ files, onConfirm, onCancel, uploading, progress }) {
  const hasStartedRef = useRef(false);

  // Auto-start upload when dialog opens
  useEffect(() => {
    if (!hasStartedRef.current && files && files.length > 0) {
      hasStartedRef.current = true;
      onConfirm();
    }
  }, [files, onConfirm]);

  const currentFileName = progress && files[progress.current]
    ? files[progress.current].name
    : files[0]?.name || 'files';

  const progressPercent = progress
    ? (progress.current / progress.total) * 100
    : 0;

  return (
    <Overlay>
      <Dialog>
        <TitleBar>
          <TitleText>Copying</TitleText>
          <CloseButton onClick={onCancel} disabled={uploading}>
            <CloseIcon>×</CloseIcon>
          </CloseButton>
        </TitleBar>

        <Content>
          <AnimationRow>
            <FolderLeft src="/icons/xp/FolderOpened.png" alt="" />
            <FlyingFilesContainer>
              <FlyingFile src="/icons/xp/JPG.png" alt="" $delay="0s" />
              <FlyingFile src="/icons/xp/JPG.png" alt="" $delay="0.3s" />
              <FlyingFile src="/icons/xp/JPG.png" alt="" $delay="0.6s" />
            </FlyingFilesContainer>
            <FolderRight src="/icons/xp/FolderClosed.png" alt="" />
          </AnimationRow>

          <InfoText>
            Copying {currentFileName}...
          </InfoText>

          <FromToText>
            From host to Desktop
          </FromToText>

          <ProgressRow>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <CancelButton onClick={onCancel}>
              Cancel
            </CancelButton>
          </ProgressRow>
        </Content>
      </Dialog>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const Dialog = styled.div`
  background: #ece9d8;
  border: 1px solid #0054e3;
  border-radius: 8px 8px 0 0;
  box-shadow:
    0 0 0 1px #0054e3,
    2px 2px 8px rgba(0, 0, 0, 0.3);
  min-width: 380px;
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: linear-gradient(
    180deg,
    #0997ff 0%,
    #0053ee 8%,
    #0053ee 40%,
    #0050ea 88%,
    #0046d2 93%,
    #0042c9 95%,
    #003ebc 100%
  );
  border-radius: 7px 7px 0 0;
`;

const TitleText = styled.span`
  flex: 1;
  color: white;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
  padding-left: 2px;
`;

const CloseButton = styled.button`
  width: 21px;
  height: 21px;
  border: none;
  background: linear-gradient(
    180deg,
    #e97850 0%,
    #cf4a2e 50%,
    #c1351e 100%
  );
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 1px 1px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    background: linear-gradient(
      180deg,
      #f08860 0%,
      #df5a3e 50%,
      #d1452e 100%
    );
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CloseIcon = styled.span`
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
  margin-top: -2px;
`;

const Content = styled.div`
  padding: 20px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const flyAnimation = keyframes`
  0% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(75px) translateY(-20px) scale(0.8);
    opacity: 0.9;
  }
  100% {
    transform: translateX(150px) translateY(0) scale(0.6);
    opacity: 0;
  }
`;

const AnimationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0 16px;
  position: relative;
  height: 70px;
`;

const FolderLeft = styled.img`
  width: 54px;
  height: 54px;
  position: absolute;
  left: 40px;
`;

const FolderRight = styled.img`
  width: 54px;
  height: 54px;
  position: absolute;
  right: 40px;
`;

const FlyingFilesContainer = styled.div`
  position: absolute;
  left: 80px;
  top: 8px;
`;

const FlyingFile = styled.img`
  width: 24px;
  height: 24px;
  position: absolute;
  animation: ${flyAnimation} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const InfoText = styled.div`
  font-size: 11px;
  color: #000;
`;

const FromToText = styled.div`
  font-size: 11px;
  color: #000;
  margin-bottom: 8px;
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 18px;
  background: #fff;
  border: 1px solid #808080;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #37b336 0px,
    #37b336 8px,
    #2ca02b 8px,
    #2ca02b 10px
  );
  background-size: 20px 100%;
  transition: width 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(0, 0, 0, 0.05) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }
`;

const CancelButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  font-size: 11px;
  background: linear-gradient(
    180deg,
    #fff 0%,
    #f5f4f0 50%,
    #e8e6df 100%
  );
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;
  color: #000;
  box-shadow:
    inset 0 1px 0 #fff,
    0 1px 1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(
      180deg,
      #fff 0%,
      #f9f8f5 50%,
      #eceae3 100%
    );
  }

  &:active {
    background: linear-gradient(
      180deg,
      #e8e6df 0%,
      #f0efe8 50%,
      #f5f4f0 100%
    );
  }
`;

export default FileUploadDialog;
