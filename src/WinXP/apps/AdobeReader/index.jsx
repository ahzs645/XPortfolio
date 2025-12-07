import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { MenuBar, Toolbar } from '../../../components';
import Sidebar from './Sidebar';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Menu configuration for Adobe Reader
const ADOBE_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Open...', action: 'openFile' },
      { label: 'Close', action: 'closeFile', disabled: true },
      { separator: true },
      { label: 'Save a Copy...', disabled: true },
      { separator: true },
      { label: 'Print...', action: 'print' },
      { label: 'Print Setup...', disabled: true },
      { separator: true },
      { label: 'Document Properties...', disabled: true },
      { separator: true },
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', disabled: true },
      { separator: true },
      { label: 'Copy', disabled: true },
      { label: 'Copy File to Clipboard', disabled: true },
      { separator: true },
      { label: 'Select All', disabled: true },
      { label: 'Deselect All', disabled: true },
      { separator: true },
      { label: 'Find...', disabled: true },
      { label: 'Find Again', disabled: true },
      { separator: true },
      { label: 'Preferences...', disabled: true },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Single Page', action: 'singlePage' },
      { label: 'Continuous', action: 'continuous' },
      { separator: true },
      { label: 'Zoom In', action: 'zoomIn' },
      { label: 'Zoom Out', action: 'zoomOut' },
      { separator: true },
      { label: 'Rotate Clockwise', disabled: true },
      { label: 'Rotate Counterclockwise', disabled: true },
    ],
  },
  {
    id: 'document',
    label: 'Document',
    items: [
      { label: 'Add Bookmark', disabled: true },
      { separator: true },
      { label: 'Pages...', disabled: true },
      { label: 'Crop Pages...', disabled: true },
      { label: 'Rotate Pages...', disabled: true },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Basic', disabled: true },
      { label: 'Commenting', disabled: true },
      { label: 'Advanced Commenting', disabled: true },
      { separator: true },
      { label: 'Spelling', disabled: true },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    items: [
      { label: 'Cascade', disabled: true },
      { label: 'Tile Horizontally', disabled: true },
      { label: 'Tile Vertically', disabled: true },
      { separator: true },
      { label: 'Close All', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Adobe Reader Help', disabled: true },
      { label: 'How To...', disabled: true },
      { separator: true },
      { label: 'About Adobe Reader...', disabled: true },
    ],
  },
];

function AdobeReader({ onClose, onMinimize, onMaximize, pdfData, pdfName, pdfPath, onUpdateTitle }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [layoutMode, setLayoutMode] = useState('continuous');
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const displayName = pdfName || (pdfPath ? pdfPath.split('/').pop() : 'Adobe Reader');

  // Update window title when PDF is loaded
  useEffect(() => {
    if (onUpdateTitle && pdfUrl) {
      onUpdateTitle(`Adobe Reader - [${displayName}]`);
    }
  }, [pdfUrl, displayName, onUpdateTitle]);

  // Load PDF from data or path
  useEffect(() => {
    if (pdfData) {
      setIsLoading(true);
      try {
        setPdfUrl(pdfData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load PDF');
        setIsLoading(false);
      }
    } else if (pdfPath) {
      setPdfUrl(pdfPath);
    }
  }, [pdfData, pdfPath]);

  const handleFileOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfUrl(event.target.result);
        setIsLoading(false);
        if (onUpdateTitle) {
          onUpdateTitle(`Adobe Reader - [${file.name}]`);
        }
      };
      reader.onerror = () => {
        setError('Failed to read PDF file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpdateTitle]);

  const handleZoomIn = useCallback(() => setScale(s => Math.min(s + 0.1, 3.0)), []);
  const handleZoomOut = useCallback(() => setScale(s => Math.max(s - 0.1, 0.5)), []);
  const handlePrevPage = useCallback(() => setPageNumber(p => Math.max(p - 1, 1)), []);
  const handleNextPage = useCallback(() => setPageNumber(p => Math.min(p + 1, numPages || 1)), [numPages]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const onDocumentLoadSuccess = useCallback((pdf) => {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
    setIsLoading(false);
  }, []);

  // Menu action handler
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'openFile':
        handleFileOpen();
        break;
      case 'zoomIn':
        handleZoomIn();
        break;
      case 'zoomOut':
        handleZoomOut();
        break;
      case 'singlePage':
        setLayoutMode('single');
        break;
      case 'continuous':
        setLayoutMode('continuous');
        break;
      case 'print':
        handlePrint();
        break;
      default:
        break;
    }
  }, [handleFileOpen, handleZoomIn, handleZoomOut, handlePrint]);

  // Toolbar action handler
  const handleToolbarAction = useCallback((action) => {
    switch (action) {
      case 'open':
        handleFileOpen();
        break;
      case 'print':
        handlePrint();
        break;
      case 'zoomIn':
        handleZoomIn();
        break;
      case 'zoomOut':
        handleZoomOut();
        break;
      case 'prevPage':
        handlePrevPage();
        break;
      case 'nextPage':
        handleNextPage();
        break;
      case 'singlePage':
        setLayoutMode('single');
        break;
      case 'continuous':
        setLayoutMode('continuous');
        break;
      default:
        break;
    }
  }, [handleFileOpen, handlePrint, handleZoomIn, handleZoomOut, handlePrevPage, handleNextPage]);

  // Zoom select change handler
  const handleZoomChange = useCallback((id, value) => {
    if (id === 'zoom') {
      setScale(Number(value) / 100);
    }
  }, []);

  // Toolbar items - using existing toolbar icons where possible
  const toolbarItems = [
    { type: 'button', id: 'open', icon: '/icons/pdf/AcroRd32_grp18534_lang1033.ico', action: 'open', title: 'Open' },
    { type: 'button', id: 'save', icon: '/gui/toolbar/save.webp', action: 'save', disabled: true, title: 'Save' },
    { type: 'button', id: 'print', icon: '/gui/toolbar/print.webp', action: 'print', title: 'Print' },
    { type: 'separator' },
    { type: 'button', id: 'prevPage', icon: '/gui/toolbar/back.webp', action: 'prevPage', disabled: pageNumber <= 1, title: 'Previous Page' },
    { type: 'button', id: 'nextPage', icon: '/gui/toolbar/forward.webp', action: 'nextPage', disabled: pageNumber >= (numPages || 1), title: 'Next Page' },
    { type: 'separator' },
    { type: 'button', id: 'zoomOut', icon: '/icons/pdf/AcroRd32_grp18545_lang1033.ico', action: 'zoomOut', title: 'Zoom Out' },
    { type: 'select', id: 'zoom', value: String(Math.round(scale * 100)), options: [
      { value: '50', label: '50%' },
      { value: '75', label: '75%' },
      { value: '100', label: '100%' },
      { value: '125', label: '125%' },
      { value: '150', label: '150%' },
      { value: '200', label: '200%' },
    ], width: 65 },
    { type: 'button', id: 'zoomIn', icon: '/icons/pdf/AcroRd32_grp18546_lang1033.ico', action: 'zoomIn', title: 'Zoom In' },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp', action: 'search', disabled: true, title: 'Search' },
  ];

  const pageStyle = useMemo(() => ({
    boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
    marginTop: '10px',
    marginBottom: '10px'
  }), []);

  return (
    <Container>
      {/* Menu Bar */}
      <MenuBar
        menus={ADOBE_MENUS}
        onAction={handleMenuAction}
        windowActions={{ onClose, onMinimize, onMaximize }}
        logo="/icons/pdf/PDF.ico"
      />

      {/* Toolbar */}
      <Toolbar
        items={toolbarItems}
        onAction={handleToolbarAction}
        onChange={handleZoomChange}
        variant="compact"
      />

      {/* Main Content Area */}
      <MainArea>
        {/* Sidebar */}
        <Sidebar
          pdfDocument={pdfDocument}
          onPageClick={(page) => setPageNumber(page)}
          activePage={pageNumber}
        />

        {/* PDF Viewer */}
        <ViewerArea>
          {isLoading ? (
            <LoadingMessage>
              <LoadingSpinner />
              Loading PDF...
            </LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : pdfUrl ? (
            <DocumentContainer>
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<LoadingMessage>Loading PDF...</LoadingMessage>}
                error={<ErrorMessage>Failed to load PDF.</ErrorMessage>}
              >
                {layoutMode === 'continuous' && numPages ? (
                  Array.from(new Array(numPages), (_, index) => (
                    <PageWrapper key={`page_${index + 1}`} style={pageStyle} id={`page-${index + 1}`}>
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                      <PageIndicator>{index + 1}</PageIndicator>
                    </PageWrapper>
                  ))
                ) : (
                  <PageWrapper style={pageStyle}>
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </PageWrapper>
                )}
              </Document>
            </DocumentContainer>
          ) : (
            <WelcomeScreen>
              <AdobeLogo>
                <LogoIcon>
                  <LogoA>A</LogoA>
                </LogoIcon>
              </AdobeLogo>
              <WelcomeTitle>Adobe Reader</WelcomeTitle>
              <WelcomeText>Open a PDF file to view it</WelcomeText>
              <OpenButton onClick={handleFileOpen}>Open PDF File...</OpenButton>
            </WelcomeScreen>
          )}
        </ViewerArea>
      </MainArea>

      {/* Status Bar */}
      <StatusBarContainer>
        <StatusSection>
          <PageInfo>
            Page {pageNumber} of {numPages || '--'}
          </PageInfo>
        </StatusSection>
        <StatusSection>
          <ZoomInfo>{Math.round(scale * 100)}%</ZoomInfo>
        </StatusSection>
      </StatusBarContainer>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #808080;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const ViewerArea = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #525252;
  overflow: auto;
  padding: 16px;
`;

const DocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageWrapper = styled.div`
  position: relative;
  background: #fff;
`;

const PageIndicator = styled.div`
  position: absolute;
  top: 0;
  right: -30px;
  color: #fff;
  font-size: 12px;
  opacity: 0.5;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #fff;
`;

const AdobeLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
`;

const LogoA = styled.span`
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  font-family: 'Times New Roman', serif;
`;

const WelcomeTitle = styled.h1`
  font-size: 24px;
  font-weight: normal;
  margin: 0;
  color: #e0e0e0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const WelcomeText = styled.p`
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
`;

const OpenButton = styled.button`
  padding: 8px 20px;
  font-size: 12px;
  font-family: Tahoma, sans-serif;
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
  border: 1px solid #999;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(to bottom, #fff 0%, #f0f0f0 100%);
  }

  &:active {
    background: linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%);
  }
`;

const StatusBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
  border-top: 1px solid #999;
  padding: 3px 8px;
  flex-shrink: 0;
  min-height: 24px;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageInfo = styled.span`
  font-size: 11px;
  color: #333;
`;

const ZoomInfo = styled.span`
  font-size: 11px;
  color: #333;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #999;
  border-radius: 2px;
`;

export default AdobeReader;
