/* eslint-disable no-unused-vars */
/**
 * WinHelp (.HLP) file parser.
 *
 * Parses the binary WinHelp format used by Windows 3.x/95/98/XP.
 * Based on the reverse-engineered specification by Manfred Winterhoff.
 *
 * File structure:
 * - 16-byte header (magic 0x00035F3F)
 * - Internal file system using B+ trees
 * - |SYSTEM: metadata, title, copyright
 * - |TOPIC: topic content blocks
 * - |FONT: font descriptors
 * - |KWBTREE/|KWDATA: keyword indices
 * - |CONTEXT: context hash → topic mapping
 * - |Phrases: phrase compression table
 */
import { BinaryReader } from './BinaryReader';
import { decompressLZ77 } from './decompress';

const HLP_MAGIC = 0x00035F3F;
const BTREE_MAGIC = 0x293B;
const SYSTEM_MAGIC = 0x036C;

// SYSTEM record types
const SYS_TITLE = 1;
const SYS_COPYRIGHT = 2;
const SYS_CONTENTS = 3;
const SYS_CONFIG = 4;
const SYS_ICON = 5;
const SYS_WINDOW = 6;
const SYS_CITATION = 8;
const SYS_LCID = 9;
const SYS_CNT = 10;
const SYS_CHARSET = 12;
const SYS_DEFFONT = 14;

// Topic record types
const TL_TOPICHDR = 0x02;
const TL_TOPICTXT = 0x20;
const TL_TABLE = 0x23;
const TL_DISPLAY30 = 0x01;

export class HlpParser {
  constructor(buffer) {
    this.reader = new BinaryReader(buffer);
    this.internalFiles = new Map();
    this.title = '';
    this.copyright = '';
    this.contentsTopicOffset = 0;
    this.compressionType = 0; // 0=none, 4=LZ77
    this.version = 0;
    this.topics = [];
    this.fonts = [];
    this.phrases = [];
    this.keywords = [];
    this.topicBlockSize = 4096;
  }

  parse() {
    this._readHeader();
    this._readDirectory();
    this._readSystem();
    this._readPhrases();
    this._readFonts();
    this._readTopics();
    this._readKeywords();

    return {
      title: this.title,
      copyright: this.copyright,
      topics: this.topics,
      fonts: this.fonts,
      keywords: this.keywords,
      version: this.version,
    };
  }

  _readHeader() {
    const r = this.reader;
    r.seek(0);
    const magic = r.readUint32();
    if (magic !== HLP_MAGIC) {
      throw new Error(`Invalid HLP file: bad magic 0x${magic.toString(16)} (expected 0x${HLP_MAGIC.toString(16)})`);
    }
    this.directoryStart = r.readInt32();
    this.firstFreeBlock = r.readInt32();
    this.fileSize = r.readInt32();
  }

  _readDirectory() {
    const r = this.reader;
    // Read directory FILEHEADER
    r.seek(this.directoryStart);
    const reservedSpace = r.readInt32();
    const usedSpace = r.readInt32();
    const fileFlags = r.readUint8();

    // Read BTREEHEADER
    const btreeMagic = r.readUint16();
    if (btreeMagic !== BTREE_MAGIC) {
      throw new Error(`Invalid B+ tree magic: 0x${btreeMagic.toString(16)}`);
    }

    const btreeFlags = r.readUint16();
    const pageSize = r.readUint16();
    const structure = r.readFixedString(16);
    r.skip(2); // must be zero
    const pageSplits = r.readUint16();
    const rootPage = r.readUint16();
    r.skip(2); // must be -1
    const totalPages = r.readUint16();
    const nLevels = r.readUint16();
    const totalEntries = r.readUint32();

    const pagesStart = r.offset;
    this._readBTreePages(pagesStart, rootPage, pageSize, nLevels, totalPages);
  }

