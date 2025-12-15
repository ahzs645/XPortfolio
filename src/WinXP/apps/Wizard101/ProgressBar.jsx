import './ProgressBar.css';

function ProgressBar({
  fileProgress = 0,
  totalProgress = 0,
  status = 'Download Complete!',
  isPatching = false
}) {
  return (
    <div className="progress-area">
      {/* File Progress column */}
      <div className="progress-column file-column">
        <div className="wiz101-progress-labels">
          <span className="wiz101-progress-label">File Progress</span>
          <span className="progress-status">{status}</span>
        </div>
        <div className="wiz101-progress-container">
          <img src="/apps/wizard101/images/skin/032_frame.png" alt="" className="wiz101-progress-frame" />
          <div className="wiz101-progress-fill-wrapper">
            <div
              className={`wiz101-progress-fill ${isPatching ? 'animating' : ''}`}
              style={{ width: `${fileProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Progress column */}
      <div className="progress-column total-column">
        <span className="wiz101-progress-label">Total Progress</span>
        <div className="wiz101-progress-container">
          <img src="/apps/wizard101/images/skin/032_frame.png" alt="" className="wiz101-progress-frame" />
          <div className="wiz101-progress-fill-wrapper">
            <div
              className={`wiz101-progress-fill ${isPatching ? 'animating' : ''}`}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
