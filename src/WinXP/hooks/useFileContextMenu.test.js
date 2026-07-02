// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBackgroundContextMenu } from './useFileContextMenu';

describe('useBackgroundContextMenu', () => {
  it('does not add a trailing divider after the New > Shortcut item', () => {
    const { result } = renderHook(() => useBackgroundContextMenu({
      onNewFolder: vi.fn(),
      onNewBriefcase: vi.fn(),
      onNewTextDoc: vi.fn(),
      onNewShortcut: vi.fn(),
    }));

    const newMenu = result.current.find((item) => item.label === 'New');
    const shortcutItem = newMenu.submenu.find((item) => item.label === 'Shortcut');

    expect(shortcutItem).toMatchObject({
      iconAsOverlay: true,
      label: 'Shortcut',
    });
    expect(newMenu.submenu.at(-1)).toBe(shortcutItem);
  });
});
