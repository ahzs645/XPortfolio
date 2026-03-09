import React, { useState, useRef, useCallback } from 'react';
import Toolbar from './Toolbar';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import Avatar from './Avatar';
import StatusBar from './StatusBar';
import PopupPicker from './PopupPicker';
import { SOUND_PATH } from '../data/constants';

const nudgeSound = new Audio(SOUND_PATH + 'nudge.mp3');

export default function ChatWindow({
  contact,
  messages,
  user,
  isMuted,
  onToggleMute,
  onSendMessage,
  onTriggerBotResponse,
  windowRef
}) {
  const [fontStyle, setFontStyle] = useState({ bold: false, italic: false, underline: false });
  const [popup, setPopup] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [lastNudgeTime, setLastNudgeTime] = useState(0);
  const inputRef = useRef(null);

  const playSound = useCallback((file) => {
    if (isMuted) return;
    const audio = new Audio(SOUND_PATH + file);
    audio.volume = 1;
    audio.play().catch(() => {});
  }, [isMuted]);

  function handleSend() {
    const text = inputRef.current?.value.trim();
    if (!text) return;
    const truncated = text.length > 500 ? text.substring(0, 500) + '... (truncated)' : text;
    const msg = {
      senderId: user.id,
      senderName: user.name,
      type: 'text',
      content: truncated,
      sender: 'local',
      style: { ...fontStyle }
    };
    onSendMessage(contact.id, msg);
    onTriggerBotResponse(truncated, contact.id);
    inputRef.current.value = '';
    inputRef.current.focus();
    setLastMessageTime(new Date().toLocaleTimeString());
    playSound('type.mp3');
  }

  function handleNudge() {
    const now = Date.now();
    if (now - lastNudgeTime < 5000) {
      onSendMessage(contact.id, { type: 'system', content: 'You have just sent a nudge, please wait a moment.' });
      return;
    }
    setLastNudgeTime(now);
    doNudge();
    onSendMessage(contact.id, { type: 'system', content: 'You have sent a nudge.' });
    onTriggerBotResponse('nudge', contact.id);
  }

  function doNudge() {
    if (!isMuted) nudgeSound.play().catch(() => {});
    if (windowRef?.current) {
      windowRef.current.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(-8px, -8px)' },
        { transform: 'translate(8px, 8px)' }, { transform: 'translate(-8px, 8px)' },
        { transform: 'translate(8px, -8px)' }, { transform: 'translate(0, 0)' }
      ], { duration: 300, iterations: 3, easing: 'ease-in-out' });
    }
  }

  function handleOpenPopup(type, e) {
    e.stopPropagation();
    if (popup === type) { setPopup(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.closest('.chat-container');
    const contRect = container?.getBoundingClientRect() || { left: 0, top: 0 };
    setPopupPos({ x: rect.left - contRect.left, y: rect.bottom - contRect.top });
    setPopup(type);
  }

  function handleToggleFont(style) {
    setFontStyle(prev => ({ ...prev, [style]: !prev[style] }));
  }

  function handleInsertEmoticon(shortcut) {
    if (inputRef.current) {
      inputRef.current.value += ` ${shortcut} `;
      inputRef.current.focus();
    }
  }

  function handleSendWink(src) {
    const msg = {
      senderId: user.id,
      senderName: user.name,
      type: 'wink',
      content: src,
      sender: 'local'
    };
    onSendMessage(contact.id, msg);
    onTriggerBotResponse('wink', contact.id);
    setLastMessageTime(new Date().toLocaleTimeString());
  }

  if (!contact) return null;

  return (
    <div className="msn-chat-body">
      <div className="chat-container" onClick={() => setPopup(null)}>
        <Toolbar onToggleMute={onToggleMute} />

        <div className="remote-user-area">
          <ChatHistory contactName={contact.name} messages={messages} />
          <Avatar image={contact.avatar} />
        </div>

        <div className="local-user-area">
          <ChatInput
            fontStyle={fontStyle}
            onSend={handleSend}
            onNudge={handleNudge}
            onOpenPopup={handleOpenPopup}
            inputRef={inputRef}
          />
          <Avatar image={user.avatar} />
        </div>

        <StatusBar lastMessageTime={lastMessageTime} />
        <div className="border-window" />

        <PopupPicker
          type={popup}
          position={popupPos}
          fontStyle={fontStyle}
          onToggleFont={handleToggleFont}
          onInsertEmoticon={handleInsertEmoticon}
          onSendWink={handleSendWink}
          onClose={() => setPopup(null)}
        />
      </div>
    </div>
  );
}
