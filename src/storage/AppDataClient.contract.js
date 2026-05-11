/**
 * Runtime contract for local app data.
 *
 * The app should talk to this shape instead of Dexie, IndexedDB, or Convex
 * directly. A future Convex adapter can implement the same groups with Convex
 * queries/mutations/actions behind them.
 *
 * fileSystems:
 * - Stores one filesystem metadata snapshot per owner/user.
 * - Snapshot records should stay JSON-like: IDs, names, parent links,
 *   timestamps, metadata, storage keys, and small inline text content only.
 *
 * fileContents:
 * - Stores large or binary file payloads by app-generated storageKey.
 * - Filesystem records reference content with storageKey instead of embedding
 *   Blob/File values directly.
 *
 * localSettings:
 * - Stores small key/value settings that historically lived in localStorage.
 * - The Dexie adapter mirrors writes to localStorage while older contexts are
 *   gradually migrated.
 *
 * backup:
 * - Exports/imports a versioned envelope that can be used for local backups or
 *   a future one-way migration to Convex.
 */
export const APP_DATA_CLIENT_METHODS = Object.freeze({
  fileSystems: ['get', 'save', 'delete', 'importLegacy', 'importLegacyGlobalForUser'],
  fileContents: ['get', 'set', 'delete', 'copy'],
  localSettings: ['get', 'set', 'delete', 'getMany', 'setMany', 'exportKeys'],
  backup: ['exportAll', 'importAll'],
  maintenance: ['clearAll', 'importLegacyFileContents'],
});