  _readBTreePages(pagesStart, rootPage, pageSize, nLevels, totalPages) {
    const r = this.reader;

    // For leaf-only tree (nLevels=1), just read leaf pages via linked list
    if (nLevels <= 1) {
      this._readLeafPages(pagesStart, rootPage, pageSize);
      return;
    }

    // Multi-level: find the leftmost leaf by descending through index pages
    let currentPage = rootPage;
    for (let level = nLevels; level > 1; level--) {
      const pageOffset = pagesStart + currentPage * pageSize;
      if (pageOffset + 6 > r.length) return;
      r.seek(pageOffset);
      r.skip(2); // unused
      r.readUint16(); // nEntries
      currentPage = r.readUint16(); // first child page
    }

    // Now read all leaf pages via linked list starting from leftmost
    this._readLeafPages(pagesStart, currentPage, pageSize);
  }

  _readLeafPages(pagesStart, startPage, pageSize) {
    const r = this.reader;
    const visited = new Set();
    let pageNum = startPage;

    while (pageNum >= 0 && !visited.has(pageNum)) {
      visited.add(pageNum);
      const pageOffset = pagesStart + pageNum * pageSize;
      const pageEnd = pageOffset + pageSize;

      if (pageOffset + 6 > r.length) break;
      r.seek(pageOffset);

      r.skip(2); // previous page
      const nextPage = r.readInt16();
      const nEntries = r.readUint16();

      for (let i = 0; i < nEntries; i++) {
        if (r.offset + 5 > pageEnd || r.offset + 5 > r.length) break;
        try {
          const filename = r.readString();
          if (r.offset + 4 > r.length) break;
          const fileOffset = r.readInt32();
          this.internalFiles.set(filename, fileOffset);
        } catch {
          break;
        }
      }

      pageNum = nextPage;
    }
  }

  _readInternalFile(name) {
    const offset = this.internalFiles.get(name);
    if (offset === undefined) return null;

    const r = this.reader;
    r.seek(offset);
    const reservedSpace = r.readInt32();
    const usedSpace = r.readInt32();
    const flags = r.readUint8();

    const dataOffset = r.offset;
    const dataLength = usedSpace - 9; // subtract FILEHEADER size
    if (dataLength <= 0) return null;

    return this.reader.slice(dataOffset, dataLength);
  }

  _readSystem() {
    const sys = this._readInternalFile('|SYSTEM');
    if (!sys) return;

    const magic = sys.readUint16();
    if (magic !== SYSTEM_MAGIC) return;

    const minor = sys.readUint16();
    const major = sys.readUint16();
    this.version = major * 100 + minor;
    const genDate = sys.readInt32();
    const flags = sys.readUint16();

    // Determine compression
    if (flags & 0x0004) {
      this.compressionType = 4; // LZ77 with 4k window
    } else if (flags & 0x0008) {
      this.compressionType = 8; // LZ77 with 2k window
    }

    // Read SYSTEM records
    while (sys.remaining > 4) {
      const recType = sys.readUint16();
      const recLen = sys.readUint16();

      if (recLen > sys.remaining) break;

      const recStart = sys.offset;
      switch (recType) {
        case SYS_TITLE:
          this.title = sys.readString(recLen);
          break;
        case SYS_COPYRIGHT:
          this.copyright = sys.readString(recLen);
          break;
        case SYS_CONTENTS:
          this.contentsTopicOffset = sys.readInt32();
          break;
        default:
          break;
      }
      sys.seek(recStart + recLen);
    }
  }

  _readPhrases() {
    // Try new-style phrase table first (|PhrIndex + |PhrImage)
    const phrIndex = this._readInternalFile('|PhrIndex');
    const phrImage = this._readInternalFile('|PhrImage');

    if (phrIndex && phrImage) {
      this._readNewPhrases(phrIndex, phrImage);
      return;
    }

    // Try old-style phrase table (|Phrases)
    const oldPhrases = this._readInternalFile('|Phrases');
    if (oldPhrases) {
      this._readOldPhrases(oldPhrases);
    }
  }

