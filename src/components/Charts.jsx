import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';

const Charts = ({ session }) => {
  const { transactions } = session;

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No Data Yet</h3>
        <p>Add sales transactions to see analytics charts.</p>
      </div>
    );
  }

  // Build daily aggregates
  const dailyMap = {};
  transactions.forEach(t => {
    const day = new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, litres: 0, transactions: 0, profit: 0 };
    dailyMap[day].revenue += t.revenue;
    dailyMap[day].litres += t.litres;
    dailyMap[day].transactions += 1;
    dailyMap[day].profit += t.revenue - (t.litres * session.setup.costPrice);
  });
  const dailyData = Object.values(dailyMap);

  // Build per-transaction data
  const txData = transactions.map((t, i) => ({
    tx: `T${i + 1}`,
    revenue: parseFloat(t.revenue.toFixed(2)),
    litres: parseFloat(t.litres.toFixed(2)),
    price: parseFloat(t.sellingPrice.toFixed(2)),
    profit: parseFloat((t.revenue - t.litres * session.setup.costPrice).toFixed(2)),
  }));

  const chartProps = {
    margin: { top: 5, right: 10, left: 0, bottom: 5 },
  };

  const tooltipStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '12px',
  };

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3 className="chart-title">📈 Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={txData} {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="tx" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">⛽ Litres Sold Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={txData} {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="tx" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v}L`} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}L`, 'Litres']} />
            <Bar dataKey="litres" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">💹 Profit Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={txData} {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="tx" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v}`, 'Profit']} />
            <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dailyData.length > 1 && (
        <div className="chart-card">
          <h3 className="chart-title">📅 Daily Transactions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;
