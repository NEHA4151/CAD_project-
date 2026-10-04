import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, detectAnomaly, detectRecurringExpenses, predictMonthEndBalance, calculateMonthlyBalance } from '../../utils/calculations';
import { format, parseISO } from 'date-fns';
import { AlertTriangleIcon, RefreshIcon, TrendingUpIcon, SparklesIcon, CheckCircleIcon } from '../common/Icons';
import './SmartInsights.css';

const SmartInsights = () => {
  const { isDarkMode } = useTheme();
  const { transactions } = useData();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthTransactions = transactions.filter(t => {
    const tDate = parseISO(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  // Anomaly Detection
  const categoryExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount || 0);
      return acc;
    }, {});

  const anomalies = Object.entries(categoryExpenses)
    .map(([category, amount]) => detectAnomaly(transactions, category, amount))
    .filter(a => a !== null);

  // Recurring Expenses
  const recurring = detectRecurringExpenses(transactions);

  // Predictive Balance
  const currentBalance = calculateMonthlyBalance(transactions);
  const predictedBalance = predictMonthEndBalance(transactions, currentBalance);

  // Auto-categorization learning status
  const learnedCount = Object.keys(transactions.reduce((acc, t) => {
    if (t.merchant) acc[t.merchant.toLowerCase()] = true;
    return acc;
  }, {})).length;

  return (
    <div className={`smart-insights ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="insights-header">
        <h2>Smart Insights & Automation</h2>
        <p>AI-powered insights to help you make better financial decisions</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon"><AlertTriangleIcon size={24} /></div>
          <h3>Spending Anomaly Detection</h3>
          <div className="anomalies-list">
            {anomalies.length > 0 ? (
              anomalies.map((anomaly, index) => (
                <div key={index} className="anomaly-item">
                  <div className="anomaly-header">
                    <span className="category-name">{anomaly.category}</span>
                    <span className={`change-badge ${anomaly.change > 0 ? 'increase' : 'decrease'}`}>
                      {anomaly.change > 0 ? '↑' : '↓'} {Math.abs(anomaly.change)}%
                    </span>
                  </div>
                  <div className="anomaly-details">
                    <span>This month: {formatCurrency(anomaly.currentAmount)}</span>
                    <span>Last month: {formatCurrency(anomaly.lastMonthAmount)}</span>
                  </div>
                  <p className="anomaly-alert">
                    {anomaly.category} spending is {Math.abs(anomaly.change)}% {anomaly.change > 0 ? 'higher' : 'lower'} than last month.
                  </p>
                </div>
              ))
            ) : (
              <p className="no-anomalies">No significant anomalies detected. Your spending patterns are consistent.</p>
            )}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon"><RefreshIcon size={24} /></div>
          <h3>Recurring Expense Detector</h3>
          <div className="recurring-list">
            {recurring.length > 0 ? (
              recurring.map((expense, index) => (
                <div key={index} className="recurring-item">
                  <div className="recurring-header">
                    <span className="merchant-name">{expense.merchant}</span>
                    <span className="frequency-badge">{expense.frequency}</span>
                  </div>
                  <div className="recurring-details">
                    <span>Avg: {formatCurrency(expense.averageAmount)}</span>
                    <span>Count: {expense.count} transactions</span>
                  </div>
                  <div className="recurring-category">
                    Category: {expense.category}
                  </div>
                  <div className="last-transaction">
                    Last: {format(parseISO(expense.lastTransaction), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-recurring">No recurring expenses detected yet. Keep adding transactions!</p>
            )}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon"><TrendingUpIcon size={24} /></div>
          <h3>Predictive Monthly Balance</h3>
          <div className="prediction-content">
            <div className="current-balance">
              <h4>Current Balance</h4>
              <p className="balance-amount">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="predicted-balance">
              <h4>Predicted End-of-Month Balance</h4>
              <p className={`balance-amount ${predictedBalance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(predictedBalance)}
              </p>
              <p className="prediction-note">
                Based on your current spending rate ({format(new Date(), 'MMM dd')})
              </p>
            </div>
            {predictedBalance < 0 && (
              <div className="warning-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangleIcon size={18} />
                <span>You may overspend this month. Consider reducing non-essential expenses.</span>
              </div>
            )}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon"><SparklesIcon size={24} /></div>
          <h3>Auto-Categorization Learning</h3>
          <div className="learning-content">
            <div className="learning-stats">
              <div className="stat-item">
                <span className="stat-label">Merchants Learned</span>
                <span className="stat-value">{learnedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Transactions</span>
                <span className="stat-value">{transactions.length}</span>
              </div>
            </div>
            <div className="learning-info">
              <p>
                The system automatically categorizes transactions based on merchant names.
                When you manually change a category, it learns and improves future categorizations.
              </p>
              <div className="learning-features">
                <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircleIcon size={14} /> Auto-detects food delivery apps
                </div>
                <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircleIcon size={14} /> Recognizes transport services
                </div>
                <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircleIcon size={14} /> Learns from your corrections
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;

