export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const calculateNetWorth = (assets, transactions) => {
  const totalAssets = assets.reduce((sum, asset) => sum + (parseFloat(asset.currentValue) || 0), 0);
  const totalLiabilities = transactions
    .filter(t => t.type === 'liability' || (t.type === 'expense' && t.category === 'Loan'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  return totalAssets - totalLiabilities;
};

export const calculateMonthlyBalance = (transactions, month = null, year = null) => {
  const currentDate = new Date();
  const targetMonth = month !== null ? month : currentDate.getMonth();
  const targetYear = year !== null ? year : currentDate.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === targetMonth && 
           transactionDate.getFullYear() === targetYear;
  });

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return income - expenses;
};

export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

export const detectAnomaly = (transactions, category, currentAmount) => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const lastMonthExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.category === category && 
             t.type === 'expense' &&
             tDate.getMonth() === lastMonth.getMonth() &&
             tDate.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (lastMonthExpenses === 0) return null;

  const percentageChange = ((currentAmount - lastMonthExpenses) / lastMonthExpenses) * 100;
  
  if (Math.abs(percentageChange) > 30) {
    return {
      category,
      currentAmount,
      lastMonthAmount: lastMonthExpenses,
      change: percentageChange.toFixed(1),
    };
  }

  return null;
};

export const detectRecurringExpenses = (transactions) => {
  const merchantFrequency = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const merchant = t.merchant?.toLowerCase() || '';
      if (!merchantFrequency[merchant]) {
        merchantFrequency[merchant] = [];
      }
      merchantFrequency[merchant].push(t);
    });

  const recurring = Object.entries(merchantFrequency)
    .filter(([_, transactions]) => transactions.length >= 2)
    .map(([merchant, transactions]) => {
      const sorted = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      const avgAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) / transactions.length;
      const lastDate = new Date(sorted[0].date);
      const secondLastDate = new Date(sorted[1].date);
      const daysDiff = Math.abs((lastDate - secondLastDate) / (1000 * 60 * 60 * 24));

      return {
        merchant: sorted[0].merchant,
        category: sorted[0].category,
        averageAmount: avgAmount,
        frequency: daysDiff <= 35 ? 'Monthly' : daysDiff <= 8 ? 'Weekly' : 'Irregular',
        count: transactions.length,
        lastTransaction: sorted[0].date,
      };
    });

  return recurring;
};

export const predictMonthEndBalance = (transactions, currentBalance) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  const currentMonthExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' &&
             tDate.getMonth() === now.getMonth() &&
             tDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const dailyAverage = currentMonthExpenses / daysPassed;
  const predictedExpenses = dailyAverage * daysRemaining;
  
  return currentBalance - predictedExpenses;
};

export const calculateEmergencyFundScore = (transactions, monthlyExpenses) => {
  const currentBalance = calculateMonthlyBalance(transactions);
  const monthsCovered = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : 0;
  
  let score = 0;
  if (monthsCovered >= 6) score = 100;
  else if (monthsCovered >= 3) score = 75;
  else if (monthsCovered >= 1) score = 50;
  else if (monthsCovered > 0) score = 25;
  
  return {
    score,
    monthsCovered: monthsCovered.toFixed(1),
    status: monthsCovered >= 6 ? 'Excellent' : monthsCovered >= 3 ? 'Good' : monthsCovered >= 1 ? 'Fair' : 'Poor',
  };
};

