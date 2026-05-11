function createUnavailableMethod(methodName) {
  return async () => {
    throw new Error(`Convex data client is not configured yet: ${methodName}`);
  };
}

export function createConvexDataClient() {
  return {
    fileSystems: {
      get: createUnavailableMethod('fileSystems.get'),
      save: createUnavailableMethod('fileSystems.save'),
      delete: createUnavailableMethod('fileSystems.delete'),
      importLegacy: createUnavailableMethod('fileSystems.importLegacy'),
      importLegacyGlobalForUser: createUnavailableMethod('fileSystems.importLegacyGlobalForUser'),
    },
    fileContents: {
      get: createUnavailableMethod('fileContents.get'),
      set: createUnavailableMethod('fileContents.set'),
      delete: createUnavailableMethod('fileContents.delete'),
      copy: createUnavailableMethod('fileContents.copy'),
    },
    localSettings: {
      get: createUnavailableMethod('localSettings.get'),
      set: createUnavailableMethod('localSettings.set'),
      delete: createUnavailableMethod('localSettings.delete'),
      getMany: createUnavailableMethod('localSettings.getMany'),
      setMany: createUnavailableMethod('localSettings.setMany'),
      exportKeys: createUnavailableMethod('localSettings.exportKeys'),
    },
    backup: {
      exportAll: createUnavailableMethod('backup.exportAll'),
      importAll: createUnavailableMethod('backup.importAll'),
    },
    maintenance: {
      clearAll: createUnavailableMethod('maintenance.clearAll'),
      importLegacyFileContents: createUnavailableMethod('maintenance.importLegacyFileContents'),
    },
  };
}

