import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { MenuBar, Toolbar } from '../../../components';

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
      { label: 'Print...', disabled: true },
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
      { label: 'Fit Page', action: 'fitPage' },
      { label: 'Fit Width', action: 'fitWidth' },
      { label: 'Actual Size', action: 'actualSize' },
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

// Icon paths
const ICONS = {
  open: '/icons/adobe/open.svg',
  save: '/icons/adobe/save.svg',
  print: '/icons/adobe/print.svg',
  email: '/icons/adobe/email.svg',
  hand: '/icons/adobe/hand.svg',
  select: '/icons/adobe/select.svg',
  zoomIn: '/icons/adobe/zoom-in.svg',
  zoomOut: '/icons/adobe/zoom-out.svg',
  fitPage: '/icons/adobe/fit-page.svg',
  actualSize: '/icons/adobe/actual-size.svg',
  find: '/icons/adobe/find.svg',
  firstPage: '/icons/adobe/first-page.svg',
  prevPage: '/icons/adobe/prev-page.svg',
  nextPage: '/icons/adobe/next-page.svg',
  lastPage: '/icons/adobe/last-page.svg',
  bookmark: '/icons/adobe/bookmark.svg',
  pages: '/icons/adobe/pages.svg',
  attachments: '/icons/adobe/attachments.svg',
  comments: '/icons/adobe/comments.svg',
};

