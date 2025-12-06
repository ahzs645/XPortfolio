import { useState, useCallback } from 'react';
import { useUserAccounts } from '../../../contexts/UserAccountsContext';
import { ProgramLayout, TaskPanel } from '../../../components';
import { MainArea, ContentArea, ContentPane, PageTitle } from './styles';
import {
  HomeView,
  PickTaskView,
  CreateAccountNameView,
  CreateAccountTypeView,
  ChangeNameView,
  ChangePictureView,
  CreatePasswordView,
  ChangePasswordView,
  RemovePasswordView,
  DeleteAccountView,
  ChangeAccountTypeView,
} from './views';

// Navigation views
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
    // Reset history and go directly to home (no back to wizard)
    setHistory([VIEW.HOME]);
    setHistoryIndex(0);
    setView(VIEW.HOME);
    setFormData({});
    setError(null);
    setSuccess(null);
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

  // Wizard navigation (keeps formData)
  const navigateToAccountType = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(VIEW.CREATE_ACCOUNT_TYPE);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setView(VIEW.CREATE_ACCOUNT_TYPE);
  };

  const navigateBackToAccountName = () => {
    setHistoryIndex(historyIndex - 1);
    setView(VIEW.CREATE_ACCOUNT_NAME);
  };

  // Toolbar configuration
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

  // Sidebar
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

  // Main content
  const renderContent = () => {
    switch (view) {
      case VIEW.HOME:
        return (
          <HomeView
            users={users}
            isAdmin={isAdmin}
            onNavigate={navigate}
            onOpenWindow={onOpenWindow}
            VIEW={VIEW}
          />
        );

      case VIEW.PICK_TASK:
        return (
          <PickTaskView
            selectedUser={selectedUser}
            isAdmin={isAdmin}
            activeUserId={activeUserId}
            onNavigate={navigate}
            VIEW={VIEW}
          />
        );

      case VIEW.CHANGE_NAME:
        return (
          <ChangeNameView
            selectedUser={selectedUser}
            formData={formData}
            setFormData={setFormData}
            error={error}
            success={success}
            onSubmit={handleChangeName}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.CHANGE_PICTURE:
        return (
          <ChangePictureView
            selectedUser={selectedUser}
            availablePictures={availablePictures}
            error={error}
            success={success}
            onChangePicture={handleChangePicture}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.CREATE_PASSWORD:
        return (
          <CreatePasswordView
            selectedUser={selectedUser}
            formData={formData}
            setFormData={setFormData}
            error={error}
            success={success}
            onSubmit={handleCreatePassword}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.CHANGE_PASSWORD:
        return (
          <ChangePasswordView
            selectedUser={selectedUser}
            activeUserId={activeUserId}
            formData={formData}
            setFormData={setFormData}
            error={error}
            success={success}
            onSubmit={handleChangePassword}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.REMOVE_PASSWORD:
        return (
          <RemovePasswordView
            selectedUser={selectedUser}
            activeUserId={activeUserId}
            formData={formData}
            setFormData={setFormData}
            error={error}
            success={success}
            onSubmit={handleRemovePassword}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.DELETE_ACCOUNT:
        return (
          <DeleteAccountView
            selectedUser={selectedUser}
            error={error}
            success={success}
            onDelete={handleDeleteAccount}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
        );

      case VIEW.CREATE_ACCOUNT_NAME:
        return (
          <CreateAccountNameView
            formData={formData}
            setFormData={setFormData}
            error={error}
            setError={setError}
            onNext={navigateToAccountType}
            onCancel={goHome}
          />
        );

      case VIEW.CREATE_ACCOUNT_TYPE:
        return (
          <CreateAccountTypeView
            formData={formData}
            setFormData={setFormData}
            error={error}
            success={success}
            onBack={navigateBackToAccountName}
            onCreate={handleCreateAccount}
            onCancel={goHome}
          />
        );

      case VIEW.CHANGE_ACCOUNT_TYPE:
        return (
          <ChangeAccountTypeView
            selectedUser={selectedUser}
            error={error}
            success={success}
            onChangeType={handleChangeAccountType}
            onCancel={() => navigate(VIEW.PICK_TASK)}
          />
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

export default UserAccounts;
