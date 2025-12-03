import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BOOT_STATE } from '../constants';
import { useConfig } from '../../contexts/ConfigContext';
import useSystemSounds from '../../hooks/useSystemSounds';

function BootScreen({ bootState, onComplete }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { isLoading, getDisplayName, getProfession, getUserLoginIcon, getLoadingImagePath } = useConfig();
  const { playLogin, prewarmBalloon } = useSystemSounds();

  const userName = getDisplayName();
  const userTitle = getProfession();
  const userIcon = getUserLoginIcon();
  const bootLogo = getLoadingImagePath();

  useEffect(() => {
    if (bootState === BOOT_STATE.BOOTING && !isLoading) {
      // Boot sequence timing - wait for config to load first
      const bootTimer = setTimeout(() => {
        setShowLogin(true);
      }, 3500);

      return () => clearTimeout(bootTimer);
    }
  }, [bootState, isLoading]);

  const handleLogin = () => {
    // Don't hide login screen - just show welcome overlay on top
    setShowWelcome(true);

    // Play the Windows login sound
    playLogin();

    // Prewarm balloon sound for later use
    setTimeout(() => {
      prewarmBalloon();
    }, 50);

    // After welcome message, transition to desktop
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (showLogin) {
    return (
      <LoginScreen>
        <LoginScreenInner>
          <LoginContainer $fadeOut={showWelcome}>
            <LoginLeft $fadeOut={showWelcome}>
              <XPLogo src={bootLogo} alt="Windows XP" />
              <LoginInstruction>
                To begin, click on <LoginInstructionName>{userName}</LoginInstructionName>
              </LoginInstruction>
            </LoginLeft>
            <LoginDivider $fadeOut={showWelcome} />
            <LoginRight $fadeOut={showWelcome}>
              <UserCard onClick={handleLogin}>
                <UserIcon src={userIcon} alt={userName} />
                <UserInfo>
                  <UserNameText>{userName}</UserNameText>
                  {userTitle && <UserTitleText className="user-title">{userTitle}</UserTitleText>}
                </UserInfo>
              </UserCard>
            </LoginRight>
          </LoginContainer>
          {showWelcome && (
            <WelcomeMessage>
              <WelcomeText>Welcome</WelcomeText>
            </WelcomeMessage>
          )}
        </LoginScreenInner>
        <TurnOffContainer $fadeOut={showWelcome}>
          <TurnOffButton>
            <img src="/icons/shutdown.webp" alt="" />
            <span>Turn off computer</span>
          </TurnOffButton>
        </TurnOffContainer>
        <BottomRight $fadeOut={showWelcome}>
          <span>After you log on, you can add or change accounts.</span>
          <span>Just go to Control Panel and click User Accounts.</span>
        </BottomRight>
      </LoginScreen>
    );
  }

  return (
    <BootContainer>
      <BootContent>
        <BootLogo src={bootLogo} alt="Windows XP" />
        <LoadingBoxes>
          <LoadingBox />
          <LoadingBox />
          <LoadingBox />
        </LoadingBoxes>
      </BootContent>
      <BootBottomLeft>
        <span>For the best experience</span>
        <span>Enter Full Screen (F11)</span>
      </BootBottomLeft>
      <BootBottomRight>
        <img src="/boot-wordmark.webp" alt="Microsoft Windows XP" />
      </BootBottomRight>
    </BootContainer>
  );
}

const loader = keyframes`
  0% {
    transform: translateX(-30px);
  }
  100% {
    transform: translateX(180px);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BootContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const BootContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BootLogo = styled.img`
  width: 350px;
  max-width: 80vw;
  max-height: 40vh;
  height: auto;
  margin-bottom: 40px;
`;

const LoadingBoxes = styled.div`
  display: flex;
  align-self: center;
  width: 180px;
  height: 22px;
  border: 2px solid #b2b2b2;
  border-radius: 7px;
  overflow: hidden;
  padding: 2px 1px;
  font-size: 0;
`;

const LoadingBox = styled.div`
  display: inline-block;
  width: 9px;
  height: 100%;
  margin-right: 2px;
  background: linear-gradient(
    180deg,
    #2838c7 0%,
    #5979ef 17%,
    #869ef3 32%,
    #869ef3 45%,
    #5979ef 59%,
    #2838c7 100%
  );
  animation: ${loader} 2s linear infinite;
`;

const BootBottomLeft = styled.div`
  position: absolute;
  bottom: 48px;
  left: 100px;
  color: #fff;
  font-size: 16px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BootBottomRight = styled.div`
  position: absolute;
  bottom: 50px;
  right: 100px;

  img {
    display: block;
    height: 32px;
    width: auto;
  }
`;

// Login Screen Styles
const LoginScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  background-color: #002d99;
  color: #fff;
  overflow: visible;
  z-index: 99999;
  animation: ${fadeIn} 0.3s ease-in;
`;

const LoginScreenInner = styled.div`
  position: absolute;
  inset: 100px 0;
  background-color: #587cdb;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #bad7f8, transparent, transparent);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #f8953d, transparent, transparent);
  }
`;

const LoginContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;
  ${({ $fadeOut }) => $fadeOut && 'pointer-events: none;'}
`;

const LoginLeft = styled.div`
  position: absolute;
  right: calc(50% + 72px);
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;
`;

const XPLogo = styled.img`
  display: block;
  height: 170px;
  max-height: 28vh;
  max-width: 100%;
  object-fit: contain;
  width: auto;
`;

const LoginInstruction = styled.div`
  color: white;
  font-size: 19px;
  font-weight: 400;
  letter-spacing: 0.25px;
  margin-top: 24px;
`;

const LoginInstructionName = styled.span`
  font-weight: 700;
`;

const LoginDivider = styled.div`
  position: absolute;
  left: 50%;
  top: 20%;
  bottom: 20%;
  transform: translateX(-50%);
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(186, 215, 248, 0) 0%,
    #bad7f8 40%,
    #bad7f8 60%,
    rgba(186, 215, 248, 0) 100%
  );
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 0.35)};
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.3s ease;
`;

const LoginRight = styled.div`
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(72px, -50%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  min-width: 260px;
  padding: 12px 18px;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #113fa6, #113fa6, #587cdb);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover img {
    border-color: #fdbd32;
  }

  &:hover .user-title {
    color: #fdbd32;
  }
`;

const UserIcon = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 5px;
  border: 3px solid white;
  transition: border-color 0.3s;
`;

const UserInfo = styled.div`
  margin-left: 20px;
  width: 200px;
`;

const UserNameText = styled.div`
  font-family: Tahoma, Arial, sans-serif;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: 0.25px;
  margin-bottom: 0.5px;
  color: white;
`;

const UserTitleText = styled.div`
  font-family: Tahoma, Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  margin-top: -2px;
  color: navy;
  transition: color 0.3s;
`;

const TurnOffContainer = styled.div`
  position: absolute;
  bottom: 35px;
  left: 50px;
  display: flex;
  align-items: center;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;
`;

const TurnOffButton = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #eff1ed;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  img {
    width: 32px;
    height: 32px;
    margin-right: 8px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  &:hover img {
    opacity: 1;
  }
`;

const BottomRight = styled.div`
  position: absolute;
  bottom: 30px;
  right: 50px;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 14px;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;

  span {
    margin-top: 1px;
  }
`;

// Welcome Message (overlay on login screen)
const WelcomeMessage = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
  pointer-events: none;
`;

const WelcomeText = styled.span`
  color: white;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 3rem;
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6), 0 1px 0 #36c;
  animation: ${fadeIn} 0.7s ease-in;
`;

export default BootScreen;
