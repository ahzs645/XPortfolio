import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const RegistryContext = createContext(null);

// Default Windows XP registry structure (simplified)
// Each node is either a key (has children) or a value
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
                }},
              }},
            }},
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
              }},
            }},
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
                    },
                  },
                }, _values: {
                  'DisplayName': { type: 'REG_SZ', data: 'i8042 Keyboard and PS/2 Mouse Port Driver' },
                  'Start': { type: 'REG_DWORD', data: 1 },
                  'Type': { type: 'REG_DWORD', data: 1 },
                }},
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
                'Explorer': { _type: 'key', children: {},
                  _values: {
                    'ShellState': { type: 'REG_BINARY', data: '24 00 00 00' },
                  },
                },
              }, _values: {} },
            }, _values: {} },
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
        '.DEFAULT': { _type: 'key', children: {},
          _values: {},
        },
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

const STORAGE_KEY = 'xp-registry';

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

// Navigate to a registry key by path string like "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet"
function navigateToKey(registry, path) {
  if (!path) return null;
  const parts = path.split('\\').filter(Boolean);
  if (parts.length === 0) return null;

  const rootName = parts[0];
  let current = registry[rootName];
  if (!current) return null;

  for (let i = 1; i < parts.length; i++) {
    if (!current.children || !current.children[parts[i]]) return null;
    current = current.children[parts[i]];
  }
  return current;
}

export function RegistryProvider({ children }) {
  const [registry, setRegistry] = useState(loadRegistry);

  useEffect(() => {
    saveRegistry(registry);
  }, [registry]);

  // Get a key node by path
  const getKey = useCallback((path) => {
    return navigateToKey(registry, path);
  }, [registry]);

  // Get children key names of a path
  const getSubKeys = useCallback((path) => {
    const node = navigateToKey(registry, path);
    if (!node || !node.children) return [];
    return Object.keys(node.children);
  }, [registry]);

  // Get values at a path
  const getValues = useCallback((path) => {
    const node = navigateToKey(registry, path);
    if (!node) return {};
    return node._values || {};
  }, [registry]);

  // Get a specific value
  const getValue = useCallback((path, valueName) => {
    const node = navigateToKey(registry, path);
    if (!node || !node._values) return null;
    return node._values[valueName] || null;
  }, [registry]);

  // Set a value at a path
  const setValue = useCallback((path, valueName, type, data) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, path);
      if (!node) return prev;
      if (!node._values) node._values = {};
      node._values[valueName] = { type, data };
      return next;
    });
  }, []);

  // Delete a value at a path
  const deleteValue = useCallback((path, valueName) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, path);
      if (!node || !node._values || !node._values[valueName]) return prev;
      delete node._values[valueName];
      return next;
    });
  }, []);

  // Rename a value
  const renameValue = useCallback((path, oldName, newName) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, path);
      if (!node || !node._values || !node._values[oldName]) return prev;
      if (node._values[newName]) return prev; // name already exists
      node._values[newName] = node._values[oldName];
      delete node._values[oldName];
      return next;
    });
  }, []);

  // Create a new subkey
  const createKey = useCallback((path, keyName) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, path);
      if (!node) return prev;
      if (!node.children) node.children = {};
      if (node.children[keyName]) return prev; // already exists
      node.children[keyName] = { _type: 'key', children: {}, _values: { '(Default)': { type: 'REG_SZ', data: '' } } };
      return next;
    });
  }, []);

  // Delete a subkey (and all its children)
  const deleteKey = useCallback((path, keyName) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, path);
      if (!node || !node.children || !node.children[keyName]) return prev;
      delete node.children[keyName];
      return next;
    });
  }, []);

  // Rename a subkey
  const renameKey = useCallback((parentPath, oldName, newName) => {
    setRegistry(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = navigateToKey(next, parentPath);
      if (!node || !node.children || !node.children[oldName]) return prev;
      if (node.children[newName]) return prev;
      node.children[newName] = node.children[oldName];
      delete node.children[oldName];
      return next;
    });
  }, []);

  // Reset registry to defaults
  const resetRegistry = useCallback(() => {
    const fresh = createDefaultRegistry();
    setRegistry(fresh);
  }, []);

  // Get all root key names
  const getRootKeys = useCallback(() => {
    return Object.keys(registry);
  }, [registry]);

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
