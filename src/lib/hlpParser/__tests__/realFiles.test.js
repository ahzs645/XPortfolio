/**
 * Tests against real-world HLP files downloaded from GitHub.
 * - CMDLINE.hlp (13KB) from OllyDbg-Archive
 * - winfile.hlp (79KB) from microsoft/winfile (official MS repo)
 */
import { describe, it, expect } from 'vitest';
import { HlpParser } from '../HlpParser';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name) {
  const path = join(fixturesDir, name);
  if (!existsSync(path)) return null;
  const data = readFileSync(path);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

describe('CMDLINE.hlp (OllyDbg command line help, 13KB)', () => {
  const buffer = loadFixture('cmdline.hlp');

  it.skipIf(!buffer)('parses without throwing', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    console.log('[CMDLINE] Title:', result.title);
  });

  it.skipIf(!buffer)('extracts topics', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result.topics.length).toBeGreaterThan(0);
    console.log('[CMDLINE] Topics:', result.topics.length);
    console.log('[CMDLINE] Topic titles:', result.topics.slice(0, 8).map(t => t.title));
  });

  it.skipIf(!buffer)('extracts fonts', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    console.log('[CMDLINE] Fonts:', result.fonts.length, result.fonts.map(f => `${f.face} ${f.size}pt${f.bold ? ' bold' : ''}${f.italic ? ' italic' : ''}`));
  });

  it.skipIf(!buffer)('extracts readable topic content', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    const withContent = result.topics.filter(t => t.content.length > 0);
    expect(withContent.length).toBeGreaterThan(0);
    console.log('[CMDLINE] Topics with content:', withContent.length);
    for (const t of withContent.slice(0, 3)) {
      console.log(`  "${t.title}": ${t.content[0]?.text?.substring(0, 80)}...`);
    }
  });
});

describe('winfile.hlp (Microsoft File Manager help, 79KB)', () => {
  const buffer = loadFixture('winfile.hlp');

  it.skipIf(!buffer)('parses without throwing', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    console.log('[winfile] Title:', result.title);
  });

  it.skipIf(!buffer)('extracts topics', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result.topics.length).toBeGreaterThan(0);
    console.log('[winfile] Topics:', result.topics.length);
    console.log('[winfile] Topic titles:', result.topics.slice(0, 10).map(t => t.title));
  });

  it.skipIf(!buffer)('extracts fonts', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    expect(result.fonts.length).toBeGreaterThan(0);
    console.log('[winfile] Fonts:', result.fonts.length, result.fonts.slice(0, 5).map(f => `${f.face} ${f.size}pt${f.bold ? ' bold' : ''}${f.italic ? ' italic' : ''}`));
  });

  it.skipIf(!buffer)('has readable content in topics', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    const withContent = result.topics.filter(t => t.content.length > 0);
    expect(withContent.length).toBeGreaterThan(0);
    console.log('[winfile] Topics with content:', withContent.length, '/', result.topics.length);
    for (const t of withContent.slice(0, 5)) {
      console.log(`  "${t.title}": ${t.content[0]?.text?.substring(0, 80)}...`);
    }
  });

  it.skipIf(!buffer)('extracts keywords if present', () => {
    const parser = new HlpParser(buffer);
    const result = parser.parse();
    console.log('[winfile] Keywords:', result.keywords.length);
    if (result.keywords.length > 0) {
      console.log('[winfile] Sample keywords:', result.keywords.slice(0, 10).map(k => k.keyword));
    }
  });
});
