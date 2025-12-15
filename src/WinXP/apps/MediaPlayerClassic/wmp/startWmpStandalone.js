import { createDialogHandler } from "./createDialogHandler.js";
import { createDm } from "./createDm.js";
import { createShell } from "./createShell.js";
import { createWm } from "./createWm.js";

async function ensureJsMediaTagsLoaded() {
  // jsmediatags is optional - used for cover art extraction
  // Skip loading to avoid 404 errors
}

// Cache the registered WMP app at module level so it persists across opens
let cachedWmpApp = null;

export async function startWmpStandalone({ desktopEl, onFrameToggle, dragRef, onXPMinimize, onXPMaximize, onXPClose }) {
  if (!desktopEl) throw new Error("Missing desktopEl");

  await ensureJsMediaTagsLoaded();

  const prevGlobals = {
    wm: window.wm,
    dm: window.dm,
    shell: window.shell,
    dialogHandler: window.dialogHandler,
    registerApp: window.registerApp,
  };

  const dm = createDm();
  const wm = createWm({ desktopEl, dm, onFrameToggle, dragRef, onXPMinimize, onXPMaximize, onXPClose });
  const shell = createShell();
  const dialogHandler = createDialogHandler();

  window.dm = dm;
  window.wm = wm;
  window.shell = shell;
  window.dialogHandler = dialogHandler;

  let capturedApp = cachedWmpApp;

  // Only import and register if not already cached
  if (!capturedApp) {
    const originalConsole = window.console;
    const originalConsoleMethods = {};
    for (const key of [
      "log",
      "info",
      "warn",
      "error",
      "debug",
      "trace",
      "table",
      "group",
      "groupCollapsed",
      "groupEnd",
      "clear",
    ]) {
      originalConsoleMethods[key] = originalConsole?.[key];
    }

    window.registerApp = (app) => {
      capturedApp = app;
      cachedWmpApp = app; // Cache for future opens
    };

    await import("./app/registerWmpApp.js");

    window.console = originalConsole;
    for (const [key, value] of Object.entries(originalConsoleMethods)) {
      try {
        if (typeof value === "function") window.console[key] = value;
      } catch {
        // ignore
      }
    }

    window.registerApp = prevGlobals.registerApp;
  }

  if (!capturedApp || typeof capturedApp.setup !== "function") {
    throw new Error("WMP did not register correctly");
  }

  await capturedApp.setup();
  const hWnd = await capturedApp.start();

  return () => {
    try {
      document.getElementById(`wmpCSS_instance_${hWnd}`)?.remove();
    } catch {
      // ignore
    }
    try {
      dm._revokeAllLocalObjectUrls?.();
    } catch {
      // ignore
    }
    try {
      wm.closeWindow(hWnd);
    } catch {
      // ignore
    }

    window.wm = prevGlobals.wm;
    window.dm = prevGlobals.dm;
    window.shell = prevGlobals.shell;
    window.dialogHandler = prevGlobals.dialogHandler;
    window.registerApp = prevGlobals.registerApp;
  };
}
