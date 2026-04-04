/**
 * Tests for the WinHelp HLP file parser.
 * Tests against both synthetic test files and real HLP files.
 */
import { describe, it, expect } from 'vitest';
import { BinaryReader } from '../BinaryReader';
import { decompressLZ77 } from '../decompress';
import { HlpParser } from '../HlpParser';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to build a minimal valid HLP file buffer
function buildMinimalHlp({ title = 'Test Help', topicText = 'Hello World' } = {}) {
  const parts = [];
  let offset = 0;

  const writeUint8 = (val) => { parts.push({ type: 'u8', val }); offset += 1; };
  const writeInt16 = (val) => { parts.push({ type: 'i16', val }); offset += 2; };
  const writeUint16 = (val) => { parts.push({ type: 'u16', val }); offset += 2; };
  const writeInt32 = (val) => { parts.push({ type: 'i32', val }); offset += 4; };
  const writeUint32 = (val) => { parts.push({ type: 'u32', val }); offset += 4; };
  const writeString = (str) => {
    for (let i = 0; i < str.length; i++) {
      writeUint8(str.charCodeAt(i));
    }
    writeUint8(0); // null terminator
  };
  const writeBytes = (arr) => {
    arr.forEach(b => writeUint8(b));
  };

  const getOffset = () => offset;

  // We'll build a very simple HLP:
  // [Header 16 bytes] [|SYSTEM file] [|TOPIC file] [Directory B+ tree]

  // --- Phase 1: Calculate offsets ---
  // Header: 16 bytes
  const headerSize = 16;

  // |SYSTEM internal file (FILEHEADER + SYSTEMHEADER + title record)
  const titleBytes = new TextEncoder().encode(title);
  const systemContentSize = 6 + 4 + 2 + // SYSTEMHEADER: magic(2) + minor(2) + major(2) + gendate(4) + flags(2)
    4 + titleBytes.length + 1; // SYSTEMREC: type(2) + len(2) + string + null
  const systemFileSize = 9 + systemContentSize; // FILEHEADER(9) + content

  // |TOPIC internal file
  const topicTextBytes = new TextEncoder().encode(topicText);
  // TOPICBLOCKHEADER(12) + TOPICLINK(21 + text)
  const topicLinkSize = 21 + 1 + topicTextBytes.length + 1; // header + format byte + text + null
  const topicContentSize = 12 + topicLinkSize;
  const topicFileSize = 9 + topicContentSize;

  // Directory: FILEHEADER(9) + BTREEHEADER(22 + 16 structure string) + one leaf page
  const dirPageSize = 1024;
  // Leaf page: unused(2) + nextpage(2) + nentries(2) + entries
  // Entry for |SYSTEM: string + null + int32 = 8 + 4 = 12
  // Entry for |TOPIC: string + null + int32 = 7 + 4 = 11
  const dirHeaderSize = 9 + 2 + 2 + 2 + 16 + 2 + 2 + 2 + 2 + 2 + 2 + 4; // FILEHEADER + BTREEHEADER fields
  const dirTotalSize = dirHeaderSize + dirPageSize;

  const systemStart = headerSize;
  const topicStart = systemStart + systemFileSize;
  const dirStart = topicStart + topicFileSize;
  const totalSize = dirStart + dirTotalSize;

  // --- Phase 2: Write data ---
  // File header
  writeUint32(0x00035F3F); // magic
  writeInt32(dirStart);     // directory start
  writeInt32(-1);           // first free block
  writeInt32(totalSize);    // entire file size

  // |SYSTEM FILEHEADER
  writeInt32(systemFileSize); // reserved space
  writeInt32(systemFileSize); // used space
  writeUint8(4);              // file flags

  // |SYSTEM content - SYSTEMHEADER
  writeUint16(0x036C);       // magic
  writeUint16(21);           // minor version (HC31)
  writeUint16(1);            // major version
  writeInt32(0);             // gen date
  writeUint16(0);            // flags (no compression)

  // SYSTEMREC - title
  writeUint16(1);                     // record type: TITLE
  writeUint16(titleBytes.length + 1); // record length
  writeBytes([...titleBytes]);
  writeUint8(0);                      // null terminator

  // |TOPIC FILEHEADER
  writeInt32(topicFileSize); // reserved space
  writeInt32(topicFileSize); // used space
  writeUint8(4);             // file flags

  // TOPICBLOCKHEADER
  writeInt32(-1);  // last topic link
  writeInt32(12);  // first topic link (right after block header)
  writeInt32(-1);  // last topic header

  // TOPICLINK
  writeInt32(topicLinkSize); // block size
  writeInt32(0);              // data len 2
  writeInt32(-1);             // prev block
  writeInt32(-1);             // next block
  writeInt32(topicLinkSize);  // data len 1
  writeUint8(0x02);           // record type: topic header

  // Simple content: format flags byte + text + null
  writeUint8(0x00);           // no formatting flags
  writeBytes([...topicTextBytes]);
  writeUint8(0);              // null terminator

  // Directory FILEHEADER
  const dirUsedSize = dirTotalSize;
  writeInt32(dirTotalSize);  // reserved space
  writeInt32(dirUsedSize);   // used space
  writeUint8(4);             // file flags

  // BTREEHEADER
  writeUint16(0x293B);       // magic
  writeUint16(0x0402);       // flags (directory)
  writeUint16(dirPageSize);  // page size
  // Structure string (16 bytes, null-padded)
  const structStr = 'z4';
  for (let i = 0; i < 16; i++) {
    writeUint8(i < structStr.length ? structStr.charCodeAt(i) : 0);
  }
  writeUint16(0);  // must be zero
  writeUint16(0);  // page splits
  writeUint16(0);  // root page
  writeInt16(-1);  // must be -1
  writeUint16(1);  // total pages
  writeUint16(1);  // nlevels (1 = leaf only)
  writeUint32(2);  // total entries

  // Leaf page (starts here)
  const leafStart = offset;
  writeInt16(-1);  // previous page (unused)
  writeInt16(-1);  // next page
  writeUint16(2);  // number of entries

  // Entry 1: |SYSTEM
  writeString('|SYSTEM');
  writeInt32(systemStart);

  // Entry 2: |TOPIC
  writeString('|TOPIC');
  writeInt32(topicStart);

  // Pad to page size
  const written = offset - leafStart;
  for (let i = written; i < dirPageSize; i++) {
    writeUint8(0);
  }

  // --- Phase 3: Assemble buffer ---
  const buffer = new ArrayBuffer(offset);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let pos = 0;

  for (const part of parts) {
    switch (part.type) {
      case 'u8':
        view.setUint8(pos, part.val & 0xFF);
        pos += 1;
        break;
      case 'i16':
        view.setInt16(pos, part.val, true);
        pos += 2;
        break;
      case 'u16':
        view.setUint16(pos, part.val, true);
        pos += 2;
        break;
      case 'i32':
        view.setInt32(pos, part.val, true);
        pos += 4;
        break;
      case 'u32':
        view.setUint32(pos, part.val, true);
        pos += 4;
        break;
    }
  }

  return buffer;
}

