/**
 * Tests against real-world HLP files downloaded from GitHub.
 * - CMDLINE.hlp (13KB) from OllyDbg-Archive
 * - winfile.hlp (79KB) from microsoft/winfile (official MS repo)
 */
import { describe, it, expect } from 'vitest';
import { HlpParser } from '../HlpParser';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name) {
  const path = join(fixturesDir, name);
  if (!existsSync(path)) return null;
  const data = readFileSync(path);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function hasControlChars(value) {
  return [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });
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
    expect(result.topics.map(t => t.title)).toEqual(
      expect.arrayContaining(['Preliminary description', 'How to add'])
    );
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
    expect(result.topics[0].title).toBe('Contents for File Manager Help');
    expect(result.topics.map(t => t.title)).toEqual(
      expect.arrayContaining(['Changing Display Options', 'Working with Files and Directories'])
    );
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

describe('additional real-world HLP coverage', () => {
  it.skipIf(!loadFixture('winexit.hlp'))('decodes old |Phrases text in winexit.hlp', () => {
    const parser = new HlpParser(loadFixture('winexit.hlp'));
    const result = parser.parse();
    const whatIsWinExit = result.topics.find((topic) => topic.title === 'What is WinExit');
    const text = whatIsWinExit?.content.map((item) => item.text).join('\n') ?? '';

    expect(text).toContain('WinExit is a screen saver');
    expect(text).toContain('logs the current user off');
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it.skipIf(!loadFixture('srvmgr.hlp'))('reads named keyword tables and full body text in srvmgr.hlp', () => {
    const parser = new HlpParser(loadFixture('srvmgr.hlp'));
    const result = parser.parse();
    const properties = result.topics.find((topic) => topic.title === 'Properties command');
    const text = properties?.content.map((item) => item.text).join('\n') ?? '';

    expect(result.keywords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: 'A', keyword: 'SM_Message' }),
      ])
    );
    expect(text).toContain('Manages the server properties');
    expect(result.internalFiles.some((entry) => hasControlChars(entry.name))).toBe(false);
  });

  it.skipIf(!loadFixture('usrmgr.hlp'))('keeps directory entries clean and extracts body text in usrmgr.hlp', () => {
    const parser = new HlpParser(loadFixture('usrmgr.hlp'));
    const result = parser.parse();
    const newUser = result.topics.find((topic) => topic.title === 'New User command');
    const text = newUser?.content.map((item) => item.text).join('\n') ?? '';

    expect(text).toContain('Creates one or more new user accounts');
    expect(result.internalFiles.some((entry) => hasControlChars(entry.name))).toBe(false);
    expect(result.auxiliaryFiles).toEqual(expect.arrayContaining(['|TopicId', '|Petra']));
  });

  it.skipIf(!loadFixture('hlp2rtf.hlp'))('parses winhelpcgi hlp2rtf sample', () => {
    const parser = new HlpParser(loadFixture('hlp2rtf.hlp'));
    const result = parser.parse();

    expect(result.title).toBe('Help to RTF');
    expect(result.topics.map((topic) => topic.title)).toEqual(expect.arrayContaining(['Introduction']));
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.bitmapFiles).toEqual(expect.arrayContaining(['|bm0']));
  });

  it.skipIf(!loadFixture('hlpacces.hlp'))('parses winhelpcgi hlpacces sample baggage metadata', () => {
    const parser = new HlpParser(loadFixture('hlpacces.hlp'));
    const result = parser.parse();

    expect(result.title).toBe('Help Access Library declarations');
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.baggageFiles).toEqual(expect.arrayContaining(['bag.ini']));
  });
});
