import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Page } from 'react-pdf';

const PDF_ICON = "/icons/pdf/PDF.ico";

const Sidebar = ({ pdfDocument, onPageClick, activePage }) => {
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [panelWidth, setPanelWidth] = useState(250);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [bookmarks, setBookmarks] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleTabClick = (tabId) => {
    if (activeTab === tabId) {
      setIsCollapsed(!isCollapsed);
    } else {
      setActiveTab(tabId);
      setIsCollapsed(false);
    }
  };

  // Sidebar resize handlers
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX || e.touches?.[0]?.clientX || 0;
    startWidthRef.current = panelWidth;
  }, [panelWidth]);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const delta = clientX - startXRef.current;
    const newWidth = Math.min(Math.max(startWidthRef.current + delta, 150), 500);
    setPanelWidth(newWidth);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    if (pdfDocument) {
      pdfDocument.getOutline().then((outline) => {
        setBookmarks(outline);
      }).catch(() => setBookmarks(null));
    }
  }, [pdfDocument]);

  const tabs = [
    { id: "bookmarks", label: "Bookmarks" },
    { id: "pages", label: "Pages" },
    { id: "attachments", label: "Attachments" },
    { id: "comments", label: "Comments" },
  ];

  const TAB_WIDTH = 22;
  const SLANT_HEIGHT = 12;

  const measureTextWidth = (text, isBold) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${isBold ? 'bold' : ''} 10px Tahoma, "Segoe UI", sans-serif`;
    const metrics = context.measureText(text);
    return metrics.width + (text.length * 0.5);
  };

  return (
    <Container>
      {/* VERTICAL TABS */}
      <TabStrip>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id && !isCollapsed;
          const measuredTextHeight = measureTextWidth(tab.label, true);
          const tabHeight = SLANT_HEIGHT + measuredTextHeight + 16;

          return (
            <TabButton
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                zIndex: isActive ? 50 : tabs.length - index,
                marginTop: index === 0 ? 4 : `-${SLANT_HEIGHT - 3}px`,
              }}
            >
              <svg
                width={TAB_WIDTH + 8}
                height={tabHeight + 2}
                viewBox={`0 0 ${TAB_WIDTH + 8} ${tabHeight + 2}`}
                style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
              >
                <path
                  d={`M 2 ${SLANT_HEIGHT} L ${TAB_WIDTH - 2} 2 Q ${TAB_WIDTH} 1 ${TAB_WIDTH + 1} 2 L ${TAB_WIDTH + 1} ${tabHeight - 2} Q ${TAB_WIDTH + 1} ${tabHeight} ${TAB_WIDTH - 1} ${tabHeight} L 3 ${tabHeight} Q 1 ${tabHeight} 1 ${tabHeight - 2} L 1 ${SLANT_HEIGHT + 2} Q 1 ${SLANT_HEIGHT} 2 ${SLANT_HEIGHT} Z`}
                  fill={isActive ? "#ECE9D8" : "#D4D0C8"}
                  stroke="#808080"
                  strokeWidth={1}
                />
                {isActive && (
                  <rect x={TAB_WIDTH} y={2} width={8} height={tabHeight - 2} fill="#ECE9D8" />
                )}
              </svg>

              <TabContent
                style={{
                  width: TAB_WIDTH,
                  height: tabHeight,
                  paddingTop: SLANT_HEIGHT + 2,
                  paddingBottom: 4,
                }}
              >
                <TabText $active={isActive}>
                  {tab.label}
                </TabText>

                <TabDots>
                  {[...Array(4)].map((_, i) => (
                    <TabDot key={i} />
                  ))}
                </TabDots>
              </TabContent>
            </TabButton>
          );
        })}
      </TabStrip>

      {/* PANEL */}
      {!isCollapsed && (
        <PanelWrapper style={{ width: panelWidth }}>
          <PanelBridge />
          <PanelInner>
            <PanelBox>
              {/* HEADER */}
              <PanelHeader>
                <HeaderLeft>
                  <SettingsIcon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#404040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </SettingsIcon>
                  <HeaderTitle>
                    {activeTab === 'bookmarks' ? 'Bookmarks' : activeTab === 'pages' ? 'Pages' : 'Options'}
                  </HeaderTitle>
                </HeaderLeft>
                <CloseButton onClick={() => setIsCollapsed(true)}>
                  ×
                </CloseButton>
              </PanelHeader>

              {/* CONTENT */}
              <PanelContent>
                {activeTab === "bookmarks" && (
                  <BookmarksTree bookmarks={bookmarks} onPageClick={onPageClick} />
                )}
                {activeTab === "pages" && (
                  <PagesPreview pdfDocument={pdfDocument} onPageClick={onPageClick} activePage={activePage} />
                )}
                {(activeTab === "attachments" || activeTab === "comments") && (
                  <EmptyMessage>Feature not available in this demo.</EmptyMessage>
                )}
              </PanelContent>
            </PanelBox>
          </PanelInner>
        </PanelWrapper>
      )}

      {!isCollapsed && (
        <ResizeHandle
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          {[...Array(5)].map((_, i) => (
            <ResizeDot key={i} />
          ))}
        </ResizeHandle>
      )}
    </Container>
  );
};

// TreeItem Component
const TreeItem = ({ item, onPageClick }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.items && item.items.length > 0;

  const handleClick = () => {
    console.log("Navigating to", item.dest);
  };

  return (
    <TreeItemWrapper>
      <TreeRow onClick={handleClick}>
        {hasChildren ? (
          <ExpandButton onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? "−" : "+"}
          </ExpandButton>
        ) : (
          <TreeSpacer>
            <DottedLine />
          </TreeSpacer>
        )}
        <TreeIcon src={PDF_ICON} alt="" />
        <TreeLabel>{item.title}</TreeLabel>
      </TreeRow>

      {expanded && hasChildren && (
        <TreeChildren>
          {item.items.map((child, idx) => (
            <TreeChildWrapper key={idx}>
              <HorizontalDottedLine />
              <TreeItem item={child} onPageClick={onPageClick} />
            </TreeChildWrapper>
          ))}
        </TreeChildren>
      )}
    </TreeItemWrapper>
  );
};

// BookmarksTree Component
const BookmarksTree = ({ bookmarks, onPageClick }) => {
  if (!bookmarks || bookmarks.length === 0) {
    return <EmptyMessage>No bookmarks found.</EmptyMessage>;
  }
  return (
    <TreeContainer>
      {bookmarks.map((item, idx) => (
        <TreeItem key={idx} item={item} onPageClick={onPageClick} />
      ))}
    </TreeContainer>
  );
};

// PagesPreview Component
const PagesPreview = ({ pdfDocument, onPageClick, activePage }) => {
  useEffect(() => {
    if (activePage) {
      const activeEl = document.getElementById(`thumbnail-${activePage}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activePage]);

  if (!pdfDocument) return <EmptyMessage>Loading pages...</EmptyMessage>;

  return (
    <ThumbnailGrid>
      {Array.from(new Array(pdfDocument.numPages), (_, index) => {
        const pageNum = index + 1;
        const isActive = activePage === pageNum;
        return (
          <ThumbnailItem
            key={`page_${pageNum}`}
            id={`thumbnail-${pageNum}`}
            onClick={() => onPageClick(pageNum)}
          >
            <ThumbnailBox $active={isActive}>
              <Page
                pageNumber={pageNum}
                width={80}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                pdf={pdfDocument}
              />
            </ThumbnailBox>
            <ThumbnailNumber $active={isActive}>
              {pageNum}
            </ThumbnailNumber>
          </ThumbnailItem>
        );
      })}
    </ThumbnailGrid>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100%;
  background: #ECE9D8;
  position: relative;
  z-index: 20;
`;

const TabStrip = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
  z-index: 30;
`;

const TabButton = styled.button`
  position: relative;
  cursor: default;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  min-width: unset !important;
  min-height: unset !important;
  font-family: inherit;
`;

const TabContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TabText = styled.span`
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.05em;
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  color: ${props => props.$active ? '#000' : '#404040'};
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-family: Tahoma, "Segoe UI", sans-serif;
`;

const TabDots = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 4px;
  opacity: 0.5;
`;

const TabDot = styled.div`
  width: 2px;
  height: 2px;
  background: #404040;
  border-radius: 50%;
  box-shadow: 1px 1px 0px white;
`;

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const PanelBridge = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  background: #ECE9D8;
  border-left: 1px solid #808080;
  z-index: 5;
`;

const PanelInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  margin-top: 4px;
  position: relative;
  z-index: 10;
`;

const PanelBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
  border: 1px solid #808080;
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  height: 22px;
  background: #ECE9D8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-bottom: 1px solid #808080;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SettingsIcon = styled.span`
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.span`
  font-weight: bold;
  font-size: 11px;
  color: #000;
`;

const CloseButton = styled.button`
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  cursor: pointer;
  font-size: 14px;
  color: #000;
  padding: 0 6px !important;
  line-height: 1;
  border-radius: 2px;
  min-width: unset !important;
  min-height: unset !important;

  &:hover {
    background: #316AC5 !important;
    color: #fff;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow: auto;
  background: #fff;
  font-size: 11px;
  line-height: 1.2;
`;

const ResizeHandle = styled.div`
  width: 6px;
  background: #D4D0C8;
  cursor: col-resize;
  height: 100%;
  border-left: 1px solid white;
  border-right: 1px solid #808080;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;

  &:hover {
    background: #E0DCD4;
  }

  &:active {
    background: #C8C4BC;
  }
`;

const ResizeDot = styled.div`
  width: 1px;
  height: 1px;
  background: #808080;
`;

// Tree Styles
const TreeContainer = styled.div`
  padding: 4px;
`;

const TreeItemWrapper = styled.div``;

const TreeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: default;
  padding: 1px 4px 1px 2px;

  &:hover {
    background: #316AC5;
    color: #fff;
  }
`;

const ExpandButton = styled.button`
  width: 9px !important;
  height: 9px !important;
  min-width: 9px !important;
  min-height: 9px !important;
  border: 1px solid #808080 !important;
  background: #fff !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  line-height: 1;
  font-weight: bold;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  padding: 0 !important;
  cursor: pointer;
`;

const TreeSpacer = styled.span`
  width: 9px;
  flex-shrink: 0;
  position: relative;
`;

const DottedLine = styled.div`
  position: absolute;
  top: 50%;
  left: -10px;
  width: 10px;
  border-top: 1px dotted #808080;
`;

const TreeIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const TreeLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  user-select: none;
`;

const TreeChildren = styled.div`
  position: relative;
  margin-left: 6px;
  border-left: 1px dotted #808080;
  padding-left: 12px;
`;

const TreeChildWrapper = styled.div`
  position: relative;
`;

const HorizontalDottedLine = styled.div`
  position: absolute;
  border-top: 1px dotted #808080;
  left: -12px;
  top: 9px;
  width: 10px;
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #404040;
  font-style: italic;
`;

// Thumbnail Styles
const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
`;

const ThumbnailItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover span {
    background: #316AC5;
    color: #fff;
  }
`;

const ThumbnailBox = styled.div`
  border: ${props => props.$active ? '2px solid #316AC5' : '1px solid #808080'};
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background: #fff;
  transition: all 0.2s;

  ${props => props.$active && `
    box-shadow: 0 0 0 2px #316AC5;
  `}

  &:hover {
    box-shadow: 0 0 0 2px #316AC5;
  }
`;

const ThumbnailNumber = styled.span`
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 1px;
  background: ${props => props.$active ? '#316AC5' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#333'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
`;

export default Sidebar;
