import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import { getXpPortalRoot } from '../../../utils/portalRoot';
import { QQ_PET_EN, translateQqPetSwfText } from './copy';

const MMTOUR_LOADER = '/apps/qqpet-gsap/mmtour-loader.js';
const MMTOUR_PLAYER_CSS = '/apps/qqpet-gsap/vendor/mmtour-player.css';
const PACK_ROOT = '/games/qqpenguin-gsap/packs';
const ORIGINAL_UI_ROOT = '/games/qqpenguin/assets/original-ui';
let mmTourModulePromise;

function loadMmTourModule() {
  if (window.__QQPET_MMTOUR__) return Promise.resolve(window.__QQPET_MMTOUR__);
  if (mmTourModulePromise) return mmTourModulePromise;

  const cssUrl = withBaseUrl(MMTOUR_PLAYER_CSS);
  if (!document.querySelector(`link[href="${cssUrl}"]`)) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = cssUrl;
    document.head.appendChild(stylesheet);
  }

  mmTourModulePromise = new Promise((resolve, reject) => {
    const onReady = () => {
      window.removeEventListener('qqpet-mmtour-ready', onReady);
      resolve(window.__QQPET_MMTOUR__);
    };
    window.addEventListener('qqpet-mmtour-ready', onReady);

    const script = document.createElement('script');
    script.type = 'module';
    script.src = withBaseUrl(MMTOUR_LOADER);
    script.dataset.qqpetMmtour = '';
    script.onerror = () => {
      window.removeEventListener('qqpet-mmtour-ready', onReady);
      mmTourModulePromise = null;
      script.remove();
      reject(new Error('Could not load the mmTour QQ Pet runtime.'));
    };
    document.head.appendChild(script);
  });

  return mmTourModulePromise;
}

// Original QQ Pet animations converted to self-contained mmTour archives.
const ANIMATIONS = [
  { id: 0, action: 'come', pack: 'other-lai0.mmtour.pack', scene: 'lai0.swf', frame: 65, speed: 12 },
  { id: 7, action: 'idle', pack: 'common.mmtour.pack', scene: 'common.swf', frame: 1238, speed: 6 },
  { id: 15, action: 'feed', pack: 'feed-chi1.mmtour.pack', scene: 'chi1.swf', frame: 139, speed: 12 },
  { id: 16, action: 'feed', pack: 'feed-chi2.mmtour.pack', scene: 'chi2.swf', frame: 141, speed: 12 },
  { id: 17, action: 'feed', pack: 'feed-chi3.mmtour.pack', scene: 'chi3.swf', frame: 231, speed: 12 },
  { id: 18, action: 'clean', pack: 'clean-xizao.mmtour.pack', scene: 'xizao.swf', frame: 103, speed: 12 },
  { id: 19, action: 'medicine', pack: 'medicine-1.mmtour.pack', scene: '1.swf', frame: 92, speed: 12 },
  { id: 20, action: 'medicine', pack: 'medicine-2.mmtour.pack', scene: '2.swf', frame: 92, speed: 12 },
  { id: 21, action: 'medicine', pack: 'medicine-3.mmtour.pack', scene: '3.swf', frame: 150, speed: 12 },
  { id: 22, action: 'work', pack: 'work.mmtour.pack', scene: 'work.swf', frame: 78, speed: 12 },
  { id: 23, action: 'study', pack: 'study.mmtour.pack', scene: 'study.swf', frame: 53, speed: 12 },
  { id: 8, action: 'touch', pack: 'touch-2.mmtour.pack', scene: '2.swf', frame: 30, speed: 12 },
  { id: 9, action: 'touch', pack: 'touch-4.mmtour.pack', scene: '4.swf', frame: 30, speed: 12 },
];

// Helper functions outside component to avoid recreating them
const getAnimationsByName = (action) => ANIMATIONS.filter(animation => animation.action === action);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

