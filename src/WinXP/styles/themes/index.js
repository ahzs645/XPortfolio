/**
 * Theme registry - built-in themes and theme utilities.
 * Only Luna is built-in. WindowBlinds themes (.wba) are installed at runtime.
 */
import { LUNA_THEME } from './luna';

export const BUILTIN_THEMES = [
  LUNA_THEME,
];

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
