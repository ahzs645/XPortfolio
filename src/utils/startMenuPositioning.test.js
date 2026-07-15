// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { positionStartMenuFlyout } from '../WinXP/Footer/startMenuPositioning';

function rect({ top, right, bottom }) {
  return {
    x: 0,
    y: top,
    top,
    right,
    bottom,
    left: 0,
    width: right,
    height: bottom - top,
  };
}

describe('positionStartMenuFlyout', () => {
  it('keeps a flyout above a reserved taskbar boundary', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1334 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1324 });

    const shell = document.createElement('div');
    shell.className = 'xp-taskbar-shell';
    const anchor = document.createElement('div');
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    taskbar.getBoundingClientRect = () => rect({ top: 1296, right: 1334, bottom: 1324 });
    shell.append(anchor, taskbar);

    const submenu = document.createElement('div');
    submenu.getBoundingClientRect = () => rect({ top: 954, right: 476, bottom: 1316 });

    positionStartMenuFlyout(submenu, anchor);

    expect(submenu.style.transform).toBe('translateY(-28px)');
  });

  it('uses the viewport bottom when no lower boundary is supplied', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 720 });

    const submenu = document.createElement('div');
    submenu.getBoundingClientRect = () => rect({ top: 338, right: 476, bottom: 700 });

    positionStartMenuFlyout(submenu);

    expect(submenu.style.transform).toBe('');
  });
});
