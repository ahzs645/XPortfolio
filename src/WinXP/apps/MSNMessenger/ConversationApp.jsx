import React, { useEffect, useMemo, useRef } from 'react';
import WindowFrame from './components/WindowFrame';
import ChatWindow from './components/ChatWindow';
import { ASSET_PATH, CONTACTS_WINDOW_HEIGHT } from './data/constants';
import messengerStyles from './styles/msn-messenger.css?raw';
import windowFrameStyles from './styles/window-frame.css?raw';
import {
  activateMsnContact,
  ensureBotsLoaded,
  setMsnMute,
  storeMsnMessage,
  triggerMsnBotResponse,
  useMsnSession,
} from './store';

export default function MSNMessengerConversation({
  contactId,
  onClose,
  onMinimize,
  onMaximize,
  onResize,
  onUpdateHeader,
  dragRef,
  isFocus,
}) {
  const chatWindowRef = useRef(null);
  const { isLoggedIn, user, botsData, messageStore, isMuted } = useMsnSession();

  const injectedStyles = useMemo(
    () =>
      `${windowFrameStyles}\n${messengerStyles}`
        .replaceAll('__MSN_ASSET_ROOT__', ASSET_PATH)
        .replaceAll('__MSN_CLASSIC_ROOT__', `${ASSET_PATH}ui/classic/`),
    [],
  );

  const contact = botsData.contacts.find((item) => item.id === contactId);

  useEffect(() => {
    ensureBotsLoaded();
  }, []);

  useEffect(() => {
    onResize?.(560, CONTACTS_WINDOW_HEIGHT);
  }, [onResize]);

  useEffect(() => {
    if (!contact) {
      return;
    }

    onUpdateHeader?.({
      icon: '/icons/xp/messenger.png',
      title: `${contact.display_name} - Conversation`,
      buttons: ['minimize', 'maximize', 'close'],
      invisible: true,
    });

    return () => onUpdateHeader?.(null);
  }, [contact, onUpdateHeader]);

  useEffect(() => {
    if (isFocus && contactId) {
      activateMsnContact(contactId);
    }
  }, [contactId, isFocus]);

  useEffect(() => {
    if (!isLoggedIn) {
      onClose?.();
    }
  }, [isLoggedIn, onClose]);

  if (!contact || !isLoggedIn) {
    return null;
  }

  return (
    <>
      <style>{injectedStyles}</style>
      <div
        className="msn-app-shell"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'transparent',
          fontFamily: '"Verdana", "Tahoma", sans-serif',
          fontSize: 11,
        }}
      >
        <div ref={chatWindowRef}>
          <WindowFrame
            title={`${contact.display_name} - Conversation`}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            dragRef={dragRef}
            width={560}
            height={CONTACTS_WINDOW_HEIGHT}
            maxTitleWidth={450}
          >
            <ChatWindow
              contact={{
                id: contact.id,
                name: contact.display_name,
                avatar: contact.avatar,
                status: contact.status,
              }}
              messages={messageStore[contactId] || []}
              user={user}
              isMuted={isMuted}
              onToggleMute={setMsnMute}
              onSendMessage={storeMsnMessage}
              onTriggerBotResponse={triggerMsnBotResponse}
              windowRef={chatWindowRef}
            />
          </WindowFrame>
        </div>
      </div>
    </>
  );
}
