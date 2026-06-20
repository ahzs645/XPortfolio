// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { shouldOpenFullscreenOnMobile } from './mobileConfig';

describe('mobile fullscreen behavior (co-located in manifests)', () => {
  it('keeps windowed apps windowed on mobile', () => {
    for (const key of ['Calculator', 'Minesweeper', 'Solitaire', 'Run', 'Winamp', 'Properties']) {
      expect(shouldOpenFullscreenOnMobile(key), key).toBe(false);
    }
  });

  it('resolves overrides by appSettings key, fixing the old dead one', () => {
    // Was 'Media Player Classic' in the name-keyed list — never matched the real
    // appKey, so the override silently did nothing. Now keyed to the app itself.
    expect(shouldOpenFullscreenOnMobile('Windows Media Player Classic')).toBe(false);
    expect(shouldOpenFullscreenOnMobile('Error Dialog')).toBe(false);
  });

  it('still resolves by window title (backward-compatible call path)', () => {
    // Error Dialog's window title is 'Error'.
    expect(shouldOpenFullscreenOnMobile('Error')).toBe(false);
  });

  it('defaults unlisted apps to fullscreen on mobile', () => {
    for (const key of ['About Me', 'Notepad', 'Internet Explorer']) {
      expect(shouldOpenFullscreenOnMobile(key), key).toBe(true);
    }
  });
});
