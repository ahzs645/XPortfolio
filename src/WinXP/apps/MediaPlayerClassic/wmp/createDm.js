function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/");
}

const SAMPLE_MEDIA_REMAP = new Map([
  [
    "c:/windows/system32/oobe/images/title.wma",
    "C:/WINDOWS/Media/Windows XP Startup.wav",
  ],
  [
    "c:/documents and settings/all users/shared music/sample music/david byrne - like humans do.mp3",
    "C:/WINDOWS/Media/Windows XP Balloon.wav",
  ],
  [
    "c:/documents and settings/all users/shared music/sample music/new stories - highway blues.mp3",
    "C:/WINDOWS/Media/Windows XP Error.wav",
  ],
  [
    "c:/documents and settings/all users/shared music/sample music/beethoven's symphony no. 9 (scherzo).mp3",
    "C:/WINDOWS/Media/Windows XP Startup.wav",
  ],
]);

function splitDirname(path) {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash <= 0) return { dir: "", base: normalized };
  return { dir: normalized.slice(0, lastSlash), base: normalized.slice(lastSlash + 1) };
}

function encodePathSegments(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function createDm() {
  const localFiles = new Map();
  const localObjectUrls = new Map();

  const remapSampleMediaPath = (path) => {
    const normalized = normalizePath(path);
    if (normalized.startsWith("local://")) return normalized;
    const remapped = SAMPLE_MEDIA_REMAP.get(normalized.toLowerCase());
    return remapped || normalized;
  };

  const registerLocalFiles = (files) => {
    const now = Date.now().toString(36);
    return files.map((file, idx) => {
      const token = `${now}-${idx}-${Math.random().toString(36).slice(2)}`;
      const pseudoPath = `local://${token}/${file.name}`;
      localFiles.set(pseudoPath, file);
      return pseudoPath;
    });
  };

  const getVfsUrl = (path) => {
    const normalized = remapSampleMediaPath(path);

    if (normalized.startsWith("local://")) {
      const file = localFiles.get(normalized);
      if (!file) return "";
      const cached = localObjectUrls.get(normalized);
      if (cached) return cached;
      const url = URL.createObjectURL(file);
      localObjectUrls.set(normalized, url);
      return url;
    }

    const m = normalized.match(/^([A-Za-z]):\/(.*)$/);
    if (m) {
      const drive = m[1].toUpperCase();
      const rest = m[2];
      return `/vfs/${drive}/${encodePathSegments(rest)}`;
    }

    return normalized;
  };

  const open = async (path) => {
    const normalized = remapSampleMediaPath(path);

    if (normalized.startsWith("local://")) {
      const file = localFiles.get(normalized);
      if (!file) return null;
      return { type: "file", content: file };
    }

    const url = getVfsUrl(normalized);
    if (!url) return null;

    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return { type: "file", content: blob };
  };

  const basename = (path) => splitDirname(path).base;

  const dirname = (path) => splitDirname(path).dir;

  return {
    open,
    basename,
    dirname,
    getVfsUrl,
    _registerLocalFiles: registerLocalFiles,
    _revokeAllLocalObjectUrls: () => {
      for (const url of localObjectUrls.values()) URL.revokeObjectURL(url);
      localObjectUrls.clear();
    },
  };
}