  _readOldPhrases(reader) {
    const numPhrases = reader.readUint16();
    const offsets = [];
    for (let i = 0; i <= numPhrases; i++) {
      offsets.push(reader.readUint16());
    }

    const dataStart = reader.offset;
    for (let i = 0; i < numPhrases; i++) {
      const start = dataStart + offsets[i];
      const end = dataStart + offsets[i + 1];
      const len = end - start;
      if (len > 0 && start + len <= reader.length) {
        reader.seek(start);
        this.phrases.push(reader.readFixedString(len));
      } else {
        this.phrases.push('');
      }
    }
  }

  _readNewPhrases(indexReader, imageReader) {
    // New-style: |PhrIndex has count + offsets, |PhrImage has LZ77-compressed data
    const numPhrases = indexReader.readUint16();
    indexReader.skip(2); // one-bits count (for Hall compression)

    const offsets = [];
    for (let i = 0; i <= numPhrases; i++) {
      offsets.push(indexReader.readUint16());
    }

    // Decompress the image data
    const compressedData = imageReader.readBytes(imageReader.remaining);
    let phraseData;
    try {
      const totalSize = offsets[numPhrases] || 0;
      if (totalSize > 0) {
        phraseData = decompressLZ77(compressedData, totalSize);
      } else {
        phraseData = compressedData;
      }
    } catch {
      phraseData = compressedData;
    }

    const decoder = new TextDecoder('windows-1252');
    for (let i = 0; i < numPhrases; i++) {
      const start = offsets[i];
      const end = offsets[i + 1];
      if (end > start && end <= phraseData.length) {
        this.phrases.push(decoder.decode(phraseData.slice(start, end)));
      } else {
        this.phrases.push('');
      }
    }
  }

  _readFonts() {
    const fontFile = this._readInternalFile('|FONT');
    if (!fontFile) return;

    if (fontFile.remaining < 8) return;
    const numFacenames = fontFile.readUint16();
    const numDescriptors = fontFile.readUint16();
    const facenamesOffset = fontFile.readUint16();
    const descriptorsOffset = fontFile.readUint16();

    // Determine descriptor size: old style (11 bytes) vs new style (variable)
    // If facenamesOffset >= 12, there may be style/charmap info after
    const descSize = numDescriptors > 0 && descriptorsOffset > 0 && facenamesOffset > descriptorsOffset
      ? Math.floor((facenamesOffset - descriptorsOffset) / numDescriptors)
      : numDescriptors > 0 && descriptorsOffset > 0
        ? Math.max(11, Math.floor((fontFile.length - descriptorsOffset) / Math.max(numDescriptors, 1)))
        : 11;

    // Read face names (each is a null-terminated string within a 32-byte slot)
    const faceNames = [];
    if (facenamesOffset < fontFile.length) {
      fontFile.seek(facenamesOffset);
      for (let i = 0; i < numFacenames && fontFile.remaining >= 1; i++) {
        // Face names are stored in fixed 32-byte slots
        faceNames.push(fontFile.readFixedString(32));
      }
    }

    // Read font descriptors
    if (descriptorsOffset < fontFile.length) {
      fontFile.seek(descriptorsOffset);
      for (let i = 0; i < numDescriptors && fontFile.remaining >= 11; i++) {
        try {
          if (descSize >= 24) {
            // New-style descriptor (HC31+/Win95): 24+ bytes
            const attrs = fontFile.readUint8();
            const halfPoints = fontFile.readUint16();
            const fontFamily = fontFile.readUint8();
            const faceIndex = fontFile.readUint16();
            const fgR = fontFile.readUint8();
            const fgG = fontFile.readUint8();
            const fgB = fontFile.readUint8();
            const bgR = fontFile.readUint8();
            const bgG = fontFile.readUint8();
            const bgB = fontFile.readUint8();
            // Skip remaining bytes of new-style descriptor
            const consumed = 12;
            if (descSize > consumed) fontFile.skip(descSize - consumed);

            this.fonts.push({
              face: faceNames[faceIndex] || 'MS Sans Serif',
              size: Math.max(1, Math.round(halfPoints / 2)),
              bold: !!(attrs & 0x01),
              italic: !!(attrs & 0x02),
              underline: !!(attrs & 0x04),
              strikeout: !!(attrs & 0x08),
              doubleUnderline: !!(attrs & 0x10),
              smallCaps: !!(attrs & 0x20),
              fgColor: `rgb(${fgR},${fgG},${fgB})`,
              bgColor: `rgb(${bgR},${bgG},${bgB})`,
            });
          } else {
            // Old-style descriptor (HC30): 11 bytes
            const attrs = fontFile.readUint8();
            const halfPoints = fontFile.readUint16();
            const fontFamily = fontFile.readUint8();
            const faceIndex = fontFile.readUint16();
            const fgR = fontFile.readUint8();
            const fgG = fontFile.readUint8();
            const fgB = fontFile.readUint8();
            const bgR = fontFile.readUint8();
            const bgG = fontFile.readUint8();
            const bgB = fontFile.readUint8();

            this.fonts.push({
              face: faceNames[faceIndex] || 'MS Sans Serif',
              size: Math.max(1, Math.round(halfPoints / 2)),
              bold: !!(attrs & 0x01),
              italic: !!(attrs & 0x02),
              underline: !!(attrs & 0x04),
              strikeout: !!(attrs & 0x08),
              doubleUnderline: !!(attrs & 0x10),
              smallCaps: !!(attrs & 0x20),
              fgColor: `rgb(${fgR},${fgG},${fgB})`,
              bgColor: `rgb(${bgR},${bgG},${bgB})`,
            });
          }
        } catch {
          break;
        }
      }
    }

    if (this.fonts.length === 0) {
      this.fonts.push({
        face: 'MS Sans Serif',
        size: 10,
        bold: false,
        italic: false,
        underline: false,
        strikeout: false,
        doubleUnderline: false,
        smallCaps: false,
        fgColor: 'rgb(0,0,0)',
        bgColor: 'rgb(255,255,255)',
      });
    }
  }

