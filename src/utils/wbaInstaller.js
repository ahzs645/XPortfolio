/**
 * WindowBlinds .wba theme installer — generic mapper.
 *
 * A .wba is a ZIP holding INI config files (.uis main skin, optional .sss
 * substyles, optional .xp XP taskbar/start-panel) plus BMP sprites. Stardock
 * skins vary a lot: section/key casing differs, frames live in different files,
 * some skins ship no .xp at all, file names use backslash paths and spaces.
 *
 * This parser maps any of them onto the theme object shape consumed by the
 * shell (see src/WinXP/styles/themes/luna.js for the contract). It is
 * deliberately defensive: everything is matched case-insensitively, missing
 * pieces degrade gracefully, and only referenced BMPs are decoded.
 */
import JSZip from 'jszip';
import { LUNA_THEME } from '../WinXP/styles/themes/luna';

/* ------------------------------------------------------------------ *
 * INI parsing + case-insensitive access
 * ------------------------------------------------------------------ */

function parseIni(text) {
  const sections = {};
  let current = null;
  // Normalise CRLF and lone-CR (old Mac) line endings.
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (const rawLine of normalized.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';')) continue;

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      current = sectionMatch[1];
      if (!sections[current]) sections[current] = {};
      continue;
    }

    if (current) {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.slice(0, eqIdx).trim();
        const value = line.slice(eqIdx + 1).trim();
        sections[current][key] = value;
      }
    }
  }
  return sections;
}

/** Case-insensitive section lookup. Returns {} if absent. */
function section(cfg, ...names) {
  if (!cfg) return {};
  const wanted = names.map((n) => n.toLowerCase());
  for (const key of Object.keys(cfg)) {
    if (wanted.includes(key.toLowerCase())) return cfg[key];
  }
  return {};
}

/** Case-insensitive key lookup within a section. */
function val(sec, ...keys) {
  if (!sec) return undefined;
  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(sec)) {
    if (wanted.includes(key.toLowerCase())) return sec[key];
  }
  return undefined;
}

/** Parse "R G B" INI colour triplets into an rgb() string. */
function iniColor(str) {
  if (!str) return null;
  const parts = str.split(/\s+/).map(Number);
  if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }
  return null;
}

function toInt(str, fallback) {
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? fallback : n;
}

/* ------------------------------------------------------------------ *
 * BMP -> canvas (magenta keyed to transparent) + frame composition
 * ------------------------------------------------------------------ */

/**
 * Decode an image buffer into a canvas, keying magenta (#FF00FF) to transparent.
 * Returns the canvas so callers can slice/recompose frames before exporting.
 */
