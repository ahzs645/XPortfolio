// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './ContextMenu';

afterEach(() => {
  cleanup();
});

describe('ContextMenu keyboard navigation', () => {
  it('opens a submenu with ArrowRight and activates a child with Enter', () => {
    const onFolder = vi.fn();
    render(
      <ContextMenu
        position={{ x: 10, y: 10 }}
        items={[
          {
            label: 'New',
            submenu: [
              { label: 'Folder', onClick: onFolder },
              { label: 'Text Document', onClick: vi.fn() },
            ],
          },
        ]}
        onClose={vi.fn()}
      />
    );

    const menu = screen.getAllByRole('menu')[0];
    fireEvent.keyDown(menu.parentElement, { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: /Folder/ })).toBeTruthy();

    fireEvent.keyDown(menu.parentElement, { key: 'Enter' });
    expect(onFolder).toHaveBeenCalledTimes(1);
  });

  it('moves between root items with ArrowDown and closes with Escape', () => {
    const onClose = vi.fn();
    const onSecond = vi.fn();
    render(
      <ContextMenu
        position={{ x: 10, y: 10 }}
        items={[
          { label: 'First', onClick: vi.fn() },
          { label: 'Second', onClick: onSecond },
        ]}
        onClose={onClose}
      />
    );

    const menuRoot = screen.getAllByRole('menu')[0].parentElement;
    fireEvent.keyDown(menuRoot, { key: 'ArrowDown' });
    fireEvent.keyDown(menuRoot, { key: 'Enter' });
    expect(onSecond).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(menuRoot, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
