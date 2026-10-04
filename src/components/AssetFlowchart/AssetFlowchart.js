import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './AssetFlowchart.css';

const AssetFlowchart = () => {
  const { isDarkMode } = useTheme();
  const { assets } = useData();
  const [selectedAsset, setSelectedAsset] = useState(null);

  const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);

  const chartData = assets.map(asset => ({
    name: asset.name,
    value: parseFloat(asset.currentValue || 0),
    profitLoss: parseFloat(asset.profitLoss || 0),
    profitLossPercent: parseFloat(asset.profitLossPercent || 0),
  }));

  const COLORS = ['darkblue', 'blue', 'goldenrod', '#6699ff', '#3366cc', '#99ccff', '#ffcc00'];

  const getAIRecommendation = (asset) => {
    const profitLossPercent = parseFloat(asset.profitLossPercent || 0);

    let recommendation = 'HOLD';
    let reason = '';
    let confidence = 'Medium';

    if (profitLossPercent > 20) {
      recommendation = 'SELL';
      reason = `This asset has gained ${profitLossPercent.toFixed(2)}%. Consider taking partial profits to lock in gains.`;
      confidence = 'High';
    } else if (profitLossPercent > 10) {
      recommendation = 'HOLD';
      reason = `Strong performance with ${profitLossPercent.toFixed(2)}% gains. Continue monitoring for profit-taking opportunities.`;
      confidence = 'Medium';
    } else if (profitLossPercent < -15) {
      recommendation = 'HOLD';
      reason = `Asset is down ${Math.abs(profitLossPercent).toFixed(2)}%. Avoid panic selling. Consider if fundamentals are still intact.`;
      confidence = 'Medium';
    } else if (profitLossPercent < -10) {
      recommendation = 'REVIEW';
      reason = `Moderate decline of ${Math.abs(profitLossPercent).toFixed(2)}%. Review your investment thesis and market conditions.`;
      confidence = 'Low';
    } else {
      recommendation = 'HOLD';
      reason = `Performance is within normal range. Continue holding based on your investment strategy.`;
      confidence = 'Low';
    }

    return { recommendation, reason, confidence };
  };

  const renderRecommendation = (asset) => {
    const { recommendation, reason, confidence } = getAIRecommendation(asset);
    const recommendationColors = {
      SELL: '#FF6B6B',
      HOLD: '#6BCB77',
      REVIEW: '#FFA726',
    };

    return (
      <div className="recommendation-card">
        <div className="recommendation-header">
          <h4>{asset.name} - AI Recommendation</h4>
          <span
            className="recommendation-badge"
            style={{ backgroundColor: recommendationColors[recommendation] }}
          >
            {recommendation}
          </span>
        </div>
        <div className="recommendation-details">
          <div className="confidence-badge">
            Confidence: {confidence}
          </div>
          <p className="reason">{reason}</p>
          <div className="asset-metrics">
            <div className="metric">
              <span>Current Value:</span>
              <span>{formatCurrency(asset.value)}</span>
            </div>
            <div className="metric">
              <span>P/L:</span>
              <span className={asset.profitLoss >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(asset.profitLoss)} ({asset.profitLossPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`asset-flowchart ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="flowchart-header">
        <h2>Asset Flowchart & AI Recommendations</h2>
        <p>Visualize your portfolio and get AI-powered investment recommendations</p>
      </div>

      <div className="flowchart-content">
        <div className="chart-section">
          <h3>Current Asset Allocation</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No assets added yet. Add assets in the Portfolio section.</p>
            </div>
          )}

          <div className="total-value-box">
            <h4>Total Portfolio Value</h4>
            <p className="total-amount">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="recommendations-section">
          <h3>AI Recommendations</h3>
          <div className="recommendations-list">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="asset-item">
                  <div
                    className="asset-summary"
                    onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                  >
                    <div className="asset-info">
                      <h4>{asset.name}</h4>
                      <span className="asset-type">{asset.type}</span>
                    </div>
                    <div className="asset-value">
                      <span className="value">{formatCurrency(asset.currentValue)}</span>
                      <span className={`pl ${parseFloat(asset.profitLoss) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(asset.profitLoss) >= 0 ? '+' : ''}{asset.profitLossPercent}%
                      </span>
                    </div>
                  </div>
                  {selectedAsset?.id === asset.id && renderRecommendation(asset)}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Add assets to get AI recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetFlowchart;

