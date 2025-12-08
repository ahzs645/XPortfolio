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
  // Format icons from WordPad
  bold: '/icons/xp/wordpad/bold.png',
  italic: '/icons/xp/wordpad/italic.png',
  underline: '/icons/xp/wordpad/underline.png',
  left: '/icons/xp/wordpad/left.png',
  center: '/icons/xp/wordpad/center.png',
  right: '/icons/xp/wordpad/right.png',
  list: '/icons/xp/wordpad/list.png',
};

function NewMessage({ onClose, onMinimize, onMaximize }) {
  const { getFullName, cvData } = useConfig();

  // Get email from CV data
  const ownerEmail = cvData?.cv?.email || 'me@example.com';
  const ownerName = getFullName();

  const [composeData, setComposeData] = useState({
    to: `${ownerName} <${ownerEmail}>`,
    from: '',
    cc: '',
    subject: '',
    message: '',
  });

  // Format state (visual only, not functional)
  const [fontName, setFontName] = useState('Arial');
  const [fontSize, setFontSize] = useState('10');

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

  // Multiple toolbars - main and format bar
  const toolbars = [
    {
      id: 'main-toolbar',
      items: [
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
      ],
    },
    {
      id: 'format-toolbar',
      variant: 'compact',
      items: [
        {
          type: 'select',
          id: 'font',
          value: fontName,
          options: [
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Verdana', label: 'Verdana' },
            { value: 'Tahoma', label: 'Tahoma' },
            { value: 'Courier New', label: 'Courier New' },
          ],
          width: 130,
          title: 'Font',
        },
        {
          type: 'select',
          id: 'size',
          value: fontSize,
          options: [
            { value: '8', label: '8' },
            { value: '10', label: '10' },
            { value: '12', label: '12' },
            { value: '14', label: '14' },
            { value: '16', label: '16' },
            { value: '18', label: '18' },
            { value: '24', label: '24' },
          ],
          width: 50,
          title: 'Size',
        },
        { type: 'separator' },
        {
          type: 'button',
          id: 'bold',
          icon: ICONS.bold,
          title: 'Bold',
          disabled: true,
        },
        {
          type: 'button',
          id: 'italic',
          icon: ICONS.italic,
          title: 'Italic',
          disabled: true,
        },
        {
          type: 'button',
          id: 'underline',
          icon: ICONS.underline,
          title: 'Underline',
          disabled: true,
        },
        { type: 'separator' },
        {
          type: 'button',
          id: 'left',
          icon: ICONS.left,
          title: 'Align Left',
          disabled: true,
        },
        {
          type: 'button',
          id: 'center',
          icon: ICONS.center,
          title: 'Center',
          disabled: true,
        },
        {
          type: 'button',
          id: 'right',
          icon: ICONS.right,
          title: 'Align Right',
          disabled: true,
        },
        { type: 'separator' },
        {
          type: 'button',
          id: 'list',
          icon: ICONS.list,
          title: 'Bullets',
          disabled: true,
        },
      ],
    },
  ];

  const handleMenuAction = useCallback((action) => {
    if (action === 'sendMessage') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleToolbarAction = useCallback((action) => {
    if (action === 'sendMessage') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleToolbarChange = useCallback((toolbarId, itemId, value) => {
    if (itemId === 'font') {
      setFontName(value);
    } else if (itemId === 'size') {
      setFontSize(value);
    }
  }, []);

  return (
    <ProgramLayout
      menus={menus}
      menuLogo={ICONS.flag}
      toolbars={toolbars}
      windowActions={windowActions}
      statusFields="Compose a new message"
      showStatusBar
      onMenuAction={handleMenuAction}
      onToolbarAction={handleToolbarAction}
      onToolbarChange={handleToolbarChange}
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
            <ComposeFieldIcon src={ICONS.envelope} alt="" />
            <ComposeLabel>From:</ComposeLabel>
            <ComposeInput
              type="email"
              name="from"
              value={composeData.from}
              onChange={handleComposeChange}
              placeholder="Your email address"
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
