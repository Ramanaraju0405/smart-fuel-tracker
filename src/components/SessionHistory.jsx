import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { exportToPDF } from '../utils/pdfExport';

const SessionHistory = ({ history, onHistoryChange }) => {
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = history.filter(s =>
    s.setup.fuelType.toLowerCase().includes(search.toLowerCase()) ||
    new Date(s.startTime).toLocaleDateString().includes(search) ||
    String(s.id).includes(search)
  );

  const handleDelete = (id) => {
    storage.deleteSession(id);
    onHistoryChange();
    setConfirmDelete(null);
  };

  const handleClearAll = () => {
    storage.clearAllHistory();
    onHistoryChange();
    setConfirmClear(false);
  };

  const getSummary = (session) => {
    const soldLitres = session.transactions.reduce((s, t) => s + t.litres, 0);
    const revenue = session.transactions.reduce((s, t) => s + t.revenue, 0);
    const cost = soldLitres * session.setup.costPrice;
    const profit = revenue - cost;
    return { soldLitres, revenue, profit };
  };

  // Analytics across all sessions
  const allSummaries = history.map(s => ({ ...s, ...getSummary(s) }));
  const totalRevenue = allSummaries.reduce((sum, s) => sum + s.revenue, 0);
  const totalFuelSold = allSummaries.reduce((sum, s) => sum + s.soldLitres, 0);
  const avgProfit = allSummaries.length > 0
    ? allSummaries.reduce((sum, s) => sum + s.profit, 0) / allSummaries.length : 0;
  const highestRevenue = allSummaries.length > 0
    ? Math.max(...allSummaries.map(s => s.revenue)) : 0;
  const lowestRevenue = allSummaries.length > 0
    ? Math.min(...allSummaries.map(s => s.revenue)) : 0;

  return (
    <div className="history-container">
      {history.length > 0 && (
        <div className="analytics-strip">
          {[
            ['🏆', 'Highest Revenue', `₹${highestRevenue.toFixed(2)}`],
            ['📉', 'Lowest Revenue', `₹${lowestRevenue.toFixed(2)}`],
            ['📊', 'Avg Profit', `₹${avgProfit.toFixed(2)}`],
            ['⛽', 'Total Fuel Sold', `${totalFuelSold.toFixed(1)} L`],
            ['💰', 'All-time Revenue', `₹${totalRevenue.toFixed(2)}`],
          ].map(([icon, label, val]) => (
            <div className="analytics-chip" key={label}>
              <div className="chip-icon">{icon}</div>
              <div className="chip-label">{label}</div>
              <div className="chip-val">{val}</div>
            </div>
          ))}
        </div>
      )}

      <div className="history-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search sessions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {history.length > 0 && (
          <button className="btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No Sessions Found</h3>
          <p>{history.length === 0 ? 'Completed sessions will appear here.' : 'No sessions match your search.'}</p>
        </div>
      ) : (
        <div className="session-cards">
          {filtered.map((session, i) => {
            const { soldLitres, revenue, profit } = getSummary(session);
            const isProfit = profit >= 0;
            const sessionNum = history.length - history.indexOf(session);
            return (
              <div className="session-card" key={session.id}>
                <div className="session-card-header">
                  <div className="session-num">Session #{sessionNum}</div>
                  <div className={`session-result ${isProfit ? 'result-profit' : 'result-loss'}`}>
                    {isProfit ? '📈 Profit' : '📉 Loss'}
                  </div>
                </div>
                <div className="session-card-body">
                  <div className="sc-meta">
                    <span>⛽ {session.setup.fuelType}</span>
                    <span>📅 {new Date(session.startTime).toLocaleDateString()}</span>
                    <span>🧾 {session.transactions.length} transactions</span>
                  </div>
                  <div className="sc-financials">
                    <div className="sc-stat">
                      <div className="sc-label">Revenue</div>
                      <div className="sc-val">₹{revenue.toFixed(2)}</div>
                    </div>
                    <div className="sc-stat">
                      <div className="sc-label">Profit</div>
                      <div className={`sc-val ${isProfit ? 'text-green' : 'text-red'}`}>
                        {isProfit ? '+' : ''}₹{profit.toFixed(2)}
                      </div>
                    </div>
                    <div className="sc-stat">
                      <div className="sc-label">Sold</div>
                      <div className="sc-val">{soldLitres.toFixed(1)} L</div>
                    </div>
                  </div>
                </div>
                <div className="session-card-footer">
                  <button className="btn-outline btn-sm" onClick={() => exportToPDF(session)}>📄 PDF</button>
                  <button className="btn-icon-danger" onClick={() => setConfirmDelete(session.id)} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>Delete Session?</h3>
            <p>This session and all its transaction data will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmClear && (
        <div className="modal-overlay" onClick={() => setConfirmClear(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Clear All History?</h3>
            <p>All {history.length} sessions will be permanently deleted. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmClear(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleClearAll}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
