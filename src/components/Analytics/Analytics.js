import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/calculations';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const { isDarkMode } = useTheme();
  const { transactions } = useData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Cash Flow Heatmap - which days drain money the most
  const getCashFlowHeatmap = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1)),
    });

    return daysInMonth.map(day => {
      const dayTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getDate() === day.getDate() &&
               tDate.getMonth() === day.getMonth() &&
               tDate.getFullYear() === day.getFullYear();
      });

      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        day: day.getDate(),
        dayName: format(day, 'EEE'),
        expenses,
        income,
        net: income - expenses,
        date: format(day, 'yyyy-MM-dd'),
      };
    });
  };

  // Lifestyle Inflation Tracker
  const getLifestyleInflationData = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      last6Months.push({
        month: format(date, 'MMM yyyy'),
        expenses,
      });
    }
    return last6Months;
  };

  // Needs vs Wants Classification
  const needsCategories = ['Bills', 'Transport', 'Food'];
  const wantsCategories = ['Entertainment', 'Shopping'];

  const getNeedsVsWants = () => {
    const monthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      const [year, month] = selectedMonth.split('-').map(Number);
      return tDate.getMonth() === month - 1 && 
             tDate.getFullYear() === year &&
             t.type === 'expense';
    });

    const needs = monthTransactions
      .filter(t => needsCategories.includes(t.category))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const wants = monthTransactions
      .filter(t => wantsCategories.includes(t.category))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const other = monthTransactions
      .filter(t => !needsCategories.includes(t.category) && !wantsCategories.includes(t.category))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return { needs, wants, other, total: needs + wants + other };
  };

  const heatmapData = getCashFlowHeatmap();
  const inflationData = getLifestyleInflationData();
  const needsVsWants = getNeedsVsWants();

  const getMaxExpense = () => {
    return Math.max(...heatmapData.map(d => d.expenses), 1);
  };

  const maxExpense = getMaxExpense();

  return (
    <div className={`analytics ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="analytics-header">
        <div>
          <h2>Advanced Analytics</h2>
          <p>Deep insights into your spending patterns and financial behavior</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-selector"
        />
      </div>

      <div className="analytics-section">
        <h3>Cash Flow Heatmap</h3>
        <p className="section-description">Visualize which days of the month drain money the most</p>
        <div className="heatmap-container">
          <div className="heatmap">
            {heatmapData.map((day) => {
              const intensity = day.expenses > 0 ? (day.expenses / maxExpense) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: day.expenses > 0
                      ? `rgba(255, 107, 107, ${Math.max(intensity / 100, 0.3)})`
                      : 'transparent',
                    border: day.expenses > 0 ? '2px solid #FF6B6B' : '1px solid',
                  }}
                  title={`${day.dayName} ${day.day}: ${formatCurrency(day.expenses)} spent`}
                >
                  <div className="day-number">{day.day}</div>
                  <div className="day-expense">{day.expenses > 0 ? formatCurrency(day.expenses) : ''}</div>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-gradient" />
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Lifestyle Inflation Tracker</h3>
        <p className="section-description">Detects if expenses rise after salary hikes or over time</p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={inflationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="Monthly Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {inflationData.length >= 2 && (
          <div className="inflation-insight">
            {(() => {
              const firstMonth = inflationData[0].expenses;
              const lastMonth = inflationData[inflationData.length - 1].expenses;
              const change = ((lastMonth - firstMonth) / firstMonth) * 100;
              
              if (change > 10) {
                return (
                  <p className="warning">
                    Notice: Your expenses have increased by {change.toFixed(1)}% over the last {inflationData.length} months.
                    This could indicate lifestyle inflation.
                  </p>
                );
              } else if (change < -10) {
                return (
                  <p className="success">
                    Positive Trend: Your expenses have decreased by {Math.abs(change).toFixed(1)}% over the last {inflationData.length} months.
                  </p>
                );
              } else {
                return (
                  <p className="info">
                    Stable: Your expenses are relatively stable, with a {change > 0 ? 'slight increase' : 'slight decrease'} of {Math.abs(change).toFixed(1)}%.
                  </p>
                );
              }
            })()}
          </div>
        )}
      </div>

      <div className="analytics-section">
        <h3>Needs vs Wants Split</h3>
        <p className="section-description">Automatically classify expenses and show ratio over time</p>
        <div className="needs-wants-grid">
          <div className="needs-wants-card needs">
            <div className="card-header">
              <h4>Needs</h4>
              <span className="percentage">
                {needsVsWants.total > 0 ? ((needsVsWants.needs / needsVsWants.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="amount">{formatCurrency(needsVsWants.needs)}</p>
            <div className="categories-list">
              {needsCategories.map(cat => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
            </div>
          </div>

          <div className="needs-wants-card wants">
            <div className="card-header">
              <h4>Wants</h4>
              <span className="percentage">
                {needsVsWants.total > 0 ? ((needsVsWants.wants / needsVsWants.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="amount">{formatCurrency(needsVsWants.wants)}</p>
            <div className="categories-list">
              {wantsCategories.map(cat => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
            </div>
          </div>

          <div className="needs-wants-card other">
            <div className="card-header">
              <h4>Other</h4>
              <span className="percentage">
                {needsVsWants.total > 0 ? ((needsVsWants.other / needsVsWants.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="amount">{formatCurrency(needsVsWants.other)}</p>
            <p className="card-description">Uncategorized or other expenses</p>
          </div>
        </div>

        <div className="ratio-chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Needs', value: needsVsWants.needs, fill: '#6BCB77' },
              { name: 'Wants', value: needsVsWants.wants, fill: '#FF6B6B' },
              { name: 'Other', value: needsVsWants.other, fill: '#4D96FF' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

