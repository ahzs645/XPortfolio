/**
 * Theme registry.
 *
 * Luna (the native XP look) is the only built-in theme. WindowBlinds (.wba)
 * skins are user-provided: open one via the Theme Manager's "Open theme..."
 * action (or by opening a .wba file in the shell) and it's parsed at runtime
 * by wbaInstaller.js and added to the list — nothing is bundled in the repo.
 *
 * To ship a skin as a built-in instead, drop its .wba in public/themes/<id>/
 * and add a manifest entry below; ThemeContext fetches + parses each at load.
 */
import { LUNA_THEME } from './luna';

/**
 * Bundled WindowBlinds skins shipped as built-in themes (none by default).
 * Entry shape: { id, name, url, wallpaperOverride? }. `id` is stable (used by
 * DisplayProperties / saved settings) and overrides the parser-derived id;
 * `wallpaperOverride` points at a static wallpaper file instead of a parsed
 * data URL.
 */
export const BUNDLED_WBA_THEMES = [];

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
