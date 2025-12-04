import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

// Animation data extracted from original QQ Pet
const ANIMATIONS = [
  { id: 0, name: "来", nameEn: "come", path: "Penguin/GG/other/lai0.swf", frame: 65, speed: 12 },
  { id: 7, name: "平常", nameEn: "idle", path: "common.swf", frame: 1238, speed: 6 },
  { id: 15, name: "喂食", nameEn: "feed", path: "Penguin/GG/e/chi1.swf", frame: 139, speed: 12 },
  { id: 16, name: "喂食", nameEn: "feed", path: "Penguin/GG/e/chi2.swf", frame: 141, speed: 12 },
  { id: 18, name: "清洁", nameEn: "clean", path: "Penguin/GG/e/xizao.swf", frame: 103, speed: 12 },
  { id: 19, name: "吃药", nameEn: "medicine", path: "Penguin/GG/bing/1.swf", frame: 92, speed: 12 },
  { id: 22, name: "工作", nameEn: "work", path: "Penguin/GG/e/work.swf", frame: 78, speed: 12 },
  { id: 23, name: "学习", nameEn: "study", path: "Penguin/GG/e/study.swf", frame: 53, speed: 12 },
  { id: 8, name: "右脚", nameEn: "touch", path: "Penguin/GG/chang/2.swf", frame: 30, speed: 12 },
  { id: 9, name: "左脚", nameEn: "touch", path: "Penguin/GG/chang/4.swf", frame: 30, speed: 12 },
];

// Menu actions
const MENU_ACTIONS = [
  { id: 'feed', label: '喂食', icon: '🍖', animation: 'feed' },
  { id: 'clean', label: '清洁', icon: '🛁', animation: 'clean' },
  { id: 'medicine', label: '吃药', icon: '💊', animation: 'medicine' },
  { id: 'play', label: '打工', icon: '💼', animation: 'work' },
  { id: 'study', label: '学习', icon: '📚', animation: 'study' },
];

// Helper functions outside component to avoid recreating them
const getAnimationsByName = (nameEn) => ANIMATIONS.filter(a => a.nameEn === nameEn);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

