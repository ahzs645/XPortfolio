import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { MenuBar, Toolbar } from '../../../components';
import { useApp } from '../../../contexts/AppContext';
import { useFileSystem } from '../../../contexts/FileSystemContext';
import { HlpParser } from '../../../lib/hlpParser';

function dataUrlToArrayBuffer(dataUrl) {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid data URL');
  }

  const metadata = dataUrl.slice(5, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  if (metadata.includes(';base64')) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes.buffer;
  }

  return new TextEncoder().encode(decodeURIComponent(payload)).buffer;
}

const MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Open...', action: 'open' },
      { label: 'Print Topic...', disabled: true },
      { separator: true },
      { label: 'Exit', action: 'exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Copy', action: 'copy' },
      { separator: true },
      { label: 'Annotate...', disabled: true },
    ],
  },
  {
    id: 'bookmark',
    label: 'Bookmark',
    items: [
      { label: 'Define...', disabled: true },
    ],
  },
  {
    id: 'options',
    label: 'Options',
    items: [
      { label: 'Font', disabled: true },
      { separator: true },
      { label: 'Keep Help on Top', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'About Help...', action: 'about' },
    ],
  },
];

const TOOLBAR_ITEMS = [
  { id: 'contents', label: 'Contents', action: 'contents' },
  { id: 'index', label: 'Index', action: 'showIndex' },
  { id: 'back', label: 'Back', action: 'back' },
  { id: 'print', label: 'Print', disabled: true },
];

