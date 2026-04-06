/**
 * Binary reader for parsing HLP file structures.
 * Reads little-endian values from an ArrayBuffer.
 */
export class BinaryReader {
  constructor(buffer, offset = 0) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.offset = offset;
  }

  get length() {
    return this.buffer.byteLength;
  }

  get remaining() {
    return this.buffer.byteLength - this.offset;
  }

  seek(offset) {
    this.offset = offset;
  }

  skip(bytes) {
    this.offset += bytes;
  }

  readUint8() {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readInt16() {
    const val = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return val;
  }

  readUint16() {
    const val = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return val;
  }

  readInt32() {
    const val = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readUint32() {
    const val = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readBytes(count) {
    const bytes = new Uint8Array(this.buffer, this.offset, count);
    this.offset += count;
    return bytes;
  }

  readString(maxLength = 256) {
    const start = this.offset;
    let end = start;
    const bytes = new Uint8Array(this.buffer);
    while (end < this.buffer.byteLength && end - start < maxLength && bytes[end] !== 0) {
      end++;
    }
    const str = new TextDecoder('windows-1252').decode(bytes.slice(start, end));
    this.offset = end + 1; // skip null terminator
    return str;
  }

  readFixedString(length) {
    const available = Math.min(length, this.buffer.byteLength - this.offset);
    if (available <= 0) {
      this.offset += length;
      return '';
    }
    const bytes = new Uint8Array(this.buffer, this.offset, available);
    this.offset += length;
    // Find null terminator
    let end = bytes.indexOf(0);
    if (end === -1) end = available;
    return new TextDecoder('windows-1252').decode(bytes.slice(0, end));
  }

  slice(offset, length) {
    return new BinaryReader(this.buffer.slice(offset, offset + length));
  }
}
