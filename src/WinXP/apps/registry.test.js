// @vitest-environment jsdom
//
// Sanity guard for the manifest-driven app registry: catches a broken or
// missing manifest, a bad glob path, or a malformed window descriptor.
import { describe, it, expect } from 'vitest';

import { appSettings, desktopIconCatalog, defaultIconState, generateIconState } from './index.js';

describe('app registry', () => {
  it('assembles a populated registry from manifests', () => {
    expect(Object.keys(appSettings).length).toBeGreaterThan(70);
    expect(Object.keys(desktopIconCatalog).length).toBeGreaterThan(40);
    expect(defaultIconState.length).toBeGreaterThan(0);
  });

  it('registers known apps', () => {
    for (const key of ['About Me', 'Calculator', 'Minesweeper', 'Windows XP Tour']) {
      expect(appSettings[key], `missing app: ${key}`).toBeTruthy();
    }
  });

  it('gives every app a component and a header title', () => {
    for (const [key, setting] of Object.entries(appSettings)) {
      expect(setting.component, `component for ${key}`).toBeTruthy();
      expect(setting.header?.title, `header.title for ${key}`).toBeTruthy();
    }
  });

  it('resolves catalog ids to launch targets', () => {
    const [about] = generateIconState(['about']);
    expect(about.target).toBe('About Me');
  });
});
