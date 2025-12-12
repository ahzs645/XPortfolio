import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { withBaseUrl } from '../../../utils/baseUrl';

// Emoticons data
const EMOTICONS = [
  { key: ':)', src: '/images/emoticons/static/smile.gif' },
  { key: ':D', src: '/images/emoticons/static/laugh.gif' },
  { key: ';)', src: '/images/emoticons/static/wink.gif' },
  { key: ':P', src: '/images/emoticons/static/tongue.gif' },
  { key: ':(', src: '/images/emoticons/static/sad.gif' },
  { key: ':O', src: '/images/emoticons/static/gasp.gif' },
  { key: ':@', src: '/images/emoticons/static/angry.gif' },
  { key: ':S', src: '/images/emoticons/static/confused.gif' },
  { key: ':|', src: '/images/emoticons/static/stunned.gif' },
  { key: ":'(", src: '/images/emoticons/static/cry.gif' },
  { key: 'B)', src: '/images/emoticons/static/cool.gif' },
  { key: ':$', src: '/images/emoticons/static/embarrassed.gif' },
  { key: 'O:)', src: '/images/emoticons/static/angel.gif' },
  { key: '>:)', src: '/images/emoticons/static/devil.gif' },
  { key: '<3', src: '/images/emoticons/static/heart.gif' },
  { key: '</3', src: '/images/emoticons/static/heartbroken.gif' },
  { key: '(Y)', src: '/images/emoticons/static/thumbsup.gif' },
  { key: '(N)', src: '/images/emoticons/static/thumbsdown.gif' },
];

// Sample contacts - grouped by status
const CONTACTS_DATA = {
  online: [
    { id: 1, hash: 'github', name: 'GitHub', ping: Date.now() },
    { id: 2, hash: 'linkedin', name: 'LinkedIn', ping: Date.now() },
    { id: 3, hash: 'portfolio', name: 'Portfolio', ping: Date.now() },
  ],
  offline: [
    { id: 4, hash: 'twitter', name: 'Twitter/X', ping: Date.now() - 3600000 },
    { id: 5, hash: 'discord', name: 'Discord', ping: Date.now() - 7200000 },
    { id: 6, hash: 'email', name: 'Email Me', ping: 0 },
  ],
};

