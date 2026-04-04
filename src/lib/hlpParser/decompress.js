/**
 * LZ77 decompression for WinHelp files.
 * Used to decompress topic blocks and phrase tables.
 */
export function decompressLZ77(src, destSize) {
  const dest = new Uint8Array(destSize);
  let srcPos = 0;
  let destPos = 0;

  while (srcPos < src.length && destPos < destSize) {
    let flags = src[srcPos++];

    for (let i = 0; i < 8 && srcPos < src.length && destPos < destSize; i++) {
      if (flags & 1) {
        // Compressed: read 16-bit reference
        if (srcPos + 1 >= src.length) break;
        const val = src[srcPos] | (src[srcPos + 1] << 8);
        srcPos += 2;

        const copyLen = (val & 0x0F) + 3;
        const copyOffset = (val >> 4) + 1;

        for (let j = 0; j < copyLen && destPos < destSize; j++) {
          dest[destPos] = dest[destPos - copyOffset];
          destPos++;
        }
      } else {
        // Literal byte
        dest[destPos++] = src[srcPos++];
      }
      flags >>= 1;
    }
  }

  return dest;
}

/**
 * Decompress phrases from a phrase-compressed topic.
 * Characters 0-15 index into the phrase table.
 */
export function decompressPhrases(data, phrases) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const byte = data[i];

    if (byte === 0 && i + 1 < data.length) {
      // Two-byte phrase reference
      const next = data[i + 1];
      const phraseIndex = (byte * 256 + next - 256) / 2;
      if (phraseIndex >= 0 && phraseIndex < phrases.length) {
        result.push(...new TextEncoder().encode(phrases[phraseIndex]));
      }
      i++;
    } else if (byte > 0 && byte < 16) {
      // Single byte phrase reference (old style)
      if (byte < phrases.length) {
        result.push(...new TextEncoder().encode(phrases[byte]));
      }
    } else {
      result.push(byte);
    }
  }

  return new Uint8Array(result);
}
