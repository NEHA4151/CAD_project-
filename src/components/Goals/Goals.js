import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, calculateEmergencyFundScore, calculateMonthlyBalance } from '../../utils/calculations';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Goals.css';

const Goals = () => {
  const { isDarkMode } = useTheme();
  const { goals, transactions, addGoal, updateGoal, deleteGoal } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    type: 'save',
    dailyAmount: '',
  });

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      const tDate = parseISO(t.date);
      const now = new Date();
      if (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()) {
        return sum + parseFloat(t.amount || 0);
      }
      return sum;
    }, 0);

  const currentBalance = calculateMonthlyBalance(transactions);
  const emergencyFund = calculateEmergencyFundScore(transactions, monthlyExpenses);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dailyAmount = formData.dailyAmount ? parseFloat(formData.dailyAmount) : null;
    addGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || 0),
      dailyAmount,
    });
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      type: 'save',
      dailyAmount: '',
    });
    setShowAddForm(false);
  };

  const goalProgressData = goals.map(goal => ({
    name: goal.name,
    current: goal.currentAmount,
    target: goal.targetAmount,
    progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0),
  }));

  return (
    <div className={`goals ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="goals-header">
        <div>
          <h2>Goal-Based Finance</h2>
          <p>Set and track your financial goals with micro-saving strategies</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          + Add Goal
        </button>
      </div>

      <div className="emergency-fund-section">
        <h3>Emergency Fund Health Score</h3>
        <div className="emergency-fund-card">
          <div className="score-circle">
            <div className="score-value">{emergencyFund.score}</div>
            <div className="score-label">Score</div>
          </div>
          <div className="emergency-fund-details">
            <div className="detail-item">
              <span>Months Covered:</span>
              <span className="value">{emergencyFund.monthsCovered} months</span>
            </div>
            <div className="detail-item">
              <span>Status:</span>
              <span className={`status-badge ${emergencyFund.status.toLowerCase()}`}>
                {emergencyFund.status}
              </span>
            </div>
            <div className="detail-item">
              <span>Current Balance:</span>
              <span className="value">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="detail-item">
              <span>Monthly Expenses:</span>
              <span className="value">{formatCurrency(monthlyExpenses)}</span>
            </div>
          </div>
          <div className="recommendation">
            {emergencyFund.monthsCovered < 6 && (
              <p>
                Target recommendation: Aim for at least 6 months of expenses in your emergency fund. 
                You need {formatCurrency((monthlyExpenses * 6) - currentBalance)} more.
              </p>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="add-goal-form">
          <h3>Add New Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Vacation, Laptop, House"
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="save">Save</option>
                  <option value="spend">Spend</option>
                  <option value="invest">Invest</option>
                </select>
              </div>
              <div className="form-group">
                <label>Daily Amount (₹) - Optional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dailyAmount}
                  onChange={(e) => setFormData({ ...formData, dailyAmount: e.target.value })}
                  placeholder="Micro-saving amount"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add Goal</button>
            </div>
          </form>
        </div>
      )}

      <div className="goals-list">
        <h3>Your Goals</h3>
        {goals.length > 0 ? (
          <div className="goals-grid">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h4>{goal.name}</h4>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="delete-btn"
                      title="Delete goal"
                    >
                      ×
                    </button>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>{progress.toFixed(1)}%</span>
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                  <div className="goal-details">
                    <div className="detail-row">
                      <span>Remaining:</span>
                      <span className="value">{formatCurrency(remaining)}</span>
                    </div>
                    {goal.deadline && (
                      <div className="detail-row">
                        <span>Deadline:</span>
                        <span>{format(parseISO(goal.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {goal.dailyAmount && (
                      <div className="detail-row">
                        <span>Daily Target:</span>
                        <span className="value">{formatCurrency(goal.dailyAmount)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newAmount = parseFloat(prompt('Update current amount:', goal.currentAmount)) || goal.currentAmount;
                      updateGoal(goal.id, { currentAmount: newAmount });
                    }}
                    className="btn-update"
                  >
                    Update Progress
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No goals set yet. Click "Add Goal" to create your first financial goal!</p>
          </div>
        )}
      </div>

      {goals.length > 0 && (
        <div className="goals-chart">
          <h3>Goal Progress Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={goalProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#667eea" name="Current" />
              <Line type="monotone" dataKey="target" stroke="#6BCB77" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Goals;