// Sample messages for demo
const SAMPLE_MESSAGES = {
  github: [
    { name: 'GitHub', text: 'Check out my repositories! Click to visit my GitHub profile.', time: Date.now() - 60000, isMe: false },
  ],
  linkedin: [
    { name: 'LinkedIn', text: "Let's connect professionally! Click to view my LinkedIn.", time: Date.now() - 120000, isMe: false },
  ],
  portfolio: [
    { name: 'Portfolio', text: 'Welcome to my portfolio! Feel free to explore.', time: Date.now() - 180000, isMe: false },
  ],
  twitter: [
    { name: 'Twitter/X', text: 'Follow me for updates!', time: Date.now() - 3600000, isMe: false },
  ],
  discord: [
    { name: 'Discord', text: 'Join my Discord server!', time: Date.now() - 7200000, isMe: false },
  ],
  email: [
    { name: 'Email Me', text: 'Send me an email to get in touch!', time: 0, isMe: false },
  ],
};

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function Messenger({ onClose, onMinimize, onMaximize, isFocus, onResize }) {
  const { getFullName, cvData } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState({ online: true, offline: false });
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const textareaRef = useRef(null);
  const chatRef = useRef(null);

  const userName = getFullName() || 'User';

  // Get links from CV data
  const links = {
    github: cvData?.cv?.links?.github || 'https://github.com',
    linkedin: cvData?.cv?.links?.linkedin || 'https://linkedin.com',
    portfolio: window.location.href,
    twitter: cvData?.cv?.links?.twitter || 'https://twitter.com',
    discord: cvData?.cv?.links?.discord || '#',
    email: cvData?.cv?.email ? `mailto:${cvData.cv.email}` : '#',
  };

  // Filter contacts based on search
  const filterContacts = useCallback((contacts) => {
    if (!searchTerm.trim()) return contacts;
    return contacts.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleGroup = useCallback((group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const selectContact = useCallback((contact, group) => {
    if (activeContact?.hash === contact.hash) {
      // Close chat
      setActiveContact(null);
      setChatOpen(false);
      setMessages([]);
      // Trigger resize to narrow (218px like original)
      onResize?.(218, 434);
    } else {
      // Open chat
      setActiveContact({ ...contact, group });
      setChatOpen(true);
      setMessages(SAMPLE_MESSAGES[contact.hash] || []);
      // Trigger resize to wide
      onResize?.(700, 434);
    }
  }, [activeContact, onResize]);

  const closeChat = useCallback(() => {
    setActiveContact(null);
    setChatOpen(false);
    setMessages([]);
    onResize?.(218, 434);
  }, [onResize]);

  const handleEmojiClick = useCallback((emoji) => {
    const insert = ` ${emoji.key} `;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = inputText.slice(0, start) + insert + inputText.slice(end);
      setInputText(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insert.length, start + insert.length);
      }, 0);
    }
  }, [inputText]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !activeContact) return;

    const newMessage = {
      name: userName,
      text: inputText,
      time: Date.now(),
      isMe: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Open link after sending message
    const url = links[activeContact.hash];
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }, [inputText, activeContact, userName, links]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Set initial size on mount
  useEffect(() => {
    onResize?.(218, 434);
  }, []);

  return (
    <MessengerContainer>
      {/* Contacts Panel */}
      <ContactsPanel $chatOpen={chatOpen}>
        <StatusSection>
          <StatusLabel>My Status:</StatusLabel>
          <StatusValue>
            <UserNameSpan>{userName}</UserNameSpan>
            <UserStatusSpan>(Online)</UserStatusSpan>
          </StatusValue>
        </StatusSection>

        <BarImage src={withBaseUrl('/images/interface/messenger/bar.png')} alt="" />

        <SearchInput
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <ContactsList>
          {/* Online Group */}
          {filterContacts(CONTACTS_DATA.online).length > 0 && (
            <>
              <GroupHeader
                className={openGroups.online ? 'open' : ''}
                onClick={() => toggleGroup('online')}
              >
                <Arrow className={openGroups.online ? 'open' : ''} />
                <GroupLeft>
                  <GroupLabel>Online</GroupLabel>
                  <GroupCount>({filterContacts(CONTACTS_DATA.online).length})</GroupCount>
                </GroupLeft>
              </GroupHeader>
              {openGroups.online && (
                <SubList>
                  {filterContacts(CONTACTS_DATA.online).map(contact => (
                    <Contact
                      key={contact.id}
                      className={activeContact?.hash === contact.hash ? 'active' : ''}
                      onClick={() => selectContact(contact, 'online')}
                    >
                      <ContactIcon src={withBaseUrl('/images/interface/messenger/online.png')} alt="" />
                      <ContactName>{contact.name}</ContactName>
                    </Contact>
                  ))}
                </SubList>
              )}
            </>
          )}

          {/* Offline Group */}
          {filterContacts(CONTACTS_DATA.offline).length > 0 && (
            <>
              <GroupHeader
                className={openGroups.offline ? 'open' : ''}
                onClick={() => toggleGroup('offline')}
              >
                <Arrow className={openGroups.offline ? 'open' : ''} />
                <GroupLeft>
                  <GroupLabel>Offline</GroupLabel>
                  <GroupCount>({filterContacts(CONTACTS_DATA.offline).length})</GroupCount>
                </GroupLeft>
              </GroupHeader>
              {openGroups.offline && (
                <SubList>
                  {filterContacts(CONTACTS_DATA.offline).map(contact => (
                    <Contact
                      key={contact.id}
                      className={activeContact?.hash === contact.hash ? 'active' : ''}
                      onClick={() => selectContact(contact, 'offline')}
                    >
                      <ContactIcon src={withBaseUrl('/images/interface/messenger/offline.png')} alt="" />
                      <ContactName>{contact.name}</ContactName>
                    </Contact>
                  ))}
                </SubList>
              )}
            </>
          )}
        </ContactsList>
      </ContactsPanel>

      {/* Messages Panel - only show when chat is open */}
      {chatOpen && activeContact && (
        <MessagesPanel>
          <InfoBar>
            <RecipientInfo>
              <RecipientName>{activeContact.name}</RecipientName>
              <RecipientSeen>{formatTimeAgo(activeContact.ping)}</RecipientSeen>
            </RecipientInfo>
            <InfoButtons>
              <CloseButton onClick={closeChat}>Close</CloseButton>
            </InfoButtons>
          </InfoBar>

          <ChatArea ref={chatRef}>
            {messages.map((msg, idx) => (
              <Message key={idx}>
                <MessageLabel>
                  <strong>{msg.name}</strong> says:
                  <MessageTime>{formatTimeAgo(msg.time)}</MessageTime>
                </MessageLabel>
                <MessageValue>{msg.text}</MessageValue>
              </Message>
            ))}
          </ChatArea>

          <BaseArea>
            <EmojiBar>
              {EMOTICONS.map((emoji, idx) => (
                <EmojiImg
                  key={idx}
                  src={withBaseUrl(emoji.src)}
                  alt={emoji.key}
                  title={emoji.key}
                  onClick={() => handleEmojiClick(emoji)}
                />
              ))}
            </EmojiBar>

            <InputArea>
              <MessageTextarea
                ref={textareaRef}
                placeholder="Type a message..."
                maxLength={1000}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <SendButton onClick={sendMessage}>Send</SendButton>
            </InputArea>
          </BaseArea>
        </MessagesPanel>
      )}
    </MessengerContainer>
  );
}

const MessengerContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  gap: 5px;
  background: #0148b2;
  padding: 5px;
  box-sizing: border-box;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
`;

const ContactsPanel = styled.div`
  width: ${props => props.$chatOpen ? '200px' : '100%'};
  background: #fff;
  border-radius: 5px;
  flex-shrink: 0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url(/icons/xp/messenger.png) no-repeat right 15px bottom / 70% auto;
    opacity: 0.1;
    pointer-events: none;
    border-radius: 5px;
  }