function QQPenguin({ onClose, onMinimize }) {
  const containerRef = useRef(null);
  const mmTourRef = useRef(null);
  const playerRef = useRef(null);
  const playerHostRef = useRef(null);
  const timeoutRef = useRef(null);
  const menuTimerRef = useRef(null);
  const initializedRef = useRef(false);
  const loadVersionRef = useRef(0);
  const dialogRef = useRef(null);

  // Always show login dialog (set to true)
  const [showLogin, setShowLogin] = useState(true);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDetailMenu, setShowDetailMenu] = useState(false);
  const [detailMenuType, setDetailMenuType] = useState(null);

  // Pet stats
  const [, setStats] = useState({
    hunger: 80,
    cleanliness: 90,
    health: 100,
    happiness: 75,
  });

  // Pet position (bottom-right corner initially)
  const [petPos, setPetPos] = useState({ x: window.innerWidth - 250, y: window.innerHeight - 200 });
  const [dialogPos, setDialogPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingPet, setIsDraggingPet] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Dialog drag handlers
  const handleMouseDown = (e) => {
    if (e.target.id === 'close' || e.target.id === 'min') return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - dialogPos.x, y: e.clientY - dialogPos.y };
  };

  // Pet drag handlers
  const handlePetMouseDown = (e) => {
    if (e.button === 2) return; // Right click handled separately
    e.preventDefault();
    hasDragged.current = false;
    setIsDraggingPet(true);
    dragStart.current = { x: e.clientX - petPos.x, y: e.clientY - petPos.y };
  };

  useEffect(() => {
    if (!isDragging && !isDraggingPet) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        setDialogPos({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
      if (isDraggingPet) {
        hasDragged.current = true;
        setPetPos({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsDraggingPet(false);
      setTimeout(() => { hasDragged.current = false; }, 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isDraggingPet]);

  // Load animation helper using ref to avoid stale closures
  const loadAnimation = async (nameEn, callback) => {
    if (!mmTourRef.current || !containerRef.current) return;

    const anims = getAnimationsByName(nameEn);
    if (anims.length === 0) return;

    const anim = randomChoice(anims);
    const duration = (1000 * anim.frame) / anim.speed;
    const loadVersion = ++loadVersionRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const host = document.createElement('div');
    Object.assign(host.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      visibility: 'hidden',
      background: 'transparent',
      pointerEvents: 'none',
    });
    containerRef.current.appendChild(host);

    try {
      const player = await mmTourRef.current.createDecompiledPlayer(host, {
        assetSource: 'archive',
        archiveUrl: withBaseUrl(`${PACK_ROOT}/${anim.pack}`),
        scene: anim.scene,
        autoplay: true,
        translateText: translateQqPetSwfText,
      });

      if (loadVersion !== loadVersionRef.current) {
        player.destroy();
        host.remove();
        return;
      }

      // Let mmTour paint its first frame while hidden, then swap players in one
      // frame. The outgoing animation remains visible during archive loading.
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (loadVersion !== loadVersionRef.current) {
        player.destroy();
        host.remove();
        return;
      }

      const previousPlayer = playerRef.current;
      const previousHost = playerHostRef.current;

      // QQ Pet SWFs declare a white stage but were originally embedded with
      // Flash's transparent window mode so the penguin floats over the desktop.
      containerRef.current.style.background = 'transparent';
      host.style.setProperty('background', 'transparent', 'important');
      host.style.visibility = 'visible';
      playerRef.current = player;
      playerHostRef.current = host;
      previousPlayer?.destroy();
      previousHost?.remove();

      if (callback) {
        timeoutRef.current = setTimeout(callback, duration);
      }
    } catch (e) {
      if (loadVersion === loadVersionRef.current) {
        console.error(`Failed to load mmTour animation ${anim.pack}:`, e);
      }
      host.remove();
    }
  };

  // Initialize the web-native mmTour/GSAP player after login.
  useEffect(() => {
    if (showLogin) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    let cancelled = false;

    const initMmTour = async () => {
      try {
        mmTourRef.current = await loadMmTourModule();
        if (cancelled) return;
        setBubbleMessage(QQ_PET_EN.bubble.greeting);
        setShowBubble(true);
        await loadAnimation('come', () => {
          setShowBubble(false);
          loadAnimation('idle');
        });
      } catch (e) {
        console.error('Failed to initialize the mmTour/GSAP QQ Pet player:', e);
      }
    };

    initMmTour();

    return () => {
      cancelled = true;
      initializedRef.current = false;
      loadVersionRef.current += 1;
      clearTimeout(menuTimerRef.current);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
      playerHostRef.current?.remove();
      playerHostRef.current = null;
      mmTourRef.current = null;
    };
  }, [showLogin]);

  const handleLogin = () => {
    if (rememberChoice) {
      localStorage.setItem('qqpet_skip_login', 'true');
    }
    setShowLogin(false);
  };

  const handleBubbleButton = () => {
    setShowBubble(false);
  };

  const handlePetClick = (e) => {
    if (hasDragged.current) return;
    e.stopPropagation();
    if (!showBubble && !showMenu) {
      loadAnimation('touch', () => loadAnimation('idle'));
      setBubbleMessage(QQ_PET_EN.bubble.chuckle);
      setShowBubble(true);
    } else if (showBubble) {
      setShowBubble(false);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
    setShowBubble(false);
  };

  const showQuickbar = () => {
    clearTimeout(menuTimerRef.current);
    setShowMenu(true);
  };

  const hideQuickbarSoon = () => {
    clearTimeout(menuTimerRef.current);
    menuTimerRef.current = setTimeout(() => setShowMenu(false), 500);
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);

    if (action.id === 'feed' || action.id === 'medicine') {
      setDetailMenuType(action.id);
      setShowDetailMenu(true);
    } else {
      // Play animation and update stats
      loadAnimation(action.animation, () => loadAnimation('idle'));

      // Update stats based on action
      setStats(prev => {
        const newStats = { ...prev };
        switch (action.id) {
          case 'clean':
            newStats.cleanliness = Math.min(100, prev.cleanliness + 20);
            setBubbleMessage(QQ_PET_EN.bubble.bathed);
            break;
          case 'play':
            newStats.happiness = Math.min(100, prev.happiness + 15);
            newStats.hunger = Math.max(0, prev.hunger - 5);
            setBubbleMessage(QQ_PET_EN.bubble.worked);
            break;
          case 'study':
            newStats.happiness = Math.min(100, prev.happiness + 10);
            setBubbleMessage(QQ_PET_EN.bubble.studied);
            break;
        }
        return newStats;
      });
      setShowBubble(true);
    }
  };

  const handleDetailMenuClose = () => {
    setShowDetailMenu(false);
    setDetailMenuType(null);
  };

  const handleFeedItem = (item) => {
    setShowDetailMenu(false);
    setDetailMenuType(null);
    loadAnimation('feed', () => loadAnimation('idle'));
    setStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + item.value),
      happiness: Math.min(100, prev.happiness + 5),
    }));
    setBubbleMessage(QQ_PET_EN.bubble.ate(item.name));
    setShowBubble(true);
  };

  const handleMedicineItem = () => {
    setShowDetailMenu(false);
    setDetailMenuType(null);
    loadAnimation('medicine', () => loadAnimation('idle'));
    setStats(prev => ({
      ...prev,
      health: Math.min(100, prev.health + QQ_PET_EN.detail.medicine.value),
    }));
    setBubbleMessage(QQ_PET_EN.bubble.medicine);
    setShowBubble(true);
  };

  // Close menus when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowMenu(false);
      setShowDetailMenu(false);
      setDetailMenuType(null);
    }
  };

  // Use portal to render outside the Window container's transform context
  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10000, pointerEvents: 'none' }}
      onClick={handleOverlayClick}
    >
      {showLogin ? (
        <LoginOverlay>
          <LoginDialog
            ref={dialogRef}
            onMouseDown={handleMouseDown}
            style={{ transform: `translate(calc(-50% + ${dialogPos.x}px), calc(-50% + ${dialogPos.y}px))`, cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <LoginHeader>
              <CloseBtn id="close" onClick={onClose} />
              <MinBtn id="min" onClick={onMinimize} />
            </LoginHeader>
            <LoginTitle>{QQ_PET_EN.login.title}</LoginTitle>
            <PetIcon />
            <PetLabel>{QQ_PET_EN.login.petName}</PetLabel>
            <CheckboxRow>
              <CheckboxIcon checked={rememberChoice} onClick={() => setRememberChoice(!rememberChoice)} />
              <CheckboxLabel>{QQ_PET_EN.login.remember}</CheckboxLabel>
            </CheckboxRow>
            <OkButton onClick={handleLogin}>{QQ_PET_EN.login.confirm}</OkButton>
          </LoginDialog>
        </LoginOverlay>
      ) : (
        <PetOverlay>
          {/* Speech Bubble */}
          {showBubble && (
            <Bubble style={{
              left: petPos.x + 18,
              top: petPos.y - 125,
            }}>
              <BubbleMessage>{bubbleMessage}</BubbleMessage>
              <BubbleBtn $left={52} onClick={handleBubbleButton}>{QQ_PET_EN.bubble.praise}</BubbleBtn>
              <BubbleBtn $left={116} onClick={handleBubbleButton}>{QQ_PET_EN.bubble.laugh}</BubbleBtn>
            </Bubble>
          )}

          {/* Original five-button QQ Pet hover toolbar */}
          {showMenu && (
            <Quickbar
              onMouseOver={showQuickbar}
              onMouseLeave={hideQuickbarSoon}
              style={{
                left: petPos.x + 78,
                top: petPos.y + 178,
              }}
            >
              {QQ_PET_EN.menu.map(action => (
                <QuickbarButton
                  key={action.id}
                  $icon={action.icon}
                  title={action.label}
                  aria-label={action.label}
                  onClick={() => handleMenuAction(action)}
                />
              ))}
            </Quickbar>
          )}

          {/* Detail Menu - Original QQ Pet Style */}
          {showDetailMenu && (
            <DetailMenu style={{
              left: petPos.x + 125 - 145,
              top: petPos.y - 130,
            }}>
              <DetailTitle>
                {detailMenuType === 'feed' ? QQ_PET_EN.detail.chooseFood : QQ_PET_EN.detail.chooseMedicine}
              </DetailTitle>
              <DetailCloseBtn onClick={handleDetailMenuClose}>×</DetailCloseBtn>
              <ItemList>
                {detailMenuType === 'feed' ? (
                  <>
                    {QQ_PET_EN.detail.foods.map(item => (
                      <ItemCard key={item.id} onClick={() => handleFeedItem(item)}>
                        <ItemIcon src={withBaseUrl(item.image)} />
                        <ItemText>{item.name} +{item.value}</ItemText>
                      </ItemCard>
                    ))}
                  </>
                ) : (
                  <ItemCard onClick={handleMedicineItem}>
                    <ItemIcon src={withBaseUrl(QQ_PET_EN.detail.medicine.image)} />
                    <ItemText>{QQ_PET_EN.detail.medicine.name} +{QQ_PET_EN.detail.medicine.value}</ItemText>
                  </ItemCard>
                )}
              </ItemList>
              <DetailFooter>
                <VipIcon>💎</VipIcon>
                <span>
                  <a href="#" onClick={(e) => e.preventDefault()}>{QQ_PET_EN.detail.vipLink}</a>
                  {QQ_PET_EN.detail.vipSuffix}
                </span>
              </DetailFooter>
            </DetailMenu>
          )}

          {/* Pet Container */}
          <PetContainer
            ref={containerRef}
            data-testid="qqpet-stage"
            onMouseDown={handlePetMouseDown}
            onMouseOver={showQuickbar}
            onMouseLeave={hideQuickbarSoon}
            onClick={handlePetClick}
            onContextMenu={handleContextMenu}
            style={{
              left: petPos.x,
              top: petPos.y,
              cursor: isDraggingPet ? 'grabbing' : 'grab',
            }}
          />
        </PetOverlay>
      )}
    </div>,
    getXpPortalRoot()
  );
}