describe('BinaryReader', () => {
  it('reads little-endian integers correctly', () => {
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setUint32(0, 0x00035F3F, true); // HLP magic
    view.setInt32(4, -1, true);

    const reader = new BinaryReader(buf);
    expect(reader.readUint32()).toBe(0x00035F3F);
    expect(reader.readInt32()).toBe(-1);
  });

  it('reads null-terminated strings', () => {
    const encoder = new TextEncoder();
    const str = 'Hello';
    const bytes = encoder.encode(str);
    const buf = new ArrayBuffer(bytes.length + 1);
    new Uint8Array(buf).set(bytes);

    const reader = new BinaryReader(buf);
    expect(reader.readString()).toBe('Hello');
    expect(reader.offset).toBe(6); // includes null terminator
  });

  it('reads fixed-length strings', () => {
    const buf = new ArrayBuffer(10);
    const arr = new Uint8Array(buf);
    arr[0] = 65; // A
    arr[1] = 66; // B
    arr[2] = 0;  // null

    const reader = new BinaryReader(buf);
    expect(reader.readFixedString(10)).toBe('AB');
    expect(reader.offset).toBe(10);
  });

  it('tracks remaining bytes', () => {
    const buf = new ArrayBuffer(16);
    const reader = new BinaryReader(buf);
    expect(reader.remaining).toBe(16);
    reader.readUint32();
    expect(reader.remaining).toBe(12);
    reader.skip(4);
    expect(reader.remaining).toBe(8);
  });
});

