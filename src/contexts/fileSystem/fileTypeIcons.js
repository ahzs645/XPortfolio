import { XP_ICONS } from './constants';

const EXTENSION_ICON_MAP = {
  '.pdf': '/icons/pdf/PDF.ico',
  '.doc': XP_ICONS.fileDoc,
  '.docx': XP_ICONS.fileDoc,
  '.rtf': XP_ICONS.fileDoc,
  '.xls': XP_ICONS.fileXls,
  '.xlsx': XP_ICONS.fileXls,
  '.ppt': XP_ICONS.filePpt,
  '.pptx': XP_ICONS.filePpt,
  '.txt': XP_ICONS.fileTxt,
  '.log': XP_ICONS.fileTxt,
  '.ini': XP_ICONS.fileTxt,
  '.md': XP_ICONS.fileTxt,
  '.html': XP_ICONS.fileHtml,
  '.htm': XP_ICONS.fileHtml,
  '.url': XP_ICONS.fileHtml,
  '.jpg': XP_ICONS.fileJpg,
  '.jpeg': XP_ICONS.fileJpg,
  '.png': XP_ICONS.fileJpg,
  '.gif': XP_ICONS.fileJpg,
  '.svg': XP_ICONS.fileJpg,
  '.bmp': XP_ICONS.fileBmp,
  '.webp': XP_ICONS.fileJpg,
  '.ico': XP_ICONS.fileJpg,
  '.mp3': XP_ICONS.fileMedia,
  '.wav': XP_ICONS.fileMedia,
  '.wma': XP_ICONS.fileMedia,
  '.ogg': XP_ICONS.fileMedia,
  '.flac': XP_ICONS.fileMedia,
  '.aac': XP_ICONS.fileMedia,
  '.mp4': XP_ICONS.fileMedia,
  '.avi': XP_ICONS.fileMedia,
  '.mov': XP_ICONS.fileMedia,
  '.mkv': XP_ICONS.fileMedia,
  '.wmv': XP_ICONS.fileMedia,
  '.webm': XP_ICONS.fileMedia,
  '.exe': XP_ICONS.fileExecutable,
  '.com': XP_ICONS.fileExecutable,
  '.bat': XP_ICONS.fileExecutable,
  '.msi': XP_ICONS.fileExecutable,
  '.ttf': XP_ICONS.fileFont,
  '.otf': XP_ICONS.fileFont,
  '.woff': XP_ICONS.fileFont,
  '.woff2': XP_ICONS.fileFont,
  '.fon': XP_ICONS.fileFont,
  '.cab': XP_ICONS.fileCab,
  '.iso': XP_ICONS.fileIso,
  '.zip': XP_ICONS.folderCompressed,
  '.rar': XP_ICONS.folderCompressed,
  '.7z': XP_ICONS.folderCompressed,
  '.tar': XP_ICONS.folderCompressed,
  '.gz': XP_ICONS.folderCompressed,
};

const MIME_ICON_MAP = [
  [/^application\/pdf/i, EXTENSION_ICON_MAP['.pdf']],
  [/^application\/json/i, XP_ICONS.fileGeneric],
  [/^text\/(plain|markdown)/i, XP_ICONS.fileTxt],
  [/^text\/html/i, XP_ICONS.fileHtml],
  [/^text\/css/i, XP_ICONS.fileGeneric],
  [/^image\//i, XP_ICONS.fileJpg],
  [/^audio\//i, XP_ICONS.fileMedia],
  [/^video\//i, XP_ICONS.fileMedia],
];

const SYSTEM_FOLDER_ICONS = new Map([
  ['desktop-folder', XP_ICONS.desktop],
  ['my-documents', XP_ICONS.myDocuments],
  ['my-pictures', XP_ICONS.myPictures],
  ['my-music', XP_ICONS.myMusic],
  ['recycle-bin', XP_ICONS.recycleBinEmpty],
]);

export function getFileExtension(name = '') {
  const lowerName = name.toLowerCase();
  const match = lowerName.match(/\.[^.]+$/);
  return match?.[0] || '';
}

export function getFileTypeIcon({
  name,
  mimeType,
  contentType,
  isDirectory = false,
  type,
  systemPath,
  id,
  isRecycleBinFull = false,
} = {}) {
  if (isDirectory || type === 'folder') {
    if (SYSTEM_FOLDER_ICONS.has(id)) return SYSTEM_FOLDER_ICONS.get(id);
    if (systemPath?.toLowerCase().includes('my pictures')) return XP_ICONS.folderPictures;
    if (systemPath?.toLowerCase().includes('my music')) return XP_ICONS.folderMusic;
    if (systemPath?.toLowerCase().includes('my videos')) return XP_ICONS.folderVideos;
    if (systemPath?.toLowerCase().includes('shared')) return XP_ICONS.folderShared;
    return XP_ICONS.folder;
  }

  if (type === 'drive') return XP_ICONS.localDisk;
  if (id === 'recycle-bin') return isRecycleBinFull ? XP_ICONS.recycleBinFull : XP_ICONS.recycleBinEmpty;

  const ext = getFileExtension(name);
  if (ext && EXTENSION_ICON_MAP[ext]) return EXTENSION_ICON_MAP[ext];

  const candidateMime = mimeType || contentType;
  if (candidateMime) {
    const matched = MIME_ICON_MAP.find(([pattern]) => pattern.test(candidateMime));
    if (matched) return matched[1];
  }

  return XP_ICONS.fileGeneric || XP_ICONS.file;
}

export { EXTENSION_ICON_MAP };