`;

const StatusSection = styled.div`
  padding: 5px;
  position: relative;
  z-index: 1;
`;

const StatusLabel = styled.div`
  font-size: 11px;
  color: #888;
`;

const StatusValue = styled.div``;

const UserNameSpan = styled.span`
  font-weight: bold;
`;

const UserStatusSpan = styled.span`
  margin-left: 4px;
  color: #0148b2;
`;

const BarImage = styled.img`
  width: 100%;
  position: relative;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  position: relative;
  z-index: 1;
`;

const ContactsList = styled.div`
  padding-bottom: 10px;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1;
`;

const GroupHeader = styled.div`
  font-weight: bold;
  color: #0148b2;
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f0f0f0;
  }
`;

const Arrow = styled.span`
  width: 16px;
  height: 16px;
  background-image: url(${withBaseUrl('/images/interface/messenger/toggledown.png')});
  background-size: contain;
  background-repeat: no-repeat;
  flex-shrink: 0;

  &.open {
    background-image: url(${withBaseUrl('/images/interface/messenger/toggleup.png')});
  }
`;

const GroupLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const GroupLabel = styled.span`
  user-select: none;
`;

const GroupCount = styled.span`
  opacity: 0.9;
  user-select: none;
`;

const SubList = styled.div``;

const Contact = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 5px 5px 25px;
  gap: 5px;
  cursor: pointer;

  &:hover {
    background: #e8f4fc;
  }

  &.active {
    font-weight: bold;
    background: #d0e8f8;
  }
`;

const ContactIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const ContactName = styled.span`
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
`;

const MessagesPanel = styled.div`
  flex: 1;
  display: flex;
  border-radius: 5px;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  gap: 5px;
`;

const InfoBar = styled.div`
  display: flex;
  align-items: center;
  padding-left: 5px;
  color: #93cdff;
  gap: 5px;
`;

const RecipientInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RecipientName = styled.div`
  font-weight: bold;
  color: #fff;
`;

const RecipientSeen = styled.div`
  font-size: 11px;
  color: #93cdff;
`;

const InfoButtons = styled.div`
  margin-left: auto;
`;

const CloseButton = styled.button`
  padding: 3px 8px;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 13px;
`;

const Message = styled.div`
  padding: 5px;
`;

const MessageLabel = styled.div`
  opacity: 0.5;
  display: flex;
  justify-content: space-between;
`;

const MessageTime = styled.span`
  font-size: 10px;
`;

const MessageValue = styled.div`
  margin-left: 10px;
  color: #000;
`;

const BaseArea = styled.div`
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
  overflow: hidden;
`;

const EmojiBar = styled.div`
  flex-shrink: 0;
  background-color: #d5e0f6;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  flex-wrap: wrap;
  gap: 2px;
`;

const EmojiImg = styled.img`
  width: 19px;
  height: 19px;
  cursor: pointer;

  &:hover {
    transform: scale(1.2);
  }
`;

const InputArea = styled.div`
  height: 50px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  padding: 5px;
`;

const MessageTextarea = styled.textarea`
  resize: none;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
`;

const SendButton = styled.button`
  padding: 5px 10px;
  height: 100%;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
`;

export default Messenger;
