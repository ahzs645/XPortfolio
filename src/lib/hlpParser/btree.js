import { WINDOWS_1252 } from './binaryUtils';

const BTREE_MAGIC = 0x293B;
const decoder = new TextDecoder(WINDOWS_1252);

export function readDirectoryEntries(reader, directoryStart) {
  reader.seek(directoryStart);
  reader.readInt32(); // reserved space
  reader.readInt32(); // used space
  reader.readUint8(); // file flags

  const btreeMagic = reader.readUint16();
  if (btreeMagic !== BTREE_MAGIC) {
    throw new Error(`Invalid B+ tree magic: 0x${btreeMagic.toString(16)}`);
  }

  reader.readUint16(); // flags
  const pageSize = reader.readUint16();
  reader.readFixedString(16); // structure
  reader.skip(2);
  reader.readUint16(); // page splits
  const rootPage = reader.readUint16();
  reader.skip(2);
  const totalPages = reader.readUint16();
  const nLevels = reader.readUint16();
  reader.readUint32(); // total entries

  const pagesStart = reader.offset;
  const leftmostLeaf = findLeftmostLeaf(reader, pagesStart, rootPage, pageSize, nLevels);
  return readLeafEntries(reader, pagesStart, leftmostLeaf, pageSize, totalPages);
}

function findLeftmostLeaf(reader, pagesStart, rootPage, pageSize, nLevels) {
  if (nLevels <= 1) return rootPage;

  let currentPage = rootPage;
  for (let level = nLevels; level > 1; level--) {
    const pageOffset = pagesStart + currentPage * pageSize;
    if (pageOffset + 6 > reader.length) return currentPage;
    reader.seek(pageOffset);
    reader.skip(4);
    currentPage = reader.readUint16();
  }

  return currentPage;
}

function readLeafEntries(reader, pagesStart, startPage, pageSize, totalPages) {
  const entries = [];
  const visited = new Set();
  let pageNum = startPage;

  while (pageNum >= 0 && pageNum < totalPages && !visited.has(pageNum)) {
    visited.add(pageNum);
    const pageOffset = pagesStart + pageNum * pageSize;
    const pageEnd = pageOffset + pageSize;

    if (pageOffset + 6 > reader.length) break;
    reader.seek(pageOffset);
    reader.skip(2);
    const nextPage = reader.readInt16();
    const nEntries = reader.readUint16();

    for (let i = 0; i < nEntries; i++) {
      if (reader.offset + 5 > pageEnd || reader.offset + 5 > reader.length) break;
      const rawName = reader.readString(Math.min(256, pageEnd - reader.offset));
      if (reader.offset + 4 > pageEnd || reader.offset + 4 > reader.length) break;
      const fileOffset = reader.readInt32();
      entries.push({ rawName, name: normalizeInternalFileName(rawName), fileOffset });
    }

    pageNum = nextPage;
  }

  return entries;
}

export function normalizeInternalFileName(name) {
  if (!name) return '';

  let start = 0;
  while (start < name.length && isControlOrExtended(name.charCodeAt(start))) {
    start += 1;
  }
  let cleaned = name.slice(start);
  const pipeIndex = cleaned.indexOf('|');
  if (pipeIndex > 0) {
    cleaned = cleaned.slice(pipeIndex);
  }

  return cleaned.trim();
}

export function isPlausibleInternalFileName(name) {
  if (!name || name.length > 128) return false;
  if ([...name].some((char) => isControlChar(char.charCodeAt(0)))) return false;
  return name.startsWith('|') || /^[A-Za-z0-9_. -]+$/.test(name);
}

export function isPlausibleInternalFileOffset(reader, offset) {
  if (offset < 16 || offset + 9 > reader.length) return false;

  try {
    const savedOffset = reader.offset;
    reader.seek(offset);
    const reservedSpace = reader.readInt32();
    const usedSpace = reader.readInt32();
    reader.readUint8();
    reader.seek(savedOffset);

    if (reservedSpace <= 0 || usedSpace <= 0) return false;
    if (reservedSpace > reader.length || usedSpace > reader.length) return false;
    return offset + Math.min(reservedSpace, usedSpace) <= reader.length + 9;
  } catch {
    return false;
  }
}

export function decodeBytes(bytes) {
  return decoder.decode(bytes);
}

function isControlChar(code) {
  return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
}

function isControlOrExtended(code) {
  return code <= 0x1f || (code >= 0x7f && code <= 0xff);
}
