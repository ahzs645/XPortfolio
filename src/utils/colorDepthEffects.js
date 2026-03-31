export const FOUR_LEVEL_TABLE = '0 0.3333 0.6667 1';
export const EIGHT_LEVEL_TABLE = '0 0.1429 0.2857 0.4286 0.5714 0.7143 0.8571 1';
export const THIRTY_TWO_LEVEL_TABLE = Array.from(
  { length: 32 },
  (_, index) => (index / 31).toFixed(4)
).join(' ');
export const SIXTY_FOUR_LEVEL_TABLE = Array.from(
  { length: 64 },
  (_, index) => (index / 63).toFixed(4)
).join(' ');

export const DITHER_DEPTHS = new Set(['2col', '8+col', '16+col', '256+col']);

export function getColorDepthFilter(depth) {
  switch (depth) {
    case '2col':
      return 'url(#xp-color-2) contrast(1.15)';
    case '8col':
    case '8+col':
      return 'url(#xp-color-8) saturate(0.92) contrast(1.18)';
    case '16col':
    case '16+col':
      return 'url(#xp-color-16) saturate(0.95) contrast(1.08)';
    case '256col':
    case '256+col':
      return 'url(#xp-color-256)';
    case '16bit':
      return 'url(#xp-color-16bit)';
    default:
      return '';
  }
}

export function getColorDitherOpacity(depth) {
  switch (depth) {
    case '2col':
      return 0.18;
    case '8+col':
      return 0.14;
    case '16+col':
      return 0.1;
    case '256+col':
      return 0.06;
    default:
      return 0;
  }
}
