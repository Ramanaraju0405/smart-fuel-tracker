export const calculations = {
  getSoldLitres: (transactions) =>
    transactions.reduce((sum, t) => sum + t.litres, 0),

  getTotalRevenue: (transactions) =>
    transactions.reduce((sum, t) => sum + t.revenue, 0),

  getTotalCost: (transactions, costPrice) => {
    const soldLitres = calculations.getSoldLitres(transactions);
    return soldLitres * costPrice;
  },

  getProfit: (transactions, costPrice) => {
    const revenue = calculations.getTotalRevenue(transactions);
    const cost = calculations.getTotalCost(transactions, costPrice);
    return revenue - cost;
  },

  getProfitMargin: (transactions, costPrice) => {
    const revenue = calculations.getTotalRevenue(transactions);
    if (revenue === 0) return 0;
    const profit = calculations.getProfit(transactions, costPrice);
    return (profit / revenue) * 100;
  },

  getRemainingStock: (targetLitres, transactions) => {
    const sold = calculations.getSoldLitres(transactions);
    return Math.max(0, targetLitres - sold);
  },

  getAverageSellingPrice: (transactions) => {
    if (transactions.length === 0) return 0;
    const totalRevenue = calculations.getTotalRevenue(transactions);
    const totalLitres = calculations.getSoldLitres(transactions);
    if (totalLitres === 0) return 0;
    return totalRevenue / totalLitres;
  },

  getTodayTransactions: (transactions) => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  },

  getMostSoldFuelType: (transactions) => {
    const counts = {};
    transactions.forEach(t => {
      counts[t.saleType] = (counts[t.saleType] || 0) + t.litres;
    });
    if (Object.keys(counts).length === 0) return 'N/A';
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  },
};
