import { useCallback } from 'react';
import {
  CANCEL_POWER_OFF,
  CLOSE_ALL_APPS,
  SET_BOOT_STATE,
} from '../constants/actions';
import { BOOT_STATE } from '../constants';

export function usePowerActions({ dispatch, logoutUser, playLogoff }) {
  const performRestart = useCallback(() => {
    dispatch({ type: CANCEL_POWER_OFF });
    dispatch({ type: CLOSE_ALL_APPS });
    logoutUser();
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.BOOTING });
  }, [dispatch, logoutUser]);

  const onModalRestart = useCallback(() => {
    performRestart();
  }, [performRestart]);

  const onModalLogOff = useCallback(() => {
    playLogoff();
    dispatch({ type: CANCEL_POWER_OFF });
    logoutUser();
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.LOGIN });
  }, [playLogoff, dispatch, logoutUser]);

  const onModalShutDown = useCallback(() => {
    dispatch({ type: CANCEL_POWER_OFF });
    dispatch({ type: CLOSE_ALL_APPS });
    logoutUser();
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.OFF });
  }, [dispatch, logoutUser]);

  const onModalClose = useCallback(() => {
    dispatch({ type: CANCEL_POWER_OFF });
  }, [dispatch]);

  return {
    performRestart,
    onModalRestart,
    onModalLogOff,
    onModalShutDown,
    onModalShutDownWithoutUpdates: onModalShutDown,
    onModalClose,
  };
}
