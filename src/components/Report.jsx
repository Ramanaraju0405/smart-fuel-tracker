import React from 'react';
import { calculations } from '../utils/calculations';
import { exportToPDF } from '../utils/pdfExport';
import { exportToCSV } from '../utils/csvExport';

const Report = ({ session, onNewSession }) => {
  const { setup, transactions, startTime, endTime } = session;
  const soldLitres = calculations.getSoldLitres(transactions);
  const unsold = Math.max(0, setup.targetLitres - soldLitres);
  const revenue = calculations.getTotalRevenue(transactions);
  const cost = calculations.getTotalCost(transactions, setup.costPrice);
  const profit = calculations.getProfit(transactions, setup.costPrice);
  const margin = calculations.getProfitMargin(transactions, setup.costPrice);
  const isProfit = profit >= 0;

  const duration = endTime
    ? Math.round((new Date(endTime) - new Date(startTime)) / 60000)
    : null;

  return (
    <div className="report-container">
      <div className={`profit-banner ${isProfit ? 'profit-positive' : 'profit-negative'}`}>
        <div className="banner-icon">{isProfit ? '🎉' : '📉'}</div>
        <div className="banner-content">
          <div className="banner-title">{isProfit ? 'Profitable Session!' : 'Loss This Session'}</div>
          <div className="banner-amount" style={{ color: isProfit ? '#22c55e' : '#ef4444' }}>
            {isProfit ? '+' : ''}₹{profit.toFixed(2)}
          </div>
          <div className="banner-sub">Margin: {margin.toFixed(2)}%</div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h3 className="section-head">📦 Stock Summary</h3>
          <div className="report-rows">
            {[
              ['Fuel Type', setup.fuelType],
              ['Total Stock', `${setup.targetLitres.toFixed(2)} L`],
              ['Sold Stock', `${soldLitres.toFixed(2)} L`],
              ['Unsold Stock', `${unsold.toFixed(2)} L`],
              ['Transactions', transactions.length],
            ].map(([l, v]) => (
              <div className="report-row" key={l}>
                <span className="row-label">{l}</span>
                <span className="row-value">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3 className="section-head">💰 Financial Summary</h3>
          <div className="report-rows">
            {[
              ['Total Revenue', `₹${revenue.toFixed(2)}`, 'neutral'],
              ['Total Cost', `₹${cost.toFixed(2)}`, 'neutral'],
              ['Total Profit', `${isProfit ? '+' : ''}₹${profit.toFixed(2)}`, isProfit ? 'pos' : 'neg'],
              ['Profit Margin', `${margin.toFixed(2)}%`, isProfit ? 'pos' : 'neg'],
              ['Avg Sale Price', `₹${calculations.getAverageSellingPrice(transactions).toFixed(2)}/L`, 'neutral'],
            ].map(([l, v, color]) => (
              <div className="report-row" key={l}>
                <span className="row-label">{l}</span>
                <span className={`row-value ${color === 'pos' ? 'text-green' : color === 'neg' ? 'text-red' : ''}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3 className="section-head">🕐 Session Timeline</h3>
          <div className="report-rows">
            {[
              ['Session ID', session.id.slice(0, 12) + '...'],
              ['Start Time', new Date(startTime).toLocaleString()],
              ['End Time', endTime ? new Date(endTime).toLocaleString() : '—'],
              ['Duration', duration != null ? `${duration} min` : '—'],
              ['Cost Per Litre', `₹${setup.costPrice.toFixed(2)}`],
            ].map(([l, v]) => (
              <div className="report-row" key={l}>
                <span className="row-label">{l}</span>
                <span className="row-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button className="btn-accent" onClick={() => exportToPDF(session)}>📄 Export PDF</button>
        <button className="btn-outline" onClick={() => exportToCSV(transactions, session.id)}>📥 Export CSV</button>
        <button className="btn-primary" onClick={onNewSession}>🚀 New Session</button>
      </div>
    </div>
  );
};

export default Report;
