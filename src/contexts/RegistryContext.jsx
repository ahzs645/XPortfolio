import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useShellSettings } from './ShellSettingsContext';

const RegistryContext = createContext(null);

const STORAGE_KEY = 'xp-registry';

function createDefaultRegistry() {
  return {
    'HKEY_LOCAL_MACHINE': {
      _type: 'key',
      children: {
        'HARDWARE': {
          _type: 'key',
          children: {
            'DESCRIPTION': { _type: 'key', children: {
              'System': { _type: 'key', children: {
                'CentralProcessor': { _type: 'key', children: {
                  '0': { _type: 'key', children: {},
                    _values: {
                      'ProcessorNameString': { type: 'REG_SZ', data: 'Intel Pentium 4 CPU 2.40GHz' },
                      'Identifier': { type: 'REG_SZ', data: 'x86 Family 15 Model 2 Stepping 9' },
                      '~MHz': { type: 'REG_DWORD', data: 2400 },
                    },
                  },
                } },
              } },
            } },
          },
          _values: {},
        },
        'SOFTWARE': {
          _type: 'key',
          children: {
            'Microsoft': { _type: 'key', children: {
              'Windows NT': { _type: 'key', children: {
                'CurrentVersion': { _type: 'key', children: {},
                  _values: {
                    'ProductName': { type: 'REG_SZ', data: 'Microsoft Windows XP' },
                    'CurrentVersion': { type: 'REG_SZ', data: '5.1' },
                    'CurrentBuildNumber': { type: 'REG_SZ', data: '2600' },
                    'CSDVersion': { type: 'REG_SZ', data: 'Service Pack 3' },
                    'RegisteredOwner': { type: 'REG_SZ', data: 'User' },
                  },
                },
              } },
            } },
          },
          _values: {},
        },
        'SYSTEM': {
          _type: 'key',
          children: {
            'CurrentControlSet': { _type: 'key', children: {
              'Control': { _type: 'key', children: {
                'CrashControl': { _type: 'key', children: {},
                  _values: {
                    'AutoReboot': { type: 'REG_DWORD', data: 1 },
                    'CrashDumpEnabled': { type: 'REG_DWORD', data: 3 },
                    'LogEvent': { type: 'REG_DWORD', data: 1 },
                    'SendAlert': { type: 'REG_DWORD', data: 0 },
                  },
                },
              }, _values: {} },
              'Services': { _type: 'key', children: {
                'i8042prt': { _type: 'key', children: {
                  'Parameters': { _type: 'key', children: {},
                    _values: {
                      '(Default)': { type: 'REG_SZ', data: '' },
                      'CrashOnCtrlScroll': { type: 'REG_DWORD', data: 0 },
                    },
                  },
                }, _values: {
                  'DisplayName': { type: 'REG_SZ', data: 'i8042 Keyboard and PS/2 Mouse Port Driver' },
                  'Start': { type: 'REG_DWORD', data: 1 },
                  'Type': { type: 'REG_DWORD', data: 1 },
                } },
                'Tcpip': { _type: 'key', children: {
                  'Parameters': { _type: 'key', children: {},
                    _values: {
                      'DefaultTTL': { type: 'REG_DWORD', data: 128 },
                    },
                  },
                }, _values: {} },
              }, _values: {} },
            }, _values: {} },
            'Setup': { _type: 'key', children: {},
              _values: {
                'SystemSetupInProgress': { type: 'REG_DWORD', data: 0 },
              },
            },
          },
          _values: {},
        },
      },
      _values: {},
    },
    'HKEY_CURRENT_USER': {
      _type: 'key',
      children: {
        'Software': { _type: 'key', children: {
          'Microsoft': { _type: 'key', children: {
            'Windows': { _type: 'key', children: {
              'CurrentVersion': { _type: 'key', children: {
                'Explorer': { _type: 'key', children: {
                  'Advanced': { _type: 'key', children: {}, _values: {
                    'ClassicFolders': { type: 'REG_DWORD', data: 0 },
                    'FullPathInTitle': { type: 'REG_DWORD', data: 0 },
                    'Hidden': { type: 'REG_DWORD', data: 0 },
                    'ShowFileExtensions': { type: 'REG_DWORD', data: 1 },
                  } },
                  'Taskbar': { _type: 'key', children: {}, _values: {
                    'LockTaskbar': { type: 'REG_DWORD', data: 1 },
                    'AutoHide': { type: 'REG_DWORD', data: 0 },
                    'KeepOnTop': { type: 'REG_DWORD', data: 1 },
                    'GroupButtons': { type: 'REG_DWORD', data: 0 },
                    'ShowQuickLaunch': { type: 'REG_DWORD', data: 1 },
                    'ShowClock': { type: 'REG_DWORD', data: 1 },
                    'HideInactiveIcons': { type: 'REG_DWORD', data: 0 },
                  } },
                  'StartMenu': { _type: 'key', children: {}, _values: {
                    'Style': { type: 'REG_SZ', data: 'modern' },
                  } },
                }, _values: {
                  'ShellState': { type: 'REG_BINARY', data: '24 00 00 00' },
                  'OpenFoldersInNewWindow': { type: 'REG_DWORD', data: 0 },
                } },
              }, _values: {} },
            }, _values: {} },
          }, _values: {} },
          'Multimedia': { _type: 'key', children: {
            'Audio': { _type: 'key', children: {}, _values: {
              'Volume': { type: 'REG_DWORD', data: 50 },
              'Mute': { type: 'REG_DWORD', data: 0 },
            } },
          }, _values: {} },
        }, _values: {} },
        'Control Panel': { _type: 'key', children: {
          'Desktop': { _type: 'key', children: {},
            _values: {
              'Wallpaper': { type: 'REG_SZ', data: 'C:\\WINDOWS\\Web\\Wallpaper\\Bliss.bmp' },
              'ScreenSaveActive': { type: 'REG_SZ', data: '1' },
            },
          },
          'Colors': { _type: 'key', children: {},
            _values: {
              'Background': { type: 'REG_SZ', data: '0 78 152' },
              'Window': { type: 'REG_SZ', data: '255 255 255' },
            },
          },
        }, _values: {} },
      },
      _values: {},
    },
    'HKEY_CLASSES_ROOT': {
      _type: 'key',
      children: {
        '.txt': { _type: 'key', children: {},
          _values: { '(Default)': { type: 'REG_SZ', data: 'txtfile' } },
        },
        '.exe': { _type: 'key', children: {},
          _values: { '(Default)': { type: 'REG_SZ', data: 'exefile' } },
        },
        '.reg': { _type: 'key', children: {},
          _values: { '(Default)': { type: 'REG_SZ', data: 'regfile' } },
        },
      },
      _values: {},
    },
    'HKEY_USERS': {
      _type: 'key',
      children: {
        '.DEFAULT': { _type: 'key', children: {}, _values: {} },
      },
      _values: {},
    },
    'HKEY_CURRENT_CONFIG': {
      _type: 'key',
      children: {
        'Software': { _type: 'key', children: {
          'Fonts': { _type: 'key', children: {},
            _values: {
              'LogPixels': { type: 'REG_DWORD', data: 96 },
            },
          },
        }, _values: {} },
      },
      _values: {},
    },
  };
}

