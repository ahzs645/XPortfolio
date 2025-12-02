import React from 'react';
import styled from 'styled-components';

function ImageViewer({ onClose, isFocus, initialImages }) {
  return (
    <Container>
      <ViewerFrame
        src="/apps/imageViewer/imageViewer.html"
        title="Windows Picture and Fax Viewer"
      />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #a0a0a0;
  overflow: hidden;
`;

const ViewerFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default ImageViewer;
