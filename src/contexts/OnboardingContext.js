import React, { createContext, useState, useContext, useEffect } from 'react';
import { useData } from './DataContext';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const { assets, transactions } = useData();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';

    // Auto-start tour for new users with no data
    if (!hasCompletedOnboarding && assets && assets.length === 0 && transactions && transactions.length === 0) {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000); // Increased delay slightly to make sure rendering finishes
      return () => clearTimeout(timer);
    }
  }, [assets, transactions]);

  const startTour = () => {
    setRunTour(true);
  };

  const finishTour = () => {
    setRunTour(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  return (
    <OnboardingContext.Provider value={{ runTour, startTour, finishTour }}>
      {children}
    </OnboardingContext.Provider>
  );
};
