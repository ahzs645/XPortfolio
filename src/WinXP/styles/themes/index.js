/**
 * Theme registry.
 *
 * Luna (the native XP look) is the only hand-written theme. Every other
 * built-in is a real WindowBlinds .wba parsed at runtime by wbaInstaller.js —
 * the same path used when a user opens a .wba themselves. Add a skin by
 * dropping its .wba in public/themes/<id>/ and adding a manifest entry here.
 */
import { LUNA_THEME } from './luna';

/**
 * Bundled WindowBlinds skins shipped as built-in themes.
 * `id` is stable (used by DisplayProperties / saved settings); the parser's
 * derived id is overridden with this. `wallpaperOverride` lets a bundled theme
 * point at a static wallpaper file instead of a multi-MB parsed data URL.
 */
export const BUNDLED_WBA_THEMES = [
  {
    id: 'xbox',
    name: 'Official Xbox WindowBlinds',
    url: '/themes/xbox/xbox.wba',
    wallpaperOverride: '/themes/xbox/xbox_wallpaper.webp',
  },
  { id: 'santa', name: 'SantaXP', url: '/themes/santa/santa.wba' },
  { id: 'liquidhf', name: 'Liquid HF', url: '/themes/liquidhf/liquidhf.wba' },
  { id: 'lunarbase', name: 'Lunar Base', url: '/themes/lunarbase/lunar_base.wba' },
  { id: 'solar', name: 'Solar', url: '/themes/solar/solarwb2.wba' },
  { id: 'stronghold', name: 'Stronghold XP', url: '/themes/stronghold/strongholdxp.wba' },
];

/** Synchronously-available built-in themes (Luna only; .wba themes load async). */
export const BUILTIN_THEMES = [LUNA_THEME];

/**
 * Creates a theme map from an array of theme objects.
 */
export function createThemeMap(themes) {
  const map = {};
  for (const theme of themes) {
    map[theme.id] = theme;
  }
  return map;
}

export const BUILTIN_THEME_MAP = createThemeMap(BUILTIN_THEMES);

export { LUNA_THEME };
