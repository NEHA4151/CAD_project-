import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, calculateNetWorth } from '../../utils/calculations';
import { format, parseISO, subMonths, eachMonthOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangleIcon } from '../common/Icons';
import './Investments.css';

const Investments = () => {
  const { isDarkMode } = useTheme();
  const { assets, transactions } = useData();
  const [timeRange, setTimeRange] = useState('6months');

  // Net Worth Timeline
  const getNetWorthTimeline = () => {
    const months = parseInt(timeRange.replace('months', ''));
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    const monthArray = eachMonthOfInterval({ start: startDate, end: endDate });

    // This would ideally calculate net worth for each month
    // For demo, we'll simulate based on current data
    return monthArray.map((month, index) => {
      const currentNetWorth = calculateNetWorth(assets, transactions);
      // Simulate growth (in real app, this would use historical data)
      const simulatedNetWorth = currentNetWorth * (1 - (months - index) * 0.02);
      return {
        month: format(month, 'MMM yyyy'),
        netWorth: Math.max(simulatedNetWorth, 0),
      };
    });
  };

  const netWorthData = getNetWorthTimeline();
  const currentNetWorth = calculateNetWorth(assets, transactions);

  // Asset Allocation
  const totalAssetsValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);

  const assetAllocation = assets.reduce((acc, asset) => {
    const type = asset.type || 'other';
    if (!acc[type]) {
      acc[type] = { type, value: 0, count: 0 };
    }
    acc[type].value += parseFloat(asset.currentValue || 0);
    acc[type].count += 1;
    return acc;
  }, {});

  const allocationData = Object.values(assetAllocation).map(item => ({
    name: item.type.replace('_', ' ').toUpperCase(),
    value: item.value,
    count: item.count,
  }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];

  // Target Allocation (user-defined ideal allocation)
  const targetAllocation = {
    equity: 50,
    mutual_fund: 30,
    bonds: 15,
    etf: 5,
  };

  // Asset Allocation Drift Detection
  const checkAllocationDrift = () => {
    const drifts = [];
    Object.entries(assetAllocation).forEach(([type, data]) => {
      const currentPercent = totalAssetsValue > 0 ? (data.value / totalAssetsValue) * 100 : 0;
      const targetPercent = targetAllocation[type] || 0;
      const drift = currentPercent - targetPercent;

      if (Math.abs(drift) > 5) {
        drifts.push({
          type,
          current: currentPercent.toFixed(1),
          target: targetPercent,
          drift: drift.toFixed(1),
          status: drift > 0 ? 'over' : 'under',
        });
      }
    });
    return drifts;
  };

  const allocationDrifts = checkAllocationDrift();

  // Missed Investment Alert (checks for recurring investments)
  const checkMissedInvestments = () => {
    // This would check if scheduled SIPs or recurring investments were made
    // For demo, we'll show a placeholder
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const thisMonthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear && t.type === 'income';
    });

    // Simulated check - in real app, this would check against scheduled investments
    if (thisMonthTransactions.length < 1) {
      return [{
        type: 'SIP',
        message: 'No investment detected this month. Did you miss your SIP?',
        lastDate: 'N/A',
      }];
    }

    return [];
  };

  const missedInvestments = checkMissedInvestments();

  return (
    <div className={`investments ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="investments-header">
        <div>
          <h2>Investments & Net Worth</h2>
          <p>Track your net worth and monitor investment performance</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => window.open('https://www.google.com/search?q=asset+news', '_blank')}
            style={{ padding: '8px 16px', borderRadius: '6px', background: '#4ECDC4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Asset News (Google)
          </button>
          <button
            onClick={() => window.open('https://www.google.com/search?q=stock+market+news', '_blank')}
            style={{ padding: '8px 16px', borderRadius: '6px', background: '#2E8B57', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Market News (Google)
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>

      <div className="net-worth-section">
        <div className="net-worth-card">
          <h3>Current Net Worth</h3>
          <p className="net-worth-value">{formatCurrency(currentNetWorth)}</p>
          <div className="net-worth-breakdown">
            <div className="breakdown-item">
              <span>Assets:</span>
              <span className="positive">{formatCurrency(totalAssetsValue)}</span>
            </div>
            <div className="breakdown-item">
              <span>Liabilities:</span>
              <span className="negative">
                {formatCurrency(totalAssetsValue - currentNetWorth)}
              </span>
            </div>
          </div>
        </div>

        <div className="net-worth-chart">
          <h3>Net Worth Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#667eea"
                strokeWidth={3}
                name="Net Worth"
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="allocation-section">
        <h3>Asset Allocation</h3>
        <div className="allocation-content">
          <div className="allocation-chart">
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No assets to display</div>
            )}
          </div>

          <div className="allocation-list">
            {allocationData.map((item, index) => {
              const percent = totalAssetsValue > 0 ? (item.value / totalAssetsValue * 100).toFixed(1) : 0;
              return (
                <div key={index} className="allocation-item">
                  <div className="allocation-header">
                    <span className="allocation-name">{item.name}</span>
                    <span className="allocation-percent">{percent}%</span>
                  </div>
                  <div className="allocation-bar">
                    <div
                      className="allocation-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <div className="allocation-details">
                    <span>{formatCurrency(item.value)}</span>
                    <span>{item.count} asset{item.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
            {allocationData.length === 0 && (
              <div className="empty-state">Add assets in Portfolio to see allocation</div>
            )}
          </div>
        </div>
      </div>

      {allocationDrifts.length > 0 && (
        <div className="drift-alerts">
          <h3>Asset Allocation Drift Alerts</h3>
          <p className="section-description">Your portfolio has deviated from target allocation</p>
          {allocationDrifts.map((drift, index) => (
            <div key={index} className="drift-alert">
              <div className="drift-header">
                <span className="drift-type">{drift.type.toUpperCase().replace('_', ' ')}</span>
                <span className={`drift-status ${drift.status}`}>
                  {drift.status === 'over' ? '↑ Over-allocated' : '↓ Under-allocated'}
                </span>
              </div>
              <div className="drift-details">
                <span>Current: {drift.current}%</span>
                <span>Target: {drift.target}%</span>
                <span>Drift: {drift.drift > 0 ? '+' : ''}{drift.drift}%</span>
              </div>
              <p className="drift-recommendation">
                {drift.status === 'over'
                  ? `Consider rebalancing by reducing ${drift.type} allocation`
                  : `Consider increasing ${drift.type} allocation`}
              </p>
            </div>
          ))}
        </div>
      )}

      {missedInvestments.length > 0 && (
        <div className="missed-investments">
          <h3>Missed Investment Alerts</h3>
          {missedInvestments.map((investment, index) => (
            <div key={index} className="missed-alert">
              <div className="alert-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangleIcon size={20} />
              </div>
              <div className="alert-content">
                <h4>{investment.type} Alert</h4>
                <p>{investment.message}</p>
                <span className="alert-date">Last investment: {investment.lastDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Investments;

