import { useState, useRef, useEffect } from 'react';
import './Window.css';

function Window({ children, title = "Wizard101", onClose, onMinimize, dragRef }) {
  const [closeState, setCloseState] = useState('normal');
  const [minState, setMinState] = useState('normal');
  const [isActive, setIsActive] = useState(true);
  const windowRef = useRef(null);

  // Track window focus state
  useEffect(() => {
    const handleFocus = () => setIsActive(true);
    const handleBlur = () => setIsActive(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Close button images (X)
  const closeImages = {
    normal: '018_image_18',
    hover: '019_IEND',
    pressed: '020_IEND'
  };

  // Minimize button images (bar)
  const minImages = {
    normal: '022_IEND',
    hover: '023_IEND',
    pressed: '024_IEND'
  };

  return (
    <div
      ref={windowRef}
      className={`wiz101-window ${isActive ? 'wiz101-window-active' : 'wiz101-window-inactive'}`}
    >
      {/* Title Bar - using 3 pieces: left, middle (repeat), right */}
      <div
        className="wiz101-titlebar"
        ref={dragRef}
      >
        {/* Left cap with icon and title */}
        <div className="wiz101-titlebar-left">
          <img
            src={isActive ? "/apps/wizard101/images/skin/028_IEND.png" : "/apps/wizard101/images/borders/inactive left.png"}
            alt=""
            draggable="false"
            className="wiz101-titlebar-left-bg"
          />
          <div className="wiz101-titlebar-title-wrapper">
            <img src="/apps/wizard101/images/icon.ico" alt="" className="wiz101-window-icon" draggable="false" />
            <span className="wiz101-window-title">{title}</span>
          </div>
        </div>

        {/* Middle section (repeatable) */}
        <div
          className="wiz101-titlebar-middle"
          style={!isActive ? { backgroundImage: "url('/apps/wizard101/images/borders/inactive middle.png')" } : {}}
        >
          <span className="wiz101-titlebar-center-text">KingsIsle Entertainment, Inc.</span>
        </div>

        {/* Right cap with buttons */}
        <div className="wiz101-titlebar-right">
          <img
            src={isActive ? "/apps/wizard101/images/skin/026_image_26.png" : "/apps/wizard101/images/borders/inactive right.png"}
            alt=""
            draggable="false"
            className="wiz101-titlebar-right-bg"
          />
          <div className="wiz101-window-controls">
            <button
              className="wiz101-window-btn wiz101-btn-minimize"
              onClick={onMinimize}
              onMouseEnter={() => setMinState('hover')}
              onMouseLeave={() => setMinState('normal')}
              onMouseDown={() => setMinState('pressed')}
              onMouseUp={() => setMinState('hover')}
              title="Minimize"
            >
              <img
                src={`/apps/wizard101/images/skin/${minImages[minState]}.png`}
                alt="Minimize"
                draggable="false"
              />
            </button>
            <button
              className="wiz101-window-btn wiz101-btn-close"
              onClick={onClose}
              onMouseEnter={() => setCloseState('hover')}
              onMouseLeave={() => setCloseState('normal')}
              onMouseDown={() => setCloseState('pressed')}
              onMouseUp={() => setCloseState('hover')}
              title="Close"
            >
              <img
                src={`/apps/wizard101/images/skin/${closeImages[closeState]}.png`}
                alt="Close"
                draggable="false"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Window Content with side borders */}
      <div className="wiz101-window-content-wrapper">
        <div className="wiz101-window-border-left"></div>
        <div className="wiz101-window-body">
          {children}
        </div>
        <div className="wiz101-window-border-right"></div>
      </div>

      {/* Bottom border - 3 pieces: left corner, middle repeat, right corner */}
      <div className="wiz101-window-border-bottom">
        <div className="wiz101-bottom-border-left"></div>
        <div className="wiz101-bottom-border-middle"></div>
        <div className="wiz101-bottom-border-right"></div>
      </div>
    </div>
  );
}

export default Window;
