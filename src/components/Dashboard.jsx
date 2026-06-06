import React from 'react';
import { calculations } from '../utils/calculations';

const Dashboard = ({ session, onEndSession }) => {
  const { setup, transactions } = session;
  const soldLitres = calculations.getSoldLitres(transactions);
  const remaining = calculations.getRemainingStock(setup.targetLitres, transactions);
  const revenue = calculations.getTotalRevenue(transactions);
  const cost = calculations.getTotalCost(transactions, setup.costPrice);
  const profit = calculations.getProfit(transactions, setup.costPrice);
  const todayTx = calculations.getTodayTransactions(transactions);
  const todayRevenue = todayTx.reduce((s, t) => s + t.revenue, 0);
  const avgPrice = calculations.getAverageSellingPrice(transactions);
  const mostSold = calculations.getMostSoldFuelType(transactions);
  const progress = setup.targetLitres > 0 ? (soldLitres / setup.targetLitres) * 100 : 0;
  const isLow = remaining > 0 && remaining <= setup.lowStockLimit;
  const isDepleted = remaining === 0;

  return (
    <div className="dashboard">
      {isDepleted && (
        <div className="alert alert-danger">
          ⚠️ Stock Depleted! All fuel has been sold. Please end this session.
        </div>
      )}
      {isLow && !isDepleted && (
        <div className="alert alert-warning">
          ⚡ Low Stock Warning! Only {remaining.toFixed(1)}L remaining (below {setup.lowStockLimit}L limit).
        </div>
      )}

      {/* Primary Metrics */}
      <div className="cards-grid">
        <div className="metric-card card-fuel">
          <div className="card-icon">⛽</div>
          <div className="card-label">Fuel Type</div>
          <div className="card-value">{setup.fuelType}</div>
        </div>
        <div className="metric-card card-stock">
          <div className="card-icon">📦</div>
          <div className="card-label">Total Stock</div>
          <div className="card-value">{setup.targetLitres.toFixed(1)}<span className="unit">L</span></div>
        </div>
        <div className="metric-card card-sold">
          <div className="card-icon">🔥</div>
          <div className="card-label">Sold</div>
          <div className="card-value">{soldLitres.toFixed(1)}<span className="unit">L</span></div>
        </div>
        <div className={`metric-card ${isDepleted ? 'card-danger' : isLow ? 'card-warning' : 'card-remaining'}`}>
          <div className="card-icon">{isDepleted ? '🚫' : isLow ? '⚠️' : '💧'}</div>
          <div className="card-label">Remaining</div>
          <div className="card-value">{remaining.toFixed(1)}<span className="unit">L</span></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-labels">
          <span>Stock Progress</span>
          <span>{progress.toFixed(1)}% Sold</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${Math.min(100, progress)}%`,
            background: isDepleted ? '#ef4444' : isLow ? '#f59e0b' : 'linear-gradient(90deg, #fbbf24, #f97316)' }} />
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="cards-grid cards-grid-3">
        <div className="metric-card card-revenue">
          <div className="card-icon">💰</div>
          <div className="card-label">Total Revenue</div>
          <div className="card-value">₹{revenue.toFixed(2)}</div>
        </div>
        <div className="metric-card card-cost">
          <div className="card-icon">🏷️</div>
          <div className="card-label">Total Cost</div>
          <div className="card-value">₹{cost.toFixed(2)}</div>
        </div>
        <div className={`metric-card ${profit >= 0 ? 'card-profit' : 'card-loss'}`}>
          <div className="card-icon">{profit >= 0 ? '📈' : '📉'}</div>
          <div className="card-label">Profit / Loss</div>
          <div className="card-value" style={{ color: profit >= 0 ? '#22c55e' : '#ef4444' }}>
            {profit >= 0 ? '+' : ''}₹{profit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="section-title">Today's Snapshot</div>
      <div className="cards-grid">
        <div className="metric-card card-sm">
          <div className="card-icon">📅</div>
          <div className="card-label">Today's Revenue</div>
          <div className="card-value sm">₹{todayRevenue.toFixed(2)}</div>
        </div>
        <div className="metric-card card-sm">
          <div className="card-icon">🧾</div>
          <div className="card-label">Today's Transactions</div>
          <div className="card-value sm">{todayTx.length}</div>
        </div>
        <div className="metric-card card-sm">
          <div className="card-icon">💲</div>
          <div className="card-label">Avg Selling Price</div>
          <div className="card-value sm">₹{avgPrice.toFixed(2)}/L</div>
        </div>
        <div className="metric-card card-sm">
          <div className="card-icon">🏆</div>
          <div className="card-label">Most Sold Type</div>
          <div className="card-value sm">{mostSold}</div>
        </div>
      </div>

      <div className="cards-grid cards-grid-2">
        <div className="metric-card card-sm">
          <div className="card-icon">🔢</div>
          <div className="card-label">Total Transactions</div>
          <div className="card-value sm">{transactions.length}</div>
        </div>
        <div className="metric-card card-sm">
          <div className="card-icon">🕐</div>
          <div className="card-label">Session Started</div>
          <div className="card-value sm" style={{fontSize:'0.9rem'}}>{new Date(session.startTime).toLocaleString()}</div>
        </div>
      </div>

      <button className="btn-danger btn-full" onClick={onEndSession}>
        🔴 End Session
      </button>
    </div>
  );
};

export default Dashboard;
