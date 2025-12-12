import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../utils/baseUrl';

function FileUploadDialog({ files, onConfirm, onCancel, uploading, progress }) {
  const hasStartedRef = useRef(false);

  // Get flat file list from structure
  const fileList = files?.files || [];

  // Auto-start upload when dialog opens
  useEffect(() => {
    if (!hasStartedRef.current && fileList && fileList.length > 0) {
      hasStartedRef.current = true;
      onConfirm();
    }
  }, [fileList, onConfirm]);

  const currentFileName = progress && fileList[progress.current]
    ? fileList[progress.current].name
    : fileList[0]?.name || 'files';

  return (
    <Overlay>
      <Dialog className="window">
        <div className="title-bar">
          <div className="title-bar-text">Copying</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onCancel} disabled={uploading} />
          </div>
        </div>

        <Content className="window-body">
          <AnimationImage src={withBaseUrl('/gui/copying.gif')} alt="Copying animation" />

          <InfoText>
            Copying {currentFileName}...
          </InfoText>

          <FromToText>
            From host to Desktop
          </FromToText>

          <ProgressRow>
            <StyledProgress />
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
  width: 370px;

  .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
  }
`;

const Content = styled.div`
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AnimationImage = styled.img`
  width: 272px;
  height: 60px;
  align-self: flex-start;
`;

const InfoText = styled.div`
  font-size: 11px;
  color: #000;
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FromToText = styled.div`
  font-size: 11px;
  color: #000;
  margin-bottom: 4px;
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledProgress = styled.progress`
  flex: 1;
  height: 16px;
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