const REGISTRY_BINDINGS = [
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer',
    valueName: 'OpenFoldersInNewWindow',
    type: 'REG_DWORD',
    settingPath: 'explorer.openFoldersInNewWindow',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    valueName: 'ClassicFolders',
    type: 'REG_DWORD',
    settingPath: 'explorer.sidebarMode',
    toRegistry: (value) => value === 'classic' ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1 ? 'classic' : 'show',
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    valueName: 'FullPathInTitle',
    type: 'REG_DWORD',
    settingPath: 'explorer.fullPathInTitle',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    valueName: 'Hidden',
    type: 'REG_DWORD',
    settingPath: 'explorer.showHiddenContents',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    valueName: 'ShowFileExtensions',
    type: 'REG_DWORD',
    settingPath: 'explorer.showFileExtensions',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'LockTaskbar',
    type: 'REG_DWORD',
    settingPath: 'taskbar.lockTaskbar',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'AutoHide',
    type: 'REG_DWORD',
    settingPath: 'taskbar.autoHide',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'KeepOnTop',
    type: 'REG_DWORD',
    settingPath: 'taskbar.keepOnTop',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'GroupButtons',
    type: 'REG_DWORD',
    settingPath: 'taskbar.groupButtons',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'ShowQuickLaunch',
    type: 'REG_DWORD',
    settingPath: 'taskbar.showQuickLaunch',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'ShowClock',
    type: 'REG_DWORD',
    settingPath: 'taskbar.showClock',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Taskbar',
    valueName: 'HideInactiveIcons',
    type: 'REG_DWORD',
    settingPath: 'taskbar.hideInactiveIcons',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartMenu',
    valueName: 'Style',
    type: 'REG_SZ',
    settingPath: 'taskbar.startMenuStyle',
    toRegistry: (value) => value === 'classic' ? 'classic' : 'modern',
    fromRegistry: (value) => value === 'classic' ? 'classic' : 'modern',
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Multimedia\\Audio',
    valueName: 'Volume',
    type: 'REG_DWORD',
    settingPath: 'audio.volume',
    toRegistry: (value) => Math.max(0, Math.min(100, Number.parseInt(String(value), 10) || 0)),
    fromRegistry: (value) => Math.max(0, Math.min(100, Number.parseInt(String(value), 10) || 0)),
  },
  {
    path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Multimedia\\Audio',
    valueName: 'Mute',
    type: 'REG_DWORD',
    settingPath: 'audio.muted',
    toRegistry: (value) => value ? 1 : 0,
    fromRegistry: (value) => Number.parseInt(String(value), 10) === 1,
  },
];

