import { decompressLZ77 } from './decompress';
import { LsbBitReader, WINDOWS_1252 } from './binaryUtils';

const decoder = new TextDecoder(WINDOWS_1252);

export function readOldPhrases(reader) {
  const phrases = [];
  const phraseBuffers = [];
  const numPhrases = reader.readUint16();

  const savedPos = reader.offset;
  const possibleOneHundred = reader.readUint16();
  let decompressedSizeHint = 0;
  let isHC31 = false;

  if (possibleOneHundred === 0x0100) {
    decompressedSizeHint = reader.readUint32();
    isHC31 = true;
  } else {
    reader.seek(savedPos);
  }

  const offsets = [];
  for (let i = 0; i <= numPhrases; i++) {
    offsets.push(reader.readUint16());
  }

  const offsetTableSize = (numPhrases + 1) * 2;
  const compressedData = reader.readBytes(reader.remaining);
  let phraseData = compressedData;

  if (isHC31 && compressedData.length > 0) {
    const targetSize = Math.max(
      decompressedSizeHint,
      offsets[numPhrases] > offsetTableSize ? offsets[numPhrases] - offsetTableSize : 0,
      compressedData.length
    );

    try {
      phraseData = decompressLZ77(compressedData, targetSize);
    } catch {
      phraseData = compressedData;
    }
  }

  const baseOffset = isHC31 ? offsetTableSize : 0;
  for (let i = 0; i < numPhrases; i++) {
    const start = offsets[i] - baseOffset;
    const end = offsets[i + 1] - baseOffset;
    if (start >= 0 && end > start && end <= phraseData.length) {
      const bytes = phraseData.slice(start, end);
      phrases.push(decoder.decode(bytes));
      phraseBuffers.push(Array.from(bytes));
    } else {
      phrases.push('');
      phraseBuffers.push([]);
    }
  }

  return { phraseStyle: 2, phrases, phraseBuffers };
}

export function readNewPhrases(indexReader, imageReader) {
  let numPhrases;
  let phraseImageSize;
  let phraseImageCompressedSize;
  let offsets;

  if (indexReader.length >= 28 && indexReader.readUint32() === 1) {
    numPhrases = indexReader.readUint32();
    indexReader.readUint32();
    phraseImageSize = indexReader.readUint32();
    phraseImageCompressedSize = indexReader.readUint32();
    indexReader.readUint32();
    const bitCount = indexReader.readUint16() & 0x0f;
    indexReader.readUint16();

    offsets = [0];
    const bitReader = new LsbBitReader(new Uint8Array(indexReader.buffer), indexReader.offset);
    for (let i = 0; i < numPhrases; i++) {
      let length = 1;
      while (bitReader.readBit()) {
        length += 1 << bitCount;
      }
      for (let bit = 0; bit < bitCount; bit++) {
        if (bitReader.readBit()) {
          length += 1 << bit;
        }
      }
      offsets.push(offsets[offsets.length - 1] + length);
    }
  } else {
    indexReader.seek(0);
    numPhrases = indexReader.readUint16();
    indexReader.skip(2);

    offsets = [];
    for (let i = 0; i <= numPhrases; i++) {
      offsets.push(indexReader.readUint16());
    }

    phraseImageSize = offsets[numPhrases] || 0;
    phraseImageCompressedSize = imageReader.length;
  }

  const compressedData = imageReader.readBytes(imageReader.remaining);
  let phraseData;
  try {
    if (
      phraseImageSize > 0 &&
      phraseImageCompressedSize !== phraseImageSize &&
      compressedData.length !== phraseImageSize
    ) {
      phraseData = decompressLZ77(compressedData, phraseImageSize);
    } else {
      phraseData = compressedData;
    }
  } catch {
    phraseData = compressedData;
  }

  const phrases = [];
  const phraseBuffers = [];
  for (let i = 0; i < numPhrases; i++) {
    const start = offsets[i];
    const end = offsets[i + 1];
    if (end > start && end <= phraseData.length) {
      const bytes = phraseData.slice(start, end);
      phrases.push(decoder.decode(bytes));
      phraseBuffers.push(Array.from(bytes));
    } else {
      phrases.push('');
      phraseBuffers.push([]);
    }
  }

  return { phraseStyle: 3, phrases, phraseBuffers };
}
