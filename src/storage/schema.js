export const APP_DATA_SCHEMA_VERSION = 1;

export const APP_DATA_EXPORT_KIND = 'xportfolio.localData';

export function createExportEnvelope(payload) {
  return {
    kind: APP_DATA_EXPORT_KIND,
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    exportedAt: Date.now(),
    ...payload,
  };
}

export function isValidExportEnvelope(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.kind === APP_DATA_EXPORT_KIND &&
    value.schemaVersion === APP_DATA_SCHEMA_VERSION &&
    Array.isArray(value.fileSystems) &&
    Array.isArray(value.fileContents) &&
    Array.isArray(value.localSettings)
  );
}
