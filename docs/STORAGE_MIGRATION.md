# Storage Migration Notes

XPortfolio is moving toward a Dexie-backed local data client that can later be
replaced by a Convex adapter with less rewrite.

## Current Local Shape

The shared storage boundary is `src/storage`.

- `fileSystems`: one filesystem metadata snapshot per owner/user.
  - Key: `ownerId`
  - Value: JSON-like filesystem snapshot.
  - Convex mapping: `ownerId` remains an app-level owner field. The snapshot can
    later become either a document snapshot or normalized file/folder documents.

- `fileContents`: binary or large file payloads keyed by app-generated storage
  keys.
  - Key: `storageKey`
  - Value: Blob/string/file payload.
  - Convex mapping: `storageKey` remains the app-level content key. Convex `_id`
    should stay internal.

- `localSettings`: small key/value settings that historically lived in
  `localStorage`.
  - Key: setting name, such as `xp-volume` or `userAccounts`.
  - Value: string value, usually JSON for structured settings.
  - Convex mapping: owner-scoped settings documents shaped like
    `{ ownerId, key, value, updatedAt }`.

## Migration Rule

New app code should use `appDataClient` instead of direct `localStorage`,
`idb-keyval`, Dexie tables, or future Convex calls.

During the migration, `localSettings` mirrors writes back to `localStorage`.
That keeps older components working while each setting cluster is moved behind
the shared boundary.

## Future Convex Adapter

`createConvexDataClient()` intentionally exposes the same method groups as the
Dexie client:

- `fileSystems`
- `fileContents`
- `localSettings`
- `backup`
- `maintenance`

The stub currently throws until real Convex queries, mutations, actions, and
storage APIs are wired in.

