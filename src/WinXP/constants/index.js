// Focus states - tracks which UI element currently has focus
export const FOCUSING = {
  WINDOW: 'WINDOW',
  ICON: 'ICON',
  DESKTOP: 'DESKTOP',
};

// Power states for shutdown/logout dialogs
export const POWER_STATE = {
  START: 'START',
  LOG_OFF: 'LOG_OFF',
  TURN_OFF: 'TURN_OFF',
};

// Boot sequence states
export const BOOT_STATE = {
  BOOTING: 'BOOTING',
  LOGIN: 'LOGIN',
  WELCOME: 'WELCOME',
  DESKTOP: 'DESKTOP',
};

// Window button types
export const WINDOW_BUTTONS = {
  MINIMIZE: 'minimize',
  MAXIMIZE: 'maximize',
  CLOSE: 'close',
};

export * from './actions';