async function bufferToCanvas(arrayBuffer, fileName, mime = 'image/bmp') {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] >= 250 && data[i + 1] <= 5 && data[i + 2] >= 250) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      } catch {
        // getImageData can throw on tainted canvases; keep the opaque draw.
      }
      resolve({ canvas, width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${fileName}`));
    };
    img.src = url;
  });
}

function canvasToDataUrl(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * Normalise a multi-frame title-bar bitmap into the 2-cell [active|inactive]
 * horizontal strip the renderer expects (background-size:200% 100%, active=left).
 *
 * @param orientation 'horizontal' for UIS1 HorzFrame (frames side by side),
 *                    'vertical' for classic Personality Top (frames stacked).
 */
function composeTwoFrameStrip(canvas, frameCount, orientation) {
  const count = Math.max(1, frameCount);
  const cellW = orientation === 'horizontal' ? Math.round(canvas.width / count) : canvas.width;
  const cellH = orientation === 'vertical' ? Math.round(canvas.height / count) : canvas.height;

  const out = document.createElement('canvas');
  out.width = cellW * 2;
  out.height = cellH;
  const ctx = out.getContext('2d');

  const drawCell = (frameIndex, destX) => {
    const idx = Math.min(frameIndex, count - 1);
    const srcX = orientation === 'horizontal' ? idx * cellW : 0;
    const srcY = orientation === 'vertical' ? idx * cellH : 0;
    ctx.drawImage(canvas, srcX, srcY, cellW, cellH, destX, 0, cellW, cellH);
  };

  drawCell(0, 0);       // active
  drawCell(1, cellW);   // inactive (falls back to active when count === 1)

  return { dataUrl: canvasToDataUrl(out), width: cellW, height: cellH };
}

/**
 * Crop each frame out of a frame strip into its own data URL.
 * WindowBlinds packs button/taskbar states as equal cells along one axis.
 */
function frameDataUrls(canvas, count, orientation) {
  const n = Math.max(1, count);
  const cellW = orientation === 'horizontal' ? Math.round(canvas.width / n) : canvas.width;
  const cellH = orientation === 'vertical' ? Math.round(canvas.height / n) : canvas.height;
  const urls = [];
  for (let i = 0; i < n; i++) {
    const out = document.createElement('canvas');
    out.width = cellW;
    out.height = cellH;
    out.getContext('2d').drawImage(
      canvas,
      orientation === 'horizontal' ? i * cellW : 0,
      orientation === 'vertical' ? i * cellH : 0,
      cellW, cellH, 0, 0, cellW, cellH,
    );
    urls.push(canvasToDataUrl(out));
  }
  return urls;
}

/**
 * Guess how many state frames a control-button strip holds. Skins ship 2-6
 * square-ish cells side by side; pick the divisor whose cell is closest to
 * square.
 */
function detectFrameCount(width, height, candidates = [6, 5, 4, 3, 2]) {
  let best = null;
  for (const c of candidates) {
    if (width % c !== 0) continue;
    const score = Math.abs(width / c - height);
    if (!best || score < best.score) best = { count: c, score };
  }
  return best ? best.count : 3;
}

/**
 * Average luminance (0-255) of an opaque region of a canvas, used to pick a
 * readable text colour over raster art. Returns null if the region is
 * (almost) fully transparent.
 */
function regionLuminance(canvas, sx, sy, sw, sh) {
  try {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(sx, sy, Math.max(1, sw), Math.max(1, sh));
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) continue;
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    if (n < (data.length / 4) * 0.05) return null;
    return sum / n;
  } catch {
    return null;
  }
}

/** Black-or-white text colour for a given backdrop luminance. */
const textColorFor = (lum, fallback = '#fff') =>
  lum == null ? fallback : (lum > 150 ? '#1a1a1a' : '#fff');

/* ------------------------------------------------------------------ *
 * ZIP helpers + asset resolution
 * ------------------------------------------------------------------ */

const isBackup = (name) => name.endsWith('~') || name.toLowerCase().endsWith('.bak');

function listFiles(zip) {
  return Object.keys(zip.files).filter((f) => !zip.files[f].dir && !isBackup(f));
}

function filesWithExt(files, ext) {
  const suffix = `.${ext.toLowerCase()}`;
  return files.filter((f) => f.toLowerCase().endsWith(suffix));
}

async function readIni(zip, name) {
  return parseIni(await zip.files[name].async('string'));
}

/** Reduce an INI asset reference ("skin\\foo.bmp") to a lowercase basename key. */
function assetKey(iniPath) {
  if (!iniPath) return null;
  return iniPath.replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
}

function resolveAsset(assets, iniPath) {
  const key = assetKey(iniPath);
  return key ? assets[key] || null : null;
}

/** Collect every basename referenced as an image across the parsed configs. */
function collectImageRefs(...configs) {
  const refs = new Set();
  for (const cfg of configs) {
    if (!cfg) continue;
    for (const sec of Object.values(cfg)) {
      for (const value of Object.values(sec)) {
        if (typeof value === 'string' && /\.(bmp|png|gif|jpg|jpeg)$/i.test(value.trim())) {
          const key = assetKey(value);
          if (key) refs.add(key);
        }
      }
    }
  }
  return refs;
}

/** Decode only the referenced images. Returns { basename: {canvas,width,height,dataUrl} }. */
async function convertReferenced(zip, refs) {
  const assets = {};
  const files = listFiles(zip);

  await Promise.all(files.map(async (name) => {
    const key = name.replace(/\\/g, '/').split('/').pop().toLowerCase();
    if (!refs.has(key)) return;
    const ext = key.slice(key.lastIndexOf('.') + 1);
    const mime = ext === 'bmp' ? 'image/bmp'
      : ext === 'png' ? 'image/png'
      : ext === 'gif' ? 'image/gif'
      : 'image/jpeg';
    try {
      const buf = await zip.files[name].async('arraybuffer');
      const decoded = await bufferToCanvas(buf, name, mime);
      decoded.dataUrl = canvasToDataUrl(decoded.canvas);
      assets[key] = decoded;
    } catch (e) {
      console.warn(`WBA: failed to convert ${name}:`, e.message);
    }
  }));

  return assets;
}

/* ------------------------------------------------------------------ *
 * Config discovery
 * ------------------------------------------------------------------ */

/** Score a parsed .uis so we can pick the "main" one when a skin ships several. */
function scoreMainConfig(cfg, name, archiveBase) {
  let score = Object.keys(cfg).length * 0.1;
  if (Object.keys(section(cfg, 'Personality')).length) score += 5;
  if (Object.keys(section(cfg, 'Colours', 'Colors')).length) score += 5;
  score += Object.keys(cfg).filter((k) => /^button\d+$/i.test(k)).length;
  // Tiebreak: prefer a file whose name matches the archive name.
  const base = name.replace(/\\/g, '/').split('/').pop().replace(/\.uis$/i, '').toLowerCase();
  if (archiveBase && base.includes(archiveBase)) score += 0.5;
  return score;
}

/* ------------------------------------------------------------------ *
 * Theme building
 * ------------------------------------------------------------------ */

function slugId(name) {
  return (name || 'custom-theme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'custom-theme';
}

function buildColors(colours) {
  return {
    highlight: iniColor(val(colours, 'Hilight', 'Highlight')) || '#316ac5',
    highlightText: iniColor(val(colours, 'HilightText', 'HighlightText')) || '#fff',
    activeTitle: iniColor(val(colours, 'ActiveTitle')) || 'rgb(0, 84, 227)',
    inactiveTitle: iniColor(val(colours, 'InactiveTitle')) || 'rgb(118, 149, 212)',
    surface: iniColor(val(colours, 'Menu')) || '#ece9d8',
    windowText: iniColor(val(colours, 'WindowText')) || '#000',
    buttonFace: iniColor(val(colours, 'ButtonFace')) || '#ece9d8',
    menuBackground: iniColor(val(colours, 'Menu')) || '#fff',
    menuText: iniColor(val(colours, 'MenuText')) || '#000',
  };
}

/** Title bar: prefer UIS1 framed strip, else classic Personality, else CSS. */
function buildTitleBar(mainConfig, frameConfig, assets, colours, fonts, textCfg) {
  const personality = section(mainConfig, 'Personality');

  // UIS1 framed style — HorzFrame lives in [Borders] of the .uis or a substyle.
  const borders = section(frameConfig, 'Borders');
  const horzFrame = val(borders, 'HorzFrame');
  const frameAsset = resolveAsset(assets, horzFrame);

  const fontFamily = val(fonts, 'Fontname') || 'Tahoma, sans-serif';
  const fontSize = `${val(fonts, 'FontHeight') || 13}px`;
  const use3D = val(textCfg, 'Use3DText') === '1';
  const shadow = use3D
    ? `${val(textCfg, 'ShadowOffset') || 1}px ${val(textCfg, 'ShadowOffset') || 1}px 0 rgb(${val(textCfg, 'ShadowTextR') || 0}, ${val(textCfg, 'ShadowTextG') || 0}, ${val(textCfg, 'ShadowTextB') || 0})`
    : 'none';

  // Caption text colour: skin ActiveText RGB, else the Windows scheme's
  // TitleText (NOT ActiveTitle — that's the caption *background* colour).
  const rgbTriple = (sec, r, g, b) => {
    const rv = val(sec, r);
    if (rv == null) return null;
    return `rgb(${rv}, ${val(sec, g) || 0}, ${val(sec, b) || 0})`;
  };
  const textColor = rgbTriple(personality, 'ActiveTextR', 'ActiveTextG', 'ActiveTextB')
    || iniColor(val(colours, 'TitleText'))
    || 'rgb(255, 255, 255)';
  const inactiveTextColor = rgbTriple(personality, 'InactiveTextR', 'InactiveTextG', 'InactiveTextB')
    || iniColor(val(colours, 'InactiveTitleText'))
    || 'rgb(180, 180, 180)';

  // Caption text layout (0=left, 1=center, 2=right), pixel shifts from skin.
  const alignVal = val(personality, 'TextAlignment');
  const textLayout = {
    textAlign: alignVal === '1' ? 'center' : alignVal === '2' ? 'right' : 'left',
    textShiftX: toInt(val(personality, 'TextShift'), 0),
    textShiftY: toInt(val(personality, 'TextShiftVert'), 0),
  };

  if (frameAsset) {
    const frameCount = toInt(val(borders, 'FrameCount'), 2);
    const strip = composeTwoFrameStrip(frameAsset.canvas, frameCount, 'horizontal');
    const frames = frameDataUrls(frameAsset.canvas, frameCount, 'horizontal');
    // TopMiddleStretch=0 means the caption art tiles horizontally.
    const stretch = val(borders, 'TopMiddleStretch') !== '0';
    return {
      titleBar: {
        type: 'image',
        frameImage: strip.dataUrl,
        frameWidth: strip.width,
        frameHeight: strip.height,
        frameCount: 2,
        activeImage: frames[0],
        inactiveImage: frames[1] || frames[0],
        stretch,
        height: toInt(val(section(mainConfig, 'Metrics'), 'CaptionHeight'), 28),
        textColor,
        inactiveTextColor,
        textShadow: shadow,
        fontFamily,
        fontSize,
        fontWeight: 'normal',
        ...textLayout,
      },
      vertFrame: val(borders, 'VertFrame'),
    };
  }

  // Classic Personality style — Top/Left/Right/Bottom BMPs with stacked frames.
  const topAsset = resolveAsset(assets, val(personality, 'Top'));
  if (topAsset) {
    const frameCount = toInt(val(personality, 'TopFrame'), 2);
    const strip = composeTwoFrameStrip(topAsset.canvas, frameCount, 'vertical');
    const frames = frameDataUrls(topAsset.canvas, frameCount, 'vertical');
    // Raster caption art tiles horizontally unless the skin opts out
    // (TopStretch=1 means "stretch, don't tile").
    const stretch = val(personality, 'TopStretch') === '1';
    return {
      titleBar: {
        type: 'image',
        frameImage: strip.dataUrl,
        frameWidth: strip.width,
        frameHeight: strip.height,
        frameCount: 2,
        activeImage: frames[0],
        inactiveImage: frames[1] || frames[0],
        stretch,
        // TopTopHeight is the fixed top *slice* for 3-segment stretching (can
        // be as small as 3px); the caption's natural height is one frame of
        // the Top bitmap.
        height: Math.max(18, strip.height),
        textColor,
        inactiveTextColor,
        textShadow: shadow,
        fontFamily,
        fontSize,
        fontWeight: 'normal',
        ...textLayout,
      },
      vertFrame: null, // classic Left/Right are separate; rely on borderColor instead
    };
  }

  return { titleBar: { type: 'css' }, vertFrame: null };
}

/** Window control buttons from [Button0..N] (Action: 0=close, 23=min, 22=max/restore). */
function buildWindowControls(mainConfig, assets) {
  const buttons = [];
  for (const key of Object.keys(mainConfig)) {
    if (/^button\d+$/i.test(key)) buttons.push(mainConfig[key]);
  }
  if (!buttons.length) return { type: 'css' };

  const byAction = (action) => buttons.filter((b) => val(b, 'Action') === action);
  const closeBtn = byAction('0')[0];
  const minBtn = byAction('23')[0];
  const maxButtons = byAction('22');
  // Visibility 3 = maximize, 4 = restore; many skins omit Visibility entirely.
  const maxBtn = maxButtons.find((b) => val(b, 'Visibility') === '3') || maxButtons[0];
  const restoreBtn = maxButtons.find((b) => val(b, 'Visibility') === '4') || maxButtons[1];

  const closeAsset = resolveAsset(assets, val(closeBtn, 'ButtonImage'));
  const minAsset = resolveAsset(assets, val(minBtn, 'ButtonImage'));
  const maxAsset = resolveAsset(assets, val(maxBtn, 'ButtonImage'));
  const restoreAsset = resolveAsset(assets, val(restoreBtn, 'ButtonImage'));

  if (!closeAsset && !minAsset && !maxAsset) return { type: 'css' };

  // Each button image is a horizontal strip of square-ish state cells
  // (normal / mouseover / pressed, often followed by inactive variants).
  const sprite = (asset) => {
    if (!asset) return { spriteSheet: '', stateWidth: 19, stateHeight: 17 };
    const count = detectFrameCount(asset.width, asset.height);
    const frames = frameDataUrls(asset.canvas, count, 'horizontal');
    return {
      normal: frames[0],
      hover: frames[1] || frames[0],
      pressed: frames[2] || frames[1] || frames[0],
      spriteSheet: asset.dataUrl,
      stateWidth: Math.round(asset.width / count),
      stateHeight: asset.height,
    };
  };

  return {
    type: 'sprite',
    close: sprite(closeAsset),
    minimize: sprite(minAsset),
    maximize: sprite(maxAsset),
    restore: sprite(restoreAsset || maxAsset),
  };
}

/** Taskbar / tray / start button / task buttons from the .xp config (if present). */
function buildTaskbar(xpConfig, mainConfig, assets, colours) {
  // Skins without .xp taskbar sections degrade to the Luna taskbar; consumers
  // (Footer) dereference nested state objects like taskButton.cover.
  const out = {
    taskbar: LUNA_THEME.taskbar,
    tray: LUNA_THEME.tray,
    taskButton: LUNA_THEME.taskButton,
    startButton: { type: 'default' },
  };

  // Read the 9-slice metadata skins attach to taskbar parts: fixed raster
  // caps (LeftWidth/TopHeight/...), tiled-or-stretched middles (Tile), and
  // the content box the part was designed to hold (ContentLeft/...).
  const sliceOf = (sec) => ({
    top: toInt(val(sec, 'TopHeight'), 0),
    right: toInt(val(sec, 'RightWidth'), 0),
    bottom: toInt(val(sec, 'BottomHeight'), 0),
    left: toInt(val(sec, 'LeftWidth'), 0),
  });
  const contentOf = (sec) => ({
    top: toInt(val(sec, 'ContentTop'), 0),
    right: toInt(val(sec, 'ContentRight'), 0),
    bottom: toInt(val(sec, 'ContentBottom'), 0),
    left: toInt(val(sec, 'ContentLeft'), 0),
  });

  const taskbarSec = section(xpConfig, 'Taskbar.Horz');
  const taskbarImg = resolveAsset(assets, val(taskbarSec, 'Image'));
  if (taskbarImg) {
    out.taskbar = {
      background: `url("${taskbarImg.dataUrl}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: 'auto 100%',
    };
  }

  const traySec = section(xpConfig, 'Taskbar.TrayHorz');
  const trayImg = resolveAsset(assets, val(traySec, 'Image'));
  if (trayImg) {
    const content = contentOf(traySec);
    const trayLum = regionLuminance(
      trayImg.canvas,
      content.left, 0,
      Math.max(1, trayImg.width - content.left - content.right), trayImg.height,
    );
    out.tray = {
      type: 'frames',
      image: trayImg.dataUrl,
      width: trayImg.width,
      height: trayImg.height,
      slice: sliceOf(traySec),
      tile: val(traySec, 'Tile') !== '0',
      content,
      background: `url("${trayImg.dataUrl}")`,
      backgroundSize: 'auto 100%',
      backgroundRepeat: 'repeat-x',
      borderLeft: 'none',
      boxShadow: 'none',
      textColor: textColorFor(trayLum, iniColor(val(colours, 'TitleText')) || '#000'),
      padding: '0 10px 0 21px',
    };
  }

  // Start button: .xp Taskbar.StartButton, else classic [StartButton] in the .uis.
  const startImg = resolveAsset(assets, val(section(xpConfig, 'Taskbar.StartButton'), 'Image'))
    || resolveAsset(assets, val(section(mainConfig, 'StartButton'), 'Image', 'Bitmap'));
  if (startImg) {
    const stateCount = 5; // XP start-button template: normal/hover/pressed/focus/focusPressed
    out.startButton = {
      type: 'sprite',
      spriteSheet: startImg.dataUrl,
      stateWidth: Math.round(startImg.width / stateCount),
      stateHeight: startImg.height,
      states: { normal: 0, hover: 1, pressed: 2, focusNormal: 3, focusPressed: 4 },
    };
  }

  const taskSec = section(xpConfig, 'Taskbar.ButtonHorz');
  const taskImg = resolveAsset(assets, val(taskSec, 'Image'));
  if (taskImg) {
    // Fixed WindowBlinds template: 6 cells side by side —
    // [normal, hover, pressed, focused, focused-hover, focused-pressed].
    const states = taskImg.width % 6 === 0 ? 6 : detectFrameCount(taskImg.width, taskImg.height);
    const w = Math.round(taskImg.width / states);
    const frames = frameDataUrls(taskImg.canvas, states, 'horizontal');
    const at = (i) => frames[Math.min(i, frames.length - 1)];
    const lum = (i) => regionLuminance(taskImg.canvas, Math.min(i, states - 1) * w, 0, w, taskImg.height);
    // Frame 0 can be fully transparent (flat-until-hover designs); fall back
    // to the taskbar art for a readable text colour.
    const taskbarLum = taskbarImg
      ? regionLuminance(taskbarImg.canvas, 0, 0, taskbarImg.width, taskbarImg.height)
      : null;
    out.taskButton = {
      type: 'frames',
      frameWidth: w,
      frameHeight: taskImg.height,
      slice: sliceOf(taskSec),
      tile: val(taskSec, 'Tile') === '1',
      states: {
        cover: at(0),
        coverHover: at(1),
        coverActive: at(2),
        focus: at(3),
        focusHover: at(4),
        focusActive: at(5),
      },
      textColor: textColorFor(lum(0) ?? taskbarLum),
      focusTextColor: textColorFor(lum(3) ?? taskbarLum),
      showTopHighlight: false,
    };
  }

  return out;
}

