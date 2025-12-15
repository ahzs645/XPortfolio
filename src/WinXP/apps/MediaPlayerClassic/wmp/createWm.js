function makeRestoreButton({ desktopEl, windowId, caption, onRestore }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = caption || "Restore";
  btn.className = "wmp-restore-btn";
  btn.dataset.windowId = windowId;
  btn.onclick = () => onRestore();
  desktopEl.appendChild(btn);
  return btn;
}

function ensureRestoreButtonStyles() {
  if (document.getElementById("wmp-restore-style")) return;
  const style = document.createElement("style");
  style.id = "wmp-restore-style";
  style.textContent = `
    .wmp-restore-btn{
      position: absolute;
      left: 12px;
      bottom: 12px;
      z-index: 1000000;
      max-width: calc(100% - 24px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}

export function createWm({ desktopEl, dm }) {
  if (!desktopEl) throw new Error("Missing desktopEl");
  if (!dm) throw new Error("Missing dm");

  ensureRestoreButtonStyles();

  const windows = {};
  let counter = 0;
  const restoreButtons = new Map();

  const getWindowEl = (id) => windows[id];

  const createNewWindow = (instanceIdentifier, fragment) => {
    const id = `${instanceIdentifier}-${++counter}`;

    const appEl = document.createElement("app");
    appEl.id = id;
    appEl.classList.add(instanceIdentifier);

    const appContents = document.createElement("appcontents");
    appContents.style.width = "640px";
    appContents.style.height = "532px";
    appContents.appendChild(fragment);

    appEl.appendChild(appContents);
    desktopEl.appendChild(appEl);

    windows[id] = appEl;
    return id;
  };

  const setSize = (id, width, height) => {
    const win = getWindowEl(id);
    if (!win) return;
    const appContents = win.querySelector("appcontents");
    if (!appContents) return;
    appContents.style.width = `${width}px`;
    appContents.style.height = `${height}px`;
  };

  const setCaption = (id, caption) => {
    const win = getWindowEl(id);
    if (!win) return;
    win.dataset.caption = caption || "";
  };

  const setIcon = (id, iconNameOrPath) => {
    const win = getWindowEl(id);
    if (!win) return;
    win.dataset.icon = iconNameOrPath || "";
  };

  const getPosition = (id) => {
    const win = getWindowEl(id);
    if (!win) return null;
    const winRect = win.getBoundingClientRect();
    const desktopRect = desktopEl.getBoundingClientRect();
    return [winRect.left - desktopRect.left, winRect.top - desktopRect.top];
  };

  const setPosition = (id, left, top) => {
    const win = getWindowEl(id);
    if (!win) return;
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  };

  const restoreWindow = (id) => {
    const win = getWindowEl(id);
    if (!win) return;
    win.dataset._minimized = "0";
    win.style.display = "";
    restoreButtons.get(id)?.remove();
    restoreButtons.delete(id);
  };

  const focusWindow = (id) => {
    const win = getWindowEl(id);
    if (!win) return;
    win.style.zIndex = String(Date.now());
    if (win.dataset._minimized === "1") restoreWindow(id);
  };

  const toggleMaximizeWindow = (id) => {
    const win = getWindowEl(id);
    if (!win) return;

    const appContents = win.querySelector("appcontents");
    if (!appContents) return;

    const isMax = win.classList.contains("maximized");
    if (!isMax) {
      win.dataset._prevLeft = win.style.left || "";
      win.dataset._prevTop = win.style.top || "";
      win.dataset._prevWidth = appContents.style.width || "";
      win.dataset._prevHeight = appContents.style.height || "";

      win.classList.add("maximized");
      win.style.left = "0px";
      win.style.top = "0px";
      setSize(id, desktopEl.clientWidth, desktopEl.clientHeight);
    } else {
      win.classList.remove("maximized");
      win.style.left = win.dataset._prevLeft || "";
      win.style.top = win.dataset._prevTop || "";
      if (win.dataset._prevWidth && win.dataset._prevHeight) {
        appContents.style.width = win.dataset._prevWidth;
        appContents.style.height = win.dataset._prevHeight;
      }
    }
  };

  const minimizeWindow = (id) => {
    const win = getWindowEl(id);
    if (!win) return;

    const caption = win.dataset.caption || "Windows Media Player";

    win.dataset._minimized = "1";
    win.style.display = "none";

    if (!restoreButtons.has(id)) {
      const btn = makeRestoreButton({
        desktopEl,
        windowId: id,
        caption,
        onRestore: () => focusWindow(id),
      });
      restoreButtons.set(id, btn);
    }
  };

  const closeWindow = (id) => {
    const win = getWindowEl(id);
    if (!win) return;
    restoreButtons.get(id)?.remove();
    restoreButtons.delete(id);
    win.remove();
    delete windows[id];
  };

  const openFileDialog = async ({ filters } = {}) => {
    const accept = Array.isArray(filters)
      ? filters
          .flatMap((f) => f?.extensions || [])
          .filter(Boolean)
          .filter((ext) => !String(ext).includes("*"))
          .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`))
          .join(",")
      : "";

    return await new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      if (accept) input.accept = accept;

      input.onchange = () => {
        const files = Array.from(input.files || []);
        if (files.length === 0) {
          resolve(null);
          return;
        }
        const paths = dm._registerLocalFiles(files);
        resolve(paths);
      };

      input.click();
    });
  };

  return {
    _desktop: desktopEl,
    _windows: windows,

    createNewWindow,
    setSize,
    setCaption,
    setIcon,
    getPosition,
    setPosition,
    focusWindow,
    toggleMaximizeWindow,
    minimizeWindow,
    closeWindow,
    openFileDialog,
  };
}
