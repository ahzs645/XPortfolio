import styled from 'styled-components';

// Layout components
export const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const ContentArea = styled.div`
  flex: 1;
  background: linear-gradient(180deg, #5a7edc 0%, #3c5eb5 50%, #2a4a9a 100%);
  overflow-y: auto;
`;

export const ContentPane = styled.div`
  padding: 16px 20px;
  background: #fff;
  min-height: 100%;
`;

export const BlueContentPane = styled.div`
  padding: 0;
  min-height: 100%;
`;

// Header components
export const ContentHeader = styled.div`
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

export const PageTitle = styled.h1`
  margin: 0 0 20px 0;
  padding: 10px 0;
  font-size: 24px;
  font-weight: normal;
  color: #7294DF;
  border-bottom: none;
  font-family: sans-serif;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  padding: 20px 30px 10px;
  font-size: 22px;
  font-weight: normal;
  font-style: italic;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-family: 'Franklin Gothic Medium', 'Trebuchet MS', sans-serif;
`;

// Task links
export const TaskLinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 30px 20px 50px;
`;

export const BlueTaskLink = styled.a`
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

export const TaskLink = styled.a`
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

export const TasksContainer = styled.div`
  display: flex;
  gap: 40px;
`;

export const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

// User components
export const UsersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 30px 30px;
`;

export const UserCard = styled.div`
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

export const UserAvatar = styled.img`
  width: ${({ $large }) => $large ? '64px' : '48px'};
  height: ${({ $large }) => $large ? '64px' : '48px'};
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  object-fit: cover;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

export const GuestAvatar = styled.div`
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

export const UserInfo = styled.div`
  flex: 1;
`;

export const UserName = styled.div`
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
`;

export const UserType = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
`;

export const UserPreview = styled.div`
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

// Form components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
`;

export const FormLabel = styled.label`
  font-size: 12px;
  color: #000;
`;

export const FormInput = styled.input`
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 12px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const ActionButton = styled.button`
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

export const ErrorText = styled.div`
  color: #c00;
  font-size: 11px;
  margin-top: 4px;
`;

export const SuccessText = styled.div`
  color: #080;
  font-size: 11px;
  margin-top: 4px;
`;

export const PasswordHint = styled.p`
  font-size: 12px;
  color: #000;
  margin: 0 0 16px 0;
  max-width: 450px;
  line-height: 1.4;
`;

// Picture selection
export const CurrentPictureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #0054e3;
  font-size: 12px;
`;

export const PicturesGrid = styled.div`
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

export const PictureOption = styled.label`
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

// Warning/Delete components
export const DeleteWarning = styled.div`
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

export const WarningIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

// Account type selection
export const AccountTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;
`;

export const AccountTypeOption = styled.div`
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

// Wizard components
export const WizardContentPane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #fff;
`;

export const WizardTitle = styled.h1`
  margin: 0;
  padding: 30px 30px 20px;
  font-size: 24px;
  font-weight: normal;
  color: #0054e3;
  font-family: 'Franklin Gothic Medium', 'Trebuchet MS', sans-serif;
`;

export const WizardBody = styled.div`
  flex: 1;
  padding: 0 30px;

  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

export const WizardLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #000;
  margin-bottom: 8px;
`;

export const WizardInput = styled.input`
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

export const WizardHelpText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 12px 0 0;
`;

export const WizardLink = styled.span`
  color: #0054e3;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0066ff;
  }
`;

export const WizardButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 8px;
  padding-left: 20px;

  .field-row {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding: 0;

    input[type="radio"] {
      margin: 0;
      padding: 0;
      vertical-align: middle;
    }

    label {
      font-size: 12px;
      color: #000;
      cursor: pointer;
      margin: 0;
      padding: 0;
      line-height: 1;
      vertical-align: middle;
    }
  }
`;

export const AccountTypeDescription = styled.div`
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

export const WarningText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 12px 0;
  line-height: 1.5;
`;

// Password form specific components
export const PasswordFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 500px;
`;

export const PasswordFormInput = styled.input`
  padding: 3px 4px;
  border: 1px solid #000;
  font-size: 12px;
  font-family: inherit;
  width: 100%;
  max-width: 450px;
  margin-bottom: 8px;

  &:focus {
    outline: none;
  }
`;

export const PasswordHelperText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 4px 0 12px 0;
  line-height: 1.4;
`;

export const PasswordHintLabel = styled.label`
  font-size: 12px;
  color: #000;

  a {
    color: #0066cc;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: #0044aa;
    }
  }
`;

export const BlueDivider = styled.div`
  height: 1px;
  margin: 16px 0 12px 0;
  background: linear-gradient(to left, #215DC6 0%, #215DC6 40%, transparent 100%);
`;

export const RightAlignedButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