  _readTopics() {
    const topicFile = this._readInternalFile('|TOPIC');
    if (!topicFile) return;

    const topicData = topicFile.readBytes(topicFile.remaining);
    const blockSize = this.topicBlockSize;
    const isCompressed = this.compressionType !== 0;

    // Step 1: Process blocks - strip 12-byte headers, decompress payloads, concatenate
    const payloads = [];
    let pos = 0;
    while (pos + 12 <= topicData.length) {
      const blockEnd = Math.min(pos + blockSize, topicData.length);

      // Skip 12-byte TOPICBLOCKHEADER (always uncompressed)
      const payload = topicData.slice(pos + 12, blockEnd);

      if (isCompressed && payload.length > 0) {
        try {
          const decompressed = decompressLZ77(payload, blockSize * 4);
          payloads.push(decompressed);
        } catch {
          payloads.push(payload);
        }
      } else {
        payloads.push(payload);
      }

      pos = blockEnd;
    }

    // Concatenate all payloads (headers stripped)
    const totalLen = payloads.reduce((sum, p) => sum + p.length, 0);
    const allData = new Uint8Array(totalLen);
    let writePos = 0;
    for (const p of payloads) {
      allData.set(p, writePos);
      writePos += p.length;
    }

    // Step 2: Parse topic links linearly from concatenated data
    pos = 0;
    let safety = 0;
    while (pos + 21 <= allData.length && safety < 10000) {
      safety++;
      try {
        const linkData = this._readTopicLink(allData, pos, allData.length);
        if (!linkData) break;

        if (linkData.topic) {
          this.topics.push(linkData.topic);
        }

        if (linkData.nextPos <= pos) break;
        pos = linkData.nextPos;
      } catch {
        break;
      }
    }

    // Fallback if nothing parsed
    if (this.topics.length === 0) {
      this.topics.push({
        id: 0,
        title: this.title || 'Help',
        content: [{ type: 'text', text: 'This help file could not be fully parsed. The file may use an unsupported format version.' }],
        links: [],
      });
    }
  }

