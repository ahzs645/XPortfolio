import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import ProgramLayout from '../../../components/WindowBars/ProgramLayout';
import { useConfig } from '../../../contexts/ConfigContext';

const ICONS = {
  send: '/gui/toolbar/send.webp',
  cut: '/gui/toolbar/cut.webp',
  copy: '/gui/toolbar/copy.webp',
  paste: '/gui/toolbar/paste.webp',
  contacts: '/icons/outlook/contacts.png',
  envelope: '/icons/outlook/envelope.png',
  flag: '/icons/outlook/flag.png',
};

function NewMessage({ onClose, onMinimize, onMaximize }) {
  const { getFullName, cvData } = useConfig();

  // Get email from CV data
  const ownerEmail = cvData?.cv?.email || 'me@example.com';
  const ownerName = getFullName();

  const [composeData, setComposeData] = useState({
    to: `${ownerName} <${ownerEmail}>`,
    cc: '',
    subject: '',
    message: '',
  });

  const handleComposeChange = useCallback((e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSendMessage = useCallback(() => {
    // Create mailto link to send to owner
    const mailtoLink = `mailto:${ownerEmail}?subject=${encodeURIComponent(composeData.subject)}&body=${encodeURIComponent(composeData.message)}`;
    window.open(mailtoLink, '_blank');
    // Close the window after sending
    onClose?.();
  }, [ownerEmail, composeData.subject, composeData.message, onClose]);

  const windowActions = { onClose, onMinimize, onMaximize };

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Send Message', action: 'sendMessage' },
        { separator: true },
        { label: 'Save', disabled: true },
        { separator: true },
        { label: 'Close', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', disabled: true },
        { separator: true },
        { label: 'Cut', disabled: true },
        { label: 'Copy', disabled: true },
        { label: 'Paste', disabled: true },
        { separator: true },
        { label: 'Select All', disabled: true },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Toolbar', disabled: true },
        { label: 'Formatting Bar', disabled: true },
        { label: 'Status Bar', disabled: true },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { label: 'File Attachment...', disabled: true },
        { label: 'Signature', disabled: true },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        { label: 'Rich Text (HTML)', disabled: true },
        { label: 'Plain Text', disabled: true },
        { separator: true },
        { label: 'Font...', disabled: true },
        { label: 'Paragraph...', disabled: true },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { label: 'Spelling...', disabled: true },
        { separator: true },
        { label: 'Check Names', disabled: true },
      ],
    },
    {
      id: 'message',
      label: 'Message',
      items: [
        { label: 'Send Message', action: 'sendMessage' },
        { separator: true },
        { label: 'Set Priority', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Contents and Index', disabled: true },
        { separator: true },
        { label: 'About Outlook Express', disabled: true },
      ],
    },
  ];

  const toolbarItems = [
    {
      type: 'button',
      id: 'send',
      icon: ICONS.send,
      label: 'Send',
      action: 'sendMessage',
    },
    { type: 'separator' },
    {
      type: 'button',
      id: 'cut',
      icon: ICONS.cut,
      label: 'Cut',
      disabled: true,
    },
    {
      type: 'button',
      id: 'copy',
      icon: ICONS.copy,
      label: 'Copy',
      disabled: true,
    },
    {
      type: 'button',
      id: 'paste',
      icon: ICONS.paste,
      label: 'Paste',
      disabled: true,
    },
  ];

  const handleMenuAction = useCallback((action) => {
    if (action === 'sendMessage') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleToolbarAction = useCallback((action) => {
    handleMenuAction(action);
  }, [handleMenuAction]);

  return (
    <ProgramLayout
      menus={menus}
      menuLogo={ICONS.flag}
      toolbarItems={toolbarItems}
      windowActions={windowActions}
      statusFields="Compose a new message"
      showStatusBar
      onMenuAction={handleMenuAction}
      onToolbarAction={handleToolbarAction}
    >
      <ComposeContainer>
        <ComposeFieldsContainer>
          <ComposeField>
            <ComposeFieldIcon src={ICONS.contacts} alt="" />
            <ComposeLabel>To:</ComposeLabel>
            <ComposeInput
              type="text"
              name="to"
              value={composeData.to}
              readOnly
              className="readonly"
            />
          </ComposeField>
          <ComposeField>
            <ComposeFieldIcon src={ICONS.contacts} alt="" />
            <ComposeLabel>Cc:</ComposeLabel>
            <ComposeInput
              type="text"
              name="cc"
              value={composeData.cc}
              onChange={handleComposeChange}
              placeholder="Carbon copy recipients"
            />
          </ComposeField>
          <ComposeField>
            <ComposeFieldIcon src={ICONS.envelope} alt="" />
            <ComposeLabel>Subject:</ComposeLabel>
            <ComposeInput
              type="text"
              name="subject"
              value={composeData.subject}
              onChange={handleComposeChange}
              placeholder="Enter subject"
            />
          </ComposeField>
        </ComposeFieldsContainer>
        <ComposeFormatBar>
          <FormatSelect>
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Verdana</option>
            <option>Tahoma</option>
          </FormatSelect>
          <FormatSelect $small>
            <option>10</option>
            <option>12</option>
            <option>14</option>
            <option>16</option>
          </FormatSelect>
          <FormatDivider />
          <FormatButton title="Bold"><b>B</b></FormatButton>
          <FormatButton title="Italic"><i>I</i></FormatButton>
          <FormatButton title="Underline"><u>U</u></FormatButton>
          <FormatDivider />
          <FormatButton title="Align Left">&#8801;</FormatButton>
          <FormatButton title="Align Center">=</FormatButton>
          <FormatButton title="Align Right">&#8801;</FormatButton>
        </ComposeFormatBar>
        <ComposeTextArea
          name="message"
          value={composeData.message}
          onChange={handleComposeChange}
          placeholder="Type your message here..."
        />
      </ComposeContainer>
    </ProgramLayout>
  );
}

// Styled components
const ComposeContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #ece9d8;
  overflow: hidden;
`;

const ComposeFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-bottom: 1px solid #919b9c;
  padding: 4px 0;
`;

const ComposeField = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 8px;
  gap: 4px;
`;

const ComposeFieldIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

const ComposeLabel = styled.label`
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  min-width: 50px;
  color: #000;
`;

const ComposeInput = styled.input`
  flex: 1;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  background: #fff;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }

  &.readonly {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const ComposeFormatBar = styled.div`
  display: flex;
  align-items: center;
  background: #ece9d8;
  border-bottom: 1px solid #919b9c;
  padding: 2px 4px;
  gap: 2px;
`;

const FormatSelect = styled.select`
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  padding: 1px 2px;
  border: 1px solid #7f9db9;
  background: #fff;
  width: ${props => props.$small ? '50px' : '120px'};
`;

const FormatButton = styled.button`
  width: 22px;
  height: 22px;
  border: 1px solid transparent;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: Times New Roman, serif;
  font-size: 12px;

  &:hover {
    border: 1px solid #316ac5;
    background: #c1d2ee;
  }
`;

const FormatDivider = styled.div`
  width: 1px;
  height: 18px;
  background: #919b9c;
  margin: 0 4px;
`;

const ComposeTextArea = styled.textarea`
  flex: 1;
  font-family: Arial, sans-serif;
  font-size: 12px;
  padding: 8px;
  resize: none;
  background: #fff;
  margin: 4px;
  border: 2px inset #c7c5b2;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

export default NewMessage;
