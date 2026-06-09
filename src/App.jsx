import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './utils/storage';
import { calculations } from './utils/calculations';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import History from './components/History';
import Report from './components/Report';
import SessionHistory from './components/SessionHistory';
import Charts from './components/Charts';
import './App.css';

const VIEWS = {
  WELCOME: 'welcome',
  SETUP: 'setup',
  DASHBOARD: 'dashboard',
  ADD_SALE: 'add_sale',
  HISTORY: 'history',
  CHARTS: 'charts',
  REPORT: 'report',
  SESSION_HISTORY: 'session_history',
};

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { id: VIEWS.ADD_SALE, label: 'Add Sale', icon: '➕' },
  { id: VIEWS.HISTORY, label: 'History', icon: '📋' },
  { id: VIEWS.CHARTS, label: 'Analytics', icon: '📈' },
  { id: VIEWS.SESSION_HISTORY, label: 'Sessions', icon: '🗂️' },
];

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState(VIEWS.WELCOME);
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [notification, setNotification] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const savedSession = storage.getActiveSession();
      if (savedSession) setSession(savedSession);
      setHistory(storage.getSessionHistory());
    }
    setAuthReady(true);
  }, []);

  const showNotif = useCallback((notif) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    const savedSession = storage.getActiveSession();
    if (savedSession) setSession(savedSession);
    setHistory(storage.getSessionHistory());
    showNotif({ type: 'success', message: `Welcome back, ${loggedUser.name}! 👋` });
  };

  const handleLogout = () => {
    storage.clearCurrentUser();
    setUser(null);
    setSession(null);
    setHistory([]);
    setView(VIEWS.WELCOME);
    setShowUserMenu(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    storage.setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSetup = (setupData) => {
    const newSession = {
      id: `session-${Date.now()}`,
      setup: setupData,
      transactions: [],
      startTime: new Date().toISOString(),
      endTime: null,
    };
    setSession(newSession);
    storage.setActiveSession(newSession);
    setView(VIEWS.DASHBOARD);
    showNotif({ type: 'success', message: 'Session started successfully!' });
  };

  const handleAddSale = (transaction) => {
    setSession(prev => {
      const updated = { ...prev, transactions: [...prev.transactions, transaction] };
      storage.setActiveSession(updated);
      const remaining = calculations.getRemainingStock(updated.setup.targetLitres, updated.transactions);
      if (remaining === 0) showNotif({ type: 'warning', message: '⚡ Stock depleted! Please end the session.' });
      return updated;
    });
  };

  const handleDeleteTransaction = (id) => {
    setSession(prev => {
      const updated = { ...prev, transactions: prev.transactions.filter(t => t.id !== id) };
      storage.setActiveSession(updated);
      return updated;
    });
    showNotif({ type: 'info', message: 'Transaction deleted.' });
  };

  const handleEndSession = () => {
    const ended = { ...session, endTime: new Date().toISOString() };
    storage.addToSessionHistory(ended);
    storage.clearActiveSession();
    setSession(ended);
    setHistory(storage.getSessionHistory());
    setConfirmEnd(false);
    setView(VIEWS.REPORT);
    showNotif({ type: 'success', message: 'Session completed!' });
  };

  const handleNewSession = () => { setSession(null); setView(VIEWS.WELCOME); };
  const refreshHistory = () => setHistory(storage.getSessionHistory());

  const isSessionActive = session && !session.endTime;
  const showNav = isSessionActive && view !== VIEWS.WELCOME && view !== VIEWS.SETUP;

  const renderView = () => {
    switch (view) {
      case VIEWS.WELCOME:
        return <Welcome onStart={() => setView(VIEWS.SETUP)} onContinue={() => setView(VIEWS.DASHBOARD)}
          hasActiveSession={!!storage.getActiveSession()} sessionCount={history.length} />;
      case VIEWS.SETUP: return <Setup onSetup={handleSetup} />;
      case VIEWS.DASHBOARD: return session && <Dashboard session={session} onEndSession={() => setConfirmEnd(true)} />;
      case VIEWS.ADD_SALE: return session && <AddSale session={session} onAddSale={handleAddSale} onNotify={showNotif} />;
      case VIEWS.HISTORY: return session && <History session={session} onDeleteTransaction={handleDeleteTransaction} />;
      case VIEWS.CHARTS: return session && <Charts session={session} />;
      case VIEWS.REPORT: return session && <Report session={session} onNewSession={handleNewSession} />;
      case VIEWS.SESSION_HISTORY: return <SessionHistory history={history} onHistoryChange={refreshHistory} />;
      default: return null;
    }
  };

  if (!authReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛽</div>
        <div className="login-spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className={`app ${theme}`}>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <button className="logo-btn" onClick={() => setView(isSessionActive ? VIEWS.DASHBOARD : VIEWS.WELCOME)}>
            <span className="logo-emoji">⛽</span>
            <span className="logo-text">Smart Fuel Tracker</span>
          </button>
        </div>
        <div className="header-right">
          {view === VIEWS.SESSION_HISTORY && <span className="header-badge">{history.length} sessions</span>}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {isSessionActive && (
            <button className="session-history-btn" onClick={() => setView(VIEWS.SESSION_HISTORY)}>🗂️</button>
          )}
          {view === VIEWS.SESSION_HISTORY && !isSessionActive && (
            <button className="btn-outline btn-sm" onClick={() => setView(VIEWS.WELCOME)}>← Back</button>
          )}
          {/* Avatar button — dropdown rendered as portal outside header */}
          <button className="user-avatar-btn" onClick={() => setShowUserMenu(p => !p)}>
            <span className="user-avatar-initials">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </button>
        </div>
      </header>

      {/* ── User dropdown rendered OUTSIDE header to avoid stacking context trap ── */}
      {showUserMenu && (
        <>
          <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
          <div className="user-dropdown-fixed">
            <div className="user-dropdown-header">
              <div className="ud-name">{user.name}</div>
              <div className="ud-username">@{user.username}</div>
            </div>
            <div className="user-dropdown-divider" />
            <button className="ud-item" onClick={handleLogout}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </>
      )}

      {/* ── Bottom Nav ── */}
      {showNav && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <main className={`app-main with-header ${showNav ? 'with-nav' : ''}`}>
        {renderView()}
      </main>

      {/* ── Notification ── */}
      {notification && (
        <div className={`notification notif-${notification.type}`}>
          <span className="notif-icon">
            {notification.type === 'success' ? '✅' : notification.type === 'warning' ? '⚡' : 'ℹ️'}
          </span>
          {notification.message}
        </div>
      )}

      {/* ── End Session Confirm ── */}
      {confirmEnd && (
        <div className="modal-overlay" onClick={() => setConfirmEnd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔴</div>
            <h3>End Session?</h3>
            <p>This will complete the current session and generate a final report.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmEnd(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleEndSession}>End Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
