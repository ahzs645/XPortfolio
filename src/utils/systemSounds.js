export const SOUND_FILE_CATALOG = Object.freeze({
  alert: { key: 'alert', fileName: 'alert.wav', path: '/sounds/alert.wav' },
  balloon: { key: 'balloon', fileName: 'balloon.wav', path: '/sounds/balloon.wav' },
  battcritical: { key: 'battcritical', fileName: 'battcritical.wav', path: '/sounds/battcritical.wav' },
  chimes: { key: 'chimes', fileName: 'chimes.wav', path: '/sounds/chimes.wav' },
  chord: { key: 'chord', fileName: 'chord.wav', path: '/sounds/chord.wav' },
  ding: { key: 'ding', fileName: 'ding.wav', path: '/sounds/ding.wav' },
  error: { key: 'error', fileName: 'error.wav', path: '/sounds/error.wav' },
  exclamation: { key: 'exclamation', fileName: 'exclamation.wav', path: '/sounds/exclamation.wav' },
  hdw_fail: { key: 'hdw_fail', fileName: 'hdw_fail.wav', path: '/sounds/hdw_fail.wav' },
  hdw_insert: { key: 'hdw_insert', fileName: 'hdw_insert.wav', path: '/sounds/hdw_insert.wav' },
  hdw_remove: { key: 'hdw_remove', fileName: 'hdw_remove.wav', path: '/sounds/hdw_remove.wav' },
  logoff: { key: 'logoff', fileName: 'logoff.wav', path: '/sounds/logoff.wav' },
  logon: { key: 'logon', fileName: 'logon.wav', path: '/sounds/logon.wav' },
  lowbatt: { key: 'lowbatt', fileName: 'lowbatt.wav', path: '/sounds/lowbatt.wav' },
  notify: { key: 'notify', fileName: 'notify.wav', path: '/sounds/notify.wav' },
  recycle: { key: 'recycle', fileName: 'recycle.wav', path: '/sounds/recycle.wav' },
  shutdown: { key: 'shutdown', fileName: 'shutdown.wav', path: '/sounds/shutdown.wav' },
  start: { key: 'start', fileName: 'start.wav', path: '/sounds/start.wav' },
  startup: { key: 'startup', fileName: 'startup.wav', path: '/sounds/startup.wav' },
  tada: { key: 'tada', fileName: 'tada.wav', path: '/sounds/tada.wav' },
  xpding: { key: 'xpding', fileName: 'xpding.wav', path: '/sounds/xpding.wav' },
  minimize: { key: 'minimize', fileName: 'minimize.wav', path: '/sounds/minimize.wav' },
  restore: { key: 'restore', fileName: 'restore.wav', path: '/sounds/restore.wav' },
});

export const SOUND_FILE_OPTIONS = Object.freeze([
  { key: '', fileName: '(None)', path: null },
  ...Object.values(SOUND_FILE_CATALOG).sort((a, b) => a.fileName.localeCompare(b.fileName)),
]);

export const SOUND_EVENT_DEFINITIONS = Object.freeze([
  { id: 'asterisk', label: 'Asterisk' },
  { id: 'closeProgram', label: 'Close program' },
  { id: 'criticalBatteryAlarm', label: 'Critical Battery Alarm' },
  { id: 'criticalStop', label: 'Critical Stop' },
  { id: 'defaultBeep', label: 'Default Beep' },
  { id: 'exclamation', label: 'Exclamation' },
  { id: 'exitWindows', label: 'Exit Windows' },
  { id: 'hardwareFail', label: 'Hardware Fail' },
  { id: 'hardwareInsert', label: 'Hardware Insert' },
  { id: 'hardwareRemove', label: 'Hardware Remove' },
  { id: 'logoff', label: 'Logoff' },
  { id: 'logon', label: 'Logon' },
  { id: 'menuCommand', label: 'Menu command' },
  { id: 'recycleEmpty', label: 'Recycle Empty' },
  { id: 'startWindows', label: 'Start Windows' },
  { id: 'windowsBalloon', label: 'Windows Balloon' },
]);

export const DEFAULT_SOUND_SCHEME_NAME = 'Windows Default';

export const DEFAULT_SOUND_SCHEME = Object.freeze({
  name: DEFAULT_SOUND_SCHEME_NAME,
  sounds: {
    asterisk: 'alert',
    closeProgram: '',
    criticalBatteryAlarm: 'battcritical',
    criticalStop: 'error',
    defaultBeep: 'xpding',
    exclamation: 'exclamation',
    exitWindows: 'shutdown',
    hardwareFail: 'hdw_fail',
    hardwareInsert: 'hdw_insert',
    hardwareRemove: 'hdw_remove',
    logoff: 'logoff',
    logon: 'logon',
    menuCommand: 'start',
    recycleEmpty: 'recycle',
    startWindows: 'startup',
    windowsBalloon: 'balloon',
  },
});

export const DEFAULT_SOUND_SETTINGS = Object.freeze({
  activeSchemeName: DEFAULT_SOUND_SCHEME_NAME,
  schemes: {},
});

export function cloneSoundScheme(scheme) {
  return {
    name: scheme.name,
    sounds: { ...scheme.sounds },
  };
}

export function getBuiltInSoundSchemes() {
  return {
    [DEFAULT_SOUND_SCHEME_NAME]: cloneSoundScheme(DEFAULT_SOUND_SCHEME),
  };
}

export function getEffectiveSoundSchemes(soundSettings) {
  return {
    ...getBuiltInSoundSchemes(),
    ...(soundSettings?.schemes || {}),
  };
}

export function normalizeSoundSettings(soundSettings) {
  return {
    activeSchemeName: soundSettings?.activeSchemeName || DEFAULT_SOUND_SCHEME_NAME,
    schemes: { ...(soundSettings?.schemes || {}) },
  };
}

export function pruneSoundSchemes(schemes) {
  const builtIns = getBuiltInSoundSchemes();
  return Object.fromEntries(
    Object.entries(schemes).filter(([name, scheme]) => {
      const builtIn = builtIns[name];
      if (!builtIn) return true;
      return JSON.stringify(builtIn.sounds) !== JSON.stringify(scheme.sounds);
    })
  );
}
