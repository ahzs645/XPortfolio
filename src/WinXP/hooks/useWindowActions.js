import { useCallback } from 'react';
import {
  FOCUS_APP,
  MINIMIZE_APP,
  DEL_APP,
} from '../constants/actions';

export function useWindowActions({ dispatch, focusedAppId, windowSoundsEnabled, playMinimize, playRestore }) {
  const onFocusApp = useCallback((id) => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, [dispatch]);

  const onMaximizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        if (windowSoundsEnabled) {
          playRestore();
        }
        dispatch({ type: 'TOGGLE_MAXIMIZE_APP', payload: id });
      }
    },
    [focusedAppId, dispatch, windowSoundsEnabled, playRestore]
  );

  const onMinimizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        if (windowSoundsEnabled) {
          playMinimize();
        }
        dispatch({ type: MINIMIZE_APP, payload: id });
      }
    },
    [focusedAppId, dispatch, windowSoundsEnabled, playMinimize]
  );

  const onCloseApp = useCallback(
    (id) => {
      if (focusedAppId === id) {
        dispatch({ type: DEL_APP, payload: id });
      }
    },
    [focusedAppId, dispatch]
  );

  const onMinimizeAll = useCallback(() => {
    dispatch({ type: 'MINIMIZE_ALL_APPS' });
  }, [dispatch]);

  const handleEndTask = useCallback((id) => {
    dispatch({ type: DEL_APP, payload: id });
  }, [dispatch]);

  const handleSwitchToApp = useCallback((id) => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, [dispatch]);

  return {
    onFocusApp,
    onMaximizeWindow,
    onMinimizeWindow,
    onCloseApp,
    onMinimizeAll,
    handleEndTask,
    handleSwitchToApp,
  };
}