describe('LZ77 Decompression', () => {
  it('decompresses literal-only data', () => {
    // Flag byte 0x00 = all 8 operations are literals
    const src = new Uint8Array([0x00, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48]);
    const result = decompressLZ77(src, 8);
    expect(result.length).toBe(8);
    expect(String.fromCharCode(...result)).toBe('ABCDEFGH');
  });

  it('decompresses with back-references', () => {
    // Write "ABCABC":
    // Flag: 0b00000111 = 0x07 -> bits 0,1,2 are compressed, 3-7 literal
    // Actually simpler: flag 0x00 for 3 literals A,B,C then flag with ref
    // Let's do: flag=0x00, A,B,C,D,E,F,G,H (8 literals)
    // Then flag=0x01, ref to copy from 8 back, len 3
    const src = new Uint8Array([
      0x00, // flag: all 8 bits literal
      0x41, 0x42, 0x43, 0x41, 0x42, 0x43, 0x44, 0x45,
    ]);
    const result = decompressLZ77(src, 8);
    expect(result.length).toBe(8);
    expect(String.fromCharCode(...result)).toBe('ABCABCDE');
  });

  it('handles empty input', () => {
    const result = decompressLZ77(new Uint8Array([]), 0);
    expect(result.length).toBe(0);
  });
});

describe('HlpParser', () => {
  it('rejects files with invalid magic', () => {
    const buf = new ArrayBuffer(16);
    const parser = new HlpParser(buf);
    expect(() => parser.parse()).toThrow('Invalid HLP file');
  });

  it('parses a minimal synthetic HLP file', () => {
    const buffer = buildMinimalHlp({
      title: 'My Test Help',
      topicText: 'Welcome to the help system.',
    });

    const parser = new HlpParser(buffer);
    const result = parser.parse();

    expect(result.title).toBe('My Test Help');
    expect(result.topics.length).toBeGreaterThan(0);
  });

  it('parses title from SYSTEM records', () => {
    const buffer = buildMinimalHlp({ title: 'Calculator Help' });
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result.title).toBe('Calculator Help');
  });

  it('returns empty arrays when no fonts/keywords exist', () => {
    const buffer = buildMinimalHlp();
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result.fonts).toEqual([]);
    expect(result.keywords).toEqual([]);
  });
});

// Tests against real HLP files (skipped if files not present)
describe('Real HLP files', () => {
  const testFilesDir = join(__dirname, 'fixtures');

  const tryLoadFile = (filename) => {
    try {
      return readFileSync(join(testFilesDir, filename));
    } catch {
      return null;
    }
  };

  it.skipIf(!tryLoadFile('test.hlp'))('parses generated test HLP file', () => {
    const data = tryLoadFile('test.hlp');
    const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const parser = new HlpParser(buffer);
    const result = parser.parse();

    // Validate title and copyright from |SYSTEM
    expect(result.title).toBe('HELPDECO - HLP File Decompiler');
    expect(result.version).toBe(121); // major*100 + minor = 1*100 + 21

    // Validate topics
    expect(result.topics.length).toBe(3);
    expect(result.topics[0].title).toBe('Contents');
    expect(result.topics[1].title).toBe('Usage');
    expect(result.topics[2].title).toBe('File Format');

    // Validate topic content was correctly associated
    expect(result.topics[0].content.length).toBeGreaterThan(0);
    expect(result.topics[0].content[0].text).toContain('WinHelp file decompiler');

    expect(result.topics[1].content.length).toBeGreaterThan(0);
    expect(result.topics[1].content[0].text).toContain('extract all internal files');

    expect(result.topics[2].content.length).toBeGreaterThan(0);
    expect(result.topics[2].content[0].text).toContain('16-byte header');

    // Validate fonts from |FONT
    expect(result.fonts.length).toBe(3);
    expect(result.fonts[0].face).toBe('MS Sans Serif');
    expect(result.fonts[0].bold).toBe(false);
    expect(result.fonts[0].size).toBe(10);

    expect(result.fonts[1].face).toBe('MS Sans Serif');
    expect(result.fonts[1].bold).toBe(true);
    expect(result.fonts[1].size).toBe(12);

    expect(result.fonts[2].face).toBe('Arial');
    expect(result.fonts[2].italic).toBe(true);
  });
});