function AdobeReader({ onClose, onMinimize, onMaximize, pdfData, pdfName, pdfPath, onUpdateTitle }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [sidebarTab, setSidebarTab] = useState('bookmarks');
  const [showSidebar, setShowSidebar] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tool, setTool] = useState('hand');
  const fileInputRef = useRef(null);

  const displayName = pdfName || (pdfPath ? pdfPath.split('/').pop() : 'Adobe Reader');

  // Update window title when PDF is loaded
  React.useEffect(() => {
    if (onUpdateTitle && pdfUrl) {
      onUpdateTitle(`Adobe Reader - [${displayName}]`);
    }
  }, [pdfUrl, displayName, onUpdateTitle]);

  // Load PDF from data or path
  React.useEffect(() => {
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

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 25, 400)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 25, 25)), []);
  const handleFitPage = useCallback(() => setZoom(100), []);
  const handleActualSize = useCallback(() => setZoom(100), []);
  const handleFitWidth = useCallback(() => setZoom(125), []);

  const handlePrevPage = useCallback(() => setCurrentPage(p => Math.max(p - 1, 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages)), [totalPages]);
  const handleFirstPage = useCallback(() => setCurrentPage(1), []);
  const handleLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);

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
      case 'fitPage':
        handleFitPage();
        break;
      case 'fitWidth':
        handleFitWidth();
        break;
      case 'actualSize':
        handleActualSize();
        break;
      default:
        break;
    }
  }, [handleFileOpen, handleZoomIn, handleZoomOut, handleFitPage, handleFitWidth, handleActualSize]);

  // Toolbar action handler
  const handleToolbarAction = useCallback((action) => {
    switch (action) {
      case 'open':
        handleFileOpen();
        break;
      case 'zoomIn':
        handleZoomIn();
        break;
      case 'zoomOut':
        handleZoomOut();
        break;
      case 'fitPage':
        handleFitPage();
        break;
      case 'actualSize':
        handleActualSize();
        break;
      case 'handTool':
        setTool('hand');
        break;
      case 'selectTool':
        setTool('select');
        break;
      case 'firstPage':
        handleFirstPage();
        break;
      case 'prevPage':
        handlePrevPage();
        break;
      case 'nextPage':
        handleNextPage();
        break;
      case 'lastPage':
        handleLastPage();
        break;
      default:
        break;
    }
  }, [handleFileOpen, handleZoomIn, handleZoomOut, handleFitPage, handleActualSize, handleFirstPage, handlePrevPage, handleNextPage, handleLastPage]);

  // Zoom select change handler
  const handleZoomChange = useCallback((id, value) => {
    if (id === 'zoom') {
      setZoom(Number(value));
    }
  }, []);

  // Toolbar items
  const toolbarItems = [
    { type: 'button', id: 'open', icon: ICONS.open, action: 'open' },
    { type: 'button', id: 'save', icon: ICONS.save, disabled: true, action: 'save' },
    { type: 'button', id: 'print', icon: ICONS.print, disabled: true, action: 'print' },
    { type: 'button', id: 'email', icon: ICONS.email, disabled: true, action: 'email' },
    { type: 'separator' },
    { type: 'button', id: 'hand', icon: ICONS.hand, active: tool === 'hand', action: 'handTool' },
    { type: 'button', id: 'select', icon: ICONS.select, active: tool === 'select', action: 'selectTool' },
    { type: 'separator' },
    { type: 'button', id: 'zoomOut', icon: ICONS.zoomOut, action: 'zoomOut' },
    { type: 'select', id: 'zoom', value: String(zoom), options: [
      { value: '25', label: '25%' },
      { value: '50', label: '50%' },
      { value: '75', label: '75%' },
      { value: '100', label: '100%' },
      { value: '125', label: '125%' },
      { value: '150', label: '150%' },
      { value: '200', label: '200%' },
      { value: '400', label: '400%' },
    ], width: 65 },
    { type: 'button', id: 'zoomIn', icon: ICONS.zoomIn, action: 'zoomIn' },
    { type: 'button', id: 'actualSize', icon: ICONS.actualSize, action: 'actualSize' },
    { type: 'button', id: 'fitPage', icon: ICONS.fitPage, action: 'fitPage' },
    { type: 'separator' },
    { type: 'button', id: 'find', icon: ICONS.find, disabled: true, action: 'find' },
  ];

  return (
    <Container>
      {/* Menu Bar */}
      <MenuBar
        menus={ADOBE_MENUS}
        onAction={handleMenuAction}
        windowActions={{ onClose, onMinimize, onMaximize }}
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
        {showSidebar && (
          <Sidebar>
            <SidebarTabs>
              <SidebarTab
                $active={sidebarTab === 'bookmarks'}
                onClick={() => setSidebarTab('bookmarks')}
                title="Bookmarks"
              >
                <TabIcon src={ICONS.bookmark} alt="Bookmarks" />
                <TabLabel>Bookmarks</TabLabel>
              </SidebarTab>
              <SidebarTab
                $active={sidebarTab === 'pages'}
                onClick={() => setSidebarTab('pages')}
                title="Pages"
              >
                <TabIcon src={ICONS.pages} alt="Pages" />
                <TabLabel>Pages</TabLabel>
              </SidebarTab>
              <SidebarTab
                $active={sidebarTab === 'attachments'}
                onClick={() => setSidebarTab('attachments')}
                title="Attachments"
              >
                <TabIcon src={ICONS.attachments} alt="Attachments" />
                <TabLabel>Attachments</TabLabel>
              </SidebarTab>
              <SidebarTab
                $active={sidebarTab === 'comments'}
                onClick={() => setSidebarTab('comments')}
                title="Comments"
              >
                <TabIcon src={ICONS.comments} alt="Comments" />
                <TabLabel>Comments</TabLabel>
              </SidebarTab>
            </SidebarTabs>
            <SidebarContent>
              <SidebarPanel>
                <OptionsBar>
                  <OptionsButton>
                    <OptionsIcon>☰</OptionsIcon>
                    Options ▼
                  </OptionsButton>
                </OptionsBar>
                {sidebarTab === 'bookmarks' && (
                  <PanelContent>
                    {pdfUrl ? (
                      <BookmarkTree>
                        <BookmarkItem>
                          <BookmarkIcon>📄</BookmarkIcon>
                          <BookmarkLabel>Table of Contents</BookmarkLabel>
                        </BookmarkItem>
                      </BookmarkTree>
                    ) : (
                      <EmptyMessage>No bookmarks</EmptyMessage>
                    )}
                  </PanelContent>
                )}
                {sidebarTab === 'pages' && (
                  <PanelContent $gray>
                    {pdfUrl ? (
                      <PageThumbnails>
                        <PageThumb $selected={currentPage === 1}>
                          <PageThumbInner>1</PageThumbInner>
                        </PageThumb>
                      </PageThumbnails>
                    ) : (
                      <EmptyMessage>No pages</EmptyMessage>
                    )}
                  </PanelContent>
                )}
                {sidebarTab === 'attachments' && (
                  <PanelContent>
                    <EmptyMessage>No attachments</EmptyMessage>
                  </PanelContent>
                )}
                {sidebarTab === 'comments' && (
                  <PanelContent>
                    <EmptyMessage>No comments</EmptyMessage>
                  </PanelContent>
                )}
              </SidebarPanel>
            </SidebarContent>
          </Sidebar>
        )}

        {/* Toggle Sidebar Button */}
        <SidebarToggle
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? "Hide Navigation Pane" : "Show Navigation Pane"}
        >
          {showSidebar ? '◀' : '▶'}
        </SidebarToggle>

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
            <PDFContainer>
              <PDFEmbed
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                type="application/pdf"
                title={displayName}
              />
            </PDFContainer>
          ) : (
            <WelcomeScreen>
              <AdobeLogo>
                <LogoIcon>
                  <LogoA>A</LogoA>
                </LogoIcon>
              </AdobeLogo>
              <WelcomeTitle>Adobe Reader 6.0</WelcomeTitle>
              <WelcomeText>Open a PDF file to view it</WelcomeText>
              <OpenButton onClick={handleFileOpen}>Open PDF File...</OpenButton>
            </WelcomeScreen>
          )}
        </ViewerArea>
      </MainArea>

      {/* Status Bar */}
      <StatusBar>
        <StatusSection>
          <NavButton onClick={handleFirstPage} disabled={currentPage === 1} title="First Page">
            <NavIcon src={ICONS.firstPage} alt="First" />
          </NavButton>
          <NavButton onClick={handlePrevPage} disabled={currentPage === 1} title="Previous Page">
            <NavIcon src={ICONS.prevPage} alt="Prev" />
          </NavButton>
          <PageInfo>
            <PageInput
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
              min={1}
              max={totalPages}
            />
            <PageTotal>of {totalPages}</PageTotal>
          </PageInfo>
          <NavButton onClick={handleNextPage} disabled={currentPage === totalPages} title="Next Page">
            <NavIcon src={ICONS.nextPage} alt="Next" />
          </NavButton>
          <NavButton onClick={handleLastPage} disabled={currentPage === totalPages} title="Last Page">
            <NavIcon src={ICONS.lastPage} alt="Last" />
          </NavButton>
        </StatusSection>
        <StatusSection>
          <ZoomInfo>{zoom}%</ZoomInfo>
        </StatusSection>
      </StatusBar>

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

