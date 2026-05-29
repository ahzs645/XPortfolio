import { describe, expect, it } from 'vitest';
import { getPreservedExtension, truncateFilename } from './filenameUtils';

describe('truncateFilename', () => {
  it('preserves simple extensions when truncating', () => {
    expect(truncateFilename('portfolio-final-draft.pdf', { maxLength: 20 }))
      .toBe('portfolio-f…raft.pdf');
  });

  it('preserves multi-part extensions when requested', () => {
    expect(truncateFilename('archive.backup.tar.gz', { maxLength: 18, extensionParts: 2 }))
      .toBe('archive.…up.tar.gz');
  });

  it('truncates extensionless names without extension splitting', () => {
    expect(truncateFilename('averyverylongfoldername', { maxLength: 12 }))
      .toBe('averyverylo…');
  });

  it('handles hidden files without treating the leading dot as an extension', () => {
    expect(truncateFilename('.env.local.configuration', { maxLength: 14 }))
      .toBe('.env.local.co…');
  });
});

describe('getPreservedExtension', () => {
  it('returns the requested extension suffix', () => {
    expect(getPreservedExtension('archive.backup.tar.gz', 2)).toBe('.tar.gz');
  });

  it('ignores extensionless hidden files', () => {
    expect(getPreservedExtension('.env', 1)).toBe('');
  });
});
