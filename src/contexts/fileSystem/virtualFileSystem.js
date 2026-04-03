import { SYSTEM_IDS } from './constants';

export const VFS_ROOT_PATH = '';
export const VFS_ROOT_LABEL = 'My Computer';
export const VFS_RECYCLE_BIN_PATH = 'C:/RECYCLER';

const ROOT_NODE_ID = '__vfs_root__';

const DRIVE_LETTER_BY_SYSTEM_ID = {
  [SYSTEM_IDS.C_DRIVE]: 'C',
  [SYSTEM_IDS.D_DRIVE]: 'D',
  [SYSTEM_IDS.E_DRIVE]: 'E',
};

const SPECIAL_PATH_BY_ID = {
  [SYSTEM_IDS.RECYCLE_BIN]: VFS_RECYCLE_BIN_PATH,
};

const SPECIAL_ALIASES_BY_ID = {
  [SYSTEM_IDS.RECYCLE_BIN]: ['Recycle Bin'],
};

const PATH_ALIASES_BY_ID = {
  [SYSTEM_IDS.DESKTOP]: ['Desktop'],
  [SYSTEM_IDS.MY_DOCUMENTS]: ['My Documents'],
  [SYSTEM_IDS.MY_PICTURES]: ['My Pictures'],
  [SYSTEM_IDS.MY_MUSIC]: ['My Music'],
  [SYSTEM_IDS.PROGRAM_FILES]: ['Program Files'],
  [SYSTEM_IDS.FAVORITES]: ['Favorites'],
};

const normalizeLowerKey = (path) => normalizeVirtualPath(path).toLowerCase();

function getDriveLetter(item) {
  const explicit = DRIVE_LETTER_BY_SYSTEM_ID[item?.id];
  if (explicit) {
    return explicit;
  }

  const name = item?.name || '';
  const match = name.match(/\(([A-Za-z]):\)/) || name.match(/^([A-Za-z]):/);
  return match ? match[1].toUpperCase() : null;
}

export function normalizeVirtualPath(path) {
  if (path == null) {
    return VFS_ROOT_PATH;
  }

  let normalized = String(path).trim();
  if (!normalized || normalized.toLowerCase() === VFS_ROOT_LABEL.toLowerCase()) {
    return VFS_ROOT_PATH;
  }

  normalized = normalized.replace(/\\/g, '/').replace(/\/+/g, '/');

  const driveMatch = normalized.match(/^([A-Za-z]):(?:\/(.*))?$/);
  if (driveMatch) {
    const drive = `${driveMatch[1].toUpperCase()}:`;
    const rest = driveMatch[2] ? `/${driveMatch[2]}` : '/';
    normalized = `${drive}${rest}`;
  }

  if (normalized !== VFS_ROOT_PATH && !/^[A-Za-z]:\/$/.test(normalized)) {
    normalized = normalized.replace(/\/$/, '');
  }

  return normalized;
}

export function joinVirtualPath(basePath, ...segments) {
  let current = normalizeVirtualPath(basePath);

  segments.forEach((segment) => {
    const part = String(segment ?? '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

    if (!part) {
      return;
    }

    if (!current) {
      current = normalizeVirtualPath(part);
      return;
    }

    if (/^[A-Za-z]:\/$/.test(current)) {
      current = normalizeVirtualPath(`${current}${part}`);
      return;
    }

    current = normalizeVirtualPath(`${current}/${part}`);
  });

  return current;
}

export function dirnameVirtualPath(path) {
  const normalized = normalizeVirtualPath(path);

  if (!normalized || normalized === VFS_ROOT_PATH) {
    return VFS_ROOT_PATH;
  }

  if (/^[A-Za-z]:\/$/.test(normalized)) {
    return VFS_ROOT_PATH;
  }

  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash <= 2 && /^[A-Za-z]:/.test(normalized)) {
    return `${normalized.slice(0, 2)}/`;
  }

  if (lastSlash < 0) {
    return VFS_ROOT_PATH;
  }

  return normalized.slice(0, lastSlash) || VFS_ROOT_PATH;
}