// Styled Components
const LoginOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const LoginDialog = styled.div`
  width: 330px;
  height: 229px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/bg.png')});
  background-size: cover;
  position: absolute;
  left: 50%;
  top: 50%;
  user-select: none;
  pointer-events: auto;
`;

const LoginHeader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: row-reverse;
`;

const LoginTitle = styled.div`
  position: absolute;
  top: 1px;
  left: 31px;
  width: 112px;
  height: 21px;
  display: flex;
  align-items: center;
  padding-left: 3px;
  background: linear-gradient(#55c8ee, #43bae6);
  color: #082b3b;
  font: bold 12px Tahoma, sans-serif;
`;

const CloseBtn = styled.div`
  width: 38px;
  height: 18px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/close-btn.png')});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const MinBtn = styled.div`
  width: 25px;
  height: 18px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/min-btn.bmp')});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const PetIcon = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 135px;
  height: 136px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/icon.png')});
  background-size: cover;

  &::after {
    content: 'QQ Pet';
    position: absolute;
    left: 17px;
    bottom: 12px;
    width: 102px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #b86600;
    border-radius: 16px;
    background: linear-gradient(#ffd94f, #f4a900);
    color: #943500;
    font: bold 16px Tahoma, sans-serif;
    text-align: center;
    text-shadow: 0 1px #fff5a8;
  }
`;

const PetLabel = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 350%);
  font-size: 12px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 3px;

  &::before {
    content: '';
    width: 17px;
    height: 17px;
    background-image: url(${withBaseUrl('/games/qqpenguin/assets/pet-label-icon.png')});
    background-size: cover;
  }
`;

const CheckboxRow = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-140%, 510%);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
`;

const CheckboxIcon = styled.div`
  width: 17px;
  height: 17px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/checkbox.png')});
  background-size: cover;
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  margin-top: -2px;
`;

const OkButton = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(100%, 410%);
  width: 69px;
  height: 21px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/ok-btn.png')});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #333;
  &:hover { opacity: 0.9; }
`;

const PetOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Bubble = styled.div`
  position: absolute;
  width: 226px;
  height: 157px;
  background-image: url(${withBaseUrl('/games/qqpenguin/assets/bubble.png')});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: auto;
  z-index: 10001;
`;

const BubbleMessage = styled.div`
  position: absolute;
  left: 40px;
  top: 65px;
  width: 120px;
  color: rgb(113, 59, 31);
  font-family: 'Times New Roman', serif;
  font-size: 13px;
  line-height: 15px;
  white-space: pre-line;
  text-align: center;
`;

const BubbleBtn = styled.button`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 106px;
  width: 48px;
  height: 18px;
  padding: 0;
  background-color: transparent;
  background-image: url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/bubble-button.png`)});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border: none;
  color: rgb(113, 59, 31);
  font-family: 'Times New Roman', serif;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const Quickbar = styled.div`
  position: absolute;
  width: 101px;
  height: 22px;
  background:
    url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/quickbar-left.png`)}) 0 0 no-repeat,
    url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/quickbar-middle.bmp`)}) 20px 0 repeat-x,
    url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/quickbar-right.bmp`)}) 100px 0 no-repeat;
  pointer-events: auto;
  z-index: 10001;
  display: flex;
