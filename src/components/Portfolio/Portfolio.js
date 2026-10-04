import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/calculations';
import { BarChartIcon, TrendingUpIcon, PieChartIcon } from '../common/Icons';
import './Portfolio.css';

const Portfolio = () => {
  const { isDarkMode } = useTheme();
  const { assets, addAsset, deleteAsset } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'equity',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    broker: '',
    brokerAccountId: '',
  });

  const assetTypes = [
    { value: 'equity', label: 'Equity/Stocks' },
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'etf', label: 'ETF' },
  ];

  const brokers = ['Zerodha', 'Groww', 'Upstox', 'Angel One', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentValue = parseFloat(formData.currentPrice) * parseFloat(formData.quantity);
    const investmentAmount = parseFloat(formData.purchasePrice) * parseFloat(formData.quantity);
    const profitLoss = currentValue - investmentAmount;
    const profitLossPercent = investmentAmount > 0 ? (profitLoss / investmentAmount * 100).toFixed(2) : 0;

    addAsset({
      ...formData,
      currentValue: currentValue.toFixed(2),
      investmentAmount: investmentAmount.toFixed(2),
      profitLoss: profitLoss.toFixed(2),
      profitLossPercent,
    });

    setFormData({
      name: '',
      type: 'equity',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      broker: '',
      brokerAccountId: '',
    });
    setShowAddForm(false);
  };

  const handleBrokerIntegration = (broker) => {
    alert(`Integration with ${broker} would be implemented here. This requires API keys and OAuth authentication from the broker.`);
  };

  const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);
  const totalInvestment = assets.reduce((sum, asset) => sum + parseFloat(asset.investmentAmount || 0), 0);
  const totalProfitLoss = assets.reduce((sum, asset) => sum + parseFloat(asset.profitLoss || 0), 0);

  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) acc[asset.type] = [];
    acc[asset.type].push(asset);
    return acc;
  }, {});

  return (
    <div className={`portfolio ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="portfolio-header">
        <div>
          <h2>Portfolio</h2>
          <p>Track your investments across different asset classes</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="btn btn-secondary"
          >
            Link Broker Account
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            + Add Asset
          </button>
        </div>
      </div>

      <div className="portfolio-stats">
        <div className="stat-box">
          <h3>Total Portfolio Value</h3>
          <p className="stat-value">{formatCurrency(totalValue)}</p>
        </div>
        <div className="stat-box">
          <h3>Total Investment</h3>
          <p className="stat-value">{formatCurrency(totalInvestment)}</p>
        </div>
        <div className="stat-box">
          <h3>Profit/Loss</h3>
          <p className={`stat-value ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalProfitLoss)} ({((totalProfitLoss / (totalInvestment || 1)) * 100).toFixed(2)}%)
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="add-asset-form">
          <h3>Add New Asset</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Broker</label>
                <select
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                >
                  <option value="">Select Broker</option>
                  {brokers.map(broker => (
                    <option key={broker} value={broker}>{broker}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Account ID (Optional)</label>
                <input
                  type="text"
                  value={formData.brokerAccountId}
                  onChange={(e) => setFormData({ ...formData, brokerAccountId: e.target.value })}
                  placeholder="For tracking purposes"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Asset
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showIntegrationModal && (
        <div className="modal-overlay" onClick={() => setShowIntegrationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Link Broker Account</h3>
            <p>Connect your broker account to automatically sync portfolio data</p>
            <div className="broker-list">
              <div className="broker-item" onClick={() => handleBrokerIntegration('Zerodha')}>
                <div className="broker-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChartIcon size={20} /></div>
                <div className="broker-info">
                  <h4>Zerodha</h4>
                  <p>Connect via Kite Connect API</p>
                </div>
                <div className="broker-status">Not Connected</div>
              </div>
              <div className="broker-item" onClick={() => handleBrokerIntegration('Groww')}>
                <div className="broker-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUpIcon size={20} /></div>
                <div className="broker-info">
                  <h4>Groww</h4>
                  <p>Connect via Groww API</p>
                </div>
                <div className="broker-status">Not Connected</div>
              </div>
              <div className="broker-item" onClick={() => handleBrokerIntegration('Upstox')}>
                <div className="broker-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PieChartIcon size={20} /></div>
                <div className="broker-info">
                  <h4>Upstox</h4>
                  <p>Connect via Upstox API</p>
                </div>
                <div className="broker-status">Not Connected</div>
              </div>
            </div>
            <p className="integration-note">
              <strong>Note:</strong> API integration requires authentication tokens from your broker.
              For security, this feature should be implemented with proper OAuth2 flow and secure storage of API keys.
            </p>
            <button onClick={() => setShowIntegrationModal(false)} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="assets-by-type">
        {Object.entries(assetsByType).map(([type, typeAssets]) => (
          <div key={type} className="asset-type-section">
            <h3>{assetTypes.find(t => t.value === type)?.label || type}</h3>
            <div className="assets-grid">
              {typeAssets.map((asset) => (
                <div key={asset.id} className="asset-card">
                  <div className="asset-header">
                    <h4>{asset.name}</h4>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="delete-btn"
                      title="Delete asset"
                    >
                      ×
                    </button>
                  </div>
                  <div className="asset-details">
                    <div className="asset-row">
                      <span>Quantity:</span>
                      <span>{asset.quantity}</span>
                    </div>
                    <div className="asset-row">
                      <span>Current Value:</span>
                      <span className="value">{formatCurrency(asset.currentValue)}</span>
                    </div>
                    <div className="asset-row">
                      <span>Investment:</span>
                      <span>{formatCurrency(asset.investmentAmount)}</span>
                    </div>
                    <div className="asset-row">
                      <span>P/L:</span>
                      <span className={parseFloat(asset.profitLoss) >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(asset.profitLoss)} ({asset.profitLossPercent}%)
                      </span>
                    </div>
                    {asset.broker && (
                      <div className="asset-row">
                        <span>Broker:</span>
                        <span>{asset.broker}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="empty-state">
          <p>No assets added yet. Click "Add Asset" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
