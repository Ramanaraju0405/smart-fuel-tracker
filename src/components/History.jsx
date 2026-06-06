import React, { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';

const History = ({ session, onDeleteTransaction }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [confirmId, setConfirmId] = useState(null);

  const { transactions } = session;
  const totalRevenue = transactions.reduce((s, t) => s + t.revenue, 0);

  const filtered = transactions.filter(t => {
    const matchFilter = filter === 'All' || t.saleType === filter;
    const matchSearch = search === '' ||
      t.saleType.toLowerCase().includes(search.toLowerCase()) ||
      new Date(t.timestamp).toLocaleDateString().includes(search) ||
      t.litres.toString().includes(search);
    return matchFilter && matchSearch;
  });

  const handleDelete = (id) => {
    onDeleteTransaction(id);
    setConfirmId(null);
  };

  return (
    <div className="history-container">
      <div className="history-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search transactions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'Petrol Only', 'Petrol + Oil'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="btn-outline btn-sm" onClick={() => exportToCSV(transactions, session.id)}>
          📥 Export CSV
        </button>
      </div>

      <div className="revenue-summary-bar">
        <span>📊 {filtered.length} of {transactions.length} transactions</span>
        <span className="rev-total">Total: ₹{totalRevenue.toFixed(2)}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Transactions Found</h3>
          <p>{transactions.length === 0 ? 'Start adding sales to see them here.' : 'No results match your filter.'}</p>
        </div>
      ) : (
        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Litres</th>
                <th>Price/L</th>
                <th>Revenue</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const d = new Date(t.timestamp);
                const originalIndex = transactions.findIndex(tx => tx.id === t.id);
                return (
                  <tr key={t.id} className="tx-row">
                    <td><span className="tx-num">{originalIndex + 1}</span></td>
                    <td>{d.toLocaleDateString()}</td>
                    <td>{d.toLocaleTimeString()}</td>
                    <td>
                      <span className={`type-badge ${t.saleType === 'Petrol Only' ? 'badge-petrol' : 'badge-oil'}`}>
                        {t.saleType === 'Petrol Only' ? '⛽' : '🛢️'} {t.saleType}
                      </span>
                    </td>
                    <td>{t.litres.toFixed(2)} L</td>
                    <td>₹{t.sellingPrice.toFixed(2)}</td>
                    <td className="revenue-cell">₹{t.revenue.toFixed(2)}</td>
                    <td>
                      <button className="btn-icon-danger" onClick={() => setConfirmId(t.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>Delete Transaction?</h3>
            <p>This action cannot be undone. The transaction will be permanently removed.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
