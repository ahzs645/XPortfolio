import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

// Special URL for home page
const HOME_PAGE = 'about:home';

// Helper function to process URLs for iframe embedding
// Adds ?igu=1 to Google URLs to bypass X-Frame-Options restrictions
const processUrlForIframe = (url) => {
  try {
    const urlObj = new URL(url);

    // Only allow http and https schemes to prevent javascript: and data: URL attacks
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return HOME_PAGE;
    }

    // Check if it's a Google domain (google.com, google.co.uk, google.de, etc.)
    const isGoogleDomain = /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/i.test(urlObj.hostname);

    if (isGoogleDomain) {
      // For Google homepage or search, add igu=1 parameter
      // This tells Google to serve headers that allow iframe embedding
      if (!urlObj.searchParams.has('igu')) {
        urlObj.searchParams.set('igu', '1');
      }
      return urlObj.toString();
    }

    return url;
  } catch {
    return url;
  }
};

// Menu configuration for Internet Explorer
const IE_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New Window', disabled: true },
      { label: 'Open...', disabled: true },
      { separator: true },
      { label: 'Save As...', disabled: true },
      { separator: true },
      { label: 'Print...', disabled: true },
      { label: 'Print Preview', disabled: true },
      { separator: true },
      { label: 'Close', action: 'exitProgram' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Cut', disabled: true },
      { label: 'Copy', disabled: true },
      { label: 'Paste', disabled: true },
      { separator: true },
      { label: 'Select All', disabled: true },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Toolbars', disabled: true },
      { label: 'Status Bar', disabled: true },
      { separator: true },
      { label: 'Stop', action: 'stop' },
      { label: 'Refresh', action: 'refresh' },
      { separator: true },
      { label: 'Maximize', action: 'maximizeWindow' },
      { label: 'Minimize', action: 'minimizeWindow' },
    ],
  },
  {
    id: 'favorites',
    label: 'Favorites',
    items: [
      { label: 'Add to Favorites...', disabled: true },
      { label: 'Organize Favorites...', disabled: true },
      { separator: true },
      { label: 'Links', disabled: true },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Internet Options...', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Help Topics', disabled: true },
      { separator: true },
      { label: 'About Internet Explorer', disabled: true },
    ],
  },
];

