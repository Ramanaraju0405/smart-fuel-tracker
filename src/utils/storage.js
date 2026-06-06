const KEYS = {
  ACTIVE_SESSION: 'sfst_active_session',
  SESSION_HISTORY: 'sfst_session_history',
  THEME: 'sfst_theme',
};

export const storage = {
  getActiveSession: () => {
    try {
      const raw = localStorage.getItem(KEYS.ACTIVE_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setActiveSession: (session) => {
    localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
  },
  clearActiveSession: () => {
    localStorage.removeItem(KEYS.ACTIVE_SESSION);
  },
  getSessionHistory: () => {
    try {
      const raw = localStorage.getItem(KEYS.SESSION_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  addToSessionHistory: (session) => {
    const history = storage.getSessionHistory();
    history.unshift(session);
    localStorage.setItem(KEYS.SESSION_HISTORY, JSON.stringify(history));
  },
  deleteSession: (id) => {
    const history = storage.getSessionHistory().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SESSION_HISTORY, JSON.stringify(history));
  },
  clearAllHistory: () => {
    localStorage.removeItem(KEYS.SESSION_HISTORY);
  },
  getTheme: () => localStorage.getItem(KEYS.THEME) || 'dark',
  setTheme: (theme) => localStorage.setItem(KEYS.THEME, theme),
};
