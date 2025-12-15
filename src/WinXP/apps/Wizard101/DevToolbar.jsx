import { useLauncherMode } from '../context/LauncherContext';
import './DevToolbar.css';

function DevToolbar() {
  const { mode, setMode } = useLauncherMode();

  const modes = [
    { id: 'default', label: 'Default', description: 'Login & Progress bars' },
    { id: 'patchClient', label: 'Live Mode', description: 'Ravenwood News (2014 Archive)' },
    { id: 'offline', label: 'Offline', description: 'Fallback content' },
  ];

  return (
    <div className="dev-toolbar">
      <span className="dev-toolbar-label">Dev Mode:</span>
      <div className="dev-toolbar-modes">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`dev-mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            title={m.description}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DevToolbar;