// Welcome page component
function WelcomePage({ onNavigate }) {
  const quickLinks = [
    { title: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📚' },
    { title: 'GitHub', url: 'https://github.com', icon: '💻' },
    { title: 'Reddit', url: 'https://old.reddit.com', icon: '🔗' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰' },
  ];

  return (
    <WelcomeContainer>
      <WelcomeHeader>
        <WelcomeLogo src={withBaseUrl('/icons/xp/InternetExplorer6.png')} alt="IE" />
        <WelcomeTitle>Welcome to Internet Explorer</WelcomeTitle>
      </WelcomeHeader>
      <WelcomeContent>
        <WelcomeSection>
          <SectionTitle>Quick Links</SectionTitle>
          <QuickLinksGrid>
            {quickLinks.map((link) => (
              <QuickLink key={link.url} onClick={() => onNavigate(link.url)}>
                <QuickLinkIcon>{link.icon}</QuickLinkIcon>
                <QuickLinkTitle>{link.title}</QuickLinkTitle>
              </QuickLink>
            ))}
          </QuickLinksGrid>
        </WelcomeSection>
        <WelcomeSection>
          <SectionTitle>Getting Started</SectionTitle>
          <WelcomeText>
            Type a web address in the address bar above and press Enter to navigate.
          </WelcomeText>
          <WelcomeNote>
            Note: Some websites may not display due to security restrictions (X-Frame-Options).
            Sites like Google, Wikipedia, GitHub, and many others work great!
          </WelcomeNote>
        </WelcomeSection>
      </WelcomeContent>
    </WelcomeContainer>
  );
}

function InternetExplorer({ onClose, onMinimize, onMaximize, isFocus, initialUrl, filePath }) {
  // Determine starting URL - use initialUrl if provided, otherwise home page
  const startUrl = initialUrl || HOME_PAGE;
  // Store file path mapping for blob URLs
  const [filePathMap] = useState(() => {
    const map = {};
    if (filePath && initialUrl?.startsWith('blob:')) {
      map[initialUrl] = filePath;
    }
    return map;
  });
  const [history, setHistory] = useState([startUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState(filePath || (startUrl.startsWith('blob:') ? 'Local File' : startUrl));
  const [loading, setLoading] = useState(startUrl !== HOME_PAGE);
  const iframeRef = useRef(null);
  const inputRef = useRef(null);

  const currentUrl = history[historyIndex];
  const isHomePage = currentUrl === HOME_PAGE;
  const isLocalFile = currentUrl.startsWith('blob:');

  // Helper to get display URL for address bar
  const getDisplayUrl = useCallback((url) => {
    if (url === HOME_PAGE) return HOME_PAGE;
    if (url.startsWith('blob:')) return filePathMap[url] || 'Local File';
    return url;
  }, [filePathMap]);

  // Navigation functions
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInputUrl(getDisplayUrl(history[newIndex]));
      if (history[newIndex] !== HOME_PAGE) {
        setLoading(true);
      }
    }
  }, [historyIndex, history, getDisplayUrl]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInputUrl(getDisplayUrl(history[newIndex]));
      if (history[newIndex] !== HOME_PAGE) {
        setLoading(true);
      }
    }
  }, [historyIndex, history, getDisplayUrl]);

  const refresh = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && !isHomePage) {
      setLoading(true);
      const currentSrc = iframe.src;
      iframe.src = currentSrc;
    }
  }, [isHomePage]);

  const stop = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.stop();
      setLoading(false);
    }
  }, []);

  const goHome = () => navigateToUrl(HOME_PAGE);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- reads history+historyIndex from closure to slice/push; refactoring to functional updates would split coordinated state
  const navigateToUrl = useCallback((url) => {
    let finalUrl = url.trim();
    if (!finalUrl) return;

    // Handle special URLs
    if (finalUrl === HOME_PAGE || finalUrl === 'about:blank') {
      finalUrl = HOME_PAGE;
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('about:')) {
      // Check if it looks like a URL
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        // Treat as search query - use DuckDuckGo as it works in iframes
        finalUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(finalUrl)}`;
      }
    }

    // Process URL for iframe embedding (e.g., add ?igu=1 for Google)
    if (finalUrl !== HOME_PAGE) {
      finalUrl = processUrlForIframe(finalUrl);
    }

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setInputUrl(finalUrl);
    if (finalUrl !== HOME_PAGE) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [history, historyIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigateToUrl(inputUrl);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case 'refresh':
        refresh();
        break;
      case 'stop':
        stop();
        break;
      default:
        break;
    }
  };

  // Toolbar configuration
  const toolbarItems = [
    {
      type: 'button',
      id: 'back',
      icon: '/gui/toolbar/back.webp',
      label: 'Back',
      disabled: historyIndex === 0,
      action: 'back',
    },
    {
      type: 'button',
      id: 'forward',
      icon: '/gui/toolbar/forward.webp',
      label: 'Forward',
      disabled: historyIndex >= history.length - 1,
      action: 'forward',
    },
    { type: 'separator' },
    {
      type: 'button',
      id: 'stop',
      icon: '/icons/xp/IEStop.png',
      disabled: !loading,
      action: 'stop',
    },
    {
      type: 'button',
      id: 'refresh',
      icon: '/icons/xp/IERefresh.png',
      action: 'refresh',
    },
    {
      type: 'button',
      id: 'home',
      icon: '/icons/xp/IEHome.png',
      action: 'home',
    },
    { type: 'separator' },
    {
      type: 'button',
      id: 'search',
      icon: '/gui/toolbar/search.webp',
      label: 'Search',
      disabled: true,
    },
    {
      type: 'button',
      id: 'favorites',
      icon: '/gui/toolbar/favorites.webp',
      label: 'Favorites',
      disabled: true,
    },
  ];

  const handleToolbarAction = (action) => {
    switch (action) {
      case 'back':
        goBack();
        break;
      case 'forward':
        goForward();
        break;
      case 'stop':
        stop();
        break;
      case 'refresh':
        refresh();
        break;
      case 'home':
        goHome();
        break;
      default:
        break;
    }
  };

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={IE_MENUS}
      menuLogo="/gui/toolbar/barlogo.webp"
      toolbarItems={toolbarItems}
      onToolbarAction={handleToolbarAction}
      onMenuAction={handleMenuAction}
      hideAddressBar={true}
      statusFields={loading ? 'Loading...' : 'Done'}
    >
      <Container>
        <AddressBarContainer>
          <AddressLabel>Address</AddressLabel>
          <AddressInputWrapper>
            <AddressIcon src={withBaseUrl('/icons/xp/InternetShortcut.png')} alt="" />
            <AddressInput
              ref={inputRef}
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.target.select()}
            />
          </AddressInputWrapper>
          <GoButton onClick={() => navigateToUrl(inputUrl)}>
            <GoIcon src={withBaseUrl('/icons/xp/Go.png')} alt="Go" />
            <GoText>Go</GoText>
          </GoButton>
        </AddressBarContainer>
        <IframeContainer>
          {isHomePage ? (
            <WelcomePage onNavigate={navigateToUrl} />
          ) : (
            <StyledIframe
              ref={iframeRef}
              src={currentUrl}
              onLoad={handleIframeLoad}
              title="Internet Explorer"
              sandbox={isLocalFile ? "allow-same-origin allow-scripts allow-popups allow-forms allow-modals" : "allow-same-origin allow-scripts allow-popups allow-forms"}
              $isFocus={isFocus}
            />
          )}
        </IframeContainer>
        <StatusBarCustom>
          <StatusLeft>
            <StatusIcon src={withBaseUrl('/icons/xp/InternetShortcut.png')} alt="" />
            <StatusText>{loading ? 'Loading...' : 'Done'}</StatusText>
          </StatusLeft>
          <StatusRight>
            <StatusIcon src={withBaseUrl('/icons/xp/InternetShortcut.png')} alt="" />
            <StatusText>Internet</StatusText>
          </StatusRight>
        </StatusBarCustom>
      </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f0f0;
`;

const AddressBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 26px;
  background: linear-gradient(to bottom, #f6f8fc 0%, #e3e8f0 100%);
  border-bottom: 1px solid #919b9c;
  padding: 0 4px;
`;

const AddressLabel = styled.span`
  font-size: 11px;
  color: #000;
  padding: 0 6px;
  font-family: Tahoma, sans-serif;
`;

const AddressInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: 20px;
  background: #fff;
  border: 1px solid #7f9db9;
  margin-right: 4px;
`;

const AddressIcon = styled.img`
  width: 16px;
  height: 16px;
  margin: 0 4px;
`;

const AddressInput = styled.input`
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  padding: 0 4px;
`;

const GoButton = styled.button`
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(to bottom, #fff 0%, #e3e8f0 100%);
  border: 1px solid #7f9db9;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to bottom, #fff 0%, #ccd8e8 100%);
  }

  &:active {
    background: linear-gradient(to bottom, #ccd8e8 0%, #fff 100%);
  }
`;

const GoIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const GoText = styled.span`
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  margin-left: 2px;
`;

const IframeContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background: #fff;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: ${props => props.$isFocus ? 'auto' : 'none'};
`;

const StatusBarCustom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  background: #ece9d8;
  border-top: 1px solid #fff;
  padding: 0 4px;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
`;

const StatusRight = styled.div`
  display: flex;
  align-items: center;
`;

const StatusIcon = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 4px;
`;

const StatusText = styled.span`
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  color: #000;
`;

// Welcome page styles
const WelcomeContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8f4fc 0%, #d4e8f7 50%, #c5dff0 100%);
  overflow-y: auto;
  font-family: Tahoma, sans-serif;
`;

const WelcomeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 30px 40px;
  background: linear-gradient(to bottom, #0054a6 0%, #0066cc 50%, #0078d7 100%);
  border-bottom: 3px solid #003d7a;
`;

const WelcomeLogo = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 16px;
`;

const WelcomeTitle = styled.h1`
  font-size: 24px;
  font-weight: normal;
  color: #fff;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const WelcomeContent = styled.div`
  padding: 30px 40px;
`;

const WelcomeSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: bold;
  color: #003399;
  margin: 0 0 15px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #99c2e5;
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
`;

const QuickLink = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #fff;
  border: 1px solid #99c2e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e8f4fc;
    border-color: #0066cc;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
  }

  &:active {
    background: #d4e8f7;
  }
`;

const QuickLinkIcon = styled.span`
  font-size: 28px;
  margin-bottom: 8px;
`;

const QuickLinkTitle = styled.span`
  font-size: 11px;
  color: #003399;
  text-align: center;
`;

const WelcomeText = styled.p`
  font-size: 12px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 10px 0;
`;

const WelcomeNote = styled.p`
  font-size: 11px;
  color: #666;
  line-height: 1.4;
  margin: 0;
  padding: 10px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

export default InternetExplorer;
