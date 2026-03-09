import React, { useState, useEffect, useCallback } from 'react';
import { STATUS_OPTIONS, getAvatarPath, SIGNIN_PATH, PASSPORT_ICON_PATH } from '../data/constants';
import { useUserAccounts } from '../../../../contexts/UserAccountsContext';

export default function LoginView({ onLogin }) {
  const { getCurrentUser } = useUserAccounts();
  const currentUser = getCurrentUser();
  const savedUser = localStorage.getItem('msn_saved_user') || '';
  const savedStatus = localStorage.getItem('msn_last_status') || 'online';
  const defaultUserName = currentUser?.name || savedUser;
  const defaultAvatar = currentUser?.picture || 'chess';
  const shouldAutoSignIn = localStorage.getItem('msn_auto') === 'true' && Boolean(defaultUserName);

  const [username, setUsername] = useState(defaultUserName);
  const [status, setStatus] = useState(savedStatus);
  const [rememberMe, setRememberMe] = useState(Boolean(defaultUserName));
  const [autoSignIn, setAutoSignIn] = useState(shouldAutoSignIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doLogin = useCallback((name, selectedStatus, remember, auto) => {
    if (!name.trim()) {
      setError('Please enter a Display Name.');
      return;
    }
    setError('');
    setLoading(true);

    if (remember) {
      localStorage.setItem('msn_remember', 'true');
      localStorage.setItem('msn_saved_user', name);
    } else {
      localStorage.removeItem('msn_remember');
      localStorage.removeItem('msn_saved_user');
    }
    if (auto) localStorage.setItem('msn_auto', 'true');
    else localStorage.removeItem('msn_auto');
    localStorage.setItem('msn_last_status', selectedStatus);

    setTimeout(() => {
      setLoading(false);
      onLogin({ name: name.trim(), status: selectedStatus, avatar: defaultAvatar });
    }, 3000);
  }, [defaultAvatar, onLogin]);

  useEffect(() => {
    if (shouldAutoSignIn && defaultUserName) {
      const timer = window.setTimeout(() => {
        doLogin(defaultUserName, savedStatus, true, true);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [defaultUserName, doLogin, savedStatus, shouldAutoSignIn]);

  function handleSubmit(e) {
    e.preventDefault();
    doLogin(username, status, rememberMe, autoSignIn);
  }

  return (
    <div className="msn-login-view">
      <div className="login-content">
        <form className="login-box" onSubmit={handleSubmit}>
          <img id="msn-avatar-preview" src={getAvatarPath(defaultAvatar)} alt="Avatar" />
          <div className="login-input-container">
            <div className="label-input">
              <label htmlFor="msn-username">Display Name:</label>
              <input
                type="text"
                id="msn-username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="msn-select">
            <select value={status} onChange={e => setStatus(e.target.value)} disabled={loading}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ width: 200, margin: '0 auto' }}>
            <div className="msn-checkbox">
              <input type="checkbox" id="msn-remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              <label style={{ color: '#12368D' }} htmlFor="msn-remember">Remember Me</label>
            </div>
            <div className="msn-checkbox">
              <input type="checkbox" id="msn-auto" checked={autoSignIn} onChange={e => setAutoSignIn(e.target.checked)} />
              <label style={{ color: '#12368D' }} htmlFor="msn-auto">Sign Me In Automatically</label>
            </div>
          </div>
          <br />
          {error && <div className="login-error-msg">{error}</div>}
          {!loading && (
            <button type="submit" className="msn-btn default" style={{ marginTop: 5 }}>Sign In</button>
          )}
          {loading && (
            <img className="loading-img" src={SIGNIN_PATH} width="48" height="36" alt="Loading" />
          )}
        </form>
      </div>
      <div className="login-view-bg" />
      <div className="passport-footer">
        <img src={PASSPORT_ICON_PATH} alt="Key" />
        <span>Microsoft Passport Network</span>
      </div>
    </div>
  );
}
