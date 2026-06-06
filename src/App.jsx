import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './utils/storage';
import { calculations } from './utils/calculations';
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
  const [view, setView] = useState(VIEWS.WELCOME);
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [notification, setNotification] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load persisted state
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedSession = storage.getActiveSession();
    if (savedSession) setSession(savedSession);

    const savedHistory = storage.getSessionHistory();
    setHistory(savedHistory);
  }, []);

  const showNotif = useCallback((notif) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 3500);
  }, []);

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
      const updated = {
        ...prev,
        transactions: [...prev.transactions, transaction],
      };
      storage.setActiveSession(updated);
      // Auto-complete if stock depleted
      const remaining = calculations.getRemainingStock(updated.setup.targetLitres, updated.transactions);
      if (remaining === 0) {
        showNotif({ type: 'warning', message: '⚡ Stock depleted! Please end the session.' });
      }
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
    const newHistory = storage.getSessionHistory();
    setHistory(newHistory);
    setConfirmEnd(false);
    setView(VIEWS.REPORT);
    showNotif({ type: 'success', message: 'Session completed!' });
  };

  const handleNewSession = () => {
    setSession(null);
    setView(VIEWS.WELCOME);
  };

  const refreshHistory = () => {
    setHistory(storage.getSessionHistory());
  };

  const isSessionActive = session && !session.endTime;
  const isSessionEnded = session && session.endTime;

  const renderView = () => {
    switch (view) {
      case VIEWS.WELCOME:
        return (
          <Welcome
            onStart={() => setView(VIEWS.SETUP)}
            onContinue={() => setView(VIEWS.DASHBOARD)}
            hasActiveSession={!!storage.getActiveSession()}
            sessionCount={history.length}
          />
        );
      case VIEWS.SETUP:
        return <Setup onSetup={handleSetup} />;
      case VIEWS.DASHBOARD:
        return session && <Dashboard session={session} onEndSession={() => setConfirmEnd(true)} />;
      case VIEWS.ADD_SALE:
        return session && <AddSale session={session} onAddSale={handleAddSale} onNotify={showNotif} />;
      case VIEWS.HISTORY:
        return session && <History session={session} onDeleteTransaction={handleDeleteTransaction} />;
      case VIEWS.CHARTS:
        return session && <Charts session={session} />;
      case VIEWS.REPORT:
        return session && <Report session={session} onNewSession={handleNewSession} />;
      case VIEWS.SESSION_HISTORY:
        return <SessionHistory history={history} onHistoryChange={refreshHistory} />;
      default:
        return null;
    }
  };

  const showNav = isSessionActive && view !== VIEWS.WELCOME && view !== VIEWS.SETUP;
  const showHeader = view !== VIEWS.WELCOME;

  return (
    <div className={`app ${theme}`}>
      {showHeader && (
        <header className="app-header">
          <div className="header-left">
            <button className="logo-btn" onClick={() => setView(isSessionActive ? VIEWS.DASHBOARD : VIEWS.WELCOME)}>
              <span className="logo-emoji">⛽</span>
              <span className="logo-text">Smart Fuel Tracker</span>
            </button>
          </div>
          <div className="header-right">
            {view === VIEWS.SESSION_HISTORY && (
              <span className="header-badge">{history.length} sessions</span>
            )}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isSessionActive && (
              <button className="session-history-btn" onClick={() => setView(VIEWS.SESSION_HISTORY)}>
                🗂️
              </button>
            )}
            {view === VIEWS.WELCOME && (
              <button className="btn-outline btn-sm" onClick={() => setView(VIEWS.SESSION_HISTORY)}>
                📂 History
              </button>
            )}
            {view === VIEWS.SESSION_HISTORY && !isSessionActive && (
              <button className="btn-outline btn-sm" onClick={() => setView(VIEWS.WELCOME)}>
                ← Back
              </button>
            )}
          </div>
        </header>
      )}

      {showNav && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => { setView(item.id); setMenuOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <main className={`app-main ${showNav ? 'with-nav' : ''} ${showHeader ? 'with-header' : ''}`}>
        {renderView()}
      </main>

      {notification && (
        <div className={`notification notif-${notification.type}`}>
          <span className="notif-icon">
            {notification.type === 'success' ? '✅' : notification.type === 'warning' ? '⚡' : 'ℹ️'}
          </span>
          {notification.message}
        </div>
      )}

      {confirmEnd && (
        <div className="modal-overlay" onClick={() => setConfirmEnd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔴</div>
            <h3>End Session?</h3>
            <p>This will complete the current session and generate a final report. You can view the report and export it afterwards.</p>
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
