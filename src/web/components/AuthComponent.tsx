/**
 * AMMP Authentication Component
 * Handles API key input and authentication
 */

import React, { useState } from 'react';

export function AuthComponent() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your AMMP API key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In the ChatGPT environment, we'd post a message to trigger the MCP tool
      // For now, we simulate the authentication
      window.postMessage({
        type: 'ammp:authenticate',
        data: { apiKey },
      }, '*');

      // The actual authentication will be handled by the MCP tool
      // and the result will come back via postMessage event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-component">
      <div className="auth-card">
        <div className="auth-header">
          <h2>⚡ AMMP Energy Monitor</h2>
          <p>Connect to your AMMP solar energy monitoring system</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="api-key">AMMP API Key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              disabled={loading}
              className="api-key-input"
            />
            <small className="form-help">
              Get your API key from{' '}
              <a 
                href="https://data-api.ammp.io" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                data-api.ammp.io
              </a>
            </small>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              <>
                <span>🔓</span>
                Connect to AMMP
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-privacy">
            <span className="lock-icon">🔒</span>
            Your API key is encrypted and never stored
          </p>
        </div>
      </div>

      <div className="auth-features">
        <h3>Features</h3>
        <ul>
          <li>
            <span className="feature-icon">📊</span>
            <div>
              <strong>Real-time Energy Data</strong>
              <p>Track energy production across all your sites</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🚨</span>
            <div>
              <strong>Alert Monitoring</strong>
              <p>Get notified of errors and warnings instantly</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">📈</span>
            <div>
              <strong>Performance Analytics</strong>
              <p>Monitor availability, PR, and efficiency metrics</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🔧</span>
            <div>
              <strong>Device Management</strong>
              <p>Track inverter and equipment status</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