export default function WinHelp({ onClose, filePath, fileContent }) {
  const { openApp } = useApp();
  const { getFileContent } = useFileSystem();
  const [helpData, setHelpData] = useState(null);
  const [currentTopicId, setCurrentTopicId] = useState(0);
  const [history, setHistory] = useState([]);
  const [showIndex, setShowIndex] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Parse HLP file from props or file content
  useEffect(() => {
    const loadFile = async () => {
      try {
        let buffer = null;

        if (fileContent) {
          // Content passed directly (from file system)
          if (fileContent instanceof ArrayBuffer) {
            buffer = fileContent;
          } else if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
            buffer = dataUrlToArrayBuffer(fileContent);
          }
        } else if (filePath) {
          // Try to load from virtual file system
          const content = await getFileContent(filePath);
          if (content instanceof ArrayBuffer) {
            buffer = content;
          } else if (typeof content === 'string' && content.startsWith('data:')) {
            buffer = dataUrlToArrayBuffer(content);
          }
        }

        if (buffer) {
          const parser = new HlpParser(buffer);
          const data = parser.parse();
          setHelpData(data);
          setCurrentTopicId(0);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to parse HLP file:', err);
        setError(err.message);
      }
    };

    loadFile();
  }, [fileContent, filePath, getFileContent]);

  const currentTopic = useMemo(() => {
    if (!helpData || !helpData.topics.length) return null;
    return helpData.topics[currentTopicId] || helpData.topics[0];
  }, [helpData, currentTopicId]);

  const visibleTopicContent = useMemo(() => {
    if (!currentTopic?.content?.length) return [];
    const [firstItem, ...rest] = currentTopic.content;
    if (normalizeLookupText(firstItem?.text) === normalizeLookupText(currentTopic.title)) {
      return rest;
    }
    return currentTopic.content;
  }, [currentTopic]);

  const filteredKeywords = useMemo(() => {
    if (!helpData?.keywords) return [];
    if (!searchQuery) return helpData.keywords;
    const q = searchQuery.toLowerCase();
    return helpData.keywords.filter(k => k.keyword.toLowerCase().includes(q));
  }, [helpData, searchQuery]);

  const findTopicIdByText = useCallback((text) => {
    if (!helpData?.topics?.length || !text) return null;
    const normalized = normalizeLookupText(text);
    if (!normalized) return null;

    const exact = helpData.topics.find((topic) => normalizeLookupText(topic.title) === normalized);
    if (exact) return exact.id;

    const partial = helpData.topics.find((topic) => {
      const title = normalizeLookupText(topic.title);
      return title && (title.includes(normalized) || normalized.includes(title));
    });
    return partial?.id ?? null;
  }, [helpData]);

  const navigateToTopic = useCallback((topicId) => {
    if (topicId == null || topicId === currentTopicId) return;
    setHistory(prev => [...prev, currentTopicId]);
    setCurrentTopicId(topicId);
    setShowIndex(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentTopicId]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentTopicId(prev);
    }
  }, [history]);

  const goContents = useCallback(() => {
    navigateToTopic(0);
  }, [navigateToTopic]);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'exit':
        onClose?.();
        break;
      case 'open':
        fileInputRef.current?.click();
        break;
      case 'copy':
        if (window.getSelection) {
          try { document.execCommand('copy'); } catch { /* ignore */ }
        }
        break;
      case 'contents':
        goContents();
        break;
      case 'showIndex':
        setShowIndex(prev => !prev);
        break;
      case 'back':
        goBack();
        break;
      case 'about':
        openApp?.('About Windows');
        break;
      default:
        break;
    }
  }, [onClose, goBack, goContents, openApp]);

  const handleToolbarAction = useCallback((action) => {
    handleMenuAction(action);
  }, [handleMenuAction]);

  const handleFileOpen = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const buffer = await file.arrayBuffer();
      const parser = new HlpParser(buffer);
      const data = parser.parse();
      setHelpData(data);
      setCurrentTopicId(0);
      setHistory([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return (
    <Container>
      <MenuBar menus={MENUS} onAction={handleMenuAction} />
      <ToolbarRow>
        {TOOLBAR_ITEMS.map(item => (
          <ToolbarButton
            key={item.id}
            onClick={() => !item.disabled && handleToolbarAction(item.action)}
            disabled={item.disabled || (item.id === 'back' && history.length === 0)}
          >
            {item.label}
          </ToolbarButton>
        ))}
      </ToolbarRow>

      <MainArea>
        {showIndex && helpData && (
          <SidePanel>
            <SidePanelHeader>Index</SidePanelHeader>
            <SearchInput
              type="text"
              placeholder="Type first few letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <KeywordList>
              {filteredKeywords.map((kw, i) => (
                <KeywordItem
                  key={i}
                  onClick={() => {
                    const topicId = kw.topicId ?? findTopicIdByText(kw.keyword);
                    if (topicId != null) {
                      navigateToTopic(topicId);
                    }
                  }}
                  $disabled={kw.topicId == null && findTopicIdByText(kw.keyword) == null}
                >
                  {kw.keyword}
                </KeywordItem>
              ))}
              {filteredKeywords.length === 0 && (
                <NoResults>No keywords found</NoResults>
              )}
            </KeywordList>
          </SidePanel>
        )}

        <ContentArea ref={contentRef}>
          {error && (
            <ErrorMessage>
              <ErrorIcon>&#x26A0;</ErrorIcon>
              <div>
                <strong>Cannot open Help file</strong>
                <p>{error}</p>
              </div>
            </ErrorMessage>
          )}

          {!helpData && !error && (
            <WelcomeScreen>
              <HelpIcon src="/icons/xp/Help.png" alt="Help" onError={(e) => { e.target.style.display = 'none'; }} />
              <WelcomeTitle>Windows Help</WelcomeTitle>
              <WelcomeText>
                Open a .HLP file to view its contents.
              </WelcomeText>
              <OpenButton onClick={() => fileInputRef.current?.click()}>
                Open Help File...
              </OpenButton>
            </WelcomeScreen>
          )}

          {helpData && !error && (
            <>
              {helpData.title && currentTopicId === 0 && (
                <HelpTitle>{helpData.title}</HelpTitle>
              )}

              {currentTopic && (
                <TopicContent>
                  {currentTopic.title && (
                    <TopicTitle>{currentTopic.title}</TopicTitle>
                  )}
                  {visibleTopicContent.map((item, i) => (
                    <TopicParagraph key={i}>
                      {item.segments?.length ? item.segments.map((segment, segmentIndex) => (
                        segment.type === 'link' ? (
                          <InlineTopicLink
                            key={segmentIndex}
                            onClick={() => {
                              const topicId = segment.topicId ?? findTopicIdByText(segment.text);
                              if (topicId != null) {
                                navigateToTopic(topicId);
                              }
                            }}
                            $disabled={segment.topicId == null && findTopicIdByText(segment.text) == null}
                          >
                            {segment.text}
                          </InlineTopicLink>
                        ) : (
                          <span key={segmentIndex}>{segment.text}</span>
                        )
                      )) : item.text}
                    </TopicParagraph>
                  ))}
                  {visibleTopicContent.length === 0 && (
                    <TopicParagraph>
                      <em>(This topic has no content)</em>
                    </TopicParagraph>
                  )}
                </TopicContent>
              )}

              {helpData.topics.length > 1 && currentTopicId === 0 && (
                <TopicList>
                  <TopicListTitle>Topics:</TopicListTitle>
                  {helpData.topics.slice(1).map((topic) => (
                    <TopicLink
                      key={topic.id}
                      onClick={() => navigateToTopic(topic.id)}
                    >
                      {topic.title || `Topic ${topic.id}`}
                    </TopicLink>
                  ))}
                </TopicList>
              )}
            </>
          )}
        </ContentArea>
      </MainArea>

      <StatusBar>
        {helpData ? `${helpData.topics.length} topic(s)` : 'Ready'}
      </StatusBar>

      <input
        ref={fileInputRef}
        type="file"
        accept=".hlp,.HLP"
        style={{ display: 'none' }}
        onChange={handleFileOpen}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: Tahoma, 'MS Sans Serif', sans-serif;
  font-size: 11px;
`;

const ToolbarRow = styled.div`
  display: flex;
  gap: 1px;
  padding: 2px 4px;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
`;

const ToolbarButton = styled.button`
  padding: 2px 8px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  background: ${({ disabled }) => disabled ? '#ece9d8' : '#ece9d8'};
  border: 1px solid transparent;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  color: ${({ disabled }) => disabled ? '#aca899' : '#000'};

  &:hover:not(:disabled) {
    border-color: #aca899;
    background: #f1efe2;
  }

  &:active:not(:disabled) {
    border-color: #aca899;
    background: #ddd8c7;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const SidePanel = styled.div`
  width: 220px;
  min-width: 220px;
  border-right: 1px solid #aca899;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const SidePanelHeader = styled.div`
  padding: 4px 8px;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  font-weight: bold;
  font-size: 11px;
`;

const SearchInput = styled.input`
  margin: 4px;
  padding: 2px 4px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  border: 1px solid #7f9db9;
`;

const KeywordList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2px;
`;

const KeywordItem = styled.div`
  padding: 2px 6px;
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};
  font-size: 11px;
  color: ${({ $disabled }) => $disabled ? '#666' : 'inherit'};

  &:hover {
    background: ${({ $disabled }) => $disabled ? 'transparent' : '#316ac5'};
    color: ${({ $disabled }) => $disabled ? '#666' : '#fff'};
  }
`;

const InlineTopicLink = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: ${({ $disabled }) => $disabled ? '#333' : '#003399'};
  text-decoration: ${({ $disabled }) => $disabled ? 'none' : 'underline'};
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};

  &:hover {
    color: ${({ $disabled }) => $disabled ? '#333' : '#cc0000'};
  }
`;

const NoResults = styled.div`
  padding: 8px;
  color: #666;
  font-style: italic;
  text-align: center;
`;

function normalizeLookupText(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #fff;
  padding: 12px 16px;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  margin-bottom: 12px;

  p {
    margin: 4px 0 0;
    color: #666;
  }
`;

const ErrorIcon = styled.span`
  font-size: 24px;
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #333;
`;

const HelpIcon = styled.img`
  width: 48px;
  height: 48px;
`;

const WelcomeTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin: 0;
`;

const WelcomeText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const OpenButton = styled.button`
  margin-top: 8px;
  padding: 4px 16px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  background: #ece9d8;
  border: 1px solid #aca899;
  cursor: pointer;

  &:hover {
    background: #f1efe2;
  }
  &:active {
    background: #ddd8c7;
  }
`;

const HelpTitle = styled.h1`
  font-size: 16px;
  font-weight: bold;
  color: #003399;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
`;

const TopicContent = styled.div`
  margin-bottom: 16px;
`;

const TopicTitle = styled.h2`
  font-size: 13px;
  font-weight: bold;
  color: #003399;
  margin: 0 0 8px;
`;

const TopicParagraph = styled.p`
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 8px;
  color: #333;
  white-space: pre-wrap;
`;

const TopicList = styled.div`
  margin-top: 16px;
  border-top: 1px solid #ccc;
  padding-top: 12px;
`;

const TopicListTitle = styled.h3`
  font-size: 12px;
  font-weight: bold;
  margin: 0 0 8px;
  color: #333;
`;

const TopicLink = styled.div`
  padding: 2px 0;
  color: #003399;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    color: #cc0000;
  }
`;

const StatusBar = styled.div`
  padding: 2px 8px;
  background: #ece9d8;
  border-top: 1px solid #fff;
  font-size: 11px;
  color: #333;
`;
