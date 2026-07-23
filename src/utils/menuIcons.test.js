import { describe, expect, it } from 'vitest';
import { withMenuIconUrl } from './menuIcons';

describe('withMenuIconUrl', () => {
  it('uses the generated 32x32 asset for a known Start-menu icon', () => {
    expect(withMenuIconUrl('/icons/games/wow.webp')).toMatch(/menu-icon-[a-f0-9]+\.png/);
  });

  it('falls back to the original URL for ungenerated and absolute icons', () => {
    expect(withMenuIconUrl('/icons/custom.png')).toBe('/icons/custom.png');
    expect(withMenuIconUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });
});
