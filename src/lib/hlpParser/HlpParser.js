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
import {
  decompressLZ77,
  decompressPhrasesNibble,
  decompressPhrasesOld,
  decompressPhrasesNew,
} from './decompress';

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

// Paragraph format flags
const FORMATF_UNKNOWN0001 = 0x0001;
const FORMATF_SB = 0x0002;
const FORMATF_SA = 0x0004;
const FORMATF_SL = 0x0008;
const FORMATF_LEFT = 0x0010;
const FORMATF_RIGHT = 0x0020;
const FORMATF_LEFTFIRST = 0x0040;
const FORMATF_BOX = 0x0100;
const FORMATF_TABS = 0x0200;

// Topic text command opcodes
const CMD_FONT = 0x80;
const CMD_LINE = 0x81;
const CMD_PAR = 0x82;
const CMD_TAB = 0x83;
const CMD_BMC = 0x86;
const CMD_BML = 0x87;
const CMD_BMR = 0x88;
const CMD_HOTSPOTEND = 0x89;
const CMD_NON_BREAKABLE_SPACE = 0x8B;
const CMD_POPUP30 = 0xE0;
const CMD_JUMP30 = 0xE1;
const CMD_POPUP = 0xE2;
const CMD_JUMP = 0xE3;
const CMD_POPUPHIDE = 0xE6;
const CMD_JUMPHIDE = 0xE7;
const CMD_MACRO = 0xC8;
const CMD_MACROHIDE = 0xCC;
const CMD_POPUPINTER = 0xEA;
const CMD_SECONDWIN = 0xEB;
const CMD_POPUPHIDEINTER = 0xEE;
const CMD_JUMPHIDEINTER = 0xEF;
const CMD_END = 0xFF;

