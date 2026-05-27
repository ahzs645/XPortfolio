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

localDb.version(3).stores({
  fileSystems: '&ownerId, updatedAt',
  fileSystemItems: '[ownerId+itemId], ownerId, itemId, parentId, type, storageKey, updatedAt',
  fileContents: '&storageKey, updatedAt, contentType',
  localSettings: '&key, updatedAt',
  meta: '&key',
}).upgrade(async (transaction) => {
  const fileSystems = transaction.table('fileSystems');
  const fileSystemItems = transaction.table('fileSystemItems');
  const records = await fileSystems.toArray();

  for (const record of records) {
    if (!record?.ownerId || !record.snapshot || typeof record.snapshot !== 'object') {
      continue;
    }

    const updatedAt = record.updatedAt || Date.now();
    const itemRecords = Object.values(record.snapshot)
      .filter((item) => item?.id)
      .map((item) => ({
        ownerId: record.ownerId,
        itemId: item.id,
        parentId: item.parent || '',
        type: item.type || '',
        storageKey: item.storageKey || '',
        updatedAt: item.dateModified || updatedAt,
        item,
      }));

    if (itemRecords.length > 0) {
      await fileSystemItems.bulkPut(itemRecords);
    }

    await fileSystems.put({
      ownerId: record.ownerId,
      updatedAt,
    });
  }
});
