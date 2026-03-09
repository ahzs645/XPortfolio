import { useSyncExternalStore } from 'react';
import { withBaseUrl } from '../../../utils/baseUrl';
import { ASSET_PATH, SOUND_PATH, WINKS } from './data/constants';

const listeners = new Set();
const responseTimers = new Map();

const DEFAULT_USER = {
  id: 'user_local',
  name: '',
  avatar: 'chess',
  status: 'online',
};

let botsPromise = null;

let state = {
  isLoggedIn: false,
  user: DEFAULT_USER,
  botsData: { contacts: [] },
  messageStore: {},
  unreadCounts: {},
  activeContactId: null,
  isMuted: false,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  emitChange();
}

function preloadBotHistories(currentUser, contacts) {
  const store = {};

  contacts.forEach((contact) => {
    store[contact.id] = [];
    contact.conversation.forEach((message) => {
      const parsedMessage = {
        senderId: message.from === 'currentuser' ? 'user_local' : contact.id,
        senderName: message.from === 'currentuser' ? currentUser.name : contact.display_name,
        sender: message.from === 'currentuser' ? 'local' : 'remote',
      };

      if (message.type === 'wink' && WINKS[message.content]) {
        parsedMessage.type = 'wink';
        parsedMessage.content = `${ASSET_PATH}winks/${WINKS[message.content]}`;
      } else if (message.type === 'nudge') {
        parsedMessage.type = 'nudge';
      } else {
        parsedMessage.type = 'text';
        parsedMessage.content = message.text || message.content;
      }

      store[contact.id].push(parsedMessage);
    });
  });

  return store;
}

function clearResponseTimers() {
  responseTimers.forEach((timer) => window.clearTimeout(timer));
  responseTimers.clear();
}

export async function ensureBotsLoaded() {
  if (state.botsData.contacts.length > 0) {
    return state.botsData;
  }

  if (!botsPromise) {
    botsPromise = fetch(withBaseUrl('/apps/msn-messenger/bots.json'))
      .then((response) => (response.ok ? response.json() : { contacts: [] }))
      .catch(() => ({ contacts: [] }))
      .then((data) => {
        setState((previous) => ({ ...previous, botsData: data }));
        return data;
      });
  }

  return botsPromise;
}

export function loginToMsn(userData) {
  const nextUser = { ...userData, id: 'user_local' };
  const contacts = state.botsData.contacts;

  setState((previous) => ({
    ...previous,
    isLoggedIn: true,
    user: nextUser,
    messageStore: preloadBotHistories(nextUser, contacts),
    unreadCounts: {},
    activeContactId: contacts[0]?.id ?? null,
  }));
}

export function signOutOfMsn() {
  clearResponseTimers();
  localStorage.removeItem('msn_auto');

  setState((previous) => ({
    ...previous,
    isLoggedIn: false,
    user: DEFAULT_USER,
    messageStore: {},
    unreadCounts: {},
    activeContactId: null,
    isMuted: false,
  }));
}

export function activateMsnContact(contactId) {
  setState((previous) => ({
    ...previous,
    activeContactId: contactId,
    unreadCounts: {
      ...previous.unreadCounts,
      [contactId]: 0,
    },
  }));
}

export function setMsnMute(nextMuted) {
  setState((previous) => ({ ...previous, isMuted: nextMuted }));
}

export function storeMsnMessage(contactId, message) {
  setState((previous) => {
    const messages = [...(previous.messageStore[contactId] || []), message];
    if (messages.length > 100) {
      messages.shift();
    }

    return {
      ...previous,
      messageStore: {
        ...previous.messageStore,
        [contactId]: messages,
      },
    };
  });
}

export function triggerMsnBotResponse(contactId, messageContent) {
  const existingTimer = responseTimers.get(contactId);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const bot = state.botsData.contacts.find((contact) => contact.id === contactId);
  if (!bot?.fallback_replies?.length) {
    return;
  }

  const timer = window.setTimeout(() => {
    let reply = bot.fallback_replies[Math.floor(Math.random() * bot.fallback_replies.length)];
    if (messageContent === 'nudge') {
      reply = 'Hey, stop that! :@';
    }

    responseTimers.delete(contactId);

    setState((previous) => {
      const messages = [
        ...(previous.messageStore[contactId] || []),
        {
          senderId: bot.id,
          senderName: bot.display_name,
          type: 'text',
          content: reply,
          sender: 'remote',
        },
      ];

      if (messages.length > 100) {
        messages.shift();
      }

      return {
        ...previous,
        messageStore: {
          ...previous.messageStore,
          [contactId]: messages,
        },
        unreadCounts:
          previous.activeContactId === contactId
            ? previous.unreadCounts
            : {
                ...previous.unreadCounts,
                [contactId]: (previous.unreadCounts[contactId] || 0) + 1,
              },
      };
    });

    if (!state.isMuted) {
      const audio = new Audio(`${SOUND_PATH}type.mp3`);
      audio.play().catch(() => {});
    }
  }, 1200 + 1000 * Math.random());

  responseTimers.set(contactId, timer);
}

export function getMsnState() {
  return state;
}

export function subscribeToMsnStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMsnSession() {
  return useSyncExternalStore(subscribeToMsnStore, getMsnState, getMsnState);
}
