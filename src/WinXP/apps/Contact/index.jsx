import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { ProgramLayout } from '../../../components';

// Menu configuration for Contact window
const CONTACT_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Send', action: 'sendMessage' },
      { separator: true },
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Cut', action: 'cut', disabled: true },
      { label: 'Copy', action: 'copy', disabled: true },
      { label: 'Paste', action: 'paste', disabled: true },
      { separator: true },
      { label: 'Select All', action: 'selectAll', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

// Toolbar configuration for Contact window
const CONTACT_TOOLBAR = [
  { type: 'button', id: 'send', icon: '/gui/toolbar/send.webp', label: 'Send', action: 'sendMessage' },
  { type: 'separator' },
  { type: 'button', id: 'cut', icon: '/gui/toolbar/cut.webp', label: 'Cut', disabled: true },
  { type: 'button', id: 'copy', icon: '/gui/toolbar/copy.webp', label: 'Copy', disabled: true },
  { type: 'button', id: 'paste', icon: '/gui/toolbar/paste.webp', label: 'Paste', disabled: true },
];

function Contact({ onClose, onMinimize, onMaximize, isFocus }) {
  const { getFullName, cvData } = useConfig();
  const [formData, setFormData] = useState({
    from: '',
    subject: '',
    message: '',
  });

  // Get email from CV data or use default
  const email = cvData?.cv?.email || 'me@example.com';
  const name = getFullName();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSend = useCallback(() => {
    // Create mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}`;
    window.open(mailtoLink, '_blank');
  }, [email, formData.subject, formData.message]);

  const handleToolbarAction = useCallback((action) => {
    if (action === 'sendMessage') {
      handleSend();
    }
  }, [handleSend]);

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={CONTACT_MENUS}
      menuLogo="/gui/toolbar/barlogo.webp"
      toolbarItems={CONTACT_TOOLBAR}
      onToolbarAction={handleToolbarAction}
      addressTitle="Contact Me"
      addressIcon="/icons/contact.webp"
      statusFields="Compose a new message"
    >
      <Container>
      <Field>
        <Label htmlFor="contact-to">To:</Label>
        <Input
          id="contact-to"
          type="text"
          value={`${name} <${email}>`}
          readOnly
          className="readonly"
        />
      </Field>
      <Field>
        <Label htmlFor="contact-from">From:</Label>
        <Input
          id="contact-from"
          type="email"
          name="from"
          value={formData.from}
          onChange={handleChange}
          placeholder="Your email address"
        />
      </Field>
      <Field>
        <Label htmlFor="contact-subject">Subject:</Label>
        <Input
          id="contact-subject"
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject of your message"
        />
      </Field>
      <TextArea
        id="contact-message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Write your message here"
      />
    </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  gap: 8px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px;
  background-color: #e9e9e9;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  color: #000;
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
`;

const Label = styled.label`
  display: inline-block;
  flex-shrink: 0;
  min-width: 50px;
  padding-right: 6px;
  text-align: right;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 2px;
  box-shadow: inset 1.75px 1.75px 0 #888, inset -1.75px -1.75px 0 #f0f0f0,
    inset 0 0 3px 1px #d6d6d6;
  box-sizing: border-box;
  color: #000;
  font-family: inherit;
  font-size: inherit;
  padding: 5px 8px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }

  &.readonly {
    background-color: rgba(141, 141, 141, 0.12);
    user-select: none;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 100px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 2px;
  box-shadow: inset 1.75px 1.75px 0 #888, inset -1.75px -1.75px 0 #f0f0f0,
    inset 0 0 3px 1px #d6d6d6;
  box-sizing: border-box;
  color: #000;
  font-family: inherit;
  font-size: inherit;
  padding: 5px 8px;
  resize: none;
  line-height: 1.4;
  overflow: auto;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

export default Contact;
