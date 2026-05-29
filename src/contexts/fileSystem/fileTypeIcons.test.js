import { describe, expect, it } from 'vitest';
import { XP_ICONS } from './constants';
import { getFileExtension, getFileTypeIcon } from './fileTypeIcons';

describe('getFileExtension', () => {
  it('returns the final extension in lowercase', () => {
    expect(getFileExtension('Report.Final.PDF')).toBe('.pdf');
  });

  it('returns an empty string for extensionless names', () => {
    expect(getFileExtension('README')).toBe('');
  });
});

describe('getFileTypeIcon', () => {
  it('resolves common document file types', () => {
    expect(getFileTypeIcon({ name: 'resume.docx' })).toBe(XP_ICONS.fileDoc);
    expect(getFileTypeIcon({ name: 'budget.xlsx' })).toBe(XP_ICONS.fileXls);
    expect(getFileTypeIcon({ name: 'slides.pptx' })).toBe(XP_ICONS.filePpt);
  });

  it('resolves media and archive file types', () => {
    expect(getFileTypeIcon({ name: 'song.wav' })).toBe(XP_ICONS.fileMedia);
    expect(getFileTypeIcon({ name: 'backup.tar.gz' })).toBe(XP_ICONS.folderCompressed);
  });

  it('falls back to MIME type when an extension is unknown', () => {
    expect(getFileTypeIcon({ name: 'download', mimeType: 'image/png' })).toBe(XP_ICONS.fileJpg);
  });

  it('resolves special folders and regular folders', () => {
    expect(getFileTypeIcon({ id: 'desktop-folder', type: 'folder' })).toBe(XP_ICONS.desktop);
    expect(getFileTypeIcon({ type: 'folder' })).toBe(XP_ICONS.folder);
  });
});
