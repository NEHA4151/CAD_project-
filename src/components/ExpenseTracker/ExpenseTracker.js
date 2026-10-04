import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/calculations';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrashIcon } from '../common/Icons';
import './ExpenseTracker.css';

const ExpenseTracker = () => {
  const { isDarkMode } = useTheme();
  const { transactions, categories, addTransaction, deleteTransaction } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // month, year, category
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [runExpenseTour, setRunExpenseTour] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    merchant: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  useEffect(() => {
    const hasCompletedExpenseTour = localStorage.getItem('expenseTourCompleted') === 'true';
    if (!hasCompletedExpenseTour && transactions && transactions.length === 0) {
      const timer = setTimeout(() => {
        setRunExpenseTour(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const expenseTourSteps = [
    {
      target: '.add-transaction-btn',
      content: 'Welcome to Expenses! Let\'s add your first transaction here.',
      placement: 'bottom',
      disableBeacon: true,
    }
  ];

  const handleExpenseTourCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunExpenseTour(false);
      localStorage.setItem('expenseTourCompleted', 'true');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction(formData);
    setFormData({
      type: 'expense',
      amount: '',
      merchant: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    });
    setShowAddForm(false);
  };

  const getFilteredTransactions = () => {
    if (viewMode === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      return transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getMonth() === month - 1 && tDate.getFullYear() === year;
      });
    } else if (viewMode === 'year') {
      const year = parseInt(selectedYear);
      return transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getFullYear() === year;
      });
    }
    return transactions;
  };

  const filteredTransactions = getFilteredTransactions();
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const netEarning = income - expenses;

  const expenseByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount || 0);
      return acc;
    }, {});

  const chartData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const expenseColors = ['darkblue', 'blue', 'goldenrod', '#6699ff', '#3366cc', '#99ccff', '#ffcc00', '#000080'];

  // Monthly comparison data
  const getMonthlyComparison = () => {
    const months = eachMonthOfInterval({
      start: startOfMonth(new Date(new Date().getFullYear() - 1, 0)),
      end: endOfMonth(new Date()),
    });

    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        month: format(month, 'MMM yyyy'),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      };
    });
  };

  const monthlyData = getMonthlyComparison();

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className={`expense-tracker ${isDarkMode ? 'dark' : 'light'}`}>
      <Joyride
        callback={handleExpenseTourCallback}
        continuous
        hideCloseButton
        run={runExpenseTour}
        showProgress
        showSkipButton
        steps={expenseTourSteps}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#4ECDC4',
            backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
            textColor: isDarkMode ? '#ffffff' : '#333333',
            arrowColor: isDarkMode ? '#2d2d2d' : '#ffffff',
          },
          buttonNext: { backgroundColor: '#4ECDC4', borderRadius: '8px', color: '#fff' },
          buttonBack: { color: isDarkMode ? '#ccc' : '#666' },
          buttonSkip: { color: isDarkMode ? '#999' : '#999' }
        }}
        locale={{ last: 'Got it!' }}
      />
      <div className="expense-header">
        <div>
          <h2>Expense & Earning Tracker</h2>
          <p>Monitor your income, expenses, and net earnings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary add-transaction-btn"
        >
          + Add Transaction
        </button>
      </div>

      <div className="view-controls">
        <button
          onClick={() => setViewMode('month')}
          className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
        >
          Month
        </button>
        <button
          onClick={() => setViewMode('year')}
          className={`view-btn ${viewMode === 'year' ? 'active' : ''}`}
        >
          Year
        </button>
        <button
          onClick={() => setViewMode('category')}
          className={`view-btn ${viewMode === 'category' ? 'active' : ''}`}
        >
          Category
        </button>
        {viewMode === 'month' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="date-input"
          />
        )}
        {viewMode === 'year' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Total Income</h3>
          <p className="amount">{formatCurrency(income)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Total Expenses</h3>
          <p className="amount">{formatCurrency(expenses)}</p>
        </div>
        <div className={`summary-card ${netEarning >= 0 ? 'profit' : 'loss'}`}>
          <h3>Net Earning</h3>
          <p className="amount">{formatCurrency(netEarning)}</p>
        </div>
      </div>

      {showAddForm && (
        <div className="add-transaction-form">
          <h3>Add Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Merchant/Description</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  required
                  placeholder="e.g., Zomato, Salary, etc."
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {formData.type === 'income'
                    ? categories.filter(c => c.type === 'income').map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                    : expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add Transaction</button>
            </div>
          </form>
        </div>
      )}

      <div className="charts-section">
        <div className="chart-card">
          <h3>Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#6BCB77" name="Income" />
              <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
              <Bar dataKey="net" fill="#4D96FF" name="Net" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Expenses by Category</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No expense data available</p>
          )}
        </div>
      </div>

      <div className="transaction-list-section">
        <h3>Transactions</h3>
        <div className="transactions-table">
          <div className="table-header">
            <div>Date</div>
            <div>Merchant</div>
            <div>Category</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="table-row">
                <div>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</div>
                <div>{transaction.merchant}</div>
                <div>
                  <span className="category-badge" style={{
                    backgroundColor: categories.find(c => c.name === transaction.category)?.color || '#888'
                  }}>
                    {transaction.category}
                  </span>
                </div>
                <div>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </div>
                <div className={transaction.type === 'income' ? 'amount income' : 'amount expense'}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <div className="actions">
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="delete-btn"
                    title="Delete"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No transactions found for the selected period</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;

