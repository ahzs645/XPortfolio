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
import { decompressLZ77, decompressPhrasesOld, decompressPhrasesNew } from './decompress';

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
    this.phrases = [];       // String phrases for keyword display
    this.phraseBuffers = []; // Raw byte arrays for phrase decompression
    this.phraseStyle = 0;    // 0=none, 2=old (HC30), 3=new (HC31+)
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

  _readTopics() {
    const topicFile = this._readInternalFile('|TOPIC');
    if (!topicFile) return;

    const topicData = topicFile.readBytes(topicFile.remaining);
    const blockSize = this.topicBlockSize;
    const isCompressed = this.compressionType !== 0;
    const decompressTarget = 0x4000; // Max decompressed block size

    // Step 1: Decompress each block separately and scan for valid TOPICLINK headers.
    // Due to LZ77 decompression nuances, links may not be at the exact positions
    // predicted by virtual addressing, so we scan for valid headers.
    const VALID_RECTYPES = new Set([0x01, 0x02, 0x20, 0x23]);

    let blockStart = 0;
    while (blockStart + 12 <= topicData.length) {
      const blockEnd = Math.min(blockStart + blockSize, topicData.length);
      const payload = topicData.slice(blockStart + 12, blockEnd);

      let blockData;
      if (isCompressed && payload.length > 0) {
        try {
          blockData = decompressLZ77(payload, decompressTarget);
        } catch {
          blockData = payload;
        }
      } else {
        blockData = payload;
      }

      // Scan for valid TOPICLINK headers within this decompressed block
      let pos = 0;
      let linksInBlock = 0;
      while (pos + 21 <= blockData.length && linksInBlock < 5000) {
        if (this._isValidTopicLink(blockData, pos, VALID_RECTYPES)) {
          try {
            const linkData = this._readTopicLink(blockData, pos, blockData.length);
            if (linkData) {
              if (linkData.topic) {
                this.topics.push(linkData.topic);
              }
              // Advance past this link
              const advance = readInt32(blockData, pos);
              pos += Math.max(advance, 21);
              linksInBlock++;
              continue;
            }
          } catch {
            // Skip this position on parse error
          }
        }
        pos++;
      }

      blockStart = blockEnd;
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
    if (recType === TL_TOPICHDR || recType === TL_DISPLAY30) {
      topic = this._parseTopicHeader(textData, this.topics.length);
    } else if (recType === TL_TOPICTXT || recType === TL_TABLE) {
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

  _parseTopicHeader(data, topicId) {
    if (!data || data.length < 1) {
      return {
        id: topicId,
        title: `Topic ${topicId}`,
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
      content: [],
      links: [],
    };
  }

  _parseTopicText(data) {
    if (!data || data.length < 1) return [];

    // LinkData2 for text records contains the text paragraphs
    // (paragraph formatting is in LinkData1)
    // For phrase-decompressed data, text may have inline format commands (0x80-0x8F)
    const content = [];
    const text = this._extractTextFromLinkData2(data);

    if (text.trim()) {
      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        if (para.trim()) {
          content.push({ type: 'text', text: para });
        }
      }
    }

    return content;
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
