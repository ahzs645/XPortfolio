/**
 * Generates a realistic synthetic .HLP test file that exercises
 * all major parser paths: header, directory, |SYSTEM, |TOPIC, |FONT, |Phrases.
 *
 * Run: node generateTestHlp.js
 * Produces: fixtures/test.hlp
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class HlpBuilder {
  constructor() {
    this.buf = Buffer.alloc(65536);
    this.pos = 0;
  }

  writeUint8(v) { this.buf.writeUInt8(v & 0xFF, this.pos); this.pos += 1; }
  writeUint16(v) { this.buf.writeUInt16LE(v & 0xFFFF, this.pos); this.pos += 2; }
  writeInt16(v) { this.buf.writeInt16LE(v, this.pos); this.pos += 2; }
  writeInt32(v) { this.buf.writeInt32LE(v, this.pos); this.pos += 4; }
  writeUint32(v) { this.buf.writeUInt32LE(v >>> 0, this.pos); this.pos += 4; }

  writeNullString(s) {
    for (let i = 0; i < s.length; i++) {
      this.writeUint8(s.charCodeAt(i));
    }
    this.writeUint8(0);
  }

  writeFixedString(s, len) {
    for (let i = 0; i < len; i++) {
      this.writeUint8(i < s.length ? s.charCodeAt(i) : 0);
    }
  }

  pad(alignment) {
    while (this.pos % alignment !== 0) this.writeUint8(0);
  }

  padTo(target) {
    while (this.pos < target) this.writeUint8(0);
  }

  getPos() { return this.pos; }
  setPos(p) { this.pos = p; }

  patchInt32(offset, value) {
    this.buf.writeInt32LE(value, offset);
  }

  getBuffer() {
    return this.buf.slice(0, this.pos);
  }
}

function buildTestHlp() {
  const b = new HlpBuilder();

  // ==================== FILE HEADER (16 bytes) ====================
  b.writeUint32(0x00035F3F); // magic
  const dirStartPatch = b.getPos();
  b.writeInt32(0);            // directory start (patch later)
  b.writeInt32(-1);           // first free block
  const fileSizePatch = b.getPos();
  b.writeInt32(0);            // entire file size (patch later)

  // ==================== |SYSTEM (at offset 16) ====================
  const systemOffset = b.getPos();
  const systemReservedPatch = b.getPos();
  b.writeInt32(0);  // reserved space (patch later)
  const systemUsedPatch = b.getPos();
  b.writeInt32(0);  // used space (patch later)
  b.writeUint8(4);  // file flags

  // SYSTEMHEADER
  b.writeUint16(0x036C); // magic
  b.writeUint16(21);     // minor (HC31)
  b.writeUint16(1);      // major
  b.writeInt32(0);       // gen date
  b.writeUint16(0);      // flags: no compression

  // SYSTEMREC: title
  const title = 'HELPDECO - HLP File Decompiler';
  b.writeUint16(1);                   // type = TITLE
  b.writeUint16(title.length + 1);    // length
  b.writeNullString(title);

  // SYSTEMREC: copyright
  const copyright = '(c) 1996 Manfred Winterhoff';
  b.writeUint16(2);                       // type = COPYRIGHT
  b.writeUint16(copyright.length + 1);
  b.writeNullString(copyright);

  // SYSTEMREC: contents topic
  b.writeUint16(3);   // type = CONTENTS
  b.writeUint16(4);   // length
  b.writeInt32(0);     // topic 0

  const systemEnd = b.getPos();
  const systemSize = systemEnd - systemOffset;
  b.patchInt32(systemReservedPatch, systemSize);
  b.patchInt32(systemUsedPatch, systemSize);

  // ==================== |FONT ====================
  const fontOffset = b.getPos();
  const fontReservedPatch = b.getPos();
  b.writeInt32(0);
  const fontUsedPatch = b.getPos();
  b.writeInt32(0);
  b.writeUint8(4);

  // FONT header
  const numFaces = 2;
  const numDescriptors = 3;
  b.writeUint16(numFaces);        // NumFacenames
  b.writeUint16(numDescriptors);  // NumDescriptors
  const faceOffsetPos = b.getPos();
  b.writeUint16(0);               // FacenamesOffset (patch)
  const descOffsetPos = b.getPos();
  b.writeUint16(0);               // DescriptorsOffset (patch)

  // Face names (32 bytes each)
  const faceStart = b.getPos() - (fontOffset + 9); // relative to content start
  b.patchInt32(faceOffsetPos, faceStart & 0xFFFF); // patch as uint16
  b.buf.writeUInt16LE(faceStart, faceOffsetPos);
  b.writeFixedString('MS Sans Serif', 32);
  b.writeFixedString('Arial', 32);

  // Descriptors (11 bytes each: attrs(1) + halfPoints(2) + family(1) + faceIndex(2) + fg(3) + bg(3))
  const descStart = b.getPos() - (fontOffset + 9);
  b.buf.writeUInt16LE(descStart, descOffsetPos);

  // Font 0: Normal 10pt MS Sans Serif
  b.writeUint8(0x00);  // no attrs
  b.writeUint16(20);   // 10pt * 2
  b.writeUint8(0x03);  // Swiss
  b.writeUint16(0);    // face index 0
  b.writeUint8(0); b.writeUint8(0); b.writeUint8(0);       // fg black
  b.writeUint8(255); b.writeUint8(255); b.writeUint8(255); // bg white

  // Font 1: Bold 12pt MS Sans Serif
  b.writeUint8(0x01);  // bold
  b.writeUint16(24);   // 12pt * 2
  b.writeUint8(0x03);
  b.writeUint16(0);
  b.writeUint8(0); b.writeUint8(0); b.writeUint8(128);     // fg dark blue
  b.writeUint8(255); b.writeUint8(255); b.writeUint8(255);

  // Font 2: Italic 10pt Arial
  b.writeUint8(0x02);  // italic
  b.writeUint16(20);
  b.writeUint8(0x03);
  b.writeUint16(1);    // face index 1 (Arial)
  b.writeUint8(0); b.writeUint8(128); b.writeUint8(0);     // fg dark green
  b.writeUint8(255); b.writeUint8(255); b.writeUint8(255);

  const fontEnd = b.getPos();
  const fontSize = fontEnd - fontOffset;
  b.patchInt32(fontReservedPatch, fontSize);
  b.patchInt32(fontUsedPatch, fontSize);

  // ==================== |TOPIC ====================
  const topicOffset = b.getPos();
  const topicReservedPatch = b.getPos();
  b.writeInt32(0);
  const topicUsedPatch = b.getPos();
  b.writeInt32(0);
  b.writeUint8(4);

  const topicContentStart = b.getPos();

  // TOPICBLOCKHEADER (12 bytes)
  b.writeInt32(-1);  // last topic link
  b.writeInt32(12);  // first topic link (starts right after header)
  b.writeInt32(-1);  // last topic header

  // --- Topic Link 1: Header for "Contents" ---
  const topic1Start = b.getPos();
  const topic1SizePatch = b.getPos();
  b.writeInt32(0);    // block size (patch)
  b.writeInt32(0);    // data len 2
  b.writeInt32(-1);   // prev
  b.writeInt32(-1);   // next (patch later)
  b.writeInt32(0);    // data len 1
  b.writeUint8(0x02); // record type: topic header

  // Content: format flags + title text
  b.writeUint8(0x00); // no format flags
  const contentTitle = 'Contents';
  for (let i = 0; i < contentTitle.length; i++) b.writeUint8(contentTitle.charCodeAt(i));
  b.writeUint8(0);

  const topic1End = b.getPos();
  b.patchInt32(topic1SizePatch, topic1End - topic1Start);

  // --- Topic Link 2: Text for contents topic ---
  const topic2Start = b.getPos();
  const topic2SizePatch = b.getPos();
  b.writeInt32(0);
  b.writeInt32(0);
  b.writeInt32(-1);
  b.writeInt32(-1);
  b.writeInt32(0);
  b.writeUint8(0x20); // record type: text (new style)

  b.writeUint8(0x00);
  const text1 = 'Welcome to HELPDECO, the WinHelp file decompiler.';
  for (let i = 0; i < text1.length; i++) b.writeUint8(text1.charCodeAt(i));
  b.writeUint8(0);

  const topic2End = b.getPos();
  b.patchInt32(topic2SizePatch, topic2End - topic2Start);

  // --- Topic Link 3: Header for "Usage" topic ---
  const topic3Start = b.getPos();
  const topic3SizePatch = b.getPos();
  b.writeInt32(0);
  b.writeInt32(0);
  b.writeInt32(-1);
  b.writeInt32(-1);
  b.writeInt32(0);
  b.writeUint8(0x02);

  b.writeUint8(0x00);
  const usageTitle = 'Usage';
  for (let i = 0; i < usageTitle.length; i++) b.writeUint8(usageTitle.charCodeAt(i));
  b.writeUint8(0);

  const topic3End = b.getPos();
  b.patchInt32(topic3SizePatch, topic3End - topic3Start);

  // --- Topic Link 4: Text for usage ---
  const topic4Start = b.getPos();
  const topic4SizePatch = b.getPos();
  b.writeInt32(0);
  b.writeInt32(0);
  b.writeInt32(-1);
  b.writeInt32(-1);
  b.writeInt32(0);
  b.writeUint8(0x20);

  b.writeUint8(0x00);
  const text2 = 'HELPDECO can extract all internal files from a WinHelp HLP file.\nIt supports Windows 3.0, 3.1, 3.11, and 95 help files.\nTo use, run: helpdeco filename.hlp';
  for (let i = 0; i < text2.length; i++) b.writeUint8(text2.charCodeAt(i));
  b.writeUint8(0);

  const topic4End = b.getPos();
  b.patchInt32(topic4SizePatch, topic4End - topic4Start);

  // --- Topic Link 5: Header for "File Format" topic ---
  const topic5Start = b.getPos();
  const topic5SizePatch = b.getPos();
  b.writeInt32(0);
  b.writeInt32(0);
  b.writeInt32(-1);
  b.writeInt32(-1);
  b.writeInt32(0);
  b.writeUint8(0x02);

  b.writeUint8(0x00);
  const fmtTitle = 'File Format';
  for (let i = 0; i < fmtTitle.length; i++) b.writeUint8(fmtTitle.charCodeAt(i));
  b.writeUint8(0);

  const topic5End = b.getPos();
  b.patchInt32(topic5SizePatch, topic5End - topic5Start);

  // --- Topic Link 6: Text for file format ---
  const topic6Start = b.getPos();
  const topic6SizePatch = b.getPos();
  b.writeInt32(0);
  b.writeInt32(0);
  b.writeInt32(-1);
  b.writeInt32(-1);
  b.writeInt32(0);
  b.writeUint8(0x20);

  b.writeUint8(0x00);
  const text3 = 'The HLP file starts with a 16-byte header containing a magic number.\nThe internal file system is organized as a B+ tree directory.\nTopic data may be LZ77-compressed in blocks of 2K or 4K.';
  for (let i = 0; i < text3.length; i++) b.writeUint8(text3.charCodeAt(i));
  b.writeUint8(0);

  const topic6End = b.getPos();
  b.patchInt32(topic6SizePatch, topic6End - topic6Start);

  const topicEnd = b.getPos();
  const topicSize = topicEnd - topicOffset;
  b.patchInt32(topicReservedPatch, topicSize);
  b.patchInt32(topicUsedPatch, topicSize);

  // ==================== DIRECTORY (B+ tree) ====================
  const dirStart = b.getPos();
  b.patchInt32(dirStartPatch, dirStart);

  const dirPageSize = 1024;

  // FILEHEADER
  const dirReservedPatch = b.getPos();
  b.writeInt32(0);
  const dirUsedPatch = b.getPos();
  b.writeInt32(0);
  b.writeUint8(4);

  // BTREEHEADER
  b.writeUint16(0x293B);    // magic
  b.writeUint16(0x0402);    // flags
  b.writeUint16(dirPageSize);
  b.writeFixedString('z4', 16); // structure
  b.writeUint16(0);         // must be zero
  b.writeUint16(0);         // page splits
  b.writeUint16(0);         // root page
  b.writeInt16(-1);         // must be -1
  b.writeUint16(1);         // total pages
  b.writeUint16(1);         // nlevels
  b.writeUint32(3);         // total entries (|FONT, |SYSTEM, |TOPIC)

  // Leaf page
  const leafStart = b.getPos();
  b.writeInt16(-1);  // previous
  b.writeInt16(-1);  // next
  b.writeUint16(3);  // 3 entries

  // Entries must be sorted alphabetically
  b.writeNullString('|FONT');
  b.writeInt32(fontOffset);

  b.writeNullString('|SYSTEM');
  b.writeInt32(systemOffset);

  b.writeNullString('|TOPIC');
  b.writeInt32(topicOffset);

  // Pad to page size
  b.padTo(leafStart + dirPageSize);

  const dirEnd = b.getPos();
  const dirSize = dirEnd - dirStart;
  b.patchInt32(dirReservedPatch, dirSize);
  b.patchInt32(dirUsedPatch, dirSize);

  // Patch total file size
  b.patchInt32(fileSizePatch, b.getPos());

  return b.getBuffer();
}

// Generate and write
const hlpData = buildTestHlp();
const fixturesDir = join(__dirname, 'fixtures');
mkdirSync(fixturesDir, { recursive: true });
const outPath = join(fixturesDir, 'test.hlp');
writeFileSync(outPath, hlpData);
console.log(`Generated ${outPath} (${hlpData.length} bytes)`);
console.log(`Magic: 0x${hlpData.readUInt32LE(0).toString(16).padStart(8, '0')}`);