/** Start menu from StartPanel.* sections. Needs top/left/right/bottom to render. */
function buildStartMenu(xpConfig, assets) {
  const img = (sec, ...keys) => {
    const a = resolveAsset(assets, val(section(xpConfig, sec), 'Image', ...keys));
    return a ? a.dataUrl : null;
  };

  const top = img('StartPanel.UserPane');
  const left = img('StartPanel.ProgList');
  const right = img('StartPanel.PlacesList');
  const bottom = img('StartPanel.BottomBar');

  if (!top || !left || !right || !bottom) return { type: 'css' };

  const menu = {
    type: 'image',
    top: { image: top },
    left: { image: left },
    right: { image: right },
    bottom: { image: bottom },
  };
  const userPic = img('StartPanel.UserPicture');
  const menuItem = img('StartPanel.MenuItem');
  const morePrograms = img('StartPanel.MorePrograms');
  const moreArrow = img('StartPanel.MoreProgramsArrow');
  if (userPic) menu.userPic = { image: userPic };
  if (menuItem) menu.menuItem = { image: menuItem };
  if (morePrograms) menu.morePrograms = { image: morePrograms };
  if (moreArrow) menu.moreArrow = { image: moreArrow };
  return menu;
}

function buildTheme({ mainConfig, frameConfig, xpConfig, assets, skinName }) {
  const colours = section(mainConfig, 'Colours', 'Colors');
  const fonts = section(mainConfig, 'Fonts');
  const textCfg = section(mainConfig, 'Text');
  const personality = section(mainConfig, 'Personality');

  const { titleBar, vertFrame } = buildTitleBar(mainConfig, frameConfig, assets, colours, fonts, textCfg);
  const tb = buildTaskbar(xpConfig, mainConfig, assets, colours);

  // Window frame: UIS1 vertical side strip, else solid border from colours.
  let windowFrame = { type: 'css' };
  if (titleBar.type === 'image') {
    const vertAsset = resolveAsset(assets, vertFrame);
    windowFrame = {
      type: 'image',
      bodyBackground: iniColor(val(colours, 'Menu')) || '#b4b4b4',
      borderColor: iniColor(val(colours, 'WindowFrame', 'ActiveBorder')) || '#646464',
    };
    if (vertAsset) {
      windowFrame.sideImage = vertAsset.dataUrl;
      windowFrame.sideWidth = Math.max(2, Math.round(vertAsset.width / 2));
    }
  }

  const theme = {
    id: slugId(skinName),
    name: skinName || 'Custom WindowBlinds Theme',
    source: 'installed',
    taskbar: tb.taskbar,
    tray: tb.tray,
    taskButton: tb.taskButton,
    startButton: tb.startButton,
    titleBar,
    windowControls: buildWindowControls(mainConfig, assets),
    windowFrame,
    startMenu: buildStartMenu(xpConfig, assets),
    colors: buildColors(colours),
  };

  const wallpaper = resolveAsset(assets, val(personality, 'Wallpaper'));
  if (wallpaper) theme.wallpaper = wallpaper.dataUrl;

  return theme;
}

