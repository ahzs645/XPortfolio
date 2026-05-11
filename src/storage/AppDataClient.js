import * as legacyKeyval from 'idb-keyval';
import { localDb } from './localDexie/db';
import { APP_DATA_SCHEMA_VERSION, createExportEnvelope, isValidExportEnvelope } from './schema';

const FILE_SYSTEM_LEGACY_PREFIX = 'fileSystem';

export const LOCAL_OWNER_ID = 'local';

export function getFileSystemOwnerId(userId) {
  return userId || LOCAL_OWNER_ID;
}

function getLegacyFileSystemKey(userId) {
  return userId ? `${FILE_SYSTEM_LEGACY_PREFIX}-${userId}` : FILE_SYSTEM_LEGACY_PREFIX;
}

function isLegacyFileSystemKey(key) {
  return typeof key === 'string' && (
    key === FILE_SYSTEM_LEGACY_PREFIX ||
    key.startsWith(`${FILE_SYSTEM_LEGACY_PREFIX}-`)
  );
}

function isLegacyFileSystemValue(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (value instanceof Blob || value instanceof File || value instanceof ArrayBuffer) {
    return false;
  }

  return Boolean(
    value._migratedToPerUser ||
    value['c-drive'] ||
    value['desktop-folder'] ||
    value['recycle-bin']
  );
}

export function createDexieDataClient() {
  const client = {
    fileSystems: {
      async get(userId) {
        const ownerId = getFileSystemOwnerId(userId);
        const record = await localDb.fileSystems.get(ownerId);
        return record?.snapshot || null;
      },

      async save(userId, snapshot) {
        const ownerId = getFileSystemOwnerId(userId);
        await localDb.fileSystems.put({
          ownerId,
          snapshot,
          updatedAt: Date.now(),
        });
      },

      async delete(userId) {
        const ownerId = getFileSystemOwnerId(userId);
        await localDb.fileSystems.delete(ownerId);
        await legacyKeyval.del(getLegacyFileSystemKey(userId));
      },

      async importLegacy(userId) {
        const legacyKey = getLegacyFileSystemKey(userId);
        const legacySnapshot = await legacyKeyval.get(legacyKey);
        if (!legacySnapshot) {
          return null;
        }

        await client.fileSystems.save(userId, legacySnapshot);
        return legacySnapshot;
      },

      async importLegacyGlobalForUser(userId) {
        if (!userId) {
          return null;
        }

        const legacySnapshot = await legacyKeyval.get(FILE_SYSTEM_LEGACY_PREFIX);
        if (!legacySnapshot || legacySnapshot._migratedToPerUser) {
          return null;
        }

        const migratedSnapshot = {
          ...legacySnapshot,
          _migratedToPerUser: true,
        };

        await client.fileSystems.save(userId, migratedSnapshot);
        await legacyKeyval.set(FILE_SYSTEM_LEGACY_PREFIX, migratedSnapshot);
        return migratedSnapshot;
      },
    },

    fileContents: {
      async get(storageKey) {
        if (!storageKey) {
          return null;
        }

        const record = await localDb.fileContents.get(storageKey);
        if (record) {
          return record.content;
        }

        const legacyContent = await legacyKeyval.get(storageKey);
        if (legacyContent != null) {
          await client.fileContents.set(storageKey, legacyContent);
        }
        return legacyContent ?? null;
      },

      async set(storageKey, content) {
        await localDb.fileContents.put({
          storageKey,
          content,
          size: content instanceof Blob ? content.size : 0,
          contentType: content instanceof Blob ? content.type : '',
          updatedAt: Date.now(),
        });
      },

      async delete(storageKey) {
        if (!storageKey) {
          return;
        }

        await localDb.fileContents.delete(storageKey);
        await legacyKeyval.del(storageKey);
      },

      async copy(sourceStorageKey, targetStorageKey) {
        const content = await client.fileContents.get(sourceStorageKey);
        if (content) {
          await client.fileContents.set(targetStorageKey, content);
        }
        return content;
      },
    },

    localSettings: {
      async get(key) {
        const record = await localDb.localSettings.get(key);
        if (record) {
          return record.value;
        }

        const value = localStorage.getItem(key);
        if (value !== null) {
          await client.localSettings.set(key, value);
        }
        return value;
      },

      async set(key, value) {
        await localDb.localSettings.put({
          key,
          value,
          updatedAt: Date.now(),
        });
        localStorage.setItem(key, value);
      },

      async delete(key) {
        await localDb.localSettings.delete(key);
        localStorage.removeItem(key);
      },

      async getMany(keys) {
        const entries = await Promise.all(keys.map(async (key) => [key, await client.localSettings.get(key)]));
        return Object.fromEntries(entries.filter(([, value]) => value !== null));
      },

      async setMany(settings) {
        await Promise.all(
          Object.entries(settings).map(([key, value]) => client.localSettings.set(key, value))
        );
      },

      async exportKeys(keys) {
        const settings = await client.localSettings.getMany(keys);
        return Object.entries(settings).map(([key, value]) => ({
          key,
          value,
          updatedAt: Date.now(),
        }));
      },
    },

    backup: {
      async exportAll(options = {}) {
        const { settingKeys = [] } = options;
        const [fileSystems, fileContents, localSettings] = await Promise.all([
          localDb.fileSystems.toArray(),
          localDb.fileContents.toArray(),
          settingKeys.length > 0
            ? client.localSettings.exportKeys(settingKeys)
            : localDb.localSettings.toArray(),
        ]);

        return createExportEnvelope({
          fileSystems,
          fileContents,
          localSettings,
        });
      },

      async importAll(envelope, options = {}) {
        if (!isValidExportEnvelope(envelope)) {
          throw new Error(`Unsupported app data export. Expected schema version ${APP_DATA_SCHEMA_VERSION}.`);
        }

        const { replace = false } = options;

        await localDb.transaction('rw', localDb.fileSystems, localDb.fileContents, localDb.localSettings, async () => {
          if (replace) {
            await localDb.fileSystems.clear();
            await localDb.fileContents.clear();
            await localDb.localSettings.clear();
          }

          await localDb.fileSystems.bulkPut(envelope.fileSystems);
          await localDb.fileContents.bulkPut(envelope.fileContents);
          await localDb.localSettings.bulkPut(envelope.localSettings);
        });

        await Promise.all(
          envelope.localSettings.map(({ key, value }) => {
            localStorage.setItem(key, value);
            return Promise.resolve();
          })
        );
      },
    },

    maintenance: {
      async clearAll() {
        await localDb.transaction('rw', localDb.fileSystems, localDb.fileContents, localDb.localSettings, localDb.meta, async () => {
          await localDb.fileSystems.clear();
          await localDb.fileContents.clear();
          await localDb.localSettings.clear();
          await localDb.meta.clear();
        });
      },

      async importLegacyFileContents() {
        const keys = await legacyKeyval.keys();
        const contentKeys = keys.filter((key) => !isLegacyFileSystemKey(key));

        await Promise.all(contentKeys.map(async (key) => {
          const value = await legacyKeyval.get(key);
          if (!isLegacyFileSystemValue(value)) {
            await client.fileContents.set(key, value);
          }
        }));
      },
    },
  };

  return client;
}

export const appDataClient = createDexieDataClient();
