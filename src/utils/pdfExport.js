import { jsPDF } from 'jspdf';

export const exportToPDF = (session) => {
  const doc = new jsPDF();
  const { setup, transactions, endTime, startTime } = session;
  const soldLitres = transactions.reduce((s, t) => s + t.litres, 0);
  const totalRevenue = transactions.reduce((s, t) => s + t.revenue, 0);
  const totalCost = soldLitres * setup.costPrice;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const unsold = Math.max(0, setup.targetLitres - soldLitres);

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SMART FUEL SALES TRACKER', 105, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text('Session Report', 105, 30, { align: 'center' });

  // Session Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SESSION DETAILS', 14, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const infoRows = [
    ['Session ID', session.id],
    ['Fuel Type', setup.fuelType],
    ['Start Time', new Date(startTime).toLocaleString()],
    ['End Time', endTime ? new Date(endTime).toLocaleString() : 'Active'],
    ['Target Stock', `${setup.targetLitres} L`],
    ['Cost Per Litre', `₹${setup.costPrice.toFixed(2)}`],
    ['Total Investment', `₹${(setup.targetLitres * setup.costPrice).toFixed(2)}`],
  ];

  let y = 62;
  infoRows.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', 14, y);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), 80, y);
    y += 8;
  });

  // Financial Summary
  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 4, 182, 70, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL SUMMARY', 18, y + 4);
  y += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const financials = [
    ['Sold Litres', `${soldLitres.toFixed(2)} L`],
    ['Unsold Litres', `${unsold.toFixed(2)} L`],
    ['Total Revenue', `₹${totalRevenue.toFixed(2)}`],
    ['Total Cost', `₹${totalCost.toFixed(2)}`],
    ['Profit / Loss', `₹${profit.toFixed(2)}`],
    ['Profit Margin', `${margin.toFixed(2)}%`],
    ['Transactions', transactions.length],
  ];

  financials.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', 18, y);
    const isProfit = label === 'Profit / Loss';
    if (isProfit) {
      doc.setTextColor(profit >= 0 ? 22 : 220, profit >= 0 ? 163 : 38, profit >= 0 ? 74 : 38);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(String(value), 100, y);
    y += 8;
  });

  // Transaction Table
  y += 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TRANSACTION HISTORY', 14, y);
  y += 8;

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y - 4, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('#', 16, y + 2);
  doc.text('Date', 24, y + 2);
  doc.text('Time', 58, y + 2);
  doc.text('Type', 85, y + 2);
  doc.text('Litres', 120, y + 2);
  doc.text('Price/L', 145, y + 2);
  doc.text('Revenue', 170, y + 2);
  y += 12;

  doc.setFont('helvetica', 'normal');
  transactions.forEach((t, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 182, 8, 'F');
    }
    doc.setTextColor(15, 23, 42);
    const date = new Date(t.timestamp);
    doc.text(String(i + 1), 16, y);
    doc.text(date.toLocaleDateString(), 24, y);
    doc.text(date.toLocaleTimeString(), 58, y);
    doc.text(t.saleType, 85, y);
    doc.text(`${t.litres.toFixed(2)}`, 120, y);
    doc.text(`₹${t.sellingPrice.toFixed(2)}`, 145, y);
    doc.text(`₹${t.revenue.toFixed(2)}`, 170, y);
    y += 8;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Smart Fuel Sales Tracker — Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 295, { align: 'center' });
  }

  doc.save('fuel-report.pdf');
};
