import React from 'react';

const Welcome = ({ onStart, onContinue, hasActiveSession, sessionCount }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-bg-grid" />
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-icon">⛽</div>
          <div className="logo-glow" />
        </div>
        <h1 className="welcome-title">
          Smart Fuel<br />
          <span className="title-accent">Sales Tracker</span>
        </h1>
        <p className="welcome-subtitle">
          Professional inventory &amp; revenue management for fuel vendors
        </p>

        <div className="welcome-stats">
          <div className="stat-pill">
            <span className="stat-icon">📊</span>
            <span>{sessionCount} Session{sessionCount !== 1 ? 's' : ''} Completed</span>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="btn-primary btn-lg" onClick={onStart}>
            <span>🚀</span> Start New Session
          </button>
          {hasActiveSession && (
            <button className="btn-secondary btn-lg" onClick={onContinue}>
              <span>▶️</span> Continue Session
            </button>
          )}
        </div>

        <div className="welcome-features">
          {['Real-time Stock Tracking', 'Revenue & Profit Analytics', 'PDF & CSV Export', 'Session History'].map(f => (
            <div className="feature-chip" key={f}>✓ {f}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
