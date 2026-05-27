import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as legacyKeyval from 'idb-keyval';
import {
  APP_DATA_CLIENT_METHODS,
  appDataClient,
  createConvexDataClient,
  createDexieDataClient,
  isValidExportEnvelope,
} from '../index';
import { localDb } from '../localDexie/db';

function createMemoryLocalStorage() {
  const store = new Map();
  return {
    clear: () => store.clear(),
    getItem: (key) => store.get(String(key)) ?? null,
    removeItem: (key) => store.delete(String(key)),
    setItem: (key, value) => store.set(String(key), String(value)),
  };
}

describe('AppDataClient', () => {
  beforeEach(async () => {
    globalThis.localStorage = createMemoryLocalStorage();
    await localDb.open();
    await appDataClient.maintenance.clearAll();
    await legacyKeyval.clear();
  });

  afterEach(async () => {
    await appDataClient.maintenance.clearAll();
    await legacyKeyval.clear();
    localStorage.clear();
    localDb.close();
  });

  it('exports and imports a versioned backup envelope', async () => {
    const client = createDexieDataClient();
    const fileSystem = {
      root: {
        id: 'root',
        type: 'folder',
        name: 'Root',
        children: ['file-1'],
        dateCreated: 1,
        dateModified: 1,
      },
      'file-1': {
        id: 'file-1',
        type: 'file',
        name: 'note.txt',
        parent: 'root',
        storageType: 'local',
        storageKey: 'content-1',
        dateCreated: 1,
        dateModified: 1,
      },
    };

    await client.fileSystems.save('user-1', fileSystem);
    await client.fileContents.set('content-1', 'hello');
    await client.localSettings.set('xp-active-theme', 'luna');

    const storedItems = await localDb.fileSystemItems.where('ownerId').equals('user-1').toArray();
    expect(storedItems).toHaveLength(2);
    expect(storedItems.find(({ itemId }) => itemId === 'file-1')?.item).toEqual(fileSystem['file-1']);
    expect(await localDb.fileSystems.get('user-1')).not.toHaveProperty('snapshot');

    const backup = await client.backup.exportAll();
    expect(isValidExportEnvelope(backup)).toBe(true);
    expect(backup.fileSystems).toHaveLength(1);
    expect(backup.fileSystems[0].snapshot).toEqual(fileSystem);
    expect(backup.fileContents).toHaveLength(1);
    expect(backup.localSettings).toHaveLength(1);

    await client.maintenance.clearAll();
    await client.backup.importAll(backup);

    await expect(client.fileSystems.get('user-1')).resolves.toEqual(fileSystem);
    await expect(client.fileContents.get('content-1')).resolves.toBe('hello');
    await expect(client.localSettings.get('xp-active-theme')).resolves.toBe('luna');
    expect(localStorage.getItem('xp-active-theme')).toBe('luna');
  });

  it('migrates an old owner-scoped filesystem snapshot to item records on read', async () => {
    const client = createDexieDataClient();
    const legacySnapshot = {
      root: {
        id: 'root',
        type: 'folder',
        name: 'Root',
        children: ['file-1'],
        dateCreated: 1,
        dateModified: 1,
      },
      'file-1': {
        id: 'file-1',
        type: 'file',
        name: 'note.txt',
        parent: 'root',
        dateCreated: 1,
        dateModified: 2,
      },
    };

    await localDb.fileSystems.put({
      ownerId: 'legacy-user',
      snapshot: legacySnapshot,
      updatedAt: 3,
    });

    await expect(client.fileSystems.get('legacy-user')).resolves.toEqual(legacySnapshot);

    const storedItems = await localDb.fileSystemItems.where('ownerId').equals('legacy-user').toArray();
    expect(storedItems).toHaveLength(2);
    expect(storedItems.find(({ itemId }) => itemId === 'file-1')?.updatedAt).toBe(2);
    expect(await localDb.fileSystems.get('legacy-user')).not.toHaveProperty('snapshot');
  });

  it('imports selected localStorage settings on first read', async () => {
    localStorage.setItem('xp-run-history', JSON.stringify(['calc']));

    await expect(appDataClient.localSettings.get('xp-run-history')).resolves.toBe(JSON.stringify(['calc']));

    const record = await localDb.localSettings.get('xp-run-history');
    expect(record.value).toBe(JSON.stringify(['calc']));
  });

  it('imports legacy idb-keyval settings on first read', async () => {
    const installedApps = {
      'custom-app': {
        id: 'custom-app',
        name: 'Custom App',
        installedAt: 1,
      },
    };
    await legacyKeyval.set('xportfolio-installed-apps', installedApps);

    await expect(appDataClient.localSettings.get('xportfolio-installed-apps')).resolves.toEqual(installedApps);

    const record = await localDb.localSettings.get('xportfolio-installed-apps');
    expect(record.value).toEqual(installedApps);
  });

  it('reads legacy idb-keyval file content and stores it in Dexie', async () => {
    await legacyKeyval.set('legacy-content-key', 'legacy content');

    await expect(appDataClient.fileContents.get('legacy-content-key')).resolves.toBe('legacy content');

    const record = await localDb.fileContents.get('legacy-content-key');
    expect(record.content).toBe('legacy content');
  });

  it('stores, reads, copies, and deletes file content by storageKey', async () => {
    await appDataClient.fileContents.set('content-a', 'file body');
    await expect(appDataClient.fileContents.get('content-a')).resolves.toBe('file body');

    await appDataClient.fileContents.copy('content-a', 'content-b');
    await expect(appDataClient.fileContents.get('content-b')).resolves.toBe('file body');

    await appDataClient.fileContents.delete('content-a');
    await expect(appDataClient.fileContents.get('content-a')).resolves.toBeNull();
    await expect(appDataClient.fileContents.get('content-b')).resolves.toBe('file body');
  });

  it('exposes a Convex-shaped adapter with the same method groups', () => {
    const convexClient = createConvexDataClient();
    const dexieClient = createDexieDataClient();

    Object.entries(APP_DATA_CLIENT_METHODS).forEach(([group, methods]) => {
      expect(Object.keys(convexClient[group]).sort()).toEqual(methods.slice().sort());
      expect(Object.keys(dexieClient[group]).sort()).toEqual(methods.slice().sort());
    });
  });
});
