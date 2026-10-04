import React, { useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTheme } from '../../contexts/ThemeContext';

const OnboardingTour = () => {
    const { runTour, finishTour } = useOnboarding();
    const { isDarkMode } = useTheme();

    const [steps] = useState([
        {
            target: 'body',
            content: 'Welcome to your Personal Finance Tracker! Let\'s take a quick tour to help you get started with managing your wealth.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.dashboard-header',
            content: 'This is your Dashboard. It provides a quick snapshot of your financial health such as Net Worth and Total Assets.',
            placement: 'bottom',
        },
        {
            target: '.transactions-list',
            content: 'Here is where your recent spending will appear. Tracking expenses is the first step to financial freedom!',
            placement: 'left',
        },
        {
            target: '.asset-allocation',
            content: 'Build your Portfolio here! See how your wealth is distributed across different asset classes.',
            placement: 'left',
        },
        {
            target: '.sidebar-nav',
            content: 'Use this menu to navigate to different tools like Expense Tracking, Goal Setting, and Smart Insights.',
            placement: 'right',
        },
        {
            target: '.theme-toggle',
            content: 'Customize your experience! Toggle between Light and Dark mode using this button.',
            placement: 'bottom',
        }
    ]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            finishTour();
        }
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={runTour}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#4ECDC4',
                    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                    textColor: isDarkMode ? '#ffffff' : '#333333',
                    arrowColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                },
                buttonNext: {
                    backgroundColor: '#4ECDC4',
                    borderRadius: '8px',
                    color: '#fff'
                },
                buttonBack: {
                    color: isDarkMode ? '#ccc' : '#666'
                },
                buttonSkip: {
                    color: isDarkMode ? '#999' : '#999'
                }
            }}
        />
    );
};

export default OnboardingTour;
