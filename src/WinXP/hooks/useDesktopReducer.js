import { useReducer } from 'react';
import {
  ADD_APP,
  DEL_APP,
  FOCUS_APP,
  MINIMIZE_APP,
  MINIMIZE_ALL_APPS,
  TOGGLE_MAXIMIZE_APP,
  CLOSE_ALL_APPS,
  FOCUS_ICON,
  SELECT_ICONS,
  SET_ICONS,
  FOCUS_DESKTOP,
  START_SELECT,
  END_SELECT,
  POWER_OFF,
  CANCEL_POWER_OFF,
  SET_BOOT_STATE,
  UPDATE_ICON_POSITIONS,
} from '../constants/actions';
import { FOCUSING, POWER_STATE, BOOT_STATE } from '../constants';
import { defaultIconState } from '../apps';

const initState = {
  apps: [],
  nextAppID: 0,
  nextZIndex: 0,
  focusing: FOCUSING.DESKTOP,
  icons: defaultIconState,
  selecting: false,
  powerState: POWER_STATE.START,
  bootState: BOOT_STATE.BOOTING,
};

const reducer = (state, action = { type: '' }) => {
  switch (action.type) {
    case ADD_APP: {
      const app = state.apps.find(
        (_app) => _app.component === action.payload.component
      );
      if (action.payload.multiInstance || !app) {
        return {
          ...state,
          apps: [
            ...state.apps,
            {
              ...action.payload,
              id: state.nextAppID,
              zIndex: state.nextZIndex,
            },
          ],
          nextAppID: state.nextAppID + 1,
          nextZIndex: state.nextZIndex + 1,
          focusing: FOCUSING.WINDOW,
        };
      }
      const apps = state.apps.map((app) =>
        app.component === action.payload.component
          ? { ...app, zIndex: state.nextZIndex, minimized: false }
          : app
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case DEL_APP:
      if (state.focusing !== FOCUSING.WINDOW) return state;
      return {
        ...state,
        apps: state.apps.filter((app) => app.id !== action.payload),
        focusing:
          state.apps.length > 1
            ? FOCUSING.WINDOW
            : state.icons.find((icon) => icon.isFocus)
            ? FOCUSING.ICON
            : FOCUSING.DESKTOP,
      };
    case FOCUS_APP: {
      const apps = state.apps.map((app) =>
        app.id === action.payload
          ? { ...app, zIndex: state.nextZIndex, minimized: false }
          : app
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case MINIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map((app) =>
        app.id === action.payload ? { ...app, minimized: true } : app
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case MINIMIZE_ALL_APPS: {
      const apps = state.apps.map((app) => ({ ...app, minimized: true }));
      return {
        ...state,
        apps,
        focusing: FOCUSING.DESKTOP,
      };
    }
    case TOGGLE_MAXIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map((app) =>
        app.id === action.payload ? { ...app, maximized: !app.maximized } : app
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case CLOSE_ALL_APPS:
      return {
        ...state,
        apps: [],
        focusing: FOCUSING.DESKTOP,
      };
    case FOCUS_ICON: {
      const icons = state.icons.map((icon) => ({
        ...icon,
        isFocus: icon.id === action.payload,
      }));
      return {
        ...state,
        focusing: FOCUSING.ICON,
        icons,
      };
    }
    case SELECT_ICONS: {
      const icons = state.icons.map((icon) => ({
        ...icon,
        isFocus: action.payload.includes(icon.id),
      }));
      return {
        ...state,
        icons,
        focusing: FOCUSING.ICON,
      };
    }
    case FOCUS_DESKTOP:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map((icon) => ({
          ...icon,
          isFocus: false,
        })),
      };
    case START_SELECT:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map((icon) => ({
          ...icon,
          isFocus: false,
        })),
        selecting: action.payload,
      };
    case END_SELECT:
      return {
        ...state,
        selecting: null,
      };
    case POWER_OFF:
      return {
        ...state,
        powerState: action.payload,
      };
    case CANCEL_POWER_OFF:
      return {
        ...state,
        powerState: POWER_STATE.START,
      };
    case SET_BOOT_STATE:
      return {
        ...state,
        bootState: action.payload,
      };
    case SET_ICONS:
      return {
        ...state,
        icons: action.payload,
      };
    case UPDATE_ICON_POSITIONS: {
      const updatedIcons = state.icons.map((icon) => {
        const newPos = action.payload[icon.id];
        if (newPos) {
          return { ...icon, x: newPos.x, y: newPos.y };
        }
        return icon;
      });
      return {
        ...state,
        icons: updatedIcons,
      };
    }
    default:
      return state;
  }
};

export function useDesktopReducer() {
  const [state, dispatch] = useReducer(reducer, initState);

  // Get the focused app ID (topmost non-minimized window when focusing a window)
  const getFocusedAppId = () => {
    if (state.focusing !== FOCUSING.WINDOW) return -1;
    const focusedApp = [...state.apps]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((app) => !app.minimized);
    return focusedApp ? focusedApp.id : -1;
  };

  // Get the "active" window for taskbar display (topmost non-minimized window)
  // This differs from focusedAppId because it stays active even when desktop is focused
  const getActiveAppIdForTaskbar = () => {
    const activeApp = [...state.apps]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((app) => !app.minimized);
    return activeApp ? activeApp.id : -1;
  };

  return {
    state,
    dispatch,
    getFocusedAppId,
    getActiveAppIdForTaskbar,
  };
}

export default useDesktopReducer;