`;

const QuickbarButton = styled.button`
  width: 18px;
  height: 18px;
  min-width: 18px;
  max-width: 18px;
  min-height: 18px;
  max-height: 18px;
  flex: 0 0 18px;
  margin: 2px 1px;
  padding: 0;
  border: 0;
  background-color: transparent;
  background-image: ${({ $icon }) => `url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/${$icon}-normal.bmp`)})`};
  background-size: 18px 18px;
  background-repeat: no-repeat;
  cursor: pointer;

  &:hover {
    background-image: ${({ $icon }) => `url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/${$icon}-hover.bmp`)})`};
  }

  &:active {
    background-image: ${({ $icon }) => `url(${withBaseUrl(`${ORIGINAL_UI_ROOT}/${$icon}-active.bmp`)})`};
  }
`;

// Detail Menu Styles (original QQ Pet style)
const DetailMenu = styled.div`
  position: absolute;
  width: 290px;
  height: auto;
  min-height: 110px;
  background-image: linear-gradient(rgba(231,247,254,.9), hsla(0,0%,100%,.9), rgba(216,228,234,.9));
  box-shadow: 2px 2px 5px #3d3c3c;
  border-radius: 10px;
  pointer-events: auto;
  z-index: 10001;
`;

const DetailTitle = styled.div`
  margin-top: 14px;
  margin-left: 15px;
  color: #4b616f;
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  font-size: 13px;
`;

const DetailCloseBtn = styled.div`
  position: absolute;
  top: 10px;
  right: 12px;
  width: 13px;
  height: 13px;
  cursor: pointer;
  filter: drop-shadow(0 1px 2px grey);
  font-size: 14px;
  color: #4b616f;
  &:hover { color: #333; }
`;

const ItemList = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

const ItemCard = styled.div`
  width: 130px;
  height: 60px;
  margin: 5px;
  border-radius: 6px;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.1);

  &:hover {
    background: rgba(255,255,255,1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
`;

const ItemIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const ItemText = styled.span`
  font-size: 11px;
  color: #4b616f;
  margin-top: 3px;
`;

const DetailFooter = styled.div`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #666;
  padding: 8px 15px;
  border-top: 1px solid rgba(0,0,0,0.1);

  a {
    color: #e91e63;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const VipIcon = styled.span`
  margin-right: 5px;
`;


const PetContainer = styled.div`
  position: absolute;
  width: 250px;
  height: 200px;
  background: transparent !important;
  pointer-events: auto;
  user-select: none;
`;

export default QQPenguin;
