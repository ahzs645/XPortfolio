/**
 * WindowBlinds .wba theme file installer.
 * Parses a WBA archive (ZIP format), extracts INI config and BMP sprites,
 * converts BMPs to transparent PNGs, and produces a theme object.
 */
import JSZip from 'jszip';

/**
 * Convert a BMP image buffer to a transparent PNG data URL.
 * Replaces magenta (#FF00FF) pixels with full transparency.
 */
async function bmpToTransparentPng(arrayBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: 'image/bmp' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        // Magenta: R >= 250, G <= 5, B >= 250
        if (data[i] >= 250 && data[i + 1] <= 5 && data[i + 2] >= 250) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load BMP: ${fileName}`));
    };
    img.src = url;
  });
}

/**
 * Simple INI parser for WindowBlinds .UIS / .sss / .xp files.
 */
function parseIni(text) {
  const sections = {};
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';')) continue;

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      current = sectionMatch[1];
      sections[current] = {};
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

/**
 * Extract a color value from INI "R G B" format.
 */
function iniColor(str) {
  if (!str) return null;
  const parts = str.split(/\s+/).map(Number);
  if (parts.length >= 3) {
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }
  return null;
}

/**
 * Convert all BMP files in a ZIP to transparent PNGs.
 * Returns a map of filename -> { dataUrl, width, height }.
 */
async function convertAllBmps(zip) {
  const assets = {};
  const bmpFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.bmp'));

  await Promise.all(bmpFiles.map(async (name) => {
    try {
      const buf = await zip.files[name].async('arraybuffer');
      const result = await bmpToTransparentPng(buf, name);
      // Store with cleaned-up key (lowercase, no path prefix)
      const key = name.replace(/\\/g, '/').split('/').pop().toLowerCase();
      assets[key] = result;
    } catch (e) {
      console.warn(`WBA: Failed to convert ${name}:`, e.message);
    }
  }));

  return assets;
}

/**
 * Find and parse the main INI config from the WBA.
 * Tries .UIS first, then .sss files.
 */
async function findMainConfig(zip) {
  const files = Object.keys(zip.files);

  // Look for .UIS file (main skin config)
  const uisFile = files.find(f => f.toLowerCase().endsWith('.uis'));
  if (uisFile) {
    const text = await zip.files[uisFile].async('string');
    return parseIni(text);
  }

  // Fallback to .sss
  const sssFile = files.find(f => f.toLowerCase().endsWith('.sss'));
  if (sssFile) {
    const text = await zip.files[sssFile].async('string');
    return parseIni(text);
  }

  return null;
}

/**
 * Find and parse the XP taskbar/start menu config.
 */
async function findXpConfig(zip) {
  const files = Object.keys(zip.files);
  const xpFile = files.find(f => f.toLowerCase().endsWith('.xp'));
  if (xpFile) {
    const text = await zip.files[xpFile].async('string');
    return parseIni(text);
  }
  return null;
}

/**
 * Helper to resolve an asset reference from the INI (e.g. "xbox\\xbox_body_top.bmp")
 * to its converted PNG data URL.
 */
function resolveAsset(assets, iniPath) {
  if (!iniPath) return null;
  const key = iniPath.replace(/\\/g, '/').split('/').pop().toLowerCase();
  return assets[key] || null;
}

/**
 * Build a theme object from parsed INI config and converted assets.
 */
function buildTheme(mainConfig, xpConfig, assets, skinName) {
  const personality = mainConfig?.Personality || {};
  const colours = mainConfig?.Colours || {};
  const text = mainConfig?.Text || {};
  const fonts = mainConfig?.Fonts || {};

  // Generate a unique ID from the skin name
  const id = (skinName || 'custom-theme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const theme = {
    id,
    name: skinName || 'Custom WindowBlinds Theme',
    source: 'installed',
    taskbar: {},
    tray: {},
    taskButton: {},
    startButton: { type: 'default' },
    titleBar: { type: 'css' },
    windowControls: { type: 'css' },
    windowFrame: { type: 'css' },
    startMenu: { type: 'css' },
    colors: {},
  };

  // === Taskbar ===
  if (xpConfig) {
    const tbHorz = xpConfig['Taskbar.Horz'] || {};
    const tbImg = tbHorz.Image;
    const tbAsset = resolveAsset(assets, tbImg);
    if (tbAsset) {
      theme.taskbar = {
        background: `url(${tbAsset.dataUrl})`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto 100%',
      };
    }

    // Tray
    const trayHorz = xpConfig['Taskbar.TrayHorz'] || {};
    const trayImg = trayHorz.Image;
    const trayAsset = resolveAsset(assets, trayImg);
    if (trayAsset) {
      theme.tray = {
        background: `url(${trayAsset.dataUrl})`,
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'repeat-x',
        borderLeft: 'none',
        boxShadow: 'none',
        textColor: iniColor(colours.TitleText) || '#000',
        padding: '0 10px 0 21px',
      };
    }

    // Start button
    const startBtn = xpConfig['Taskbar.StartButton'] || {};
    const startAsset = resolveAsset(assets, startBtn.Image);
    if (startAsset) {
      const stateCount = 5; // normal, hover, pressed, focusNormal, focusPressed
      const stateWidth = Math.round(startAsset.width / stateCount);
      theme.startButton = {
        type: 'sprite',
        spriteSheet: startAsset.dataUrl,
        stateWidth,
        stateHeight: startAsset.height,
        states: { normal: 0, hover: 1, pressed: 2, focusNormal: 3, focusPressed: 4 },
      };
    }

    // Task buttons
    const taskBtnHorz = xpConfig['Taskbar.ButtonHorz'] || {};
    const taskAsset = resolveAsset(assets, taskBtnHorz.Image);
    if (taskAsset) {
      const stateCount = 6;
      const stateWidth = Math.round(taskAsset.width / stateCount);
      theme.taskButton = {
        type: 'sprite',
        textColor: '#ddd',
        focusTextColor: '#fff',
        showTopHighlight: false,
        cover: {
          background: `url(${taskAsset.dataUrl}) 0px 0px / auto 100% no-repeat`,
          boxShadow: 'none',
        },
        coverHover: {
          background: `url(${taskAsset.dataUrl}) -${stateWidth}px 0px / auto 100% no-repeat`,
        },
        coverActive: {
          background: `url(${taskAsset.dataUrl}) -${stateWidth * 2}px 0px / auto 100% no-repeat`,
        },
        focus: {
          background: `url(${taskAsset.dataUrl}) -${stateWidth * 3}px 0px / auto 100% no-repeat`,
          boxShadow: 'none',
        },
        focusHover: {
          background: `url(${taskAsset.dataUrl}) -${stateWidth * 4}px 0px / auto 100% no-repeat`,
        },
        focusActive: {
          background: `url(${taskAsset.dataUrl}) -${stateWidth * 5}px 0px / auto 100% no-repeat`,
        },
      };
    }
  }

  // === Title bar ===
  // Check for UIS1 (framed) style first, then classic Personality style
  const borders = mainConfig?.Borders || {};
  const horzFrame = borders.HorzFrame;
  const frameAsset = resolveAsset(assets, horzFrame);

  if (frameAsset) {
    const frameCount = parseInt(borders.FrameCount || '2', 10);
    const frameWidth = Math.round(frameAsset.width / frameCount);
    theme.titleBar = {
      type: 'image',
      frameImage: frameAsset.dataUrl,
      frameWidth,
      frameHeight: frameAsset.height,
      frameCount,
      height: parseInt(mainConfig?.Metrics?.CaptionHeight || '28', 10),
      textColor: iniColor(colours.ActiveTitle) || iniColor(`${personality.ActiveTextR || 220} ${personality.ActiveTextG || 220} ${personality.ActiveTextB || 220}`) || '#dcdcdc',
      inactiveTextColor: iniColor(colours.InactiveTitle) || iniColor(`${personality.InactiveTextR || 180} ${personality.InactiveTextG || 180} ${personality.InactiveTextB || 180}`) || '#b4b4b4',
      textShadow: text.Use3DText === '1' ? `${text.ShadowOffset || 1}px ${text.ShadowOffset || 1}px 0 rgb(${text.ShadowTextR || 0}, ${text.ShadowTextG || 0}, ${text.ShadowTextB || 0})` : 'none',
      fontFamily: fonts.Fontname || 'Tahoma, sans-serif',
      fontSize: `${fonts.FontHeight || 13}px`,
      fontWeight: 'normal',
    };
  } else {
    // Classic personality style with Top/Left/Right/Bottom BMPs
    const topAsset = resolveAsset(assets, personality.Top);
    if (topAsset) {
      theme.titleBar = {
        type: 'image',
        frameImage: topAsset.dataUrl,
        frameWidth: topAsset.width,
        frameHeight: topAsset.height,
        frameCount: 1,
        height: parseInt(personality.TopTopHeight || '28', 10),
        textColor: `rgb(${personality.ActiveTextR || 220}, ${personality.ActiveTextG || 220}, ${personality.ActiveTextB || 220})`,
        inactiveTextColor: `rgb(${personality.InactiveTextR || 180}, ${personality.InactiveTextG || 180}, ${personality.InactiveTextB || 180})`,
        textShadow: 'none',
        fontFamily: fonts.Fontname || 'Tahoma, sans-serif',
        fontSize: `${fonts.FontHeight || 13}px`,
        fontWeight: 'normal',
      };
    }
  }

  // Window frame sides
  const vertFrame = borders.VertFrame;
  const vertAsset = resolveAsset(assets, vertFrame);
  if (vertAsset) {
    theme.windowFrame = {
      type: 'image',
      sideImage: vertAsset.dataUrl,
      sideWidth: Math.round(vertAsset.width / 2),
      bodyBackground: iniColor(colours.Menu) || '#b4b4b4',
      borderColor: iniColor(colours.WindowFrame) || '#646464',
    };
  }

  // === Window controls ===
  // Look for button images (UIS1 or standard)
  const buttons = [];
  for (let i = 0; i < 8; i++) {
    const btn = mainConfig?.[`Button${i}`];
    if (btn) buttons.push(btn);
  }

  const closeBtn = buttons.find(b => b.Action === '0');
  const maxBtn = buttons.find(b => b.Action === '22' && b.Visibility === '3');
  const restoreBtn = buttons.find(b => b.Action === '22' && b.Visibility === '4');
  const minBtn = buttons.find(b => b.Action === '23');

  if (closeBtn || minBtn || maxBtn) {
    const closeAsset = resolveAsset(assets, closeBtn?.ButtonImage);
    const minAsset = resolveAsset(assets, minBtn?.ButtonImage);
    const maxAsset = resolveAsset(assets, maxBtn?.ButtonImage);
    const restoreAsset = resolveAsset(assets, restoreBtn?.ButtonImage);

    if (closeAsset || minAsset || maxAsset) {
      const makeSprite = (asset) => {
        if (!asset) return { spriteSheet: '', stateWidth: 19, stateHeight: 17 };
        const stateCount = 3; // normal, hover, pressed
        return {
          spriteSheet: asset.dataUrl,
          stateWidth: Math.round(asset.width / stateCount),
          stateHeight: asset.height,
        };
      };

      theme.windowControls = {
        type: 'sprite',
        close: makeSprite(closeAsset),
        minimize: makeSprite(minAsset),
        maximize: makeSprite(maxAsset),
        restore: makeSprite(restoreAsset || maxAsset),
      };
    }
  }

  // === Colors ===
  theme.colors = {
    highlight: iniColor(colours.Hilight) || '#316ac5',
    highlightText: iniColor(colours.HilightText) || '#fff',
    activeTitle: iniColor(colours.ActiveTitle) || 'rgb(0, 84, 227)',
    inactiveTitle: iniColor(colours.InactiveTitle) || 'rgb(118, 149, 212)',
    surface: iniColor(colours.Menu) || '#ece9d8',
    windowText: iniColor(colours.WindowText) || '#000',
    buttonFace: iniColor(colours.ButtonFace) || '#ece9d8',
    menuBackground: iniColor(colours.Menu) || '#fff',
    menuText: iniColor(colours.MenuText) || '#000',
  };

  // === Wallpaper ===
  const wallpaperAsset = resolveAsset(assets, personality.Wallpaper);
  if (wallpaperAsset) {
    theme.wallpaper = wallpaperAsset.dataUrl;
  }

  return theme;
}

/**
 * Parse and install a .wba theme file.
 * @param {ArrayBuffer|Blob|string} fileData - The WBA file data (base64 data URL, Blob, or ArrayBuffer)
 * @returns {Promise<Object>} The installed theme object
 */
export async function parseWbaFile(fileData) {
  let zipData = fileData;

  // Handle base64 data URL
  if (typeof fileData === 'string' && fileData.includes(',')) {
    const base64 = fileData.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    zipData = bytes.buffer;
  }

  const zip = await JSZip.loadAsync(zipData);

  // Find skin name from .ssd file or .UIS header
  let skinName = 'Custom Theme';
  const mainConfig = await findMainConfig(zip);
  if (mainConfig?.TitlebarSkin?.SkinName) {
    skinName = mainConfig.TitlebarSkin.SkinName;
  }

  const xpConfig = await findXpConfig(zip);

  // Convert all BMPs to PNGs
  const assets = await convertAllBmps(zip);

  // Build the theme
  const theme = buildTheme(mainConfig, xpConfig, assets, skinName);

  return theme;
}