const SMT_BMX30 = 0x03;
const SMT_EWX = 0x05;
const SMT_BMX = 0x22;

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
    this.phrases = [];       // String phrases for keyword display
    this.phraseBuffers = []; // Raw byte arrays for phrase decompression
    this.phraseStyle = 0;    // 0=none, 2=old (HC30), 3=new (HC31+)
    this.keywords = [];
    this.topicBlockSize = 4096;
    this.contextMap = new Map();
    this.titleOffsets = [];
  }

  parse() {
    this._readHeader();
    this._readDirectory();
    this._readSystem();
    this._readPhrases();
    this._readFonts();
    this._readContextMap();
    this._readTopics();
    this._readKeywords();
    this._readTitleOffsets();
    this._resolveLinksAndKeywords();

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
    // Per winhelpcgi: FileSize (field 2) is data size WITHOUT header
    // Per helpdeco: UsedSpace includes header, so subtract 9
    // Handle both: if usedSpace > reservedSpace-9, use usedSpace directly; otherwise usedSpace-9
    const dataLength = usedSpace > reservedSpace ? usedSpace : (usedSpace >= 9 ? usedSpace - 9 : usedSpace);
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

    if (minor <= 16 || (flags & 0x0008)) {
      this.topicBlockSize = 2048;
    } else {
      this.topicBlockSize = 4096;
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

    // Detect HC31 format: has OneHundred (0x0100) + DecompressedSize (4 bytes)
    const savedPos = reader.offset;
    const possibleOneHundred = reader.readUint16();
    let decompressedSizeHint = 0;
    let isHC31 = false;

    if (possibleOneHundred === 0x0100) {
      decompressedSizeHint = reader.readUint32();
      isHC31 = true;
      // |Phrases with HC31 header uses old-style decompression (bytes 1-15 as phrase refs)
      this.phraseStyle = 2;
    } else {
      reader.seek(savedPos);
      // HC30 |Phrases: single-byte refs (bytes 1-15)
      this.phraseStyle = 2;
    }

    // Read offset table: (numPhrases + 1) uint16 values
    const offsets = [];
    for (let i = 0; i <= numPhrases; i++) {
      offsets.push(reader.readUint16());
    }

    const offsetTableSize = (numPhrases + 1) * 2;
    const compressedData = reader.readBytes(reader.remaining);

    let phraseData;
    if (isHC31 && compressedData.length > 0) {
      // HC31: phrase data is LZ77-compressed
      // Offsets reference positions in [offsetTable | decompressedData]
      // So decompressed size = decompressedSizeHint - offsetTableSize
      const targetSize = decompressedSizeHint > offsetTableSize
        ? decompressedSizeHint - offsetTableSize
        : offsets[numPhrases] > offsetTableSize
          ? offsets[numPhrases] - offsetTableSize
          : compressedData.length * 4;
      try {
        phraseData = decompressLZ77(compressedData, targetSize);
      } catch {
        phraseData = compressedData;
      }
    } else {
      phraseData = compressedData;
    }

    // Extract phrases using offsets
    // For HC31, offsets are relative to start of offset table
    // For HC30, offsets are relative to start of phrase data
    const baseOffset = isHC31 ? offsetTableSize : 0;
    const decoder = new TextDecoder('windows-1252');

    for (let i = 0; i < numPhrases; i++) {
      const start = offsets[i] - baseOffset;
      const end = offsets[i + 1] - baseOffset;
      if (start >= 0 && end > start && end <= phraseData.length) {
        const bytes = phraseData.slice(start, end);
        this.phrases.push(decoder.decode(bytes));
        this.phraseBuffers.push(Array.from(bytes));
      } else {
        this.phrases.push('');
        this.phraseBuffers.push([]);
      }
    }
  }

  _readNewPhrases(indexReader, imageReader) {
    // Hall compression: |PhrIndex has count + offsets, |PhrImage has LZ77-compressed data
    this.phraseStyle = 3; // new-style (Uncompress3)
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
        const bytes = phraseData.slice(start, end);
        this.phrases.push(decoder.decode(bytes));
        this.phraseBuffers.push(Array.from(bytes));
      } else {
        this.phrases.push('');
        this.phraseBuffers.push([]);
      }
    }
  }

  _readFonts() {
    const fontFile = this._readInternalFile('|FONT');
    if (!fontFile) return;

    if (fontFile.remaining < 8) return;
    const numFacenames = fontFile.readUint16();
    const numDescriptors = fontFile.readUint16();
    const facenamesOffset = fontFile.readUint16();   // offset to face names
    const descriptorsOffset = fontFile.readUint16(); // offset to descriptors

    // Determine descriptor size
    const descSize = numDescriptors > 0 && descriptorsOffset > 0
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
    // Standard FONTDESCRIPTOR is 11 bytes: Attrs(1) HalfPoints(1) Family(1) Name(1) Unknown(1) FGRGB(3) BGRGB(3)
    // Long FONTDESCRIPTOR (MVCC) is 42+ bytes with different layout
    if (descriptorsOffset < fontFile.length) {
      fontFile.seek(descriptorsOffset);
      for (let i = 0; i < numDescriptors && fontFile.remaining >= 11; i++) {
        try {
          if (descSize >= 42) {
            // Long descriptor (MVCC): different layout
            const faceIndex = fontFile.readUint32(); // 4 bytes
            fontFile.skip(2); // unknown
            const fgR = fontFile.readUint8();
            const fgG = fontFile.readUint8();
            const fgB = fontFile.readUint8();
            const bgR = fontFile.readUint8();
            const bgG = fontFile.readUint8();
            const bgB = fontFile.readUint8();
            const negHalfPoints = fontFile.readInt32();
            fontFile.skip(12); // unknown
            const lfWeight = fontFile.readUint32();
            const lfItalic = fontFile.readUint32();
            // Skip rest
            const consumed = 4 + 2 + 6 + 4 + 12 + 4 + 4;
            if (descSize > consumed) fontFile.skip(descSize - consumed);

            this.fonts.push({
              face: faceNames[faceIndex] || 'MS Sans Serif',
              size: Math.max(1, Math.abs(Math.round(negHalfPoints / 2))),
              bold: lfWeight >= 700,
              italic: !!lfItalic,
              underline: false,
              strikeout: false,
              doubleUnderline: false,
              smallCaps: false,
              fgColor: `rgb(${fgR},${fgG},${fgB})`,
              bgColor: `rgb(${bgR},${bgG},${bgB})`,
            });
          } else {
            // Standard 11-byte FONTDESCRIPTOR
            const attrs = fontFile.readUint8();       // 1: attributes
            const halfPoints = fontFile.readUint8();   // 1: point size * 2
            const fontFamily = fontFile.readUint8();   // 1: font family
            const faceIndex = fontFile.readUint8();    // 1: index into face name table
            fontFile.skip(1);                          // 1: unknown
            const fgR = fontFile.readUint8();
            const fgG = fontFile.readUint8();
            const fgB = fontFile.readUint8();
            const bgR = fontFile.readUint8();
            const bgG = fontFile.readUint8();
            const bgB = fontFile.readUint8();
            // Skip any extra bytes for non-standard descriptors
            const consumed = 11;
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

  _readContextMap() {
    const contextFileName = [...this.internalFiles.keys()].find((name) => name.includes('|CONTEXT'));
    if (!contextFileName) return;

    const context = this._readInternalFile(contextFileName);
    if (!context) return;

    try {
      const magic = context.readUint16();
      if (magic !== BTREE_MAGIC) return;

      context.skip(2); // flags
      const pageSize = context.readUint16();
      context.readFixedString(16);
      context.skip(2);
      context.skip(2);
      const rootPage = context.readUint16();
      context.skip(2);
      const totalPages = context.readUint16();
      const nLevels = context.readUint16();
      context.readUint32();

      const pagesStart = context.offset;
      const readPage = (pageNum, level) => {
        if (pageNum < 0) return;
        const pageOffset = pagesStart + pageNum * pageSize;
        const available = context.length - pageOffset;
        if (available < 4) return;

        const page = new Uint8Array(context.buffer, pageOffset, Math.min(pageSize, available));
        const nEntries = readUint16(page, 2);

        if (level > 0) {
          let offset = 4;
          for (let index = 0; index < nEntries + 1 && offset + 6 <= page.length; index += 1) {
            const childPage = readUint16(page, offset);
            readPage(childPage, level - 1);
            offset += 6;
          }
          return;
        }

        let offset = 8;
        for (let index = 0; index < nEntries && offset + 8 <= page.length; index += 1) {
          const hashValue = readInt32(page, offset) >>> 0;
          const topicOffset = readInt32(page, offset + 4) >>> 0;
          this.contextMap.set(hashValue, topicOffset);
          offset += 8;
        }
      };

      readPage(rootPage, Math.max(0, nLevels - 1));
    } catch {
      // Context map is optional.
    }
  }

  _readTopics() {
    const topicFile = this._readInternalFile('|TOPIC');
    if (!topicFile) return;

    const topicData = topicFile.readBytes(topicFile.remaining);
    const blockSize = this.topicBlockSize;
    const isCompressed = this.compressionType !== 0;
    const blockNoShift = this.version <= 116 ? 11 : 14;
    const blockOffsetMask = (1 << blockNoShift) - 1;
    const validRecordTypes = new Set([TL_DISPLAY30, TL_TOPICHDR, TL_TOPICTXT, TL_TABLE]);

    let blockNumber = -1;
    let decompressedBlock = new Uint8Array(0);
    let decompressedSize = 0;
    let currentBlockOffset = 0;
    let nextTopicLink = 12;
    let bytesRemainingInLink = 0;
    let guard = 0;
    let currentTopicOffset = 0;

    const loadBlock = () => {
      blockNumber += 1;
      if (blockNumber < 0) {
        return false;
      }

      const absoluteOffset = blockNumber * blockSize;
      if (absoluteOffset + 12 > topicData.length) {
        return false;
      }

      const payloadEnd = Math.min(absoluteOffset + blockSize, topicData.length);
      const payload = topicData.slice(absoluteOffset + 12, payloadEnd);

      if (isCompressed && payload.length > 0) {
        try {
          decompressedBlock = decompressLZ77(
            payload,
            Math.max(0xff00, payload.length * 8, blockSize * 8)
          );
        } catch {
          decompressedBlock = payload;
        }
      } else {
        decompressedBlock = payload;
      }

      decompressedSize = decompressedBlock.length;
      currentBlockOffset = 0;
      return true;
    };

    const readTopicBytes = (length) => {
      const output = new Uint8Array(length);
      let written = 0;

      while (written < length) {
        if (
          decompressedSize === currentBlockOffset ||
          (!bytesRemainingInLink && (nextTopicLink >> blockNoShift) !== blockNumber)
        ) {
          if (!loadBlock()) {
            break;
          }
        }

        if (!bytesRemainingInLink) {
          const linkOffset = nextTopicLink & blockOffsetMask;
          const linkPosition = linkOffset - 12;

          if (linkPosition < 0 || linkPosition + 21 > decompressedBlock.length) {
            break;
          }

          const blockLength = readInt32(decompressedBlock, linkPosition);
          const nextBlock = readInt32(decompressedBlock, linkPosition + 12);

          if (blockLength < 21) {
            break;
          }

          nextTopicLink = this.version <= 116 ? nextTopicLink + nextBlock : nextBlock;
          bytesRemainingInLink = blockLength;
          currentBlockOffset = linkPosition;
        }

        if (currentBlockOffset >= decompressedBlock.length) {
          break;
        }

        output[written++] = decompressedBlock[currentBlockOffset++];
        bytesRemainingInLink -= 1;
      }

      return output.slice(0, written);
    };

    while (guard < 50000) {
      guard += 1;
      const topicLinkOffset = nextTopicLink >>> 0;

      const header = readTopicBytes(21);
      if (header.length < 21) {
        break;
      }

      const linkBlockSize = readInt32(header, 0);
      const originalDataLen2 = readInt32(header, 4);
      const nextBlock = readInt32(header, 12);
      const dataLen1 = readInt32(header, 16);
      const recordType = header[20];

      if (
        linkBlockSize < 21 ||
        dataLen1 < 21 ||
        dataLen1 > linkBlockSize ||
        !validRecordTypes.has(recordType)
      ) {
        break;
      }

      const linkData1Length = dataLen1 - 21;
      const linkData1 = linkData1Length > 0 ? readTopicBytes(linkData1Length) : new Uint8Array(0);

      let currentDataLen2 = Math.max(0, originalDataLen2);
      if (this.phraseStyle > 0) {
        currentDataLen2 = Math.max(0, linkBlockSize - dataLen1);
      }

      let linkData2 = currentDataLen2 > 0 ? readTopicBytes(currentDataLen2) : new Uint8Array(0);
      const textLength = originalDataLen2 > 0
        ? Math.min(linkData2.length, originalDataLen2)
        : linkData2.length;

      if (textLength < linkData2.length) {
        linkData2 = linkData2.slice(0, textLength);
      }

      if (linkData2.length > 0 && this.phraseStyle > 0 && this.phraseBuffers.length > 0) {
        try {
          if (this.phraseStyle === 2) {
            linkData2 = decompressPhrasesOld(linkData2, this.phraseBuffers);
          } else {
            linkData2 = currentDataLen2 < originalDataLen2
              ? decompressPhrasesNibble(linkData2, this.phraseBuffers)
              : decompressPhrasesNew(linkData2, this.phraseBuffers);
          }
        } catch {
          // Keep raw LinkData2 on phrase decoding failure.
        }
      }

      if (recordType === TL_TOPICHDR) {
        const topic = this._parseTopicHeader(linkData2, this.topics.length, linkData1, currentTopicOffset, topicLinkOffset);
        if (topic) {
          this.topics.push(topic);
        }
      } else if (recordType === TL_DISPLAY30 || recordType === TL_TOPICTXT || recordType === TL_TABLE) {
        const parsedRecord = this._parseTopicText(linkData1, linkData2, recordType);
        currentTopicOffset += Math.max(0, originalDataLen2);

        if (this.topics.length > 0 && parsedRecord.content.length > 0) {
          this.topics[this.topics.length - 1].content.push(...parsedRecord.content);
          this.topics[this.topics.length - 1].links.push(...parsedRecord.links);
        } else if (parsedRecord.content.length > 0) {
          this.topics.push({
            id: this.topics.length,
            title: `Topic ${this.topics.length}`,
            topicOffset: currentTopicOffset,
            topicLinkOffset,
            content: parsedRecord.content,
            links: parsedRecord.links,
          });
        }
      }

      if (nextBlock === -1 || nextBlock === 0) {
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

  /** Check if position has a plausible TOPICLINK header */
  _isValidTopicLink(data, pos, validTypes) {
    if (pos + 21 > data.length) return false;
    const bs = readInt32(data, pos);
    const dl1 = readInt32(data, pos + 16);
    const rt = data[pos + 20];
    return bs > 20 && bs < 65536 && dl1 >= 21 && dl1 <= bs && validTypes.has(rt);
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

    // LinkData1 = data[21..dataLen1] (formatting/binary info)
    // LinkData2 = data[dataLen1..blockSize] (text content)
    const linkData1End = Math.min(pos + Math.max(dataLen1, headerSize), blockEnd);
    const linkData2Start = linkData1End;
    const linkData2End = Math.min(pos + blockSize, blockEnd);

    // Extract LinkData2 (the text portion)
    let linkData2 = null;
    if (linkData2Start < linkData2End) {
      let rawLD2 = data.slice(linkData2Start, linkData2End);

      // Apply phrase decompression if needed
      if (this.phraseStyle > 0 && this.phraseBuffers.length > 0) {
        // Check if LinkData2 needs phrase decompression:
        // dataLen2 > actual stored size means decompressed is larger
        const storedSize = linkData2End - linkData2Start;
        if (dataLen2 > storedSize || this.phraseStyle > 0) {
          try {
            if (this.phraseStyle === 2) {
              rawLD2 = decompressPhrasesOld(rawLD2, this.phraseBuffers);
            } else if (this.phraseStyle === 3) {
              rawLD2 = decompressPhrasesNew(rawLD2, this.phraseBuffers);
            }
          } catch {
            // Keep raw data on decompression failure
          }
        }
      }
      linkData2 = rawLD2;
    }

    // If LinkData2 is empty but we have data after the header, use full content
    // (handles uncompressed files where dataLen1 == blockSize)
    let textData = linkData2;
    if ((!textData || textData.length === 0) && pos + headerSize < Math.min(pos + blockSize, blockEnd)) {
      textData = data.slice(pos + headerSize, Math.min(pos + blockSize, blockEnd));
    }

    let topic = null;
    if (recType === TL_TOPICHDR) {
      topic = this._parseTopicHeader(textData, this.topics.length);
    } else if (recType === TL_DISPLAY30 || recType === TL_TOPICTXT || recType === TL_TABLE) {
      const textContent = this._parseTopicText(textData);
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

  _parseTopicHeader(data, topicId, linkData1 = null, topicOffset = 0, topicLinkOffset = 0) {
    if (!data || data.length < 1) {
      return {
        id: topicId,
        title: `Topic ${topicId}`,
        topicOffset,
        topicLinkOffset,
        content: [],
        links: [],
      };
    }

    // LinkData2 for topic headers is a null-terminated title string
    // (paragraph formatting is in LinkData1, NOT here)
    const decoder = new TextDecoder('windows-1252');
    let end = data.indexOf(0);
    if (end === -1) end = data.length;
    const title = end > 0 ? decoder.decode(data.slice(0, end)).trim() : `Topic ${topicId}`;

    return {
      id: topicId,
      title: title || `Topic ${topicId}`,
      topicOffset,
      topicLinkOffset,
      content: [],
      links: [],
    };
  }

  _parseTopicText(linkData1, linkData2, recordType) {
    if (!linkData2 || linkData2.length < 1) {
      return { content: [], links: [] };
    }

    const structured = this._extractStructuredTopicRecord(linkData1, linkData2, recordType);
    if (structured.content.length > 0) {
      return structured;
    }

    const fallbackText = this._extractTextFromLinkData2(linkData2);
    const text = fallbackText.replace(/\r/g, '').trim();
    if (!text) {
      return { content: [], links: [] };
    }

    return {
      content: text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => ({
        type: 'text',
        text: line,
      })),
      links: [],
    };
  }

  _extractStructuredTopicRecord(linkData1, linkData2, recordType) {
    if (!linkData1 || linkData1.length === 0) {
      return { content: [], links: [] };
    }

    const formatCursor = { data: linkData1, offset: 0 };
    const textCursor = { data: linkData2, offset: 0 };
    const content = [];
    const links = [];
    let segments = [];
    let activeHotspot = null;

    const flushParagraph = () => {
      const text = segments.map((segment) => segment.text).join('');
      if (text.trim()) {
        content.push({
          type: 'text',
          text: text.replace(/\r/g, ''),
          segments: segments.map((segment) => ({ ...segment })),
        });
      }
      segments = [];
    };

    const appendSegment = (text, hotspot = activeHotspot) => {
      if (!text) return;
      const normalized = text.replace(/\r/g, '');
      if (!normalized) return;

      if (hotspot) {
        const segment = {
          type: 'link',
          text: normalized,
          hash: hotspot.hash ?? null,
          hidden: !!hotspot.hidden,
          topicId: hotspot.topicId ?? null,
          targetText: hotspot.targetText ?? null,
        };
        segments.push(segment);
        links.push(segment);
      } else {
        segments.push({ type: 'text', text: normalized });
      }
    };

    try {
      getLongValue(formatCursor);
      if (recordType !== TL_DISPLAY30) {
        getWordValue(formatCursor);
      }

      this._consumeParagraphHeader(formatCursor);

      while (formatCursor.offset < formatCursor.data.length && formatCursor.data[formatCursor.offset] === 0) {
        formatCursor.offset += 1;
      }

      while (formatCursor.offset < formatCursor.data.length) {
        let option = formatCursor.data[formatCursor.offset++];
        while (option === 0 && formatCursor.offset < formatCursor.data.length) {
          option = formatCursor.data[formatCursor.offset++];
        }

        if (option === CMD_END) {
          break;
        }

        appendSegment(readNullTerminatedString(textCursor));

        switch (option) {
          case CMD_LINE:
          case CMD_PAR:
            flushParagraph();
            break;
          case CMD_TAB:
            appendSegment('\t');
            break;
          case CMD_NON_BREAKABLE_SPACE:
            appendSegment(' ');
            break;
          case CMD_FONT:
            formatCursor.offset = Math.min(formatCursor.data.length, formatCursor.offset + 2);
            break;
          case CMD_POPUP30:
          case CMD_JUMP30:
          case CMD_POPUP:
          case CMD_JUMP:
          case CMD_POPUPHIDE:
          case CMD_JUMPHIDE:
          case CMD_POPUPINTER:
          case CMD_SECONDWIN:
          case CMD_POPUPHIDEINTER:
          case CMD_JUMPHIDEINTER:
            activeHotspot = this._readHotspotTarget(formatCursor, option);
            break;
          case CMD_MACRO:
          case CMD_MACROHIDE: {
            const macroLength = getLeWordValue(formatCursor);
            formatCursor.offset = Math.min(formatCursor.data.length, formatCursor.offset + macroLength);
            break;
          }
          case CMD_BML:
          case CMD_BMR:
          case CMD_BMC: {
            const inlineText = this._readBitmapCommandInlineText(formatCursor);
            appendSegment(inlineText, null);
            break;
          }
          case CMD_HOTSPOTEND:
            activeHotspot = null;
            break;
          default:
            break;
        }
      }

      appendSegment(readNullTerminatedString(textCursor));
      flushParagraph();

      return { content, links };
    } catch {
      return { content: [], links: [] };
    }
  }

  _consumeParagraphHeader(cursor) {
    if (cursor.offset + 6 > cursor.data.length) {
      return;
    }

    cursor.offset += 1; // Zero
    cursor.offset += 1; // EightZeroSecond
    getLeWordValue(cursor); // Zero2
    const flags = getLeWordValue(cursor);

    if (flags & FORMATF_UNKNOWN0001) {
      getShortValue(cursor);
      getShortValue(cursor);
    }
    if (flags & FORMATF_SB) getShortValue(cursor);
    if (flags & FORMATF_SA) getShortValue(cursor);
    if (flags & FORMATF_SL) getShortValue(cursor);
    if (flags & FORMATF_LEFT) getShortValue(cursor);
    if (flags & FORMATF_RIGHT) getShortValue(cursor);
    if (flags & FORMATF_LEFTFIRST) getShortValue(cursor);
    if (flags & FORMATF_BOX) {
      cursor.offset = Math.min(cursor.data.length, cursor.offset + 3);
    }
    if (flags & FORMATF_TABS) {
      if (cursor.offset < cursor.data.length) {
        const tabCount = (cursor.data[cursor.offset++] & 0x7f) / 2;
        for (let i = 0; i < tabCount && cursor.offset < cursor.data.length; i++) {
          const tabPos = getWordValue(cursor);
          if (tabPos & 0x8000) {
            cursor.offset = Math.min(cursor.data.length, cursor.offset + 1);
          }
        }
      }
    }
  }

  _readBitmapCommandInlineText(cursor) {
    if (cursor.offset >= cursor.data.length) return;

    const statementType = cursor.data[cursor.offset++];
    const headerLength = getLongValue(cursor);
    const privateStringBytes = statementType !== SMT_BMX30 ? getWordValue(cursor) : 0;
    const withData = getLeWordValue(cursor);

    if (!(withData && statementType === SMT_BMX)) {
      getLeWordValue(cursor);
    }

    if ((statementType === SMT_BMX || statementType === SMT_BMX30) && withData) {
      cursor.offset = Math.min(cursor.data.length, cursor.offset + Math.max(0, headerLength - 2));
      return '';
    }

    if (statementType === SMT_EWX) {
      cursor.offset = Math.min(cursor.data.length, cursor.offset + 1);
      const start = cursor.offset;
      const skipTo = cursor.data.indexOf(0, cursor.offset);
      const end = skipTo === -1 ? cursor.data.length : skipTo;
      const text = new TextDecoder('windows-1252').decode(cursor.data.slice(start, end));
      cursor.offset = skipTo === -1 ? cursor.data.length : skipTo + 1;

      if (text.startsWith('!')) {
        return text.slice(1);
      }

      return text.startsWith('*') ? '' : text;
    }

    if (privateStringBytes > 0) {
      cursor.offset = Math.min(cursor.data.length, cursor.offset + privateStringBytes);
    }

    return '';
  }

  _readHotspotTarget(cursor, option) {
    let hidden = false;
    let hash = null;

    switch (option) {
      case CMD_POPUPHIDE:
      case CMD_JUMPHIDE:
      case CMD_POPUPHIDEINTER:
      case CMD_JUMPHIDEINTER:
        hidden = true;
        break;
      default:
        break;
    }

    if (
      option === CMD_POPUPINTER ||
      option === CMD_SECONDWIN ||
      option === CMD_POPUPHIDEINTER ||
      option === CMD_JUMPHIDEINTER
    ) {
      const entryBytes = getLeWordValue(cursor) + 2;
      const endOffset = Math.min(cursor.data.length, cursor.offset + Math.max(0, entryBytes - 2));
      if (cursor.offset < endOffset) {
        cursor.offset += 1; // flags
      }
      if (cursor.offset + 4 <= endOffset) {
        hash = getLeDWordValue(cursor) >>> 0;
      } else {
        cursor.offset = endOffset;
      }
      cursor.offset = endOffset;
    } else if (cursor.offset + 4 <= cursor.data.length) {
      hash = getLeDWordValue(cursor) >>> 0;
    }

    return {
      hash,
      hidden,
      topicId: hash != null && this.contextMap.has(hash) ? this._topicIdForOffset(this.contextMap.get(hash)) : null,
    };
  }

  /** Extract text from LinkData2 (no paragraph format header to skip) */
  _extractTextFromLinkData2(data) {
    const result = [];
    const decoder = new TextDecoder('windows-1252');

    for (let i = 0; i < data.length; i++) {
      const byte = data[i];

      if (byte === 0) {
        // Null terminator — might be followed by more text segments
        if (i + 1 < data.length && data[i + 1] !== 0) {
          result.push('\n');
        }
      } else if (byte >= 0x80 && byte <= 0x8F) {
        // Inline formatting commands
        switch (byte) {
          case 0x80: i += 2; break;     // Font change (skip 2-byte font num)
          case 0x81: result.push('\n'); break;  // Line break
          case 0x82: result.push('\n'); break;  // Paragraph end
          case 0x83: result.push('\t'); break;  // Tab
          case 0x86: case 0x87: case 0x88: {
            // Hotspot — skip until 0x89 or skip by length
            i++;
            if (i + 1 < data.length) {
              const hsLen = data[i] | (data[i + 1] << 8);
              if (hsLen > 0 && hsLen < 1024) { i += hsLen - 1; }
              else { while (i < data.length && data[i] !== 0x89) i++; }
            }
            break;
          }
          case 0x89: break;  // End hotspot
          case 0x8B: result.push(' '); break;   // Non-break space
          case 0x8C: result.push('-'); break;   // Non-break hyphen
          default: break;
        }
      } else if (byte === 0xFF) {
        // Skip formatting separator
      } else if (byte >= 0xC8 && byte <= 0xCF) {
        // Macro — skip
        i++;
        if (i + 1 < data.length) {
          const macroLen = data[i] | (data[i + 1] << 8);
          i += 1 + macroLen;
        }
      } else if (byte >= 0xE0 && byte <= 0xEF) {
        // Topic jump — skip 4 bytes
        i += 4;
      } else if (byte >= 0x20 && byte <= 0x7E) {
        result.push(String.fromCharCode(byte));
      } else if (byte >= 0xA0) {
        result.push(decoder.decode(new Uint8Array([byte])));
      }
      // Skip other control bytes silently
    }

    return result.join('');
  }

  /**
   * Extract text from LinkData2 (already phrase-decompressed).
   * Skips paragraph format header, then reads text with inline formatting.
   */
  _extractText(data) {
    const result = [];
    const decoder = new TextDecoder('windows-1252');
    let i = 0;

    // Skip paragraph formatting header (compressed variable-length fields)
    if (data.length > 0) {
      i = this._skipParagraphFormat(data, 0);
    }

    while (i < data.length) {
      const byte = data[i];

      if (byte === 0) {
        // Null terminator - end of this text segment
        // Check if there's another paragraph after (format + text + null)
        i++;
        if (i < data.length && data[i] !== 0) {
          // Another paragraph follows — skip its format header
          result.push('\n');
          i = this._skipParagraphFormat(data, i);
        }
        continue;
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
          case 0x88: {
            i++;
            // Read the hotspot data length and skip it
            if (i + 4 < data.length) {
              const hsLen = data[i] | (data[i + 1] << 8);
              if (hsLen > 0 && hsLen < 1024) {
                i += hsLen;
              } else {
                // Fallback: scan for end marker
                while (i < data.length && data[i] !== 0x89) i++;
              }
            }
            continue;
          }
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
        // Formatting separator - skip
        i++;
      } else if (byte >= 0xC8 && byte <= 0xCF) {
        // Macro command - skip
        i++;
        if (i + 1 < data.length) {
          const macroLen = data[i] | (data[i + 1] << 8);
          i += 2 + macroLen;
        }
      } else if (byte >= 0xE0 && byte <= 0xEF) {
        // Topic jump / popup - skip command + 4 byte hash
        i += 5;
      } else if (byte >= 0x20 && byte <= 0x7E) {
        // Regular printable ASCII
        result.push(String.fromCharCode(byte));
        i++;
      } else if (byte >= 0xA0) {
        // Extended character (windows-1252)
        result.push(decoder.decode(new Uint8Array([byte])));
        i++;
      } else {
        // Other control byte - skip
        i++;
      }
    }

    return result.join('');
  }

  /**
   * Skip paragraph format header at given position.
   * Returns the position after the format data (start of text).
   * Format: flags byte + variable-length fields based on flag bits.
   */
  _skipParagraphFormat(data, pos) {
    if (pos >= data.length) return pos;

    const formatFlags = data[pos];
    let skip = pos + 1;

    // Each flag bit indicates a compressed long (4 bytes) follows
    if (formatFlags & 0x01) skip += 4; // SpacingAbove
    if (formatFlags & 0x02) skip += 4; // SpacingBelow
    if (formatFlags & 0x04) skip += 4; // SpacingLines
    if (formatFlags & 0x08) skip += 4; // LeftIndent
    if (formatFlags & 0x10) skip += 4; // RightIndent
    if (formatFlags & 0x20) skip += 4; // FirstlineIndent
    if (formatFlags & 0x40) skip += 4; // Border info
    if (formatFlags & 0x80) {
      // Tab stops: 2-byte count + variable data
      if (skip + 2 <= data.length) {
        const numTabs = data[skip] | (data[skip + 1] << 8);
        skip += 2 + numTabs * 4;
      }
    }

    return Math.min(skip, data.length);
  }

  _readKeywords() {
    // Try |KWBTREE
    const kwbtree = this._readInternalFile('|KWBTREE');
    const kwdata = this._readInternalFile('|KWDATA');
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

      const pagesStart = kwbtree.offset;
      this._extractKeywordsFromPages(kwbtree, kwdata, pagesStart, rootPage, pageSize, nLevels);
    } catch {
      // Keywords are optional
    }
  }

  _extractKeywordsFromPages(reader, kwdata, pagesStart, rootPage, pageSize, nLevels) {
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

        const rawKeyword = new TextDecoder('windows-1252').decode(page.slice(entryOffset, endOfKeyword));
        entryOffset = endOfKeyword + 1;

        const keyword = sanitizeKeyword(rawKeyword);
        const count = readUint16(page, entryOffset);
        const kwdataOffset = readInt32(page, entryOffset + 2) >>> 0;
        entryOffset += 6;

        if (!keyword) continue;

        const topicOffsets = [];
        if (kwdata) {
          try {
            kwdata.seek(kwdataOffset);
            for (let entryIndex = 0; entryIndex < count && kwdata.remaining >= 4; entryIndex += 1) {
              topicOffsets.push(kwdata.readUint32());
            }
          } catch {
            // Ignore malformed keyword offsets.
          }
        }

        this.keywords.push({
          keyword,
          topicCount: count,
          topicOffsets,
        });
      }
    };

    readPage(rootPage, Math.max(0, nLevels - 1));
  }

  _readTitleOffsets() {
    const ttl = this._readInternalFile('|TTLBTREE');
    if (!ttl) return;

    try {
      const magic = ttl.readUint16();
      if (magic !== BTREE_MAGIC) return;

      ttl.skip(2);
      const pageSize = ttl.readUint16();
      ttl.readFixedString(16);
      ttl.skip(2);
      ttl.skip(2);
      const rootPage = ttl.readUint16();
      ttl.skip(2);
      ttl.skip(2);
      const nLevels = ttl.readUint16();
      ttl.readUint32();

      const pagesStart = ttl.offset;
      const entries = [];

      const readPage = (pageNum, level) => {
        if (pageNum < 0) return;
        const pageOffset = pagesStart + pageNum * pageSize;
        const available = ttl.length - pageOffset;
        if (available < 4) return;
        const page = new Uint8Array(ttl.buffer, pageOffset, Math.min(pageSize, available));
        const nEntries = readUint16(page, 2);

        if (level > 0) {
          let entryOffset = 4;
          let selectedChild = null;
          for (let index = 0; index < nEntries + 1 && entryOffset + 6 <= page.length; index += 1) {
            const childPage = readUint16(page, entryOffset);
            readPage(childPage, level - 1);
            entryOffset += 6;
          }
          return;
        }

        let entryOffset = 8;
        for (let index = 0; index < nEntries && entryOffset + 5 <= page.length; index += 1) {
          const topicOffset = readInt32(page, entryOffset) >>> 0;
          const titleEnd = page.indexOf(0, entryOffset + 4);
          if (titleEnd === -1) break;
          const title = new TextDecoder('windows-1252').decode(page.slice(entryOffset + 4, titleEnd)).trim();
          if (title) {
            entries.push({ topicOffset, title });
          }
          entryOffset = titleEnd + 1;
        }
      };

      readPage(rootPage, Math.max(0, nLevels - 1));
      this.titleOffsets = entries.sort((a, b) => a.topicOffset - b.topicOffset);
    } catch {
      // Title tree is optional.
    }
  }

  _topicIdForOffset(topicOffset) {
    if (topicOffset == null) return null;

    const titleEntry = this._titleEntryForOffset(topicOffset);
    if (titleEntry) {
      const topicIdFromTitle = this._topicIdForTitle(titleEntry.title);
      if (topicIdFromTitle != null) {
        return topicIdFromTitle;
      }
    }

    let bestTopic = null;
    for (const topic of this.topics) {
      if (topic.topicOffset == null) continue;
      if (topic.topicOffset <= topicOffset && (!bestTopic || topic.topicOffset > bestTopic.topicOffset)) {
        bestTopic = topic;
      }
    }

    return bestTopic ? bestTopic.id : null;
  }

  _titleEntryForOffset(topicOffset) {
    let bestEntry = null;
    for (const entry of this.titleOffsets) {
      if (entry.topicOffset <= topicOffset && (!bestEntry || entry.topicOffset > bestEntry.topicOffset)) {
        bestEntry = entry;
      }
    }
    return bestEntry;
  }

  _topicIdForTitle(title) {
    const normalized = normalizeLookupText(title);
    if (!normalized) return null;
    const exact = this.topics.find((topic) => normalizeLookupText(topic.title) === normalized);
    if (exact) return exact.id;
    const partial = this.topics.find((topic) => {
      const topicTitle = normalizeLookupText(topic.title);
      return topicTitle && (topicTitle.includes(normalized) || normalized.includes(topicTitle));
    });
    return partial ? partial.id : null;
  }

  _resolveLinksAndKeywords() {
    const normalizedTitles = new Map();
    for (const topic of this.topics) {
      const normalized = normalizeLookupText(topic.title);
      if (!normalized) continue;
      if (!normalizedTitles.has(normalized)) {
        normalizedTitles.set(normalized, topic.id);
      }
    }

    for (const topic of this.topics) {
      for (const item of topic.content) {
        if (!item.segments) continue;
        for (const segment of item.segments) {
          if (segment.type !== 'link') continue;
          if (segment.topicId == null && segment.hash != null && this.contextMap.has(segment.hash)) {
            segment.topicId = this._topicIdForOffset(this.contextMap.get(segment.hash));
          }
          if (segment.topicId == null) {
            segment.topicId = resolveTopicByText(segment.text, this.topics, normalizedTitles);
          }
        }
      }
    }

    const dedupedKeywords = [];
    const seenKeywords = new Set();
    for (const keyword of this.keywords) {
      const normalizedKeyword = normalizeLookupText(keyword.keyword);
      if (!normalizedKeyword || seenKeywords.has(normalizedKeyword)) {
        continue;
      }
      seenKeywords.add(normalizedKeyword);

      const topicIdFromOffsets = keyword.topicOffsets?.length
        ? this._topicIdForOffset(keyword.topicOffsets[0])
        : null;

      const topicIdFromTitleOffsets = keyword.topicOffsets?.length
        ? this._topicIdForTitle(this._titleEntryForOffset(keyword.topicOffsets[0])?.title)
        : null;

      dedupedKeywords.push({
        ...keyword,
        topicId: topicIdFromOffsets ?? topicIdFromTitleOffsets ?? resolveTopicByText(keyword.keyword, this.topics, normalizedTitles),
      });
    }

    this.keywords = dedupedKeywords;
  }
}

// Helper to read little-endian int32 from Uint8Array
function readInt32(data, offset) {
  return (data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)) | 0;
}

function readUint16(data, offset) {
  return (data[offset] | (data[offset + 1] << 8)) >>> 0;
}

function getLeWordValue(cursor) {
  if (cursor.offset + 2 > cursor.data.length) {
    cursor.offset = cursor.data.length;
    return 0;
  }

  const value = cursor.data[cursor.offset] | (cursor.data[cursor.offset + 1] << 8);
  cursor.offset += 2;
  return value;
}

function getLeDWordValue(cursor) {
  if (cursor.offset + 4 > cursor.data.length) {
    cursor.offset = cursor.data.length;
    return 0;
  }

  const value = (
    cursor.data[cursor.offset] |
    (cursor.data[cursor.offset + 1] << 8) |
    (cursor.data[cursor.offset + 2] << 16) |
    (cursor.data[cursor.offset + 3] << 24)
  ) >>> 0;
  cursor.offset += 4;
  return value;
}

function getShortValue(cursor) {
  if (cursor.offset >= cursor.data.length) return 0;

  let value = cursor.data[cursor.offset++];
  if (value & 1) {
    if (cursor.offset < cursor.data.length) {
      value |= cursor.data[cursor.offset++] << 8;
    }
    value -= 0x8000;
  } else {
    value -= 0x80;
  }

  return value / 2;
}

function getWordValue(cursor) {
  if (cursor.offset >= cursor.data.length) return 0;

  let value = cursor.data[cursor.offset++];
  if (value & 1) {
    if (cursor.offset < cursor.data.length) {
      value |= cursor.data[cursor.offset++] << 8;
    }
  }

  return value / 2;
}

function getLongValue(cursor) {
  const low = getLeWordValue(cursor);
  if (!(low & 1)) {
    return low - 0x8000;
  }

  const high = getLeWordValue(cursor);
  return (low + high * 65536) - 0x80000000;
}

function readNullTerminatedString(cursor) {
  if (cursor.offset >= cursor.data.length) return '';

  const start = cursor.offset;
  let end = start;
  while (end < cursor.data.length && cursor.data[end] !== 0) {
    end += 1;
  }

  const value = new TextDecoder('windows-1252').decode(cursor.data.slice(start, end));
  cursor.offset = end < cursor.data.length ? end + 1 : end;
  return value;
}

function sanitizeKeyword(keyword) {
  if (!keyword) return '';
  const cleaned = keyword
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';
  if (!/[A-Za-z0-9]/.test(cleaned)) return '';
  if (cleaned.length === 1 && !/[A-Za-z0-9]/.test(cleaned)) return '';

  return cleaned;
}

function normalizeLookupText(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function resolveTopicByText(text, topics, normalizedTitles) {
  const normalized = normalizeLookupText(text);
  if (!normalized) return null;
  if (normalizedTitles.has(normalized)) {
    return normalizedTitles.get(normalized);
  }

  for (const topic of topics) {
    const title = normalizeLookupText(topic.title);
    if (!title) continue;
    if (title.includes(normalized) || normalized.includes(title)) {
      return topic.id;
    }
  }

  return null;
}

export default HlpParser;
