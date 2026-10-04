import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/calculations';
import { format, parseISO, subDays } from 'date-fns';
import { TargetIcon, FlameIcon, TrendingUpIcon, AwardIcon, CheckCircleIcon, LockIcon } from '../common/Icons';
import './Gamification.css';

const Gamification = () => {
  const { isDarkMode } = useTheme();
  const { transactions, goals } = useData();

  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [financeScore, setFinanceScore] = useState(0);
  const [xp, setXp] = useState(0);

  // Calculate spending streak (days under budget)
  useEffect(() => {
    let currentStreak = 0;
    let checkDate = new Date();

    // Check if yesterday was under budget, then count backwards
    for (let i = 0; i < 30; i++) {
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      const dateTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return format(tDate, 'yyyy-MM-dd') === checkDateStr;
      });

      const dailyExpenses = dateTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      // Assume daily budget is monthly budget / 30
      const monthlyExpenses = transactions
        .filter(t => {
          const tDate = parseISO(t.date);
          return tDate.getMonth() === new Date().getMonth() &&
            tDate.getFullYear() === new Date().getFullYear() &&
            t.type === 'expense';
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const dailyBudget = monthlyExpenses / 30;

      if (dailyExpenses <= dailyBudget * 1.1) { // 10% tolerance
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  }, [transactions]);

  // Calculate finance score and level
  useEffect(() => {
    let score = 0;
    let totalXp = 0;

    // Savings rate score (40 points)
    const monthlyIncome = transactions
      .filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getMonth() === new Date().getMonth() &&
          tDate.getFullYear() === new Date().getFullYear() &&
          t.type === 'income';
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const monthlyExpenses = transactions
      .filter(t => {
        const tDate = parseISO(t.date);
        return tDate.getMonth() === new Date().getMonth() &&
          tDate.getFullYear() === new Date().getFullYear() &&
          t.type === 'expense';
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    if (monthlyIncome > 0) {
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
      const savingsScore = Math.min(savingsRate / 2.5, 40); // Max 40 points
      score += savingsScore;
      totalXp += savingsScore * 10;
    }

    // Goal progress score (30 points)
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, g) => {
        return sum + ((g.currentAmount / g.targetAmount) * 100);
      }, 0) / goals.length;
      const goalScore = Math.min(avgProgress / 3.33, 30); // Max 30 points
      score += goalScore;
      totalXp += goalScore * 10;
    }

    // Streak score (20 points)
    const streakScore = Math.min(streak / 5, 20); // Max 20 points for 100 day streak
    score += streakScore;
    totalXp += streakScore * 10;

    // Consistency score (10 points) - based on transaction frequency
    const transactionCount = transactions.length;
    const consistencyScore = Math.min(transactionCount / 100, 10); // Max 10 points
    score += consistencyScore;
    totalXp += consistencyScore * 10;

    setFinanceScore(Math.round(score));
    setXp(Math.round(totalXp));

    // Calculate level (1 level per 100 XP)
    const calculatedLevel = Math.floor(totalXp / 100) + 1;
    setLevel(calculatedLevel);
  }, [transactions, goals, streak]);

  const xpForNextLevel = (level * 100) - xp;
  const levelProgress = (xp % 100) / 100 * 100;

  const getFinanceScoreColor = () => {
    if (financeScore >= 80) return 'darkblue';
    if (financeScore >= 60) return 'blue';
    if (financeScore >= 40) return 'goldenrod';
    return '#FF6B6B';
  };

  const getLevelTitle = () => {
    if (level >= 50) return 'Financial Master';
    if (level >= 30) return 'Wealth Builder';
    if (level >= 20) return 'Smart Saver';
    if (level >= 10) return 'Budget Expert';
    if (level >= 5) return 'Money Manager';
    return 'Beginner';
  };

  const achievements = [
    {
      id: 1,
      name: 'First Step',
      description: 'Added your first transaction',
      achieved: transactions.length > 0,
      icon: <TargetIcon size={20} />,
    },
    {
      id: 2,
      name: 'Goal Setter',
      description: 'Created your first goal',
      achieved: goals.length > 0,
      icon: <TargetIcon size={20} />,
    },
    {
      id: 3,
      name: 'Week Streak',
      description: '7 days budget streak',
      achieved: streak >= 7,
      icon: <FlameIcon size={20} />,
    },
    {
      id: 4,
      name: 'Month Master',
      description: '30 days budget streak',
      achieved: streak >= 30,
      icon: <TrendingUpIcon size={20} />,
    },
    {
      id: 5,
      name: 'Perfect Score',
      description: 'Finance score above 90',
      achieved: financeScore >= 90,
      icon: <AwardIcon size={20} />,
    },
  ];

  return (
    <div className={`gamification ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="gamification-header">
        <h2>Financial Achievements</h2>
        <p>Build healthy financial habits and track your milestones</p>
      </div>

      <div className="gamification-stats">
        <div className="level-card">
          <div className="level-badge">
            <span className="level-number">{level}</span>
            <span className="level-text">Level</span>
          </div>
          <div className="level-info">
            <h3>{getLevelTitle()}</h3>
            <p className="xp-text">{xp} XP ({xpForNextLevel} XP to next level)</p>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="streak-card">
          <div className="streak-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameIcon size={24} />
          </div>
          <div className="streak-content">
            <h3>Budget Streak</h3>
            <p className="streak-days">{streak} days</p>
            <p className="streak-description">Days under budget</p>
            {streak > 0 && (
              <p className="streak-message">Consistent discipline builds long-term wealth.</p>
            )}
          </div>
        </div>

        <div className="score-card">
          <div className="score-circle" style={{ borderColor: getFinanceScoreColor() }}>
            <div className="score-value" style={{ color: getFinanceScoreColor() }}>
              {financeScore}
            </div>
            <div className="score-label">Finance Score</div>
          </div>
          <div className="score-breakdown">
            <div className="breakdown-item">
              <span>Savings Rate</span>
              <span>40 pts max</span>
            </div>
            <div className="breakdown-item">
              <span>Goal Progress</span>
              <span>30 pts max</span>
            </div>
            <div className="breakdown-item">
              <span>Spending Streaks</span>
              <span>20 pts max</span>
            </div>
            <div className="breakdown-item">
              <span>Consistency</span>
              <span>10 pts max</span>
            </div>
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.achieved ? 'achieved' : 'locked'}`}
            >
              <div className="achievement-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {achievement.icon}
              </div>
              <div className="achievement-content">
                <h4>{achievement.name}</h4>
                <p>{achievement.description}</p>
              </div>
              {achievement.achieved ? (
                <div className="achievement-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon size={16} />
                </div>
              ) : (
                <div className="achievement-badge locked" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LockIcon size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="leaderboard-section">
        <h3>Monthly Leaderboard</h3>
        <div className="leaderboard-card">
          <div className="leaderboard-item rank-1">
            <div className="rank-number">1</div>
            <div className="rank-content">
              <span className="rank-label">Best Month</span>
              <span className="rank-value">
                {formatCurrency(
                  transactions
                    .filter(t => {
                      const tDate = parseISO(t.date);
                      return tDate.getMonth() === new Date().getMonth() &&
                        tDate.getFullYear() === new Date().getFullYear();
                    })
                    .reduce((sum, t) => {
                      return sum + (t.type === 'income' ? parseFloat(t.amount || 0) : -parseFloat(t.amount || 0));
                    }, 0)
                )}
              </span>
            </div>
          </div>
          <p className="leaderboard-note">
            Your performance this month compared to your average
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gamification;