const REGISTRY_BINDING_MAP = new Map(
  REGISTRY_BINDINGS.map((binding) => [`${binding.path}::${binding.valueName}`, binding])
);

function cloneRegistry(registry) {
  return JSON.parse(JSON.stringify(registry));
}

function loadRegistry() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return createDefaultRegistry();
}

function saveRegistry(registry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch {
    // ignore
  }
}

function navigateToKey(registry, path) {
  if (!path) return null;
  const parts = path.split('\\').filter(Boolean);
  if (parts.length === 0) return null;

  const rootName = parts[0];
  let current = registry[rootName];
  if (!current) return null;

  for (let index = 1; index < parts.length; index += 1) {
    if (!current.children || !current.children[parts[index]]) return null;
    current = current.children[parts[index]];
  }

  return current;
}

function getSettingValue(settings, path) {
  return path.split('.').reduce((current, segment) => current?.[segment], settings);
}

function ensureKeyPath(registry, path) {
  const parts = path.split('\\').filter(Boolean);
  if (parts.length === 0) return null;

  const rootName = parts[0];
  if (!registry[rootName]) {
    registry[rootName] = { _type: 'key', children: {}, _values: {} };
  }

  let current = registry[rootName];

  for (let index = 1; index < parts.length; index += 1) {
    const segment = parts[index];
    if (!current.children) current.children = {};
    if (!current.children[segment]) {
      current.children[segment] = { _type: 'key', children: {}, _values: {} };
    }
    current = current.children[segment];
  }

  if (!current._values) current._values = {};
  if (!current.children) current.children = {};
  return current;
}

function mergeRegistryNode(schemaNode, savedNode) {
  if (!savedNode || savedNode._type !== 'key') {
    return cloneRegistry(schemaNode);
  }

  const merged = {
    _type: 'key',
    children: {},
    _values: {
      ...(schemaNode._values || {}),
      ...(savedNode._values || {}),
    },
  };

  const childNames = new Set([
    ...Object.keys(schemaNode.children || {}),
    ...Object.keys(savedNode.children || {}),
  ]);

  childNames.forEach((childName) => {
    const schemaChild = schemaNode.children?.[childName];
    const savedChild = savedNode.children?.[childName];
    if (schemaChild) {
      merged.children[childName] = mergeRegistryNode(schemaChild, savedChild);
    } else if (savedChild) {
      merged.children[childName] = cloneRegistry(savedChild);
    }
  });

  return merged;
}

function mergeRegistryWithSchema(registry) {
  const schema = createDefaultRegistry();
  if (!registry) return schema;

  const merged = {};
  const rootNames = new Set([
    ...Object.keys(schema),
    ...Object.keys(registry),
  ]);

  rootNames.forEach((rootName) => {
    const schemaRoot = schema[rootName];
    const savedRoot = registry[rootName];

    if (schemaRoot) {
      merged[rootName] = mergeRegistryNode(schemaRoot, savedRoot);
    } else if (savedRoot) {
      merged[rootName] = cloneRegistry(savedRoot);
    }
  });

  return merged;
}

function applyShellSettingsBindings(registry, settings) {
  const next = cloneRegistry(registry);

  REGISTRY_BINDINGS.forEach((binding) => {
    const node = ensureKeyPath(next, binding.path);
    if (!node) return;
    node._values[binding.valueName] = {
      type: binding.type,
      data: binding.toRegistry(getSettingValue(settings, binding.settingPath)),
    };
  });

  return next;
}

function normalizeRegistry(registry, settings) {
  return applyShellSettingsBindings(mergeRegistryWithSchema(registry), settings);
}

function getRegistryBinding(path, valueName) {
  return REGISTRY_BINDING_MAP.get(`${path}::${valueName}`) || null;
}

function collectSchemaKeyPaths(registry) {
  const paths = new Set();

  const visit = (node, path) => {
    paths.add(path);
    Object.entries(node.children || {}).forEach(([childName, childNode]) => {
      visit(childNode, `${path}\\${childName}`);
    });
  };

  Object.entries(registry).forEach(([rootName, rootNode]) => {
    visit(rootNode, rootName);
  });

  return paths;
}

