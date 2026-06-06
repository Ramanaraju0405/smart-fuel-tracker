import Papa from 'papaparse';

export const exportToCSV = (transactions, sessionId) => {
  const rows = transactions.map((t, i) => ({
    'Transaction #': i + 1,
    'Date': new Date(t.timestamp).toLocaleDateString(),
    'Time': new Date(t.timestamp).toLocaleTimeString(),
    'Sale Type': t.saleType,
    'Litres Sold': t.litres.toFixed(2),
    'Selling Price Per Litre': t.sellingPrice.toFixed(2),
    'Revenue (₹)': t.revenue.toFixed(2),
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fuel-transactions-${sessionId || Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