  _readTopicLink(data, pos, blockEnd) {
    if (pos + 21 > blockEnd) return null;

    const blockSize = readInt32(data, pos);
    const dataLen2 = readInt32(data, pos + 4);
    const prevBlock = readInt32(data, pos + 8);
    const nextBlock = readInt32(data, pos + 12);
    const dataLen1 = readInt32(data, pos + 16);
    const recType = data[pos + 20];

    if (blockSize <= 0 || blockSize > 65536) return null;

    const headerSize = 21;
    const contentStart = pos + headerSize;
    const contentEnd = Math.min(pos + blockSize, blockEnd);

    if (contentStart >= contentEnd) {
      return { nextPos: pos + Math.max(blockSize, headerSize), topic: null };
    }

    const rawContent = data.slice(contentStart, contentEnd);

    let topic = null;
    if (recType === TL_TOPICHDR || recType === TL_DISPLAY30) {
      topic = this._parseTopicHeader(rawContent, this.topics.length);
    } else if (recType === TL_TOPICTXT || recType === TL_TABLE) {
      const textContent = this._parseTopicText(rawContent);
      if (this.topics.length > 0 && textContent.length > 0) {
        this.topics[this.topics.length - 1].content.push(...textContent);
      } else if (textContent.length > 0) {
        topic = {
          id: this.topics.length,
          title: '',
          content: textContent,
          links: [],
        };
      }
    }

    return {
      nextPos: pos + Math.max(blockSize, headerSize),
      topic,
    };
  }

  _parseTopicHeader(data, topicId) {
    if (data.length < 2) {
      return {
        id: topicId,
        title: `Topic ${topicId}`,
        content: [],
        links: [],
      };
    }

    // Extract title from the data - it's after formatting info
    const text = this._extractText(data);
    const lines = text.split('\n');
    const title = lines[0] || `Topic ${topicId}`;

    return {
      id: topicId,
      title: title.trim(),
      content: [],
      links: [],
    };
  }

  _parseTopicText(data) {
    const content = [];
    const text = this._extractText(data);

    if (text.trim()) {
      // Split by newlines and create paragraph elements
      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        if (para.trim()) {
          content.push({ type: 'text', text: para });
        }
      }
    }