const PROTECTED_KEY_PATHS = collectSchemaKeyPaths(createDefaultRegistry());

export function RegistryProvider({ children }) {
  const { settings, setSetting, resetSetting, resetShellSettings } = useShellSettings();
  const [registryState, setRegistryState] = useState(() => mergeRegistryWithSchema(loadRegistry()));
  const registry = useMemo(() => normalizeRegistry(registryState, settings), [registryState, settings]);

  useEffect(() => {
    saveRegistry(registry);
  }, [registry]);

  const getKey = useCallback((path) => navigateToKey(registry, path), [registry]);

  const getSubKeys = useCallback((path) => {
    const node = navigateToKey(registry, path);
    if (!node || !node.children) return [];
    return Object.keys(node.children);
  }, [registry]);

  const getValues = useCallback((path) => {
    const node = navigateToKey(registry, path);
    if (!node) return {};
    return node._values || {};
  }, [registry]);

  const getValue = useCallback((path, valueName) => {
    const node = navigateToKey(registry, path);
    if (!node || !node._values) return null;
    return node._values[valueName] || null;
  }, [registry]);

  const setValue = useCallback((path, valueName, type, data) => {
    const binding = getRegistryBinding(path, valueName);
    if (binding) {
      setSetting(binding.settingPath, binding.fromRegistry(data));
      return;
    }

    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = ensureKeyPath(next, path);
      if (!node) return prev;
      node._values[valueName] = { type, data };
      return mergeRegistryWithSchema(next);
    });
  }, [setSetting]);

  const deleteValue = useCallback((path, valueName) => {
    const binding = getRegistryBinding(path, valueName);
    if (binding) {
      resetSetting(binding.settingPath);
      return;
    }

    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = navigateToKey(next, path);
      if (!node || !node._values || !node._values[valueName]) return prev;
      delete node._values[valueName];
      return mergeRegistryWithSchema(next);
    });
  }, [resetSetting]);

  const renameValue = useCallback((path, oldName, newName) => {
    if (getRegistryBinding(path, oldName)) {
      return;
    }

    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = navigateToKey(next, path);
      if (!node || !node._values || !node._values[oldName] || node._values[newName]) {
        return prev;
      }
      node._values[newName] = node._values[oldName];
      delete node._values[oldName];
      return mergeRegistryWithSchema(next);
    });
  }, []);

  const createKey = useCallback((path, keyName) => {
    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = ensureKeyPath(next, path);
      if (!node) return prev;
      if (node.children[keyName]) return prev;
      node.children[keyName] = {
        _type: 'key',
        children: {},
        _values: { '(Default)': { type: 'REG_SZ', data: '' } },
      };
      return mergeRegistryWithSchema(next);
    });
  }, []);

  const deleteKey = useCallback((path, keyName) => {
    const keyPath = `${path}\\${keyName}`;
    if (PROTECTED_KEY_PATHS.has(keyPath)) {
      return;
    }

    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = navigateToKey(next, path);
      if (!node || !node.children || !node.children[keyName]) return prev;
      delete node.children[keyName];
      return mergeRegistryWithSchema(next);
    });
  }, []);

  const renameKey = useCallback((parentPath, oldName, newName) => {
    const keyPath = `${parentPath}\\${oldName}`;
    if (PROTECTED_KEY_PATHS.has(keyPath)) {
      return;
    }

    setRegistryState((prev) => {
      const next = cloneRegistry(prev);
      const node = navigateToKey(next, parentPath);
      if (!node || !node.children || !node.children[oldName] || node.children[newName]) {
        return prev;
      }
      node.children[newName] = node.children[oldName];
      delete node.children[oldName];
      return mergeRegistryWithSchema(next);
    });
  }, []);

  const resetRegistry = useCallback(() => {
    resetShellSettings();
    setRegistryState(mergeRegistryWithSchema(createDefaultRegistry()));
  }, [resetShellSettings]);

  const getRootKeys = useCallback(() => Object.keys(registry), [registry]);

  const isBoundValue = useCallback((path, valueName) => {
    return Boolean(getRegistryBinding(path, valueName));
  }, []);

  const isProtectedKey = useCallback((path) => {
    return PROTECTED_KEY_PATHS.has(path);
  }, []);

  const value = {
    registry,
    getKey,
    getSubKeys,
    getValues,
    getValue,
    setValue,
    deleteValue,
    renameValue,
    createKey,
    deleteKey,
    renameKey,
    resetRegistry,
    getRootKeys,
    isBoundValue,
    isProtectedKey,
  };

  return (
    <RegistryContext.Provider value={value}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return context;
}

export default RegistryContext;
