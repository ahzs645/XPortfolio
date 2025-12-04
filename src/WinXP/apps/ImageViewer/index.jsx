import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { MenuBar, AddressBar, StatusBar } from '../../../components';

// Menu configuration for Image Viewer
const IMAGE_VIEWER_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Copy', action: 'copy', disabled: true },
      { label: 'Delete', action: 'delete', disabled: true },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Zoom In', action: 'zoomIn' },
      { label: 'Zoom Out', action: 'zoomOut' },
      { label: 'Best Fit', action: 'bestFit' },
      { separator: true },
      { label: 'Maximize', action: 'maximizeWindow' },
      { label: 'Minimize', action: 'minimizeWindow' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

function ImageViewer({ onClose, onMinimize, onMaximize, isFocus, initialImages, initialImage }) {
  const iframeRef = useRef(null);
  const imgRef = useRef(null);
  const [statusText, setStatusText] = useState('Loading images...');
  const [isZoomed, setIsZoomed] = useState(false);
  const [addressPath, setAddressPath] = useState('C:\\Users\\User\\Assets');
  const [zoom, setZoom] = useState(1);

  // If we have a direct image passed, use it
  const hasDirectImage = initialImage && initialImage.src;

  // Send action to iframe
  const sendToIframe = useCallback((action) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'toolbar:action',
        action: action,
      }, '*');
    }
  }, []);

  // Handle zoom for direct images
  const handleZoomToggle = useCallback(() => {
    if (hasDirectImage) {
      setIsZoomed(prev => !prev);
      setZoom(prev => prev === 1 ? 2 : 1);
    } else {
      sendToIframe('toggleZoom');
    }
  }, [hasDirectImage, sendToIframe]);

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'zoomIn':
      case 'zoomOut':
      case 'bestFit':
        handleZoomToggle();
        break;
      default:
        break;
    }
  }, [handleZoomToggle]);

  // Set up direct image info
  useEffect(() => {
    if (hasDirectImage) {
      setAddressPath(`C:\\Desktop\\${initialImage.title}`);
      setStatusText('Ready');
    }
  }, [hasDirectImage, initialImage]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'update-status-bar') {
        setStatusText(event.data.text || 'Ready');
      }
      if (event.data?.type === 'toolbar:zoom-state') {
        setIsZoomed(event.data.active);
      }
      if (event.data?.type === 'update-address-bar') {
        setAddressPath(event.data.title || 'C:\\Users\\User\\Assets');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Container>
      <MenuBar
        menus={IMAGE_VIEWER_MENUS}
        logo="/gui/toolbar/barlogo.webp"
        onAction={handleMenuAction}
        windowActions={{ onClose, onMinimize, onMaximize }}
      />
      <AddressBar
        title={addressPath}
        icon="/icons/image-viewer.png"
      />
      <ContentArea>
        {hasDirectImage ? (
          <DirectImageContainer $isZoomed={isZoomed}>
            <DirectImage
              ref={imgRef}
              src={initialImage.src}
              alt={initialImage.title}
              $zoom={zoom}
              draggable={false}
            />
          </DirectImageContainer>
        ) : (
          <ViewerFrame
            ref={iframeRef}
            src="/apps/imageViewer/imageViewer.html"
            title="Windows Picture and Fax Viewer"
          />
        )}
      </ContentArea>
      <BottomToolbar>
        <NavButton onClick={() => sendToIframe('nav:back')}>
          <NavIconImg src="/gui/image-viewer/nav-back.svg" alt="" />
          <span>Back</span>
        </NavButton>
        <NavButton onClick={() => sendToIframe('nextImage')}>
          <NavIconImg src="/gui/image-viewer/nav-next.svg" alt="" />
          <span>Next</span>
        </NavButton>
        <SmallButton disabled title="Rotate clockwise">
          <SmallIconImg src="/gui/image-viewer/rotate-cw.svg" alt="" />
        </SmallButton>
        <SmallButton disabled title="Rotate counter-clockwise">
          <SmallIconImg src="/gui/image-viewer/rotate-ccw.svg" alt="" />
        </SmallButton>
        <NavButton onClick={handleZoomToggle} className={isZoomed ? 'active' : ''}>
          <ZoomIconImg src="/gui/image-viewer/zoom.svg" alt="" />
          <span>Zoom</span>
        </NavButton>
        <SmallButton disabled title="Slideshow">
          <SmallIconImg src="/gui/image-viewer/slideshow.svg" alt="" />
        </SmallButton>
      </BottomToolbar>
      <StatusBar fields={statusText} showGrip={true} />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #e4e4e4;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #808080;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #808080;
`;

const ViewerFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const DirectImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: ${({ $isZoomed }) => ($isZoomed ? 'auto' : 'hidden')};
  background: #808080;
`;

const DirectImage = styled.img`
  max-width: ${({ $zoom }) => ($zoom === 1 ? '100%' : 'none')};
  max-height: ${({ $zoom }) => ($zoom === 1 ? '100%' : 'none')};
  width: ${({ $zoom }) => ($zoom === 1 ? 'auto' : 'auto')};
  height: ${({ $zoom }) => ($zoom === 1 ? 'auto' : 'auto')};
  transform: scale(${({ $zoom }) => $zoom});
  transform-origin: center center;
  object-fit: contain;
  cursor: ${({ $zoom }) => ($zoom > 1 ? 'move' : 'default')};
`;

const BottomToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: linear-gradient(to bottom, #fafafa 0%, #e8e8e8 50%, #d8d8d8 100%);
  border-top: 2px solid #0a246a;
  gap: 8px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 3px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #000;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  span {
    text-decoration: underline;
  }
`;

const NavIconImg = styled.img`
  width: 28px;
  height: 28px;
`;

const ZoomIconImg = styled.img`
  width: 22px;
  height: 22px;
`;

const SmallButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 3px;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const SmallIconImg = styled.img`
  width: 20px;
  height: 20px;
`;

export default ImageViewer;
