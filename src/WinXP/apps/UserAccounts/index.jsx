import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useUserAccounts } from '../../../contexts/UserAccountsContext';
import { ProgramLayout, TaskPanel } from '../../../components';

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
  CREATE_ACCOUNT_NAME: 'createAccountName',
  CREATE_ACCOUNT_TYPE: 'createAccountType',
  CHANGE_ACCOUNT_TYPE: 'changeAccountType',
};

function UserAccounts({ onClose, onMinimize, onMaximize, onOpenWindow }) {
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

  // Get toolbar items based on current navigation state
  const getToolbarItems = () => [
    {
      type: 'button',
      id: 'back',
      icon: '/gui/toolbar/back.webp',
      label: 'Back',
      disabled: historyIndex <= 0,
      action: 'nav:back'
    },
    {
      type: 'button',
      id: 'forward',
      icon: '/gui/toolbar/forward.webp',
      disabled: historyIndex >= history.length - 1,
      action: 'nav:forward'
    },
    { type: 'separator' },
    {
      type: 'button',
      id: 'home',
      icon: '/icons/xp/UserAccounts.png',
      label: 'Home',
      action: 'nav:home'
    },
  ];

  // Handle toolbar actions
  const handleToolbarAction = (action) => {
    switch (action) {
      case 'nav:back':
        goBack();
        break;
      case 'nav:forward':
        goForward();
        break;
      case 'nav:home':
        goHome();
        break;
      default:
        break;
    }
  };

  // Render sidebar using TaskPanel
  const renderSidebar = () => (
    <TaskPanel width={200}>
      <TaskPanel.Section title="Related Tasks" variant="primary">
        {view !== VIEW.HOME && (
          <TaskPanel.Item icon="/icons/xp/FolderClosed.png" onClick={goHome}>
            View all users
          </TaskPanel.Item>
        )}
        {isAdmin && view === VIEW.HOME && (
          <TaskPanel.Item icon="/icons/xp/Go.png" onClick={() => navigate(VIEW.CREATE_ACCOUNT_NAME)}>
            Create a new account
          </TaskPanel.Item>
        )}
        {view === VIEW.HOME && !isAdmin && (
          <TaskPanel.Text icon="/icons/xp/UserAccounts.png">
            Select an account to modify
          </TaskPanel.Text>
        )}
      </TaskPanel.Section>
      <TaskPanel.Section title="Learn About">
        <TaskPanel.Item icon="/icons/help.png" onClick={() => onOpenWindow?.('Help and Support')}>
          User accounts
        </TaskPanel.Item>
        <TaskPanel.Item icon="/icons/help.png" onClick={() => onOpenWindow?.('Help and Support')}>
          User account types
        </TaskPanel.Item>
        <TaskPanel.Item icon="/icons/help.png" onClick={() => onOpenWindow?.('Help and Support')}>
          Switching users
        </TaskPanel.Item>
      </TaskPanel.Section>
    </TaskPanel>
  );

  // Render main content based on view
  const renderContent = () => {
    switch (view) {
      case VIEW.HOME:
        return (
          <BlueContentPane>
            {/* Header with icon and title */}
            <ContentHeader>
              <img src="/icons/xp/UserAccounts.png" alt="" />
              <span>User Accounts</span>
            </ContentHeader>

            {/* Pick a task section */}
            <SectionTitle>Pick a task...</SectionTitle>
            <TaskLinksSection>
              <BlueTaskLink onClick={() => navigate(VIEW.PICK_TASK, users[0]?.id)}>
                <img src="/icons/xp/Go.png" alt="" />
                <span>Change an account</span>
              </BlueTaskLink>
              {isAdmin && (
                <BlueTaskLink onClick={() => navigate(VIEW.CREATE_ACCOUNT_NAME)}>
                  <img src="/icons/xp/Go.png" alt="" />
                  <span>Create a new account</span>
                </BlueTaskLink>
              )}
              <BlueTaskLink onClick={() => onOpenWindow?.('Help and Support')}>
                <img src="/icons/xp/Go.png" alt="" />
                <span>Change the way users log on or off</span>
              </BlueTaskLink>
            </TaskLinksSection>

            {/* Pick an account section */}
            <SectionTitle>or pick an account to change</SectionTitle>
            <UsersGrid>
              {users.map(user => (
                <UserCard
                  key={user.id}
                  onClick={() => navigate(VIEW.PICK_TASK, user.id)}
                  title={`Change this person's account\naccount type, name, password, or delete the\naccount.`}
                >
                  <UserAvatar src={user.picture} alt={user.name} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserType>{user.accountType === 'admin' ? 'Computer administrator' : 'Limited account'}</UserType>
                    {user.hasPassword && <UserType>Password protected</UserType>}
                  </UserInfo>
                </UserCard>
              ))}
              {/* Guest account */}
              <UserCard onClick={() => {}} title="Guest account is off">
                <GuestAvatar>
                  <img src="/icons/xp/UserAccounts.png" alt="Guest" />
                </GuestAvatar>
                <UserInfo>
                  <UserName>Guest</UserName>
                  <UserType>Guest account is off</UserType>
                </UserInfo>
              </UserCard>
            </UsersGrid>
          </BlueContentPane>
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

      case VIEW.CREATE_ACCOUNT_NAME:
        return (
          <WizardContentPane>
            <WizardTitle>Name the new account</WizardTitle>
            <WizardBody>
              <WizardLabel>Type a name for the new account:</WizardLabel>
              <WizardInput
                type="text"
                value={formData.newName || ''}
                onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                autoFocus
              />
              <WizardHelpText>
                This name will appear on the <WizardLink>Welcome screen</WizardLink> and on the <WizardLink>Start menu</WizardLink>.
              </WizardHelpText>
              {error && <ErrorText>{error}</ErrorText>}
            </WizardBody>
            <WizardFooter>
              <WizardButtonRow>
                <ActionButton
                  onClick={() => {
                    if (!formData.newName?.trim()) {
                      setError('Please enter a name');
                      return;
                    }
                    setError(null);
                    // Keep formData and navigate to next step
                    const newHistory = history.slice(0, historyIndex + 1);
                    newHistory.push(VIEW.CREATE_ACCOUNT_TYPE);
                    setHistory(newHistory);
                    setHistoryIndex(newHistory.length - 1);
                    setView(VIEW.CREATE_ACCOUNT_TYPE);
                  }}
                >
                  Next &gt;
                </ActionButton>
                <ActionButton onClick={goHome}>Cancel</ActionButton>
              </WizardButtonRow>
            </WizardFooter>
          </WizardContentPane>
        );

      case VIEW.CREATE_ACCOUNT_TYPE:
        return (
          <WizardContentPane>
            <WizardTitle>Pick an account type</WizardTitle>
            <WizardBody>
              <fieldset>
                <RadioRow>
                  <div className="field-row">
                    <input
                      id="radio-admin"
                      type="radio"
                      name="accountType"
                      checked={formData.accountType === 'admin'}
                      onChange={() => setFormData({ ...formData, accountType: 'admin' })}
                    />
                    <label htmlFor="radio-admin">Computer administrator</label>
                  </div>
                  <div className="field-row">
                    <input
                      id="radio-limited"
                      type="radio"
                      name="accountType"
                      checked={formData.accountType !== 'admin'}
                      onChange={() => setFormData({ ...formData, accountType: 'limited' })}
                    />
                    <label htmlFor="radio-limited">Limited</label>
                  </div>
                </RadioRow>

                <AccountTypeDescription>
                  {formData.accountType === 'admin' ? (
                    <>
                      <p>With a computer administrator account, you can:</p>
                      <ul>
                        <li>Create, change, and delete accounts</li>
                        <li>Make system-wide changes</li>
                        <li>Install programs and access all files</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p>With a limited account, you can:</p>
                      <ul>
                        <li>Change or remove your password</li>
                        <li>Change your picture, theme, and other desktop settings</li>
                        <li>View files you created</li>
                        <li>View files in the Shared Documents folder</li>
                      </ul>
                      <WarningText>
                        Users with limited accounts cannot always install programs. Depending on the program, a user might need administrator privileges to install it.
                      </WarningText>
                      <WarningText>
                        Also, programs designed prior to Windows XP or Windows 2000 might not work properly with limited accounts. For best results, choose programs bearing the Designed for Windows XP logo, or, to run older programs, choose the "computer administrator" account type.
                      </WarningText>
                    </>
                  )}
                </AccountTypeDescription>
              </fieldset>

              {error && <ErrorText>{error}</ErrorText>}
              {success && <SuccessText>{success}</SuccessText>}
            </WizardBody>
            <WizardFooter>
              <WizardButtonRow>
                <ActionButton onClick={() => {
                  setHistoryIndex(historyIndex - 1);
                  setView(VIEW.CREATE_ACCOUNT_NAME);
                }}>
                  &lt; Back
                </ActionButton>
                <ActionButton onClick={handleCreateAccount}>Create Account</ActionButton>
                <ActionButton onClick={goHome}>Cancel</ActionButton>
              </WizardButtonRow>
            </WizardFooter>
          </WizardContentPane>
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
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      toolbarItems={getToolbarItems()}
      onToolbarAction={handleToolbarAction}
      showMenuBar={false}
      showAddressBar={false}
      showStatusBar={false}
    >
      <MainArea>
        {renderSidebar()}
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainArea>
    </ProgramLayout>
  );
}

// Styled components
const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  background: linear-gradient(180deg, #5a7edc 0%, #3c5eb5 50%, #2a4a9a 100%);
  overflow-y: auto;
`;

const ContentPane = styled.div`
  padding: 16px 20px;
  background: #fff;
  min-height: 100%;
`;

const BlueContentPane = styled.div`
  padding: 0;
  min-height: 100%;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(180deg, #6b8dd6 0%, #4a6fc4 100%);
  border-bottom: 1px solid #3a5ea8;

  img {
    width: 32px;
    height: 32px;
  }

  span {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding: 20px 30px 10px;
  font-size: 22px;
  font-weight: normal;
  font-style: italic;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-family: 'Franklin Gothic Medium', 'Trebuchet MS', sans-serif;
`;

const TaskLinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 30px 20px 50px;
`;

const BlueTaskLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  font-size: 13px;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    text-decoration: underline;
  }
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
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 30px 30px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 3px;
  border: 2px solid transparent;
  min-width: 200px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    border-color: #fff;
  }
`;

const UserAvatar = styled.img`
  width: ${({ $large }) => $large ? '64px' : '48px'};
  height: ${({ $large }) => $large ? '64px' : '48px'};
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  object-fit: cover;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const GuestAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: #8a8a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  img {
    width: 32px;
    height: 32px;
    filter: grayscale(100%) brightness(1.2);
    opacity: 0.8;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
`;

const UserType = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
`;

const CreateAccountLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
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

// Wizard styled components for Create Account flow
const WizardContentPane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #fff;
`;

const WizardTitle = styled.h1`
  margin: 0;
  padding: 30px 30px 20px;
  font-size: 24px;
  font-weight: normal;
  color: #0054e3;
  font-family: 'Franklin Gothic Medium', 'Trebuchet MS', sans-serif;
`;

const WizardBody = styled.div`
  flex: 1;
  padding: 0 30px;

  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

const WizardLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #000;
  margin-bottom: 8px;
`;

const WizardInput = styled.input`
  width: 300px;
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 12px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const WizardHelpText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 12px 0 0;
`;

const WizardLink = styled.span`
  color: #0054e3;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0066ff;
  }
`;

const WizardFooter = styled.div`
  padding: 16px 30px;
  border-top: 1px solid #d4d0c8;
  background: #f0f0f0;
`;

const WizardButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const RadioRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;

  .field-row {
    display: flex;
    align-items: center;
    gap: 6px;

    input[type="radio"] {
      margin: 0;
    }

    label {
      font-size: 12px;
      color: #000;
      cursor: pointer;
    }
  }
`;

const AccountTypeDescription = styled.div`
  font-size: 12px;
  color: #000;
  line-height: 1.5;

  p {
    margin: 0 0 8px 0;
  }

  ul {
    margin: 0 0 16px 0;
    padding-left: 24px;

    li {
      margin: 4px 0;
    }
  }
`;

const WarningText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 12px 0;
  line-height: 1.5;
`;

export default UserAccounts;
