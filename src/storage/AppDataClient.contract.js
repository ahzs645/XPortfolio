/**
 * Runtime contract for local app data.
 *
 * The app should talk to this shape instead of Dexie, IndexedDB, or Convex
 * directly. A future Convex adapter can implement the same groups with Convex
 * queries/mutations/actions behind them.
 *
 * fileSystems:
 * - Exposes one filesystem metadata snapshot per owner/user to the app.
 * - Snapshot data should stay JSON-like: IDs, names, parent links,
 *   timestamps, metadata, storage keys, and small inline text content only.
 * - The public adapter API still returns a snapshot for the current in-memory
 *   XP filesystem, but Dexie persists each item as a separate fileSystemItems
 *   record so the storage shape mirrors a future Convex document table.
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
 * - Values should stay JSON-compatible so this table can become a Convex
 *   document table without local serialization rules leaking into app code.
 *
 * backup:
 * - Exports/imports a versioned envelope that can be used for local backups or
 *   a future one-way migration to Convex.
 *
 * Current grain:
 * - fileSystems is owner metadata; fileSystemItems is the durable node table.
 *   The snapshot shape is assembled at the adapter boundary for existing app
 *   code and backup compatibility.
 */
export const APP_DATA_CLIENT_METHODS = Object.freeze({
  fileSystems: ['get', 'save', 'delete', 'importLegacy', 'importLegacyGlobalForUser'],
  fileContents: ['get', 'set', 'delete', 'copy'],
  localSettings: ['get', 'set', 'delete', 'getMany', 'setMany', 'exportKeys'],
  backup: ['exportAll', 'importAll'],
  maintenance: ['clearAll', 'importLegacyFileContents'],
});
