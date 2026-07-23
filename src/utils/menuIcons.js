import { MENU_ICON_URLS } from '../generated/menuIconMap';
import { withBaseUrl } from './baseUrl';

export function withMenuIconUrl(path) {
  return MENU_ICON_URLS[path] || withBaseUrl(path);
}
