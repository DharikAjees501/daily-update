import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { loginTL } from '../api';

export default function TLLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginTL(username.trim(), password);
      if (res.success) {
        onLoginSuccess(res.username || username.trim());
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div className="glass-card">
        <div className="card-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="header-icon" style={{ margin: '0 auto 0.5rem', width: '52px', height: '52px' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 className="card-title" style={{ fontSize: '1.35rem' }}>TL Portal Login</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sign in to access team updates & review submissions
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <User size={15} /> TL Username
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter TL username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={15} /> Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Log In to TL Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
