import { Divider } from '../../../../components';
import {
  WizardContentPane,
  WizardTitle,
  WizardBody,
  WizardLabel,
  WizardInput,
  WizardHelpText,
  WizardLink,
  WizardButtonRow,
  ActionButton,
  ErrorText,
  SuccessText,
  RadioRow,
  AccountTypeDescription,
  WarningText,
} from '../styles';

// Step 1: Name the new account
export function CreateAccountNameView({
  formData,
  setFormData,
  error,
  setError,
  onNext,
  onCancel,
}) {
  const handleNext = () => {
    if (!formData.newName?.trim()) {
      setError('Please enter a name');
      return;
    }
    setError(null);
    onNext();
  };

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
        <Divider direction="left" />
        <WizardButtonRow>
          <ActionButton onClick={handleNext}>Next &gt;</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </WizardButtonRow>
      </WizardBody>
    </WizardContentPane>
  );
}

// Step 2: Pick an account type
export function CreateAccountTypeView({
  formData,
  setFormData,
  error,
  success,
  onBack,
  onCreate,
  onCancel,
}) {
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
          <Divider direction="right" />
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
        <Divider direction="left" />
        <WizardButtonRow>
          <ActionButton onClick={onBack}>&lt; Back</ActionButton>
          <ActionButton onClick={onCreate}>Create Account</ActionButton>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </WizardButtonRow>
      </WizardBody>
    </WizardContentPane>
  );
}