export function basenameVirtualPath(path) {
  const normalized = normalizeVirtualPath(path);

  if (!normalized || normalized === VFS_ROOT_PATH) {
    return '';
  }

  if (/^[A-Za-z]:\/$/.test(normalized)) {
    return normalized.slice(0, 2);
  }

  return normalized.slice(normalized.lastIndexOf('/') + 1);
}

function registerPath(map, path, id) {
  const normalized = normalizeVirtualPath(path);
  map.set(normalizeLowerKey(normalized), id);

  if (/^[A-Za-z]:\/$/.test(normalized)) {
    map.set(normalized.slice(0, 2).toLowerCase(), id);
  }
}

function buildPathIndex(fileSystem) {
  const pathById = new Map();
  const idByPath = new Map();

  const registerNode = (id, canonicalPath, aliases = []) => {
    const normalizedCanonical = normalizeVirtualPath(canonicalPath);
    pathById.set(id, normalizedCanonical);
    registerPath(idByPath, normalizedCanonical, id);
    aliases.forEach((alias) => registerPath(idByPath, alias, id));
  };

  const visit = (itemId, canonicalPath, aliasPaths = []) => {
    const item = fileSystem?.[itemId];
    if (!item) {
      return;
    }

    registerNode(itemId, canonicalPath, [
      ...aliasPaths,
      ...(PATH_ALIASES_BY_ID[itemId] || []),
    ]);

    if (!item.children?.length) {
      return;
    }

    item.children.forEach((childId) => {
      const child = fileSystem[childId];
      if (!child?.name) {
        return;
      }

      const childCanonicalPath = joinVirtualPath(canonicalPath, child.name);
      const childAliases = aliasPaths.map((alias) => joinVirtualPath(alias, child.name));

      visit(childId, childCanonicalPath, childAliases);
    });
  };

  registerNode(ROOT_NODE_ID, VFS_ROOT_PATH, ['/', VFS_ROOT_LABEL]);

  Object.values(fileSystem || {})
    .filter((item) => item?.type === 'drive' && !item.parent)
    .forEach((drive) => {
      const driveLetter = getDriveLetter(drive);
      if (!driveLetter) {
        return;
      }

      const drivePath = `${driveLetter}:/`;
      visit(drive.id, drivePath, [drive.name]);
    });

  Object.entries(SPECIAL_PATH_BY_ID).forEach(([id, specialPath]) => {
    if (!fileSystem?.[id]) {
      return;
    }

    registerNode(id, specialPath, SPECIAL_ALIASES_BY_ID[id] || []);
  });

  return {
    pathById,
    idByPath,
  };
}

function toVirtualNode(fileSystem, pathById, id) {
  if (id === ROOT_NODE_ID) {
    return {
      id: ROOT_NODE_ID,
      type: 'root',
      name: VFS_ROOT_LABEL,
      path: VFS_ROOT_PATH,
      metadata: { virtual: true },
    };
  }

  const item = fileSystem?.[id];
  if (!item) {
    return null;
  }

  return {
    ...item,
    path: pathById.get(id) || VFS_ROOT_PATH,
    metadata: item.metadata || {},
  };
}

function toFilePayload(content, options = {}) {
  if (content instanceof Blob) {
    return {
      data: content,
      size: content.size,
      type: content.type || options.contentType || 'application/octet-stream',
    };
  }

  if (typeof content === 'string') {
    const blob = new Blob([content], { type: options.contentType || 'text/plain' });
    return {
      data: blob,
      size: blob.size,
      type: blob.type,
    };
  }

  const blob = new Blob([content], { type: options.contentType || 'application/octet-stream' });
  return {
    data: blob,
    size: blob.size,
    type: blob.type,
  };
}

