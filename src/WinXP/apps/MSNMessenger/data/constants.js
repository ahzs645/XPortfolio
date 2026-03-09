import { withBaseUrl } from '../../../../utils/baseUrl';

export const ASSET_PATH = withBaseUrl('/apps/msn-messenger/');
export const AVATAR_PATH = `${ASSET_PATH}avatars/`;
export const SOUND_PATH = `${ASSET_PATH}sounds/`;
export const SIGNIN_PATH = `${ASSET_PATH}signin.gif`;
export const PASSPORT_ICON_PATH = `${ASSET_PATH}ui/passport.png`;
export const CONTACTS_STRIP_PATH = `${ASSET_PATH}ui/contacts.jpg`;
export const AD_BANNER_PATH = `${ASSET_PATH}ui/ad1.gif`;
export const MSN_LOGO_PATH = `${ASSET_PATH}ui/msn-logo.png`;
export const CONTACTS_WINDOW_HEIGHT = 540;

export const SAFE_AVATARS = [
  'beach', 'chess', 'dog', 'duck', 'flower',
  'horses', 'moto', 'msn', 'palm', 'rocket', 'skate', 'soccer'
];

export const WINKS = {
  heart: 'heart.gif', laugh: 'laugh.gif', break: 'break.gif', lips: 'lips.gif',
  knock: 'knock.gif', peek: 'peek.gif', smile: 'smile.gif', water: 'water.gif'
};

export const STATUS_LABELS = {
  online: 'Online',
  busy: 'Busy',
  'be-right-back': 'Be Right Back',
  away: 'Away',
  'on-the-phone': 'On the Phone',
  'out-to-lunch': 'Out to Lunch',
  'appear-offline': 'Appear Offline'
};

export const STATUS_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'busy', label: 'Busy' },
  { value: 'be-right-back', label: 'Be Right Back' },
  { value: 'away', label: 'Away' },
  { value: 'on-the-phone', label: 'On the Phone' },
  { value: 'out-to-lunch', label: 'Out to Lunch' },
  { value: 'appear-offline', label: 'Appear Offline' }
];

export function getAvatarPath(name) {
  if (!name) return AVATAR_PATH + 'chess.png';
  if (name.includes(':') || name.includes('/')) return withBaseUrl(name);
  return SAFE_AVATARS.includes(name) ? AVATAR_PATH + name + '.png' : AVATAR_PATH + 'chess.png';
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}
