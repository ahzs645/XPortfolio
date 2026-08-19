// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefetchTf2Gameplay, tryAutoStartTf2 } from './tf2Bridge';

const BSP_SHA = 'b'.repeat(64);

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('prefetchTf2Gameplay', () => {
  it('fetches the configured BSP through the immutable object route', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          target: 'jump_beef',
          assetOrigin: 'https://xp.example.test',
          bsp: { sha256: BSP_SHA },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      });

    await expect(prefetchTf2Gameplay('/tf2/playsrc-config.json', { fetcher }))
      .resolves.toBe('jump_beef');
    expect(fetcher).toHaveBeenNthCalledWith(2,
      `https://xp.example.test/objects/sha256/${BSP_SHA}`,
      expect.objectContaining({ cache: 'force-cache' }));
  });

  it('rejects malformed object descriptors before prefetching', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        target: 'jump_beef',
        assetOrigin: 'https://xp.example.test',
        bsp: { sha256: 'not-a-hash' },
      }),
    });

    await expect(prefetchTf2Gameplay('/tf2/playsrc-config.json', { fetcher }))
      .rejects.toThrow('Invalid playsrc object descriptor');
  });
});

describe('tryAutoStartTf2', () => {
  it('waits until startup has completed', () => {
    document.body.innerHTML = '<main class="tf2-application" data-gameui="main-menu" data-startup-state="Playing"></main>';
    const dispatch = vi.spyOn(window, 'dispatchEvent');

    expect(tryAutoStartTf2(document, window)).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('opens the console and submits the configured map', () => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <main class="tf2-application" data-gameui="main-menu" data-startup-state="Completed"></main>
    `;
    const onKeyDown = (event) => {
      if (event.code !== 'Backquote') return;
      document.body.insertAdjacentHTML('beforeend', `
        <input aria-label="Console command">
        <button type="button">Submit</button>
        <button type="button" aria-label="Close console">Close</button>
      `);
    };
    window.addEventListener('keydown', onKeyDown);
    const submitted = vi.fn();
    const closed = vi.fn();

    expect(tryAutoStartTf2(document, window, 'jump_beef')).toBe(false);
    document.querySelector('button').addEventListener('click', submitted);
    document.querySelector('[aria-label="Close console"]').addEventListener('click', closed);

    expect(tryAutoStartTf2(document, window, 'jump_beef')).toBe(true);
    expect(document.querySelector('input').value).toBe('map jump_beef');
    vi.runAllTimers();
    expect(submitted).toHaveBeenCalledOnce();
    expect(closed).toHaveBeenCalledOnce();
    window.removeEventListener('keydown', onKeyDown);
  });
});
