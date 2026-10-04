import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import apiGateway, { logToCloudWatch } from '../services/apiGateway';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories] = useState([
    { id: 1, name: 'Food', type: 'expense', color: '#FF6B6B' },
    { id: 2, name: 'Transport', type: 'expense', color: '#4ECDC4' },
    { id: 3, name: 'Shopping', type: 'expense', color: '#95E1D3' },
    { id: 4, name: 'Bills', type: 'expense', color: '#F38181' },
    { id: 5, name: 'Entertainment', type: 'expense', color: '#AA96DA' },
    { id: 6, name: 'Salary', type: 'income', color: '#6BCB77' },
    { id: 7, name: 'Freelance', type: 'income', color: '#4D96FF' },
    { id: 8, name: 'Investment Returns', type: 'income', color: '#9B59B6' },
  ]);
  const [learnedMappings, setLearnedMappings] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const storagePrefix = user?.id ? `pft:${user.id}` : null;

  // Load user-scoped data: check localStorage first, then sync from backend /api/data
  useEffect(() => {
    setIsHydrated(false);

    if (!user?.id) {
      setAssets([]);
      setTransactions([]);
      setGoals([]);
      setLearnedMappings({});
      setIsHydrated(true);
      return;
    }

    const savedAssets = localStorage.getItem(`${storagePrefix}:assets`);
    const savedTransactions = localStorage.getItem(`${storagePrefix}:transactions`);
    const savedGoals = localStorage.getItem(`${storagePrefix}:goals`);
    const savedMappings = localStorage.getItem(`${storagePrefix}:learnedMappings`);

    if (savedAssets) setAssets(JSON.parse(savedAssets));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMappings) setLearnedMappings(JSON.parse(savedMappings));

    // Fetch from API Gateway
    const authToken = token || localStorage.getItem('pft_token');
    if (authToken) {
      apiGateway.get('/api/data', { 'Authorization': `Bearer ${authToken}` })
        .then(res => res.json())
        .then(data => {
          if (data) {
            if (Array.isArray(data.assets) && data.assets.length > 0) setAssets(data.assets);
            if (Array.isArray(data.transactions) && data.transactions.length > 0) setTransactions(data.transactions);
            if (Array.isArray(data.goals) && data.goals.length > 0) setGoals(data.goals);
            if (data.learnedMappings && Object.keys(data.learnedMappings).length > 0) setLearnedMappings(data.learnedMappings);
          }
        })
        .catch(err => {
          logToCloudWatch('warn', 'API Gateway sync unavailable, using local cache', { error: err.message });
        })
        .finally(() => {
          setIsHydrated(true);
        });
    } else {
      setIsHydrated(true);
    }
  }, [user?.id, token, storagePrefix]);

  // Save user-scoped data to localStorage AND API Gateway /api/data
  useEffect(() => {
    if (!storagePrefix || !isHydrated) return;
    localStorage.setItem(`${storagePrefix}:assets`, JSON.stringify(assets));
    localStorage.setItem(`${storagePrefix}:transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${storagePrefix}:goals`, JSON.stringify(goals));
    localStorage.setItem(`${storagePrefix}:learnedMappings`, JSON.stringify(learnedMappings));

    const authToken = token || localStorage.getItem('pft_token');
    if (authToken) {
      const timer = setTimeout(() => {
        apiGateway.post('/api/data', { assets, transactions, goals, learnedMappings }, {
          'Authorization': `Bearer ${authToken}`
        }).catch(e => logToCloudWatch('warn', 'Could not save data to API Gateway', { error: e.message }));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [assets, transactions, goals, learnedMappings, storagePrefix, isHydrated, token]);

  const addAsset = (asset) => {
    setAssets([...assets, { ...asset, id: Date.now() }]);
  };

  const updateAsset = (id, updates) => {
    setAssets(assets.map(asset => asset.id === id ? { ...asset, ...updates } : asset));
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const addTransaction = (transaction) => {
    // Only auto-categorize if the user didn't provide a category
    const category = transaction.category ? transaction.category : autoCategorize(transaction).name;
    setTransactions([{ ...transaction, id: Date.now(), category: category }, ...transactions]);
  };

  const updateTransaction = (id, updates) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));

    // Learn from manual categorization
    if (updates.category && updates.merchant) {
      setLearnedMappings({
        ...learnedMappings,
        [updates.merchant.toLowerCase()]: updates.category
      });
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const autoCategorize = (transaction) => {
    const merchant = transaction.merchant?.toLowerCase() || '';

    // Check learned mappings first
    if (learnedMappings[merchant]) {
      return categories.find(c => c.name === learnedMappings[merchant]) || categories[0];
    }

    // Auto-detect based on merchant name
    const merchantLower = merchant.toLowerCase();
    if (merchantLower.includes('zomato') || merchantLower.includes('swiggy') || merchantLower.includes('food')) {
      return categories.find(c => c.name === 'Food') || categories[0];
    }
    if (merchantLower.includes('uber') || merchantLower.includes('ola') || merchantLower.includes('petrol')) {
      return categories.find(c => c.name === 'Transport') || categories[0];
    }
    if (merchantLower.includes('netflix') || merchantLower.includes('spotify') || merchantLower.includes('prime')) {
      return categories.find(c => c.name === 'Entertainment') || categories[0];
    }

    return categories[0];
  };

  const addGoal = (goal) => {
    setGoals([...goals, { ...goal, id: Date.now(), progress: 0 }]);
  };

  const updateGoal = (id, updates) => {
    setGoals(goals.map(goal => goal.id === id ? { ...goal, ...updates } : goal));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const value = {
    assets,
    transactions,
    goals,
    categories,
    learnedMappings,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    autoCategorize,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

