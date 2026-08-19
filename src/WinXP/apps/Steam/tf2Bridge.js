const READY_STARTUP_STATES = new Set(['Completed', 'Skipped']);
const DEFAULT_MAP = 'jump_beef';
const BRIDGE_TIMEOUT_MS = 60_000;

function configuredObjectUrl(assetOrigin, descriptor) {
  if (
    typeof assetOrigin !== 'string'
    || !descriptor
    || typeof descriptor.sha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(descriptor.sha256)
  ) {
    throw new Error('Invalid playsrc object descriptor');
  }

  return new URL(`/objects/sha256/${descriptor.sha256}`, assetOrigin).href;
}

export async function prefetchTf2Gameplay(configUrl, {
  fetcher = fetch,
  signal,
} = {}) {
  const configResponse = await fetcher(configUrl, {
    cache: 'no-store',
    credentials: 'same-origin',
    signal,
  });
  if (!configResponse.ok) throw new Error('playsrc configuration is unavailable');

  const config = await configResponse.json();
  const bspUrl = configuredObjectUrl(config.assetOrigin, config.bsp);
  const bspResponse = await fetcher(bspUrl, {
    cache: 'force-cache',
    credentials: 'same-origin',
    signal,
  });
  if (!bspResponse.ok) throw new Error('playsrc BSP prefetch failed');

  await bspResponse.arrayBuffer();
  return typeof config.target === 'string' && /^[a-z0-9_-]+$/.test(config.target)
    ? config.target
    : DEFAULT_MAP;
}

function buttonWithText(document, text) {
  return [...document.querySelectorAll('button')]
    .find((button) => button.textContent?.trim() === text);
}

export function tryAutoStartTf2(document, frameWindow, mapName = DEFAULT_MAP) {
  const root = document.querySelector('.tf2-application');
  if (
    !root
    || root.dataset.gameui !== 'main-menu'
    || !READY_STARTUP_STATES.has(root.dataset.startupState)
  ) {
    return false;
  }

  const commandInput = document.querySelector('[aria-label="Console command"]');
  if (!commandInput) {
    frameWindow.dispatchEvent(new frameWindow.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: 'Backquote',
      key: '`',
    }));
    return false;
  }

  const submit = buttonWithText(document, 'Submit');
  if (!submit) return false;

  const inputSetter = Object.getOwnPropertyDescriptor(
    frameWindow.HTMLInputElement.prototype,
    'value',
  )?.set;
  inputSetter?.call(commandInput, `map ${mapName}`);
  commandInput.dispatchEvent(new frameWindow.Event('input', { bubbles: true }));

  frameWindow.setTimeout(() => {
    submit.click();
    frameWindow.setTimeout(() => {
      document.querySelector('[aria-label="Close console"]')?.click();
    }, 0);
  }, 0);

  return true;
}

export function connectTf2Launcher(frame, {
  configUrl,
  autoStart = true,
} = {}) {
  const abortController = new AbortController();
  let mapName = DEFAULT_MAP;
  let observer;
  let interval;
  let timeout;
  let timerWindow;
  let submitted = false;

  if (configUrl) {
    void prefetchTf2Gameplay(configUrl, { signal: abortController.signal })
      .then((target) => { mapName = target; })
      .catch(() => {});
  }

  const disconnectDocument = () => {
    observer?.disconnect();
    observer = undefined;
    if (interval !== undefined) timerWindow?.clearInterval(interval);
    if (timeout !== undefined) timerWindow?.clearTimeout(timeout);
    interval = undefined;
    timeout = undefined;
    timerWindow = undefined;
  };

  const connectDocument = () => {
    disconnectDocument();
    if (!autoStart || submitted) return;

    try {
      const document = frame.contentDocument;
      const frameWindow = frame.contentWindow;
      if (!document?.documentElement || !frameWindow) return;
      timerWindow = frameWindow;

      const attempt = () => {
        if (submitted) return;
        submitted = tryAutoStartTf2(document, frameWindow, mapName);
        if (submitted) disconnectDocument();
      };

      observer = new frameWindow.MutationObserver(attempt);
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      interval = frameWindow.setInterval(attempt, 250);
      timeout = frameWindow.setTimeout(disconnectDocument, BRIDGE_TIMEOUT_MS);
      attempt();
    } catch {
      // Cross-origin configured runtimes intentionally receive no launcher bridge.
    }
  };

  frame.addEventListener('load', connectDocument);
  connectDocument();

  return () => {
    abortController.abort();
    disconnectDocument();
    frame.removeEventListener('load', connectDocument);
  };
}
