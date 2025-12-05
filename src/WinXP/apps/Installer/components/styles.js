import styled from 'styled-components';

// Container and Layout
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #fff 0%, #ece9d8 100%);
  border-bottom: 1px solid #aca899;
`;

export const HeaderIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;

export const HeaderText = styled.h1`
  font-size: 16px;
  font-weight: bold;
  color: #003399;
  margin: 0;
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #7f9db9;
  margin: 8px;
  border-radius: 2px;
`;

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f4ef;
  border-bottom: 1px solid #d4d4d4;
  font-size: 11px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #ece9d8;
  border-top: 1px solid #aca899;
`;

// Sidebar Styles
export const SidebarContainer = styled.div`
  width: 140px;
  background: #f5f4ef;
  border-right: 1px solid #aca899;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SidebarItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  background: ${props => props.$active ? 'linear-gradient(to bottom, #fff 0%, #e8e8e8 100%)' : 'transparent'};
  border-color: ${props => props.$active ? '#d8d8d8' : 'transparent'};
  box-shadow: ${props => props.$active ? 'inset 0 1px 0 #fff' : 'none'};

  &:hover {
    background: linear-gradient(to bottom, #fafafa 0%, #e8e8e8 100%);
    border-color: #d8d8d8;
  }
`;

export const SidebarIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

export const SidebarLabel = styled.span`
  font-size: 11px;
  color: #003399;
  line-height: 1.3;
`;

export const SidebarDivider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #aca899, transparent);
  margin: 8px 0;
`;

export const SidebarInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-align: center;
  margin-top: auto;
`;

export const InfoIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  opacity: 0.7;
`;

export const InfoText = styled.span`
  font-size: 10px;
  color: #666;
  line-height: 1.4;
`;

// Buttons
export const Button = styled.button`
  padding: 4px 16px;
  font-size: 11px;
  font-family: inherit;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #e8e8e8 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  cursor: pointer;
  color: #000;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #fff 0%, #e8e8e8 50%, #dadada 51%, #efefef 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(to bottom, #cfcfcf 0%, #d8d8d8 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerButton = styled(Button)`
  background: linear-gradient(to bottom, #ff9999 0%, #ff6666 50%, #ff4444 51%, #ff6666 100%);
  border-color: #cc0000;
  color: #fff;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #ffaaaa 0%, #ff7777 50%, #ff5555 51%, #ff7777 100%);
  }
`;

export const PrimaryButton = styled(Button)`
  background: linear-gradient(to bottom, #6699ff 0%, #3366cc 50%, #2255bb 51%, #3366cc 100%);
  border-color: #003399;
  color: #fff;
  font-weight: bold;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #77aaff 0%, #4477dd 50%, #3366cc 51%, #4477dd 100%);
  }
`;

export const CloseButton = styled(Button)`
  padding: 4px 20px;
`;

// Form Elements
export const Input = styled.input`
  flex: 1;
  padding: 5px 8px;
  font-size: 11px;
  font-family: inherit;
  border: 1px solid #7f9db9;
  border-radius: 2px;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }

  &:disabled {
    background: #f0f0f0;
  }
`;

export const Select = styled.select`
  font-size: 11px;
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  padding: 3px 18px 3px 4px;
  min-height: 21px;
  background: #fff;
  border: none;
  box-shadow:
    inset -1px -1px 0 #fff,
    inset 1px 1px 0 #7f9db9,
    inset -2px -2px 0 #f0f0f0,
    inset 2px 2px 0 #a0a0a0;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='17' viewBox='0 0 16 17'%3E%3Crect x='0' y='0' width='16' height='17' fill='%23f0f0f0'/%3E%3Crect x='0' y='0' width='15' height='16' fill='%23fff'/%3E%3Crect x='1' y='1' width='14' height='15' fill='%23dfdfdf'/%3E%3Crect x='1' y='1' width='13' height='14' fill='%23f0f0f0'/%3E%3Cpolygon points='4,6 12,6 8,11' fill='%23000'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 top 0;
  cursor: pointer;

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }

  &:disabled {
    background-color: #f0f0f0;
    color: #888;
    cursor: not-allowed;
  }

  option {
    padding: 2px 4px;
    background: #fff;
    color: #000;
  }

  option:hover,
  option:checked {
    background: #316ac5;
    color: #fff;
  }
