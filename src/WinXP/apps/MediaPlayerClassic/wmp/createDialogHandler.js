export function createDialogHandler() {
  const spawnDialog = ({ title, text } = {}) => {
    const message = [title, text].filter(Boolean).join("\n\n");
    window.alert(message || "");
  };

  return { spawnDialog };
}

