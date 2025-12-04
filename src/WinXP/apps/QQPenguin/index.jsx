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
      style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10000 }}
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

          {/* Action Menu */}
          {showMenu && (
            <ActionMenu style={{
              left: petPos.x + 125 - 80,
              top: petPos.y - 180,
            }}>
              <MenuTitle>宠物操作</MenuTitle>
              <MenuCloseBtn onClick={() => setShowMenu(false)}>×</MenuCloseBtn>
              <MenuItems>
                {MENU_ACTIONS.map(action => (
                  <MenuItem key={action.id} onClick={() => handleMenuAction(action)}>
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </MenuItem>
                ))}
              </MenuItems>
              <MenuStats>
                <StatRow>
                  <StatLabel>饥饿</StatLabel>
                  <StatBar><StatFill style={{ width: `${stats.hunger}%`, background: '#ff9800' }} /></StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>清洁</StatLabel>
                  <StatBar><StatFill style={{ width: `${stats.cleanliness}%`, background: '#2196f3' }} /></StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>健康</StatLabel>
                  <StatBar><StatFill style={{ width: `${stats.health}%`, background: '#4caf50' }} /></StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>心情</StatLabel>
                  <StatBar><StatFill style={{ width: `${stats.happiness}%`, background: '#e91e63' }} /></StatBar>
                </StatRow>
              </MenuStats>
            </ActionMenu>
          )}

          {/* Detail Menu */}
          {showDetailMenu && (
            <DetailMenu style={{
              left: petPos.x + 125 - 100,
              top: petPos.y - 200,
            }}>
              <DetailTitle>
                {detailMenuType === 'feed' ? '请选择食物:' : '请选择药品:'}
              </DetailTitle>
              <DetailCloseBtn onClick={handleDetailMenuClose}>×</DetailCloseBtn>
              <DetailContent>
                {detailMenuType === 'feed' ? (
                  <>
                    <DetailItem onClick={() => handleFeedItem({ name: '冰淇淋', value: 15 })}>
                      <DetailItemIcon src="/games/qqpenguin/assets/icecream.png" />
                      <DetailItemText>冰淇淋 (+15饱食)</DetailItemText>
                    </DetailItem>
                    <DetailItem onClick={() => handleFeedItem({ name: '月饼', value: 25 })}>
                      <DetailItemIcon src="/games/qqpenguin/assets/mooncake.png" />
                      <DetailItemText>月饼 (+25饱食)</DetailItemText>
                    </DetailItem>
                  </>
                ) : (
                  <DetailItem onClick={handleMedicineItem}>
                    <DetailItemIcon src="/games/qqpenguin/assets/riyongping.png" />
                    <DetailItemText>感冒药 (+20健康)</DetailItemText>
                  </DetailItem>
                )}
              </DetailContent>
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
  pointer-events: auto;
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
  background-image: url("data:image/png;base64,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");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const MinBtn = styled.div`
  width: 25px;
  height: 18px;
  background-image: url("data:image/bmp;base64,Qk1ABwAAAAAAADYAAAAoAAAAGQAAABIAAAABACAAAAAAAAoHAAASCwAAEgsAAAAAAAAAAAAA8cBIAPLBSgDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPLBSQDywUkA8sFJAPDASwDywUwA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDywUsA8sFLAPLBSwDwwE0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A8sJNAPLCTQDywk0A78BQAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAPLDUQDyw1EA8sNRAO3AUQDzxVQA88RTAPPEUwDzxFMA88RTAPPEUwDas1QAyqhVAMqoVQDKqFUAyqhVAMqoVQDKqFUAyqhVAMqoVQDKqFUAyqhVANqzVADzxFMA88RTAPPEUwDzxFMA88RTAPPFVADswFMA88ZaAPPFVgDzxVYA88VWAPPFVgDzxVYAyqlXAN/ZzgDf2c4A39nOAN/ZzgDf2c4A39nOAN/ZzgDf2c4A39nOAN/ZzgDKqVcA88VWAPPFVgDzxVYA88VWAPPFVgDzxloA68BVAPPIXwDzx1kA88dZAPPHWQDzx1kA88dZAMqpWQDi3NEA4tzRAOLc0QDi3NEA4tzRAOLc0QDi3NEA4tzRAOLc0QDi3NEAyqlZAPPHWQDzx1kA88dZAPPHWQDzx1kA88hfAOq/VgD0yWIA9MdbAPTHWwD0x1sA9MdbAPTHWwDctloAy6paAMuqWgDLqloAy6paAMuqWgDLqloAy6paAMuqWgDLqloAy6paANy2WgD0x1sA9MdbAPTHWwD0x1sA9MdbAPTJYgDpvlgA9ctnAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD0yF4A9MheAPTIXgD1y2cA575YAPXNbAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9MlgAPTJYAD0yWAA9c1sAOa8WgD1znEA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPTKYwD0ymMA9MpjAPXOcQDlvFsA9dB2APTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD0ymUA9MplAPTKZQD10HYA5LxcAPbSegD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9MtoAPTLaAD0y2gA9tJ6AOO7XQD20n0A9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPTMagD0zGoA9MxqAPbSfQDiu1wA9tOAAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD0zGsA9MxrAPTMawD204AA4rtdAPbVggD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9c1sAPXNbAD1zWwA9tWCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggD21IIA9tSCAPbUggCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAimwiAIpsIgCKbCIAAAA=");
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
    background-image: url("data:image/png;base64,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");
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
  background-image: url("data:image/png;base64,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");
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
  background-image: url("data:image/png;base64,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");
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

// Action Menu Styles
const ActionMenu = styled.div`
  position: absolute;
  background: linear-gradient(180deg, #e8f4fc 0%, #c5e3f6 100%);
  border: 2px solid #7cb8d9;
  border-radius: 10px;
  padding: 10px;
  min-width: 160px;
  pointer-events: auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const MenuTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #2e6b8a;
  padding-bottom: 8px;
  border-bottom: 1px solid #a8d4ea;
  margin-bottom: 8px;
`;

const MenuCloseBtn = styled.div`
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  &:hover { color: #333; }
`;

const MenuItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const MenuItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  min-width: 45px;
  font-size: 11px;
  color: #333;
  border: 1px solid #cde5f0;

  &:hover {
    background: #e8f4fc;
    border-color: #7cb8d9;
  }

  span:first-child {
    font-size: 18px;
    margin-bottom: 3px;
  }
`;

const MenuStats = styled.div`
  background: white;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid #cde5f0;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  &:last-child { margin-bottom: 0; }
`;

const StatLabel = styled.span`
  font-size: 10px;
  color: #666;
  width: 30px;
`;

const StatBar = styled.div`
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const StatFill = styled.div`
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
`;

// Detail Menu Styles
const DetailMenu = styled.div`
  position: absolute;
  background: linear-gradient(180deg, #fff5e6 0%, #ffe4b8 100%);
  border: 2px solid #d4a55a;
  border-radius: 10px;
  padding: 12px;
  min-width: 200px;
  pointer-events: auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const DetailTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #8b6914;
  padding-bottom: 8px;
  border-bottom: 1px solid #d4a55a;
  margin-bottom: 10px;
`;

const DetailCloseBtn = styled.div`
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 18px;
  cursor: pointer;
  color: #8b6914;
  &:hover { color: #5a4510; }
`;

const DetailContent = styled.div`
  margin-bottom: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 5px;
  border: 1px solid #e6c88a;

  &:hover {
    background: #fff8eb;
    border-color: #d4a55a;
  }
`;

const DetailItemIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;

const DetailItemText = styled.span`
  font-size: 12px;
  color: #333;
`;

const DetailFooter = styled.div`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #e6c88a;

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