/* ------------------------------------------------------------------ *
 * Public entry
 * ------------------------------------------------------------------ */

function toZipData(fileData) {
  if (typeof fileData === 'string' && fileData.includes(',')) {
    const base64 = fileData.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  return fileData;
}

/**
 * Parse a .wba file into a theme object.
 * @param {ArrayBuffer|Blob|string} fileData base64 data URL, Blob, or ArrayBuffer
 * @param {Object} [opts]
 * @param {string} [opts.archiveName] original filename, used to pick the main .uis
 * @returns {Promise<Object>} the theme object
 */
export async function parseWbaFile(fileData, opts = {}) {
  const zip = await JSZip.loadAsync(toZipData(fileData));
  const files = listFiles(zip);

  const archiveBase = (opts.archiveName || '')
    .replace(/\\/g, '/').split('/').pop().replace(/\.wba$/i, '').toLowerCase() || null;

  // Pick the main .uis (skins can ship several substyles).
  const uisFiles = filesWithExt(files, 'uis');
  let mainConfig = {};
  let bestScore = -Infinity;
  for (const name of uisFiles) {
    const cfg = await readIni(zip, name);
    const s = scoreMainConfig(cfg, name, archiveBase);
    if (s > bestScore) { bestScore = s; mainConfig = cfg; }
  }

  // Frame config: the .uis itself if it has [Borders]HorzFrame, else a .sss substyle.
  let frameConfig = null;
  if (val(section(mainConfig, 'Borders'), 'HorzFrame')) {
    frameConfig = mainConfig;
  } else {
    for (const name of filesWithExt(files, 'sss')) {
      const cfg = await readIni(zip, name);
      if (val(section(cfg, 'Borders'), 'HorzFrame')) { frameConfig = cfg; break; }
    }
  }

  // XP taskbar / start-panel config (optional).
  const xpName = filesWithExt(files, 'xp')[0];
  const xpConfig = xpName ? await readIni(zip, xpName) : null;

  // Skin name from [TitlebarSkin] of any config.
  const skinName = val(section(mainConfig, 'TitlebarSkin'), 'SkinName')
    || (frameConfig && val(section(frameConfig, 'TitlebarSkin'), 'SkinName'))
    || archiveBase
    || 'Custom Theme';

  const refs = collectImageRefs(mainConfig, frameConfig, xpConfig);
  const assets = await convertReferenced(zip, refs);

  return buildTheme({ mainConfig, frameConfig, xpConfig, assets, skinName });
}
