import { readInt32, readUint16, WINDOWS_1252 } from './binaryUtils';

const BTREE_MAGIC = 0x293B;
const decoder = new TextDecoder(WINDOWS_1252);

export function readKeywordTables({ internalFiles, readInternalFile, sanitizeKeyword }) {
  const keywords = [];
  const keywordTables = keywordTableNames(internalFiles);

  for (const { tableName, btreeName, dataName } of keywordTables) {
    const kwbtree = readInternalFile(btreeName);
    const kwdata = readInternalFile(dataName);
    if (!kwbtree || !kwdata) continue;

    try {
      const btreeMagic = kwbtree.readUint16();
      if (btreeMagic !== BTREE_MAGIC) continue;

      kwbtree.skip(2);
      const pageSize = kwbtree.readUint16();
      kwbtree.readFixedString(16);
      kwbtree.skip(2);
      kwbtree.skip(2);
      const rootPage = kwbtree.readUint16();
      kwbtree.skip(2);
      kwbtree.readUint16();
      const nLevels = kwbtree.readUint16();
      kwbtree.readUint32();

      const pagesStart = kwbtree.offset;
      keywords.push(...extractKeywordsFromPages(kwbtree, kwdata, pagesStart, rootPage, pageSize, nLevels, tableName, sanitizeKeyword));
    } catch {
      // Keyword tables are optional and compiler-specific.
    }
  }

  return keywords;
}

function keywordTableNames(internalFiles) {
  const tables = new Map();

  const addTable = (tableName, btreeName, dataName) => {
    if (!tables.has(btreeName) && internalFiles.has(btreeName) && internalFiles.has(dataName)) {
      tables.set(btreeName, { tableName, btreeName, dataName });
    }
  };

  addTable('K', '|KWBTREE', '|KWDATA');

  for (const name of internalFiles.keys()) {
    const match = name.match(/^\|(.+)WBTREE$/);
    if (!match) continue;
    const tableName = match[1];
    addTable(tableName, name, `|${tableName}WDATA`);
  }

  return [...tables.values()];
}

function extractKeywordsFromPages(reader, kwdata, pagesStart, rootPage, pageSize, nLevels, tableName, sanitizeKeyword) {
  const keywords = [];
  const visitedPages = new Set();

  const readPage = (pageNum, level) => {
    if (pageNum < 0 || visitedPages.has(`${level}:${pageNum}`)) return;
    visitedPages.add(`${level}:${pageNum}`);

    const pageOffset = pagesStart + pageNum * pageSize;
    const available = reader.length - pageOffset;
    if (available < 4) return;
    const page = new Uint8Array(reader.buffer, pageOffset, Math.min(pageSize, available));
    const nEntries = readUint16(page, 2);

    if (level > 0) {
      let entryOffset = 4;
      for (let index = 0; index < nEntries + 1 && entryOffset + 2 <= page.length; index += 1) {
        const childPage = readUint16(page, entryOffset);
        readPage(childPage, level - 1);
        entryOffset += 2;
        while (entryOffset < page.length && page[entryOffset] !== 0) {
          entryOffset += 1;
        }
        entryOffset += 1;
      }
      return;
    }

    let entryOffset = 8;
    for (let index = 0; index < nEntries && entryOffset < page.length; index += 1) {
      const endOfKeyword = page.indexOf(0, entryOffset);
      if (endOfKeyword === -1 || endOfKeyword + 7 > page.length) {
        break;
      }

      const rawKeyword = decoder.decode(page.slice(entryOffset, endOfKeyword));
      entryOffset = endOfKeyword + 1;

      const keyword = sanitizeKeyword(rawKeyword);
      const count = readUint16(page, entryOffset);
      const kwdataOffset = readInt32(page, entryOffset + 2) >>> 0;
      entryOffset += 6;

      if (!keyword) continue;

      const topicOffsets = [];
      try {
        kwdata.seek(kwdataOffset);
        for (let entryIndex = 0; entryIndex < count && kwdata.remaining >= 4; entryIndex += 1) {
          topicOffsets.push(kwdata.readUint32());
        }
      } catch {
        // Ignore malformed keyword offsets.
      }

      keywords.push({
        keyword,
        table: tableName,
        topicCount: count,
        topicOffsets,
      });
    }
  };

  readPage(rootPage, Math.max(0, nLevels - 1));
  return keywords;
}