    return content;
  }

  _extractText(data) {
    const result = [];
    const decoder = new TextDecoder('windows-1252');
    let i = 0;

    // Skip paragraph formatting info
    if (data.length > 0) {
      const formatFlags = data[0];
      let skipBytes = 1;

      // Paragraph format fields - sizes vary by version/format
      if (formatFlags & 0x01) skipBytes += 4; // SpacingAbove
      if (formatFlags & 0x02) skipBytes += 4; // SpacingBelow
      if (formatFlags & 0x04) skipBytes += 4; // SpacingLines
      if (formatFlags & 0x08) skipBytes += 4; // LeftIndent
      if (formatFlags & 0x10) skipBytes += 4; // RightIndent
      if (formatFlags & 0x20) skipBytes += 4; // FirstlineIndent
      if (formatFlags & 0x40) skipBytes += 4; // Border info
      if (formatFlags & 0x80) {
        // Tab stops: 2-byte count + variable data
        if (skipBytes + 2 <= data.length) {
          const numTabs = data[skipBytes] | (data[skipBytes + 1] << 8);
          skipBytes += 2 + numTabs * 4;
        }
      }

      skipBytes = Math.min(skipBytes, data.length);
      i = skipBytes;
    }

    while (i < data.length) {
      const byte = data[i];

      if (byte === 0) {
        // Null terminator - end of text section
        break;
      } else if (byte >= 0x80 && byte <= 0x8F) {
        // Inline formatting command
        switch (byte) {
          case 0x80: // Font change (followed by 2-byte font number)
            i += 3;
            continue;
          case 0x81: // Line break
            result.push('\n');
            break;
          case 0x82: // Paragraph end
            result.push('\n');
            break;
          case 0x83: // Tab
            result.push('\t');
            break;
          case 0x86: // Hotspot start (variable length, skip until end marker)
          case 0x87:
          case 0x88:
            i++;
            while (i < data.length && data[i] !== 0x89) i++;
            i++; // skip end marker
            continue;
          case 0x89: // End of hotspot
            break;
          case 0x8B: // Non-break space
            result.push(' ');
            break;
          case 0x8C: // Non-break hyphen
            result.push('-');
            break;
          default:
            break;
        }
        i++;
      } else if (byte === 0xFF) {
        // Formatting separator - skip and continue (NOT end of text)
        i++;
      } else if (byte >= 0xC8 && byte <= 0xCF) {
        // Macro commands - skip
        i++;
        if (i + 1 < data.length) {
          const macroLen = data[i] | (data[i + 1] << 8);
          i += 2 + macroLen;
        }
      } else if (byte >= 0xE0 && byte <= 0xEF) {
        // Topic jump / popup
        i++;
        i += 4; // skip hash/offset
      } else if (byte >= 0x20 && byte <= 0x7F) {
        // Regular printable ASCII character
        result.push(String.fromCharCode(byte));
        i++;
      } else if (byte >= 0xA0) {
        // Extended character (windows-1252 range, printable)
        result.push(decoder.decode(new Uint8Array([byte])));
        i++;
      } else if (byte < 0x10 && this.phrases.length > byte && byte > 0) {
        // Phrase reference (old-style compression)
        if (this.phrases[byte]) {
          result.push(this.phrases[byte]);
        }
        i++;
      } else {
        // Unknown control byte - skip
        i++;
      }
    }

    return result.join('');
  }

  _readKeywords() {
    // Try |KWBTREE
    const kwbtree = this._readInternalFile('|KWBTREE');
    if (!kwbtree) return;

    try {
      const btreeMagic = kwbtree.readUint16();
      if (btreeMagic !== BTREE_MAGIC) return;

      kwbtree.skip(2); // flags
      const pageSize = kwbtree.readUint16();
      kwbtree.readFixedString(16); // structure
      kwbtree.skip(2); // must be zero
      kwbtree.skip(2); // page splits
      const rootPage = kwbtree.readUint16();
      kwbtree.skip(2); // must be -1
      const totalPages = kwbtree.readUint16();
      const nLevels = kwbtree.readUint16();
      const totalEntries = kwbtree.readUint32();

      // Simple extraction: just scan for readable strings
      // Full B+ tree traversal is complex; extract keywords heuristically
      const pagesStart = kwbtree.offset;
      this._extractKeywordsFromPages(kwbtree, pagesStart, rootPage, pageSize, nLevels);
    } catch {
      // Keywords are optional
    }
  }

  _extractKeywordsFromPages(reader, pagesStart, rootPage, pageSize, nLevels) {
    // Simplified: read leaf pages for keywords
    const readLeafPage = (pageNum) => {
      try {
        reader.seek(pagesStart + pageNum * pageSize);
        reader.skip(2); // previous page
        const nextPage = reader.readInt16();
        const nEntries = reader.readUint16();

        for (let i = 0; i < nEntries && reader.remaining > 6; i++) {
          const keyword = reader.readString();
          const count = reader.readUint16();
          const kwdataOffset = reader.readUint32();

          if (keyword.trim()) {
            this.keywords.push({
              keyword,
              topicCount: count,
            });
          }
        }

        if (nextPage >= 0) {
          readLeafPage(nextPage);
        }
      } catch {
        // End of pages
      }
    };

    if (nLevels <= 1) {
      readLeafPage(rootPage);
    } else {
      // For multi-level trees, find the first leaf page
      try {
        reader.seek(pagesStart + rootPage * pageSize);
        reader.skip(2); // unused
        const nEntries = reader.readUint16();
        const firstChild = reader.readUint16();
        readLeafPage(firstChild);
      } catch {
        readLeafPage(0);
      }
    }
  }
}

// Helper to read little-endian int32 from Uint8Array
function readInt32(data, offset) {
  return (data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)) | 0;
}

export default HlpParser;
