import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BOOT_STATE } from '../constants';
import { useConfig } from '../../contexts/ConfigContext';
import { useUserAccounts } from '../../contexts/UserAccountsContext';
import useSystemSounds from '../../hooks/useSystemSounds';

function BootScreen({ bootState, onComplete }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const { isLoading: configLoading, getDisplayName, getProfession, getUserLoginIcon, getDynamicXPSvgUrl } = useConfig();
  const {
    users,
    isLoading: usersLoading,
    loginUser,
    activeUserId,
  } = useUserAccounts();
  const { playLogin, prewarmBalloon } = useSystemSounds();

  const isLoading = configLoading || usersLoading;

  // Get user info - use selected user from accounts or fall back to config
  const selectedUser = users.find(u => u.id === selectedUserId);
  const userName = selectedUser?.name || getDisplayName();
  const userTitle = selectedUser ? (selectedUser.accountType === 'admin' ? 'Computer Administrator' : 'Limited Account') : getProfession();
  const userIcon = selectedUser?.picture || getUserLoginIcon();

  // Auto-select user if only one exists
  useEffect(() => {
    if (!usersLoading && users.length === 1 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, usersLoading, selectedUserId]);

  useEffect(() => {
    // If coming from log off, skip boot animation and show login directly
    if (bootState === BOOT_STATE.LOGIN) {
      setShowLogin(true);
      return;
    }

    if (bootState === BOOT_STATE.BOOTING && !isLoading) {
      // Boot sequence timing - wait for config to load first
      const bootTimer = setTimeout(() => {
        setShowLogin(true);
      }, 3500);

      return () => clearTimeout(bootTimer);
    }
  }, [bootState, isLoading]);

  const handleUserClick = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setSelectedUserId(userId);
    setPasswordError(null);

    // If user has password, show password input
    if (user.hasPassword) {
      setShowPasswordInput(true);
      return;
    }

    // Otherwise, log in directly
    await performLogin(userId);
  };

  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedUserId) return;

    const result = await loginUser(selectedUserId, password);
    if (result.success) {
      // Skip the login call in performLogin since we already authenticated with password
      await performLogin(selectedUserId, true);
    } else {
      setPasswordError(result.error || 'Incorrect password');
      setPassword('');
    }
  };

  const performLogin = async (userId, skipLogin = false) => {
    if (!skipLogin) {
      const result = await loginUser(userId);
      if (!result.success && result.requiresPassword) {
        setShowPasswordInput(true);
        return;
      }
    }

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

  const handleCancelPassword = () => {
    setShowPasswordInput(false);
    setPassword('');
    setPasswordError(null);
    if (users.length > 1) {
      setSelectedUserId(null);
    }
  };

  if (showLogin) {
    // Multi-user mode: show all users (including when password input is shown inline for a locked account)
    const showMultiUser = users.length > 1 && (!selectedUserId || showPasswordInput);

    return (
      <LoginScreen>
        <LoginScreenInner>
          <LoginContainer $fadeOut={showWelcome}>
            <LoginLeft $fadeOut={showWelcome}>
              <XPLogo src={getDynamicXPSvgUrl()} alt="Windows XP" />
              <LoginInstruction>
                {showMultiUser ? (
                  <>
                    <DesktopText>To begin, click your user name</DesktopText>
                    <MobileText>Tap on a user to begin</MobileText>
                  </>
                ) : showPasswordInput ? (
                  <>
                    <DesktopText>Type your password</DesktopText>
                    <MobileText>Enter your password</MobileText>
                  </>
                ) : (
                  <>
                    <DesktopText>To begin, click on <LoginInstructionName>{userName}</LoginInstructionName></DesktopText>
                    <MobileText>Tap on the user icon to begin</MobileText>
                  </>
                )}
              </LoginInstruction>
            </LoginLeft>
            <LoginDivider $fadeOut={showWelcome} />
            <MobileSeparator $fadeOut={showWelcome} />
            <LoginRight $fadeOut={showWelcome} $multiUser={showMultiUser}>
              {showMultiUser ? (
                // Show all users
                <UsersList>
                  {users.map(user => {
                    const isLocked = user.hasPassword;
                    const isSelected = selectedUserId === user.id && showPasswordInput;

                    return (
                      <LoginWrapper key={user.id} $selected={isSelected}>
                        <UserCard
                          $locked={isLocked}
                          $selected={isSelected}
                          onClick={(e) => {
                            // Don't trigger handleUserClick if password input is already showing
                            if (isSelected) {
                              e.stopPropagation();
                              return;
                            }
                            handleUserClick(user.id);
                          }}
                        >
                          <UserIcon src={user.picture} alt={user.name} />
                          <UserInfo>
                            <UserNameText>{user.name}</UserNameText>
                            {isSelected ? (
                              <InlinePasswordForm
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePasswordSubmit(e);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <InlinePasswordInput
                                  type="password"
                                  value={password}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setPassword(e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Type your password..."
                                  autoFocus
                                />
                                <InlinePasswordButton
                                  type="submit"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <img
                                    src="/apps/openlair-viewer/static/images/interface/explorer/go.png"
                                    alt="Go"
                                  />
                                </InlinePasswordButton>
                              </InlinePasswordForm>
                            ) : (
                              <UserTitleText className="user-title">
                                {user.accountType === 'admin' ? 'Computer Administrator' : 'Limited Account'}
                              </UserTitleText>
                            )}
                            {isSelected && passwordError && (
                              <PasswordError style={{ marginLeft: 0, marginTop: '4px' }}>{passwordError}</PasswordError>
                            )}
                          </UserInfo>
                        </UserCard>
                      </LoginWrapper>
                    );
                  })}
                </UsersList>
              ) : showPasswordInput ? (
                // Show password input for selected user
                <PasswordContainer>
                  <UserCard $noHover>
                    <UserIcon src={userIcon} alt={userName} />
                    <UserInfo>
                      <UserNameText>{userName}</UserNameText>
                      {userTitle && <UserTitleText className="user-title">{userTitle}</UserTitleText>}
                    </UserInfo>
                  </UserCard>
                  <PasswordForm onSubmit={handlePasswordSubmit}>
                    <PasswordInput
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type your password"
                      autoFocus
                    />
                    <PasswordButtons>
                      <PasswordSubmitButton type="submit">→</PasswordSubmitButton>
                    </PasswordButtons>
                  </PasswordForm>
                  {passwordError && <PasswordError>{passwordError}</PasswordError>}
                  {users.length > 1 && (
                    <BackToUsersLink onClick={handleCancelPassword}>
                      ← Back to user list
                    </BackToUsersLink>
                  )}
                </PasswordContainer>
              ) : (
                // Single user without password
                <UserCard onClick={() => handleUserClick(selectedUserId || users[0]?.id)}>
                  <UserIcon src={userIcon} alt={userName} />
                  <UserInfo>
                    <UserNameText>{userName}</UserNameText>
                    {userTitle && <UserTitleText className="user-title">{userTitle}</UserTitleText>}
                  </UserInfo>
                </UserCard>
              )}
            </LoginRight>
          </LoginContainer>
          {showWelcome && (
            <WelcomeMessage>
              <WelcomeText>welcome</WelcomeText>
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
        <BootLogo src={getDynamicXPSvgUrl()} alt="Windows XP" />
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

  /* Mobile adjustments */
  .mobile-device & {
    width: 280px;
    margin-bottom: 30px;
  }
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

  /* Hide on mobile */
  .mobile-device & {
    display: none !important;
  }
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

  /* Center on mobile */
  .mobile-device & {
    bottom: 30px;
    right: auto;
    left: 50%;
    transform: translateX(-50%);

    img {
      height: 26px;
    }
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

  /* Mobile adjustments */
  .mobile-device & {
    inset: 80px 0;

    &::before, &::after {
      height: 1.5px;
    }
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

  /* Mobile: stack vertically */
  .mobile-device & {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10vw;
  }
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

  /* Mobile: center and stack */
  .mobile-device & {
    position: static;
    transform: none;
    align-items: center;
    margin: 0 auto 0 auto;
  }
`;

const XPLogo = styled.img`
  display: block;
  height: 170px;
  max-height: 28vh;
  max-width: 100%;
  width: auto;

  /* Mobile adjustments */
  .mobile-device & {
    height: 155px;
    padding-left: 12px;
  }
`;

const LoginInstruction = styled.div`
  color: white;
  font-size: 19px;
  font-weight: 400;
  letter-spacing: 0.25px;
  margin-top: 24px;

  /* Mobile adjustments */
  .mobile-device & {
    font-size: 15px;
    margin-top: 8px;
    padding: 0 10px;
    text-align: center;
  }
`;

const LoginInstructionName = styled.span`
  font-weight: 700;
`;

const DesktopText = styled.span`
  display: inline;

  .mobile-device & {
    display: none;
  }
`;

const MobileText = styled.span`
  display: none;

  .mobile-device & {
    display: inline;
  }
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

  /* Hide on mobile */
  .mobile-device & {
    display: none;
  }
`;

const MobileSeparator = styled.hr`
  display: none;
  border: none;
  height: 2px;
  max-width: 75%;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(88, 124, 219, 0) 0%,
    #bad7f8 40%,
    #bad7f8 60%,
    rgba(88, 124, 219, 0) 100%
  );
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 0.35)};
  margin: 0;
  transition: opacity 0.4s ease;

  /* Show only on mobile */
  .mobile-device & {
    display: block;
    margin-top: 12px;
  }
`;

const LoginRight = styled.div`
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(72px, -50%);
  display: flex;
  align-items: ${({ $multiUser }) => $multiUser ? 'flex-start' : 'center'};
  justify-content: flex-start;
  flex-direction: ${({ $multiUser }) => $multiUser ? 'column' : 'row'};
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;
  max-height: ${({ $multiUser }) => $multiUser ? '60vh' : 'auto'};
  overflow-y: ${({ $multiUser }) => $multiUser ? 'auto' : 'visible'};

  /* Mobile: center and stack */
  .mobile-device & {
    position: static;
    transform: none;
    justify-content: center;
    margin: 0 auto;
    max-height: 50vh;
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Wrapper for login items (handles .login.selected gradient background)
const LoginWrapper = styled.div`
  padding: 1px;
  margin-bottom: 10px;
  border-radius: 11px;
  background: ${({ $selected }) => $selected
    ? 'linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)'
    : 'transparent'};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-clip: padding-box, border-box;
  transition: background 0.3s ease;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  min-width: 260px;
  padding: 12px 18px;
  border: 1px solid ${({ $locked }) => $locked ? '#5A7EDC' : 'transparent'};
  border-radius: 10px;
  cursor: ${({ $noHover }) => $noHover ? 'default' : 'pointer'};
  position: relative;
  overflow: hidden;

  /* Locked account styling */
  opacity: ${({ $locked, $selected, $noHover }) => {
    if ($noHover) return 1;
    if ($locked && !$selected) return 0.5;
    return 1;
  }};

  background: ${({ $locked, $selected }) => {
    if ($locked && $selected) {
      return 'linear-gradient(to right, #00309C 0%, #5A7EDC 100%)';
    }
    if ($locked) {
      return '#5A7EDC';
    }
    return 'transparent';
  }};

  transition: opacity 0.5s ease, transform 0.5s ease, background 0.3s ease;
  transform: translateY(0);

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

  &:hover {
    opacity: 1;
  }

  &:hover::before {
    opacity: ${({ $locked }) => $locked ? 0 : 1};
  }

  &:hover img {
    border-color: ${({ $noHover }) => $noHover ? 'white' : '#fdbd32'};
  }

  &:hover .user-title {
    color: ${({ $noHover }) => $noHover ? 'navy' : '#fdbd32'};
  }

  /* Mobile adjustments */
  .mobile-device & {
    flex-direction: column;
    min-width: auto;
    max-width: 280px;
    min-height: ${({ $noHover }) => $noHover ? 'auto' : '160px'};
    padding: 24px;
    border-radius: 10px;
    justify-content: center;
    text-align: center;
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
  overflow: hidden;

  /* Mobile adjustments */
  .mobile-device & {
    margin-left: 0;
    margin-top: 12px;
    width: auto;
    text-align: center;
  }
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

// Inline password input for locked accounts (shown when selected)
const InlinePasswordForm = styled.form`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const InlinePasswordInput = styled.input`
  border-radius: 5px;
  font-size: 14px;
  width: 150px;
  outline: none;
  border: none;
  padding: 4px 8px;
  font-family: Tahoma, Arial, sans-serif;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #888;
  }
`;

const InlinePasswordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  box-shadow: none;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;

  img {
    width: auto;
    height: 24px;
    display: block;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  .mobile-device & {
    align-items: center;
  }
`;

const PasswordForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 18px;

  .mobile-device & {
    margin-left: 0;
    flex-direction: column;
    width: 100%;
    max-width: 200px;
  }
`;

const PasswordInput = styled.input`
  padding: 6px 10px;
  font-size: 14px;
  border: 2px solid #4a6ea5;
  border-radius: 3px;
  background: #fff;
  color: #000;
  width: 180px;
  font-family: Tahoma, Arial, sans-serif;

  &:focus {
    outline: none;
    border-color: #fdbd32;
  }

  &::placeholder {
    color: #888;
  }

  .mobile-device & {
    width: 100%;
  }
`;

const PasswordButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const PasswordSubmitButton = styled.button`
  padding: 6px 12px;
  font-size: 14px;
  background: linear-gradient(180deg, #5b8fd8, #3366b3);
  border: 1px solid #2a4f8a;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: linear-gradient(180deg, #6b9fe8, #4376c3);
  }

  &:active {
    background: linear-gradient(180deg, #3366b3, #2a4f8a);
  }
`;

const PasswordError = styled.div`
  color: #ffcc00;
  font-size: 12px;
  margin-left: 18px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);

  .mobile-device & {
    margin-left: 0;
    text-align: center;
  }
`;

const BackToUsersLink = styled.a`
  color: #fff;
  font-size: 12px;
  margin-left: 18px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: #fdbd32;
  }

  .mobile-device & {
    margin-left: 0;
  }
`;

const TurnOffContainer = styled.div`
  position: absolute;
  bottom: 35px;
  left: 50px;
  display: flex;
  align-items: center;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 0.3s ease;

  /* Hide on mobile */
  .mobile-device & {
    display: none;
  }
`;

const TurnOffButton = styled.div`
  display: inline-flex;
  align-items: center;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);

  img {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    transition: filter 0.1s ease;
  }

  span {
    padding: 0 6px;
  }

  &:hover img {
    filter: brightness(1.3);
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

  /* Mobile: center and simplify */
  .mobile-device & {
    right: 0;
    left: 0;
    text-align: center;
    align-items: center;
    width: 100vw;
    margin: 0 auto;
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