function QQPenguin({ onClose, onMinimize }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);
  const initializedRef = useRef(false);
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
  const [stats, setStats] = useState({
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

  const handleMouseMove = (e) => {
    if (isDragging) {
      setDialogPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
    if (isDraggingPet) {
      hasDragged.current = true;
      setPetPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingPet(false);
    setTimeout(() => { hasDragged.current = false; }, 50);
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
    if (isDragging || isDraggingPet) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingPet]);

  // Load animation helper using ref to avoid stale closures
  const loadAnimation = async (nameEn, callback) => {
    if (!playerRef.current) return;

    const anims = getAnimationsByName(nameEn);
    if (anims.length === 0) return;

    const anim = randomChoice(anims);
    const duration = (1000 * anim.frame) / anim.speed;

    try {
      await playerRef.current.load({
        url: '/games/qqpenguin/' + anim.path,
        autoplay: 'on',
        warnOnUnsupportedContent: false,
        unmuteOverlay: 'hidden',
        wmode: 'transparent',
        windowMode: 'transparent',
        splashScreen: false,
        preloader: false,
      });
      if (callback) {
        timeoutRef.current = setTimeout(callback, duration);
      }
    } catch (e) {
      console.error('Failed to load animation:', e);
    }
  };

  // Initialize Ruffle player after login
  useEffect(() => {
    if (showLogin) return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    const initRuffle = async () => {
      if (!window.RufflePlayer) {
        console.error('Ruffle not loaded');
        return;
      }

      const ruffle = window.RufflePlayer.newest();
      const player = ruffle.createPlayer();
      player.style.width = '250px';
      player.style.height = '200px';
      player.style.zIndex = '-1';

      player.config = {
        autoplay: 'on',
        unmuteOverlay: 'hidden',
        contextMenu: 'off',
        warnOnUnsupportedContent: false,
        forceScale: true,
        forceAlign: true,
        wmode: 'transparent',
        windowMode: 'transparent',
        splashScreen: false,
        preloader: false,
        showSwfDownload: false,
      };

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(player);
        playerRef.current = player;

        try {
          await player.load({
            url: '/games/qqpenguin/common.swf',
            autoplay: 'on',
            warnOnUnsupportedContent: false,
            unmuteOverlay: 'hidden',
            wmode: 'transparent',
            windowMode: 'transparent',
            splashScreen: false,
            preloader: false,
          });
        } catch (e) {
          console.error('Failed to load animation:', e);
        }

        setTimeout(() => {
          setBubbleMessage('Hi,主人 我来也!!\n想我了吧?呵呵\n点击菜单按钮可以操作我哦~');
          setShowBubble(true);
        }, 500);
      }
    };

    if (!window.RufflePlayer) {
      const script = document.createElement('script');
      script.src = '/games/qqpenguin/Ruffle/ruffle.js';
      script.onload = initRuffle;
      document.head.appendChild(script);
    } else {
      initRuffle();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
    loadAnimation('touch', () => loadAnimation('idle'));
  };

  const handlePetClick = (e) => {
    if (hasDragged.current) return;
    e.stopPropagation();
    if (!showBubble && !showMenu) {
      loadAnimation('touch', () => loadAnimation('idle'));
      setBubbleMessage('嘿嘿~');
      setShowBubble(true);
    } else if (showBubble) {
      // Toggle menu on second click
      setShowBubble(false);
      setShowMenu(true);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
    setShowBubble(false);
  };

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setShowBubble(false);
    setShowMenu(true);
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
            setBubbleMessage('洗得真舒服~');
            break;
          case 'play':
            newStats.happiness = Math.min(100, prev.happiness + 15);
            newStats.hunger = Math.max(0, prev.hunger - 5);
            setBubbleMessage('打工赚钱啦!');
            break;
          case 'study':
            newStats.happiness = Math.min(100, prev.happiness + 10);
            setBubbleMessage('好好学习天天向上!');
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
    setBubbleMessage(`${item.name}真好吃!`);
    setShowBubble(true);
  };

  const handleMedicineItem = () => {
    setShowDetailMenu(false);
    setDetailMenuType(null);
    loadAnimation('medicine', () => loadAnimation('idle'));
    setStats(prev => ({
      ...prev,
      health: Math.min(100, prev.health + 20),
    }));
    setBubbleMessage('吃了药感觉好多了~');
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
            <PetIcon />
            <PetLabel>Q宠宝贝</PetLabel>
            <CheckboxRow>
              <CheckboxIcon checked={rememberChoice} onClick={() => setRememberChoice(!rememberChoice)} />
              <CheckboxLabel>记住我的选择</CheckboxLabel>
            </CheckboxRow>
            <OkButton onClick={handleLogin}>确定</OkButton>
          </LoginDialog>
        </LoginOverlay>
      ) : (
        <PetOverlay>
          {/* Speech Bubble */}
          {showBubble && (
            <Bubble style={{
              left: petPos.x + 125 - 75,
              top: petPos.y - 120,
            }}>
              <BubbleMessage>{bubbleMessage}</BubbleMessage>
              <BubbleButtons>
                <BubbleBtn onClick={handleBubbleButton}>真乖</BubbleBtn>
                <BubbleBtn onClick={handleBubbleButton}>哈哈</BubbleBtn>
                <BubbleBtn onClick={handleOpenMenu} style={{ background: '#FFB74D' }}>菜单</BubbleBtn>
              </BubbleButtons>
            </Bubble>
          )}

          {/* Action Menu - Original QQ Pet Context Menu Style */}
          {showMenu && (
            <ContextMenu style={{
              left: petPos.x + 125 - 75,
              top: petPos.y - 150,
            }}>
              <ContextMenuStart />
              {MENU_ACTIONS.map(action => (
                <ContextMenuOption key={action.id} onClick={() => handleMenuAction(action)}>
                  <MenuOptionIcon>{action.icon}</MenuOptionIcon>
                  <MenuOptionText>{action.label}</MenuOptionText>
                </ContextMenuOption>
              ))}
              <ContextMenuEnd />
            </ContextMenu>
          )}

          {/* Detail Menu - Original QQ Pet Style */}
          {showDetailMenu && (
            <DetailMenu style={{
              left: petPos.x + 125 - 145,
              top: petPos.y - 130,
            }}>
              <DetailTitle>
                {detailMenuType === 'feed' ? '请选择食物:' : '请选择药品:'}
              </DetailTitle>
              <DetailCloseBtn onClick={handleDetailMenuClose}>×</DetailCloseBtn>
              <ItemList>
                {detailMenuType === 'feed' ? (
                  <>
                    <ItemCard onClick={() => handleFeedItem({ name: '冰淇淋', value: 15 })}>
                      <ItemIcon src="/games/qqpenguin/assets/icecream.png" />
                      <ItemText>冰淇淋 +15</ItemText>
                    </ItemCard>
                    <ItemCard onClick={() => handleFeedItem({ name: '月饼', value: 25 })}>
                      <ItemIcon src="/games/qqpenguin/assets/mooncake.png" />
                      <ItemText>月饼 +25</ItemText>
                    </ItemCard>
                  </>
                ) : (
                  <ItemCard onClick={handleMedicineItem}>
                    <ItemIcon src="/games/qqpenguin/assets/riyongping.png" />
                    <ItemText>感冒药 +20</ItemText>
                  </ItemCard>
                )}
              </ItemList>
              <DetailFooter>
                <VipIcon>💎</VipIcon>
                <span><a href="#" onClick={(e) => e.preventDefault()}>开通粉钻</a>,体验尊贵专属特权。</span>
              </DetailFooter>
            </DetailMenu>
          )}

          {/* Pet Container */}
          <PetContainer
            ref={containerRef}
            onMouseDown={handlePetMouseDown}
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
    document.body
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
  background-image: url('/games/qqpenguin/assets/bg.png');
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

const CloseBtn = styled.div`
  width: 38px;
  height: 18px;
  background-image: url('/games/qqpenguin/assets/close-btn.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const MinBtn = styled.div`
  width: 25px;
  height: 18px;
  background-image: url('/games/qqpenguin/assets/min-btn.bmp');
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
  background-image: url('/games/qqpenguin/assets/icon.png');
  background-size: cover;
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
    background-image: url('/games/qqpenguin/assets/pet-label-icon.png');
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
  background-image: url('/games/qqpenguin/assets/checkbox.png');
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
  background-image: url('/games/qqpenguin/assets/ok-btn.png');
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
  background: white;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  pointer-events: auto;
  min-width: 150px;
  z-index: 10001;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border: 10px solid transparent;
    border-top-color: white;
    border-bottom: 0;
  }
`;

const BubbleMessage = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  white-space: pre-line;
  text-align: center;
`;

const BubbleButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const BubbleBtn = styled.button`
  padding: 5px 15px;
  background: #87CEEB;
  border: none;
  border-radius: 15px;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #7AC5E0; }
`;

// Context Menu Styles (original QQ Pet style - vertical layout)
const ContextMenu = styled.div`
  position: absolute;
  width: 150px;
  pointer-events: auto;
  font-size: 12px;
  line-height: 100%;
  z-index: 10001;
  display: flex;
  flex-direction: column;
`;

const ContextMenuStart = styled.div`
  width: 100%;
  height: 7px;
  background-image: url('/games/qqpenguin/assets/menu-start.bmp');
  background-repeat: repeat-x;
  background-size: auto 100%;
`;

const ContextMenuOption = styled.div`
  width: 100%;
  height: 22px;
  background-image: url('/games/qqpenguin/assets/menu-option.bmp');
  background-repeat: repeat-x;
  background-size: auto 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 8px;

  &:hover {
    filter: brightness(0.92);
    background-color: rgba(200, 230, 255, 0.3);
  }
`;

const ContextMenuEnd = styled.div`
  width: 100%;
  height: 7px;
  background-image: url('/games/qqpenguin/assets/menu-end.bmp');
  background-repeat: repeat-x;
  background-size: auto 100%;
`;

const MenuOptionText = styled.span`
  color: #1775a3;
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  font-size: 12px;
  margin-left: 5px;
`;

const MenuOptionIcon = styled.span`
  font-size: 14px;
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
  pointer-events: auto;
  user-select: none;
`;

export default QQPenguin;