export function createVirtualFileSystemAdapter({
  fileSystem,
  createItem,
  createFile,
  deleteItem,
  renameItem,
  moveItem,
  getFileContent,
  saveFileContent,
}) {
  const { pathById, idByPath } = buildPathIndex(fileSystem);

  const getIdForPath = (path) => {
    const normalized = normalizeVirtualPath(path);
    return idByPath.get(normalizeLowerKey(normalized)) || null;
  };

  const getPathForId = (id) => pathById.get(id) || VFS_ROOT_PATH;

  const getNodeById = (id) => toVirtualNode(fileSystem, pathById, id);

  const listRootNodes = () =>
    Object.values(fileSystem || {})
      .filter((item) => item?.type === 'drive' && !item.parent)
      .map((item) => getNodeById(item.id))
      .filter(Boolean);

  return {
    rootId: ROOT_NODE_ID,
    rootLabel: VFS_ROOT_LABEL,
    recycleBinPath: VFS_RECYCLE_BIN_PATH,
    normalizePath: normalizeVirtualPath,
    join: joinVirtualPath,
    dirname: dirnameVirtualPath,
    basename: basenameVirtualPath,
    getIdForPath,
    getPathForId,
    resolvePath(path) {
      const id = getIdForPath(path);
      return id ? getNodeById(id) : null;
    },
    getNodeById,
    exists(path) {
      return Boolean(getIdForPath(path));
    },
    async open(path) {
      const normalized = normalizeVirtualPath(path);
      if (normalized === VFS_ROOT_PATH) {
        return getNodeById(ROOT_NODE_ID);
      }

      const id = getIdForPath(normalized);
      return id ? getNodeById(id) : null;
    },
    async list(path = VFS_ROOT_PATH) {
      const normalized = normalizeVirtualPath(path);
      if (normalized === VFS_ROOT_PATH) {
        return listRootNodes();
      }

      const folderId = getIdForPath(normalized);
      const folder = folderId ? fileSystem?.[folderId] : null;
      if (!folder || !folder.children) {
        return [];
      }

      return folder.children
        .map((childId) => getNodeById(childId))
        .filter(Boolean);
    },
    async readFile(path) {
      const id = getIdForPath(path);
      if (!id) {
        return null;
      }

      const item = fileSystem?.[id];
      if (!item || item.children) {
        return null;
      }

      if (item.content !== undefined) {
        return item.content;
      }

      return getFileContent ? getFileContent(id) : null;
    },
    async mkdir(path, options = {}) {
      const normalized = normalizeVirtualPath(path);
      if (!normalized || normalized === VFS_ROOT_PATH || getIdForPath(normalized)) {
        return null;
      }

      const parentId = getIdForPath(dirnameVirtualPath(normalized));
      const folderName = basenameVirtualPath(normalized);
      if (!parentId || !folderName) {
        return null;
      }

      return createItem
        ? createItem(parentId, folderName, 'folder', options)
        : null;
    },
    async writeFile(path, content, options = {}) {
      const normalized = normalizeVirtualPath(path);
      if (!normalized || normalized === VFS_ROOT_PATH) {
        return null;
      }

      const existingId = getIdForPath(normalized);
      if (existingId) {
        const existing = fileSystem?.[existingId];
        if (!existing || existing.children) {
          return null;
        }

        const payload = toFilePayload(content, options);
        return saveFileContent
          ? saveFileContent(existingId, payload.data)
          : null;
      }

      const parentId = getIdForPath(dirnameVirtualPath(normalized));
      const fileName = basenameVirtualPath(normalized);
      if (!parentId || !fileName || !createFile) {
        return null;
      }

      return createFile(parentId, fileName, toFilePayload(content, options), options);
    },
    async rename(path, newName) {
      const id = getIdForPath(path);
      return id && renameItem ? renameItem(id, newName) : false;
    },
    async delete(path) {
      const id = getIdForPath(path);
      return id && deleteItem ? deleteItem(id) : false;
    },
    async move(sourcePath, targetDirectoryPath) {
      const sourceId = getIdForPath(sourcePath);
      const targetParentId = getIdForPath(targetDirectoryPath);
      return sourceId && targetParentId && moveItem
        ? moveItem(sourceId, targetParentId)
        : false;
    },
  };
}

