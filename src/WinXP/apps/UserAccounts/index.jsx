import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useUserAccounts } from '../../../contexts/UserAccountsContext';

// Navigation history stack
const VIEW = {
  HOME: 'home',
  PICK_TASK: 'pickTask',
  CHANGE_NAME: 'changeName',
  CHANGE_PICTURE: 'changePicture',
  CHANGE_PASSWORD: 'changePassword',
  CREATE_PASSWORD: 'createPassword',
  REMOVE_PASSWORD: 'removePassword',
  DELETE_ACCOUNT: 'deleteAccount',
  CREATE_ACCOUNT: 'createAccount',
  CHANGE_ACCOUNT_TYPE: 'changeAccountType',
};

function UserAccounts({ onClose, onMinimize, onOpenWindow }) {
  const {
    users,
    getCurrentUser,
    activeUserId,
    changeUserName,
    changeUserPicture,
    changeUserPassword,
    createUserPassword,
    removeUserPassword,
    deleteUser,
    createUser,
    changeAccountType,
    availablePictures,
  } = useUserAccounts();

  const [view, setView] = useState(VIEW.HOME);
  const [history, setHistory] = useState([VIEW.HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const currentUser = getCurrentUser();
  const selectedUser = users.find(u => u.id === selectedUserId);
  const isAdmin = currentUser?.accountType === 'admin';

  // Navigation helpers
  const navigate = useCallback((newView, userId = null) => {
    if (userId) setSelectedUserId(userId);
    setError(null);
    setSuccess(null);
    setFormData({});

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newView);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setView(newView);
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setView(history[historyIndex - 1]);
      setError(null);
      setSuccess(null);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setView(history[historyIndex + 1]);
      setError(null);
      setSuccess(null);
    }
  }, [history, historyIndex]);

  const goHome = useCallback(() => {
    navigate(VIEW.HOME);
    setSelectedUserId(null);
  }, [navigate]);

  // Form handlers
  const handleChangeName = async () => {
    if (!formData.newName?.trim()) {
      setError('Please enter a name');
      return;
    }
    changeUserName(selectedUserId, formData.newName.trim());
    setSuccess('Name changed successfully');
    setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
  };

  const handleChangePicture = (picturePath) => {
    changeUserPicture(selectedUserId, picturePath);
    setSuccess('Picture changed successfully');
    setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
  };

  const handleChangePassword = async () => {
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = await changeUserPassword(selectedUserId, formData.currentPassword, formData.newPassword);
    if (result.success) {
      setSuccess('Password changed successfully');
      setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
    } else {
      setError(result.error);
    }
  };

  const handleCreatePassword = async () => {
    if (!formData.newPassword) {
      setError('Please enter a password');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = await createUserPassword(selectedUserId, formData.newPassword);
    if (result.success) {
      setSuccess('Password created successfully');
      setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
    } else {
      setError(result.error);
    }
  };

  const handleRemovePassword = async () => {
    const result = await removeUserPassword(selectedUserId, formData.currentPassword);
    if (result.success) {
      setSuccess('Password removed successfully');
      setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteAccount = () => {
    const result = deleteUser(selectedUserId);
    if (result.success) {
      setSuccess('Account deleted successfully');
      setTimeout(() => navigate(VIEW.HOME), 1000);
    } else {
      setError(result.error);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.newName?.trim()) {
      setError('Please enter a name');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    await createUser({
      name: formData.newName.trim(),
      picture: formData.picture || null,
      password: formData.password || null,
      accountType: formData.accountType || 'limited',
    });
    setSuccess('Account created successfully');
    setTimeout(() => navigate(VIEW.HOME), 1000);
  };

  const handleChangeAccountType = (newType) => {
    const result = changeAccountType(selectedUserId, newType);
    if (result.success) {
      setSuccess('Account type changed successfully');
      setTimeout(() => navigate(VIEW.PICK_TASK), 1000);
    } else {
      setError(result.error);
    }
  };

  // Render sidebar
  const renderSidebar = () => (
    <Sidebar>
      <SidebarPane>
        <SidebarTitle>Related Tasks</SidebarTitle>
        <SidebarLinks>
          {view !== VIEW.HOME && (
            <SidebarLink onClick={goHome}>
              <img src="/icons/xp/FolderClosed.png" alt="" />
              View all users
            </SidebarLink>
          )}
          {isAdmin && view === VIEW.HOME && (
            <SidebarLink onClick={() => navigate(VIEW.CREATE_ACCOUNT)}>
              <img src="/icons/xp/Go.png" alt="" />
              Create a new account
            </SidebarLink>
          )}
        </SidebarLinks>
      </SidebarPane>
      <SidebarPane>
        <SidebarTitle>Learn About</SidebarTitle>
        <SidebarLinks>
          <SidebarLink onClick={() => onOpenWindow?.('Help and Support')}>
            <img src="/icons/help.png" alt="" />
            User accounts
          </SidebarLink>
          <SidebarLink onClick={() => onOpenWindow?.('Help and Support')}>
            <img src="/icons/help.png" alt="" />
            User account types
          </SidebarLink>
          <SidebarLink onClick={() => onOpenWindow?.('Help and Support')}>
            <img src="/icons/help.png" alt="" />
            Switching users
          </SidebarLink>
        </SidebarLinks>
      </SidebarPane>
    </Sidebar>
  );

  // Render main content based on view
  const renderContent = () => {
    switch (view) {
      case VIEW.HOME:
        return (
          <ContentPane>
            <PageTitle>Pick an account to change</PageTitle>
            <UsersGrid>
              {users.map(user => (
                <UserCard key={user.id} onClick={() => navigate(VIEW.PICK_TASK, user.id)}>
                  <UserAvatar src={user.picture} alt={user.name} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserType>
                      {user.accountType === 'admin' ? 'Computer administrator' : 'Limited account'}
                      {user.hasPassword && ' • Password protected'}
                    </UserType>
                  </UserInfo>
                </UserCard>
              ))}
            </UsersGrid>
            {isAdmin && (
              <CreateAccountLink onClick={() => navigate(VIEW.CREATE_ACCOUNT)}>
                <img src="/icons/xp/Go.png" alt="" height="16" />
                Create a new account
              </CreateAccountLink>
            )}
          </ContentPane>
        );

      case VIEW.PICK_TASK:
        return (
          <ContentPane>
            <PageTitle>What do you want to change about {selectedUser?.name}'s account?</PageTitle>
            <TasksContainer>
              <TasksList>
                <TaskLink onClick={() => navigate(VIEW.CHANGE_NAME)}>
                  <img src="/icons/xp/Go.png" alt="" height="16" />
                  Change the name
                </TaskLink>
                <TaskLink onClick={() => navigate(VIEW.CHANGE_PICTURE)}>
                  <img src="/icons/xp/Go.png" alt="" height="16" />
                  Change the picture
                </TaskLink>
                {selectedUser?.hasPassword ? (
                  <>
                    <TaskLink onClick={() => navigate(VIEW.CHANGE_PASSWORD)}>
                      <img src="/icons/xp/Go.png" alt="" height="16" />
                      Change the password
                    </TaskLink>
                    <TaskLink onClick={() => navigate(VIEW.REMOVE_PASSWORD)}>
                      <img src="/icons/xp/Go.png" alt="" height="16" />
                      Remove the password
                    </TaskLink>
                  </>
                ) : (
                  <TaskLink onClick={() => navigate(VIEW.CREATE_PASSWORD)}>
                    <img src="/icons/xp/Go.png" alt="" height="16" />
                    Create a password
                  </TaskLink>
                )}
                {isAdmin && (
                  <TaskLink onClick={() => navigate(VIEW.CHANGE_ACCOUNT_TYPE)}>
                    <img src="/icons/xp/Go.png" alt="" height="16" />
                    Change the account type
                  </TaskLink>
                )}
                {isAdmin && selectedUserId !== activeUserId && (
                  <TaskLink onClick={() => navigate(VIEW.DELETE_ACCOUNT)}>
                    <img src="/icons/xp/Go.png" alt="" height="16" />
                    Delete the account
                  </TaskLink>
                )}
              </TasksList>
              <UserPreview>
                <UserAvatar src={selectedUser?.picture} alt={selectedUser?.name} />
                <div>
                  <strong>{selectedUser?.name}</strong>
                  <br />
                  {selectedUser?.accountType === 'admin' ? 'Computer administrator' : 'Limited account'}
                </div>
              </UserPreview>
            </TasksContainer>
          </ContentPane>
        );

      case VIEW.CHANGE_NAME:
        return (
          <ContentPane>
            <PageTitle>Change {selectedUser?.name}'s name</PageTitle>
            <FormGroup>
              <FormLabel>Type a new name for {selectedUser?.name}:</FormLabel>
              <FormInput
                type="text"
                value={formData.newName || ''}
                onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                placeholder={selectedUser?.name}
                autoFocus
              />
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={handleChangeName}>Change Name</ActionButton>
                <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      case VIEW.CHANGE_PICTURE:
        return (
          <ContentPane>
            <PageTitle>Pick a new picture for {selectedUser?.name}'s account</PageTitle>
            <CurrentPictureRow>
              <UserAvatar src={selectedUser?.picture} alt={selectedUser?.name} $large />
              <div>
                <strong>{selectedUser?.name}</strong>
                <br />
                Current picture
              </div>
            </CurrentPictureRow>
            <PicturesGrid>
              {availablePictures.map(pic => (
                <PictureOption
                  key={pic.id}
                  $selected={selectedUser?.picture === pic.path}
                >
                  <input
                    type="radio"
                    name="UserPicture"
                    value={pic.id}
                    checked={selectedUser?.picture === pic.path}
                    onChange={() => handleChangePicture(pic.path)}
                  />
                  <img
                    src={pic.path}
                    alt={pic.name}
                    className={selectedUser?.picture === pic.path ? 'active' : ''}
                  />
                </PictureOption>
              ))}
            </PicturesGrid>
            {error && <ErrorText>{error}</ErrorText>}
            {success && <SuccessText>{success}</SuccessText>}
            <ButtonRow>
              <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
            </ButtonRow>
          </ContentPane>
        );

      case VIEW.CREATE_PASSWORD:
        return (
          <ContentPane>
            <PageTitle>Create a password for {selectedUser?.name}'s account</PageTitle>
            <PasswordHint>
              You are creating a password for {selectedUser?.name}. If you do this, {selectedUser?.name} will
              lose all personal certificates and stored passwords for Web sites or network resources.
            </PasswordHint>
            <FormGroup>
              <FormLabel>Type a new password:</FormLabel>
              <FormInput
                type="password"
                value={formData.newPassword || ''}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                autoFocus
              />
              <FormLabel>Type the new password again to confirm:</FormLabel>
              <FormInput
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <FormLabel>Type a word or phrase to use as a password hint:</FormLabel>
              <FormInput
                type="text"
                value={formData.passwordHint || ''}
                onChange={(e) => setFormData({ ...formData, passwordHint: e.target.value })}
                placeholder="Optional"
              />
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={handleCreatePassword}>Create Password</ActionButton>
                <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      case VIEW.CHANGE_PASSWORD:
        return (
          <ContentPane>
            <PageTitle>Change {selectedUser?.name}'s password</PageTitle>
            <FormGroup>
              {selectedUser?.id === activeUserId && (
                <>
                  <FormLabel>Type your current password:</FormLabel>
                  <FormInput
                    type="password"
                    value={formData.currentPassword || ''}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    autoFocus
                  />
                </>
              )}
              <FormLabel>Type a new password:</FormLabel>
              <FormInput
                type="password"
                value={formData.newPassword || ''}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                autoFocus={selectedUser?.id !== activeUserId}
              />
              <FormLabel>Type the new password again to confirm:</FormLabel>
              <FormInput
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={handleChangePassword}>Change Password</ActionButton>
                <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      case VIEW.REMOVE_PASSWORD:
        return (
          <ContentPane>
            <PageTitle>Remove {selectedUser?.name}'s password</PageTitle>
            <PasswordHint>
              Are you sure you want to remove {selectedUser?.name}'s password?
              {selectedUser?.id === activeUserId && ' You will need to enter your current password to confirm.'}
            </PasswordHint>
            <FormGroup>
              {selectedUser?.id === activeUserId && (
                <>
                  <FormLabel>Type your current password:</FormLabel>
                  <FormInput
                    type="password"
                    value={formData.currentPassword || ''}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    autoFocus
                  />
                </>
              )}
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={handleRemovePassword}>Remove Password</ActionButton>
                <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      case VIEW.DELETE_ACCOUNT:
        return (
          <ContentPane>
            <PageTitle>Do you want to keep {selectedUser?.name}'s files?</PageTitle>
            <DeleteWarning>
              <WarningIcon src="/icons/xp/Critical.png" alt="Warning" />
              <div>
                <p>Before you delete {selectedUser?.name}'s account, Windows can automatically
                save the contents of {selectedUser?.name}'s desktop and My Documents folder to a
                new folder called "{selectedUser?.name}" on your desktop.</p>
                <p>However, Windows cannot save {selectedUser?.name}'s e-mail messages, Internet
                favorites, and other settings.</p>
              </div>
            </DeleteWarning>
            {error && <ErrorText>{error}</ErrorText>}
            {success && <SuccessText>{success}</SuccessText>}
            <ButtonRow>
              <ActionButton onClick={handleDeleteAccount}>Delete Files</ActionButton>
              <ActionButton onClick={handleDeleteAccount}>Keep Files</ActionButton>
              <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
            </ButtonRow>
          </ContentPane>
        );

      case VIEW.CREATE_ACCOUNT:
        return (
          <ContentPane>
            <PageTitle>Name the new account</PageTitle>
            <FormGroup>
              <FormLabel>Type a name for the new user:</FormLabel>
              <FormInput
                type="text"
                value={formData.newName || ''}
                onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                placeholder="Name"
                autoFocus
              />
              <FormLabel style={{ marginTop: 20 }}>Pick an account type:</FormLabel>
              <AccountTypeOptions>
                <AccountTypeOption
                  $selected={formData.accountType === 'admin'}
                  onClick={() => setFormData({ ...formData, accountType: 'admin' })}
                >
                  <input
                    type="radio"
                    checked={formData.accountType === 'admin'}
                    onChange={() => setFormData({ ...formData, accountType: 'admin' })}
                  />
                  <div>
                    <strong>Computer administrator</strong>
                    <p>You can change all computer settings, install programs, and access all files.</p>
                  </div>
                </AccountTypeOption>
                <AccountTypeOption
                  $selected={formData.accountType !== 'admin'}
                  onClick={() => setFormData({ ...formData, accountType: 'limited' })}
                >
                  <input
                    type="radio"
                    checked={formData.accountType !== 'admin'}
                    onChange={() => setFormData({ ...formData, accountType: 'limited' })}
                  />
                  <div>
                    <strong>Limited</strong>
                    <p>You can change some settings and use most programs, but cannot install programs or make changes that affect other users.</p>
                  </div>
                </AccountTypeOption>
              </AccountTypeOptions>
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={handleCreateAccount}>Create Account</ActionButton>
                <ActionButton onClick={goHome}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      case VIEW.CHANGE_ACCOUNT_TYPE:
        return (
          <ContentPane>
            <PageTitle>Pick a new account type for {selectedUser?.name}</PageTitle>
            <FormGroup>
              <AccountTypeOptions>
                <AccountTypeOption
                  $selected={selectedUser?.accountType === 'admin'}
                  onClick={() => handleChangeAccountType('admin')}
                >
                  <input
                    type="radio"
                    checked={selectedUser?.accountType === 'admin'}
                    onChange={() => handleChangeAccountType('admin')}
                  />
                  <div>
                    <strong>Computer administrator</strong>
                    <p>You can change all computer settings, install programs, and access all files.</p>
                  </div>
                </AccountTypeOption>
                <AccountTypeOption
                  $selected={selectedUser?.accountType === 'limited'}
                  onClick={() => handleChangeAccountType('limited')}
                >
                  <input
                    type="radio"
                    checked={selectedUser?.accountType === 'limited'}
                    onChange={() => handleChangeAccountType('limited')}
                  />
                  <div>
                    <strong>Limited</strong>
                    <p>You can change some settings and use most programs, but cannot install programs or make changes that affect other users.</p>
                  </div>
                </AccountTypeOption>
              </AccountTypeOptions>
              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
              <ButtonRow>
                <ActionButton onClick={() => navigate(VIEW.PICK_TASK)}>Cancel</ActionButton>
              </ButtonRow>
            </FormGroup>
          </ContentPane>
        );

      default:
        return <ContentPane><PageTitle>User Accounts</PageTitle></ContentPane>;
    }
  };

  return (
    <Container>
      <NavBar>
        <NavButtons>
          <NavButton onClick={goBack} disabled={historyIndex <= 0}>
            <img src="/gui/toolbar/back.webp" alt="" height="24" />
            <span>Back</span>
          </NavButton>
          <NavButton onClick={goForward} disabled={historyIndex >= history.length - 1} $small>
            <img src="/gui/toolbar/forward.webp" alt="" height="24" />
          </NavButton>
          <NavButton onClick={goHome}>
            <img src="/icons/xp/ControlPanel.png" alt="" height="24" />
            <span>Home</span>
          </NavButton>
        </NavButtons>
      </NavBar>
      <MainArea>
        {renderSidebar()}
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainArea>
    </Container>
  );
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: Tahoma, 'MS Sans Serif', sans-serif;
  font-size: 11px;
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: linear-gradient(180deg, #f7f8fa 0%, #d6dfe9 100%);
  border-bottom: 1px solid #89a4c2;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  font-size: 11px;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.5);
    border-color: #c1d2ee;
  }

  img {
    width: ${({ $small }) => $small ? '20px' : '24px'};
    height: ${({ $small }) => $small ? '20px' : '24px'};
  }

  span {
    display: ${({ $small }) => $small ? 'none' : 'inline'};
  }
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 200px;
  background: linear-gradient(180deg, #6b92c2 0%, #5479af 50%, #6188bb 100%);
  padding: 12px;
  overflow-y: auto;
  flex-shrink: 0;
`;

const SidebarPane = styled.div`
  background: linear-gradient(180deg, #c6d7f1 0%, #d8e4f1 30%, #e5ecf5 100%);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
`;

const SidebarTitle = styled.div`
  font-weight: bold;
  color: #215dc6;
  margin-bottom: 8px;
  font-size: 11px;
`;

const SidebarLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SidebarLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #215dc6;
  text-decoration: none;
  cursor: pointer;
  font-size: 11px;

  &:hover {
    text-decoration: underline;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  background: #fff;
  overflow-y: auto;
`;

const ContentPane = styled.div`
  padding: 16px 20px;
`;

const PageTitle = styled.h1`
  margin: 0 0 20px 0;
  padding: 10px 0;
  font-size: 24px;
  font-weight: normal;
  color: #7294DF;
  border-bottom: none;
  font-family: sans-serif;
`;

const UsersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    background: #e8f0fa;
  }
`;

const UserAvatar = styled.img`
  width: ${({ $large }) => $large ? '64px' : '48px'};
  height: ${({ $large }) => $large ? '64px' : '48px'};
  border-radius: 3px;
  border: 1px solid #7f9db9;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 12px;
  color: #000;
`;

const UserType = styled.div`
  font-size: 11px;
  color: #666;
`;

const CreateAccountLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0054e3;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const TasksContainer = styled.div`
  display: flex;
  gap: 40px;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const TaskLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #7294DF;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

const UserPreview = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #7294DF;
  font-size: 12px;

  img {
    width: 55px;
    height: 55px;
    object-fit: cover;
    border-radius: 3px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  color: #000;
`;

const FormInput = styled.input`
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 12px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  padding: 4px 16px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }
`;

const ErrorText = styled.div`
  color: #c00;
  font-size: 11px;
  margin-top: 4px;
`;

const SuccessText = styled.div`
  color: #080;
  font-size: 11px;
  margin-top: 4px;
`;

const PasswordHint = styled.p`
  font-size: 12px;
  color: #000;
  margin: 0 0 16px 0;
  max-width: 450px;
  line-height: 1.4;
`;

const CurrentPictureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #0054e3;
  font-size: 12px;
`;

const PicturesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  max-width: 400px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #ccc;
  background: #fff;
`;

const PictureOption = styled.label`
  display: block;
  width: 48px;
  height: 48px;
  cursor: pointer;
  overflow: hidden;

  input {
    display: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 2px solid ${({ $selected }) => $selected ? '#316ac5' : '#ccc'};
    border-radius: 2px;
    transition: border-color 0.1s;

    &:hover {
      border-color: #7eb4ea;
    }
  }
`;

const DeleteWarning = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #ffffd5;
  border: 1px solid #c0c0a0;
  border-radius: 3px;

  p {
    margin: 0 0 8px 0;
    font-size: 12px;
    line-height: 1.4;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const WarningIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const AccountTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;
`;

const AccountTypeOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${({ $selected }) => $selected ? '#316ac5' : '#ccc'};
  border-radius: 3px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#e8f0fa' : '#fff'};

  &:hover {
    border-color: #7eb4ea;
  }

  input {
    margin-top: 2px;
  }

  div {
    flex: 1;

    strong {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
    }

    p {
      margin: 0;
      font-size: 11px;
      color: #666;
      line-height: 1.4;
    }
  }
`;

export default UserAccounts;
