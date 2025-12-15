import { useState } from 'react';
import ProgressBar from './ProgressBar';
import './LoginForm.css';

function CustomCheckbox({ id, checked, onChange, label }) {
  const [isHovered, setIsHovered] = useState(false);

  const getCheckboxImage = () => {
    if (checked) {
      return isHovered
        ? '/apps/wizard101/images/skin/checkbox_checked_hover.png'
        : '/apps/wizard101/images/skin/checkbox_checked.png';
    } else {
      return isHovered
        ? '/apps/wizard101/images/skin/checkbox_unchecked_hover.png'
        : '/apps/wizard101/images/skin/checkbox_unchecked.png';
    }
  };

  return (
    <label
      className="wiz101-custom-checkbox"
      htmlFor={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="wiz101-custom-checkbox-input"
      />
      <img
        src={getCheckboxImage()}
        alt=""
        className="wiz101-custom-checkbox-image"
        draggable="false"
      />
      <span className="wiz101-custom-checkbox-label">{label}</span>
    </label>
  );
}

function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  rememberUsername,
  setRememberUsername,
  onLogin,
  onPlay,
  onSettings,
  isLoggedIn,
  isReady,
  isPatching,
  fileProgress,
  totalProgress,
  status
}) {
  const [loginBtnHovered, setLoginBtnHovered] = useState(false);
  const [settingsBtnHovered, setSettingsBtnHovered] = useState(false);

  return (
    <div className="wiz101-login-form">
      {/* Left column: Settings button */}
      <div className="wiz101-login-column wiz101-login-column-left">
        <button
          className="wiz101-login-btn settings-btn"
          onClick={onSettings}
          onMouseEnter={() => setSettingsBtnHovered(true)}
          onMouseLeave={() => setSettingsBtnHovered(false)}
          style={{
            backgroundImage: `url('/apps/wizard101/images/skin/${settingsBtnHovered ? '013_IEND' : '012_IEND'}.png')`
          }}
        >
          Settings
        </button>
      </div>

      {/* Middle column: Input fields OR Progress bars */}
      <div className="wiz101-login-column wiz101-login-column-middle">
        {isLoggedIn ? (
          <ProgressBar
            fileProgress={fileProgress}
            totalProgress={totalProgress}
            status={status}
            isPatching={isPatching}
          />
        ) : (
          <>
            <div className="wiz101-input-group">
              <label className="wiz101-input-label">Username</label>
              <input
                type="text"
                className="wiz101-input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="wiz101-input-group">
              <label className="wiz101-input-label">Password</label>
              <input
                type="password"
                className="wiz101-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyDown={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>

            <div className="wiz101-checkbox-group">
              <CustomCheckbox
                id="remember"
                checked={rememberUsername}
                onChange={(e) => setRememberUsername(e.target.checked)}
                label="Remember Username"
              />
            </div>
          </>
        )}
      </div>

      {/* Right column: Login button OR PLAY! button */}
      <div className="wiz101-login-column wiz101-login-column-right">
        {isLoggedIn ? (
          <button
            className={`wiz101-login-btn play-btn ${!isReady ? 'disabled' : ''}`}
            onClick={onPlay}
            disabled={!isReady}
            onMouseEnter={() => setLoginBtnHovered(true)}
            onMouseLeave={() => setLoginBtnHovered(false)}
            style={{
              backgroundImage: `url('/apps/wizard101/images/skin/${loginBtnHovered && isReady ? '013_IEND' : '012_IEND'}.png')`
            }}
          >
            PLAY!
          </button>
        ) : (
          <button
            className="wiz101-login-btn"
            onClick={onLogin}
            onMouseEnter={() => setLoginBtnHovered(true)}
            onMouseLeave={() => setLoginBtnHovered(false)}
            style={{
              backgroundImage: `url('/apps/wizard101/images/skin/${loginBtnHovered ? '013_IEND' : '012_IEND'}.png')`
            }}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
