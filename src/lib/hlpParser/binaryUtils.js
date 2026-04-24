export const WINDOWS_1252 = 'windows-1252';

export function readInt32(data, offset) {
  return (data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)) | 0;
}

export function readUint16(data, offset) {
  return (data[offset] | (data[offset + 1] << 8)) >>> 0;
}

export function normalizeTopicOffset(value) {
  if (value == null || value < 0 || value === 0xffff || value === 0xffffffff) {
    return null;
  }

  return value >>> 0;
}

export class LsbBitReader {
  constructor(data, offset = 0) {
    this.data = data;
    this.offset = offset;
    this.current = 0;
    this.mask = 0;
  }

  readBit() {
    if (this.mask === 0) {
      this.current = this.offset + 4 <= this.data.length ? readInt32(this.data, this.offset) >>> 0 : 0;
      this.offset += 4;
      this.mask = 1;
    }

    const bit = (this.current & this.mask) !== 0;
    this.mask = (this.mask * 2) >>> 0;
    return bit;
  }
}