const Sidebar = styled.div`
  width: 200px;
  display: flex;
  background: #e8e8e8;
  border-right: 1px solid #808080;
  flex-shrink: 0;
`;

const SidebarTabs = styled.div`
  display: flex;
  flex-direction: column;
  width: 26px;
  background: linear-gradient(to right, #6b7280 0%, #5a6370 100%);
  flex-shrink: 0;
`;

const SidebarTab = styled.button`
  width: 26px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${props => props.$active ? '#e8e8e8' : 'transparent'};
  border: none;
  border-right: ${props => props.$active ? '1px solid #e8e8e8' : 'none'};
  border-left: ${props => props.$active ? '2px solid #0066CC' : '2px solid transparent'};
  cursor: pointer;
  padding: 8px 2px;
  margin-right: ${props => props.$active ? '-1px' : '0'};
  position: relative;
  z-index: ${props => props.$active ? '1' : '0'};

  &:hover {
    background: ${props => props.$active ? '#e8e8e8' : 'rgba(255,255,255,0.1)'};
  }
`;

const TabIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const TabLabel = styled.span`
  font-size: 9px;
  font-family: Tahoma, sans-serif;
  color: ${props => props.$active ? '#000' : '#fff'};
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
`;

const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
`;

const SidebarPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const OptionsBar = styled.div`
  display: flex;
  padding: 4px 8px;
  background: linear-gradient(to bottom, #fafafa 0%, #e8e8e8 100%);
  border-bottom: 1px solid #ccc;
`;

const OptionsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;

  &:hover {
    background: #e0e0e0;
  }
`;

const OptionsIcon = styled.span`
  font-size: 10px;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 4px;
  background: ${props => props.$gray ? '#d0d0d0' : '#fff'};
`;

const BookmarkTree = styled.div`
  padding: 4px;
`;

const BookmarkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  cursor: pointer;

  &:hover {
    background: #cce8ff;
  }
`;

const BookmarkIcon = styled.span`
  font-size: 12px;
`;

const BookmarkLabel = styled.span`
  font-size: 11px;
`;

const PageThumbnails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
`;

const PageThumb = styled.div`
  width: 80px;
  height: 100px;
  background: #fff;
  border: 2px solid ${props => props.$selected ? '#316ac5' : '#999'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    border-color: #316ac5;
  }
`;

const PageThumbInner = styled.div`
  font-size: 18px;
  color: #999;
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 11px;
`;

const SidebarToggle = styled.button`
  position: absolute;
  left: ${props => props.$showSidebar !== false ? '200px' : '0'};
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 50px;
  background: linear-gradient(to right, #6b7280 0%, #5a6370 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(to right, #5a6370 0%, #4a5360 100%);
  }
`;

const ViewerArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #525252;
  overflow: auto;
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

const PDFContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: auto;
  padding: 20px;
`;

const PDFEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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

const StatusBar = styled.div`
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

const NavButton = styled.button`
  width: 20px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
  border: 1px solid #999;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #fff 0%, #f0f0f0 100%);
    border-color: #666;
  }

  &:active:not(:disabled) {
    background: linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const NavIcon = styled.img`
  width: 12px;
  height: 12px;
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageInput = styled.input`
  width: 40px;
  padding: 2px 4px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  border: 1px solid #999;
  text-align: center;
  background: #fff;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const PageTotal = styled.span`
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
