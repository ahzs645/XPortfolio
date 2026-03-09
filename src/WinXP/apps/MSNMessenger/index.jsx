import React, { useEffect, useMemo, useCallback } from 'react';
import WindowFrame from './components/WindowFrame';
import LoginView from './components/LoginView';
import ContactsView from './components/ContactsView';
import { ASSET_PATH, CONTACTS_WINDOW_HEIGHT } from './data/constants';
import { useApp } from '../../../contexts/AppContext';
import { useRunningApps } from '../../../contexts/RunningAppsContext';
import messengerStyles from './styles/msn-messenger.css?raw';
import windowFrameStyles from './styles/window-frame.css?raw';
import {
  activateMsnContact,
  ensureBotsLoaded,
  loginToMsn,
  signOutOfMsn,
  useMsnSession,
} from './store';

const WINDOW_HEADER = {
  icon: '/icons/xp/messenger.png',
  title: 'MSN Messenger',
  buttons: ['minimize', 'maximize', 'close'],
};

export default function MSNMessenger({ onClose, onResize, onUpdateHeader, onMinimize, onMaximize, dragRef }) {
  const { openApp } = useApp();
  const { apps, onSwitchTo } = useRunningApps();
  const { isLoggedIn, user, botsData, unreadCounts, activeContactId } = useMsnSession();

  const injectedStyles = useMemo(
    () =>
      `${windowFrameStyles}\n${messengerStyles}`
        .replaceAll('__MSN_ASSET_ROOT__', ASSET_PATH)
        .replaceAll('__MSN_CLASSIC_ROOT__', `${ASSET_PATH}ui/classic/`),
    [],
  );

  useEffect(() => {
    ensureBotsLoaded();
  }, []);

  useEffect(() => {
    onResize?.(280, CONTACTS_WINDOW_HEIGHT);
  }, [onResize]);

  useEffect(() => {
    onUpdateHeader?.({
      ...WINDOW_HEADER,
      title: isLoggedIn && user.name ? `MSN Messenger - ${user.name}` : WINDOW_HEADER.title,
      invisible: true,
    });

    return () => onUpdateHeader?.(null);
  }, [isLoggedIn, onUpdateHeader, user.name]);

  const handleCloseApp = useCallback(() => {
    signOutOfMsn();
    onClose?.();
  }, [onClose]);

  const handleSelectContact = useCallback(
    (contact) => {
      activateMsnContact(contact.id);

      const existingConversation = apps.find(
        (app) =>
          app.injectProps?.messengerWindowType === 'conversation' &&
          app.injectProps?.contactId === contact.id,
      );

      if (existingConversation) {
        onSwitchTo(existingConversation.id);
        return;
      }

      const openConversationCount = apps.filter(
        (app) => app.injectProps?.messengerWindowType === 'conversation',
      ).length;

      openApp(
        'MSN Messenger Conversation',
        {
          messengerWindowType: 'conversation',
          contactId: contact.id,
        },
        {
          header: {
            title: `${contact.display_name} - Conversation`,
          },
          defaultOffset: {
            x: 140 + openConversationCount * 24,
            y: 80 + openConversationCount * 24,
          },
        },
      );
    },
    [apps, onSwitchTo, openApp],
  );

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
        <WindowFrame
          title={isLoggedIn ? `MSN Messenger - ${user.name}` : 'MSN Messenger'}
          onClose={handleCloseApp}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          dragRef={dragRef}
          width={280}
          height={CONTACTS_WINDOW_HEIGHT}
          maxTitleWidth={170}
        >
          <div className="msn-container">
            {!isLoggedIn ? (
              <LoginView onLogin={loginToMsn} />
            ) : (
              <ContactsView
                user={user}
                contacts={botsData.contacts}
                activeContactId={activeContactId}
                unreadCounts={unreadCounts}
                onSelectContact={handleSelectContact}
                onSignOut={signOutOfMsn}
              />
            )}
          </div>
        </WindowFrame>
      </div>
    </>
  );
}
