import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, calculateNetWorth, calculateMonthlyBalance } from '../../utils/calculations';
import {
  WalletIcon,
  TrendingUpIcon,
  DollarIcon,
  ReceiptIcon,
  BarChartIcon,
  TargetIcon
} from '../common/Icons';
import './Dashboard.css';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { assets, transactions } = useData();

  const netWorth = calculateNetWorth(assets, transactions);
  const currentMonthBalance = calculateMonthlyBalance(transactions);

  const totalAssets = assets.reduce((sum, asset) => sum + (parseFloat(asset.currentValue) || 0), 0);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return (
    <div className={`dashboard ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back! Here's your financial snapshot</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><WalletIcon size={24} /></div>
          <div className="stat-content">
            <h3>Net Worth</h3>
            <p className="stat-value">{formatCurrency(netWorth)}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><TrendingUpIcon size={24} /></div>
          <div className="stat-content">
            <h3>Total Assets</h3>
            <p className="stat-value">{formatCurrency(totalAssets)}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon"><DollarIcon size={24} /></div>
          <div className="stat-content">
            <h3>Monthly Income</h3>
            <p className="stat-value">{formatCurrency(monthlyIncome)}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><ReceiptIcon size={24} /></div>
          <div className="stat-content">
            <h3>Monthly Expenses</h3>
            <p className="stat-value">{formatCurrency(monthlyExpenses)}</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon"><BarChartIcon size={24} /></div>
          <div className="stat-content">
            <h3>Current Balance</h3>
            <p className="stat-value">{formatCurrency(currentMonthBalance)}</p>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon"><TargetIcon size={24} /></div>
          <div className="stat-content">
            <h3>Savings Rate</h3>
            <p className="stat-value">
              {monthlyIncome > 0
                ? `${((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-merchant">{transaction.merchant}</span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                <span className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="empty-state" style={{ minHeight: '50px' }}>No transactions yet. Add your first transaction!</p>
            )}
          </div>
        </div>

        <div className="section-card">
          <h3>Asset Allocation</h3>
          <div className="asset-allocation" style={{ minHeight: '50px' }}>
            {assets.length > 0 ? (
              assets.map((asset) => {
                const percentage = totalAssets > 0 ? (asset.currentValue / totalAssets * 100).toFixed(1) : 0;
                return (
                  <div key={asset.id} className="allocation-item">
                    <div className="allocation-header">
                      <span>{asset.name}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="allocation-bar">
                      <div
                        className="allocation-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-state">No assets added yet. Add your first asset!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