`;

// Status Messages
export const StatusMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  border-radius: 3px;
  margin-bottom: 12px;
  font-size: 11px;
  line-height: 1.4;

  ${props => props.$error && `
    background: #fff0f0;
    border: 1px solid #ffcccc;
    color: #cc0000;
  `}

  ${props => props.$success && `
    background: #f0fff0;
    border: 1px solid #ccffcc;
    color: #008000;
  `}

  ${props => props.$warning && `
    background: #fff9e6;
    border: 1px solid #ffcc00;
    color: #996600;
  `}

  ${props => props.$info && `
    background: #f0f8ff;
    border: 1px solid #99ccff;
    color: #003399;
  `}
`;

export const StatusIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

// Program List
export const ProgramList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px;
`;

export const ProgramItem = styled.div`
  border: 1px solid ${props => props.$expanded ? '#7f9db9' : '#e0e0e0'};
  border-radius: 2px;
  margin-bottom: 4px;
  background: ${props => props.$expanded ? '#f5f9ff' : '#fff'};
  cursor: pointer;

  &:hover {
    background: ${props => props.$expanded ? '#f5f9ff' : '#f8f8f8'};
  }
`;

export const ProgramHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 10px;
`;

export const ProgramIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

export const ProgramInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProgramName = styled.div`
  font-weight: bold;
  font-size: 12px;
  color: #003399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProgramMeta = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

export const ProgramDetails = styled.div`
  padding: 10px 12px;
  border-top: 1px solid #d4d4d4;
  background: #fafafa;
`;

export const DetailRow = styled.div`
  display: flex;
  margin-bottom: 4px;
  font-size: 11px;
`;

export const DetailLabel = styled.span`
  width: 80px;
  color: #666;
  flex-shrink: 0;
`;

export const DetailValue = styled.span`
  color: #333;
  word-break: break-all;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
`;

// Empty State
export const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;

  p {
    margin: 4px 0;
  }
`;

export const EmptyIcon = styled.img`
  width: 48px;
  height: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
`;

// Sort Control
export const SortControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    color: #666;
  }
`;

// Section Styles
export const Section = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

export const SectionIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

export const SectionContent = styled.div`
  flex: 1;
`;

export const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: bold;
  color: #003399;
  margin: 0 0 8px 0;
`;

export const SectionDesc = styled.p`
  font-size: 11px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 16px 0;

  code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 2px;
    font-family: 'Consolas', monospace;
    font-size: 10px;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 12px;
`;

export const InputLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
`;

export const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

// Preview Card
export const PreviewCard = styled.div`
  background: #fff;
  border: 1px solid #7f9db9;
  border-radius: 3px;
  padding: 16px;
  margin-top: 16px;
`;

export const PreviewHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export const PreviewIcon = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

export const PreviewInfo = styled.div``;

export const PreviewName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #003399;
`;

export const PreviewAuthor = styled.div`
  font-size: 11px;
  color: #666;
`;

export const PreviewVersion = styled.div`
  font-size: 10px;
  color: #999;
`;

export const PreviewDesc = styled.p`
  font-size: 11px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 12px 0;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 2px;
`;

export const PreviewMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 2px;
  margin-bottom: 12px;
`;

export const MetaItem = styled.div`
  font-size: 10px;
`;

export const MetaLabel = styled.span`
  color: #666;
`;

export const MetaValue = styled.span`
  color: #333;
  margin-left: 4px;
`;

// Scrollable Content
export const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

// Defaults/Settings Styles
export const SettingsGroup = styled.div`
  background: #fff;
  border: 1px solid #d4d4d4;
  border-radius: 3px;
  margin-bottom: 12px;
`;

export const SettingsGroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(to bottom, #f8f8f8 0%, #e8e8e8 100%);
  border-bottom: 1px solid #d4d4d4;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to bottom, #fff 0%, #f0f0f0 100%);
  }
`;

export const SettingsGroupIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const SettingsGroupTitle = styled.span`
  font-weight: bold;
  font-size: 12px;
  color: #003399;
  flex: 1;
`;

export const SettingsGroupContent = styled.div`
  padding: 12px;
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const SettingsLabel = styled.span`
  width: 120px;
  font-size: 11px;
  color: #333;
  flex-shrink: 0;
`;

export const SettingsValue = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FileTypeIcon = styled.img`
  width: 16px;
  height: 16px;
`;

export const FileTypeLabel = styled.span`
  font-size: 11px;
  color: #666;
  min-width: 60px;
`;
