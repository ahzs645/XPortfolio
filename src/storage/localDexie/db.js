import Dexie from 'dexie';

export const LOCAL_DATABASE_NAME = 'xportfolio-local';

export const localDb = new Dexie(LOCAL_DATABASE_NAME);

localDb.version(1).stores({
  fileSystems: '&ownerId, updatedAt',
  fileContents: '&storageKey, updatedAt, contentType',
  meta: '&key',
});

localDb.version(2).stores({
  fileSystems: '&ownerId, updatedAt',
  fileContents: '&storageKey, updatedAt, contentType',
  localSettings: '&key, updatedAt',
  meta: '&key',
});
