/**
 * LZ77 decompression for WinHelp files.
 * Ported from winhelpcgi's iLZDecompress / Microsoft's WinHelp variant.
 *
 * Back-references are a distance backwards from the current output position:
 *   len = ((byte2 & 0xF0) >> 4) + 3
 *   distance = ((byte2 & 0x0F) << 8) + byte1 + 1
 */
export function decompressLZ77(src, destSize) {
  const dest = new Uint8Array(destSize);
  let srcPos = 0;
  let destPos = 0;

  while (srcPos < src.length && destPos < destSize) {
    const bitmap = src[srcPos++];

    for (let bit = 0; bit < 8 && srcPos < src.length && destPos < destSize; bit++) {
      if (bitmap & (1 << bit)) {
        if (srcPos + 1 >= src.length) break;

        const byte1 = src[srcPos++];
        const byte2 = src[srcPos++];
        let length = ((byte2 & 0xf0) >> 4) + 3;
        let distance = ((byte2 & 0x0f) << 8) + byte1 + 1;
        let copyPos = destPos - distance;

        while (length-- > 0 && destPos < destSize) {
          dest[destPos++] = copyPos >= 0 ? dest[copyPos++] : 0x20;
        }
      } else {
        dest[destPos++] = src[srcPos++];
      }
    }
  }

  return dest.slice(0, destPos);
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
 * Decompress Hall-compressed phrase references stored in newer help files.
 * This follows winhelpcgi's nibble mode used when PhrIndex/PhrImage are present
 * and the packed text stream is shorter than its expanded size.
 */
export function decompressPhrasesNibble(data, phraseBuffers) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const cur = data[i];

    if (cur & 1) {
      const opcode = cur & 0x0f;

      if (opcode === 0x0f) {
        const blockLength = ((cur & 0xf0) >> 4) + 1;
        result.push(...new Uint8Array(blockLength));
        continue;
      }

      if (opcode === 0x07) {
        const blockLength = ((cur & 0xf0) >> 4) + 1;
        result.push(...new Uint8Array(blockLength).fill(0x20));
        continue;
      }

      if ((opcode === 0x03 || opcode === 0x0b) && i + 1 < data.length) {
        const blockLength = ((cur & 0xf8) >> 3) + 1;
        const end = Math.min(i + 1 + blockLength, data.length);
        result.push(...data.slice(i + 1, end));
        i += end - (i + 1);
        continue;
      }

      if (
        (opcode === 0x01 || opcode === 0x05 || opcode === 0x09 || opcode === 0x0d) &&
        i + 1 < data.length
      ) {
        const byte1 = (cur & 0xfc) >> 2;
        const byte2 = data[++i];
        const phraseIdx = byte1 * 256 + byte2 + 128;
        if (phraseIdx >= 0 && phraseIdx < phraseBuffers.length) {
          result.push(...phraseBuffers[phraseIdx]);
        }
        continue;
      }
    }

    const phraseIdx = cur >> 1;
    if (phraseIdx >= 0 && phraseIdx < phraseBuffers.length) {
      result.push(...phraseBuffers[phraseIdx]);
    }
  }
  return new Uint8Array(result);
}

/**
 * Phrase expansion for PhrIndex/PhrImage streams that are not using nibble mode.
 * winhelpcgi applies the same legacy byte-pair phrase references here.
 */
export function decompressPhrasesNew(data, phraseBuffers) {
  return decompressPhrasesOld(data, phraseBuffers);
}

/**
 * Phrase expansion used by Wine for some old/new phrase streams.
 * Kept as a separate helper in case a file matches that encoding better.
 */
export function decompressPhrasesWine(data, phraseBuffers) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if ((byte & 1) && i + 1 < data.length) {
      const idx = (byte + 256 * data[i + 1] - 0x100) >> 1;
      if (idx >= 0 && idx < phraseBuffers.length) {
        result.push(...phraseBuffers[idx]);
      }
      i++;
    } else {
      result.push(byte);
    }
  }
  return new Uint8Array(result);
}
