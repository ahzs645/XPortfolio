/**
 * LZ77 decompression for WinHelp files.
 * Ported from Wine's HLPFILE_UncompressLZ77 (winhlp32/hlpfile.c).
 *
 * Uses a 4096-byte ring buffer initialized with spaces (0x20).
 * Back-references use absolute ring buffer positions (val >> 4),
 * NOT relative offsets.
 */
export function decompressLZ77(src, destSize) {
  const WINDOW_SIZE = 0x1000; // 4096
  const buf = new Uint8Array(WINDOW_SIZE);
  buf.fill(0x20); // Ring buffer initialized with spaces

  const dest = new Uint8Array(destSize);
  let srcPos = 0;
  let newpos = 0;

  while (srcPos < src.length && newpos < destSize) {
    let b = src[srcPos++];

    for (let i = 0; i < 8 && srcPos < src.length && newpos < destSize; i++) {
      if (b & 1) {
        // Back-reference: 16-bit value
        if (srcPos + 1 >= src.length) break;
        const sh = src[srcPos] | (src[srcPos + 1] << 8);
        srcPos += 2;

        let len = (sh & 0x0F) + 3;
        let offset = sh >> 4; // absolute ring buffer position (no +1!)

        while (len-- > 0 && newpos < destSize) {
          dest[newpos] = buf[offset & 0xFFF];
          buf[newpos & 0xFFF] = dest[newpos];
          newpos++;
          offset++;
        }
      } else {
        // Literal byte
        buf[newpos & 0xFFF] = src[srcPos];
        dest[newpos++] = src[srcPos++];
      }
      b >>= 1;
    }
  }

  return dest.slice(0, newpos); // Only return actually-written bytes
}

/**
 * Decompress old-style phrases (|Phrases file, both HC30 and HC31).
 * Bytes 0x01-0x0F start a 2-byte phrase reference:
 *   PhraseNum = (byte1 - 1) * 256 + byte2
 *   Phrase index = PhraseNum / 2 (integer division)
 *   If PhraseNum is odd, append a space after the phrase.
 * All other bytes (0 and 16+) are literal.
 * Ported from winhelpcgi's nDeCompTopic (non-NibbleMode).
 */
export function decompressPhrasesOld(data, phraseBuffers) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte > 0 && byte <= 0x0F && i + 1 < data.length) {
      // Two-byte phrase reference
      const byte2 = data[++i];
      const phraseNum = (byte - 1) * 256 + byte2;
      const phraseIdx = phraseNum >> 1;
      if (phraseIdx >= 0 && phraseIdx < phraseBuffers.length) {
        result.push(...phraseBuffers[phraseIdx]);
      }
      // If phraseNum is odd, append a space
      if (phraseNum & 1) {
        result.push(0x20);
      }
    } else {
      result.push(byte);
    }
  }
  return new Uint8Array(result);
}

/**
 * Decompress new-style phrases (HC31+, |Phrases with version >= 16).
 * Bytes with bit 0 set (odd) form a 2-byte phrase reference with the next byte.
 * Index = (byte1 + 256 * byte2 - 0x100) >> 1
 * Ported from Wine's HLPFILE_Uncompress3.
 */
export function decompressPhrasesNew(data, phraseBuffers) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if ((byte & 1) && i + 1 < data.length) {
      const idx = (byte + 256 * data[i + 1] - 0x100) >> 1;
      if (idx >= 0 && idx < phraseBuffers.length) {
        result.push(...phraseBuffers[idx]);
      }
      i++; // skip second byte of pair
    } else {
      result.push(byte);
    }
  }
  return new Uint8Array(result);
}
