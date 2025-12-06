import {
  ContentPane,
  PageTitle,
  FormGroup,
  FormLabel,
  FormInput,
  ButtonRow,
  ActionButton,
  ErrorText,
  SuccessText,
  PasswordHint,
  CurrentPictureRow,
  PicturesGrid,
  PictureOption,
  DeleteWarning,
  WarningIcon,
  AccountTypeOptions,
  AccountTypeOption,
  UserAvatar,
  PasswordFormGroup,
  PasswordFormInput,
  PasswordHelperText,
  PasswordHintLabel,
  BlueDivider,
  RightAlignedButtonRow,
} from '../styles';

// Change Name View
export function ChangeNameView({
  selectedUser,
  formData,
  setFormData,
  error,
  success,
  onSubmit,
  onCancel,
}) {
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
          <ActionButton onClick={onSubmit}>Change Name</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </ButtonRow>
      </FormGroup>
    </ContentPane>
  );
}

// Change Picture View
export function ChangePictureView({
  selectedUser,
  availablePictures,
  error,
  success,
  onChangePicture,
  onCancel,
}) {
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
              onChange={() => onChangePicture(pic.path)}
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
        <ActionButton onClick={onCancel}>Cancel</ActionButton>
      </ButtonRow>
    </ContentPane>
  );
}

// Create Password View
export function CreatePasswordView({
  selectedUser,
  formData,
  setFormData,
  error,
  success,
  onSubmit,
  onCancel,
}) {
  return (
    <ContentPane>
      <PageTitle>Create a password for your account</PageTitle>
      <PasswordFormGroup>
        <FormLabel>Type a new password:</FormLabel>
        <PasswordFormInput
          type="password"
          value={formData.newPassword || ''}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          autoFocus
        />
        <FormLabel>Type the new password again to confirm:</FormLabel>
        <PasswordFormInput
          type="password"
          value={formData.confirmPassword || ''}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        <PasswordHelperText>
          If your password contains capital letters, be sure to type them the same way every time
          you log on.
        </PasswordHelperText>
        <PasswordHintLabel>
          Type a word or phrase to use as a <a>password hint:</a>
        </PasswordHintLabel>
        <PasswordFormInput
          type="text"
          value={formData.passwordHint || ''}
          onChange={(e) => setFormData({ ...formData, passwordHint: e.target.value })}
        />
        <PasswordHelperText>
          The password hint will be visible to everyone who uses this computer.
        </PasswordHelperText>
        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}
        <BlueDivider />
        <RightAlignedButtonRow>
          <ActionButton onClick={onSubmit}>Create Password</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </RightAlignedButtonRow>
      </PasswordFormGroup>
    </ContentPane>
  );
}

// Change Password View
export function ChangePasswordView({
  selectedUser,
  activeUserId,
  formData,
  setFormData,
  error,
  success,
  onSubmit,
  onCancel,
}) {
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
          <ActionButton onClick={onSubmit}>Change Password</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </ButtonRow>
      </FormGroup>
    </ContentPane>
  );
}

// Remove Password View
export function RemovePasswordView({
  selectedUser,
  activeUserId,
  formData,
  setFormData,
  error,
  success,
  onSubmit,
  onCancel,
}) {
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
          <ActionButton onClick={onSubmit}>Remove Password</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </ButtonRow>
      </FormGroup>
    </ContentPane>
  );
}

// Delete Account View
export function DeleteAccountView({
  selectedUser,
  error,
  success,
  onDelete,
  onCancel,
}) {
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
        <ActionButton onClick={onDelete}>Delete Files</ActionButton>
        <ActionButton onClick={onDelete}>Keep Files</ActionButton>
        <ActionButton onClick={onCancel}>Cancel</ActionButton>
      </ButtonRow>
    </ContentPane>
  );
}

// Change Account Type View
export function ChangeAccountTypeView({
  selectedUser,
  error,
  success,
  onChangeType,
  onCancel,
}) {
  return (
    <ContentPane>
      <PageTitle>Pick a new account type for {selectedUser?.name}</PageTitle>
      <FormGroup>
        <AccountTypeOptions>
          <AccountTypeOption
            $selected={selectedUser?.accountType === 'admin'}
            onClick={() => onChangeType('admin')}
          >
            <input
              type="radio"
              checked={selectedUser?.accountType === 'admin'}
              onChange={() => onChangeType('admin')}
            />
            <div>
              <strong>Computer administrator</strong>
              <p>You can change all computer settings, install programs, and access all files.</p>
            </div>
          </AccountTypeOption>
          <AccountTypeOption
            $selected={selectedUser?.accountType === 'limited'}
            onClick={() => onChangeType('limited')}
          >
            <input
              type="radio"
              checked={selectedUser?.accountType === 'limited'}
              onChange={() => onChangeType('limited')}
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
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </ButtonRow>
      </FormGroup>
    </ContentPane>
  );
}
