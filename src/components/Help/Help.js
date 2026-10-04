import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import {
  BarChartIcon,
  BriefcaseIcon,
  ReceiptIcon,
  PieChartIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AwardIcon
} from '../common/Icons';
import './Help.css';

const Help = () => {
    const { startTour } = useOnboarding();
    const navigate = useNavigate();

    const handleStartTour = () => {
        navigate('/');
        // Small delay to allow navigation and component mount before starting tour
        setTimeout(() => {
            startTour();
        }, 100);
    };

    const features = [
        {
            title: "Dashboard Overview",
            icon: <BarChartIcon size={22} />,
            description: "The main landing page of the application. It provides a quick, high-level snapshot of your financial health, combining data from all other sections into easy-to-read summary cards (like Net Worth, Total Assets, Monthly Income, etc.) and quick access to recent transactions."
        },
        {
            title: "Portfolio",
            icon: <BriefcaseIcon size={22} />,
            description: "This section tracks your overall financial holdings. You can add, edit, and view different asset classes you own (like Cash, Stocks, Real Estate, etc.). It displays the current value of your combined assets to give you a clear picture of what you currently have."
        },
        {
            title: "Expenses",
            icon: <ReceiptIcon size={22} />,
            description: "A detailed tracker for your day-to-day spending. You can log individual expenses here, categorize them (e.g., Food, Rent, Entertainment), and set dates. It helps you see exactly where your money is going."
        },
        {
            title: "Asset Flowchart",
            icon: <PieChartIcon size={22} />,
            description: "A visual representation of how your money moves. This flowchart visually connects your income sources to your various assets and expenses, making it easier to understand your overall financial ecosystem at a glance."
        },
        {
            title: "Smart Insights",
            icon: <SparklesIcon size={22} />,
            description: "An automated analysis of your financial data. This feature reviews your spending habits, income, and goals, and provides actionable recommendations and anomaly alerts."
        },
        {
            title: "Goals",
            icon: <TargetIcon size={22} />,
            description: "Set and track specific financial milestones. Whether you're saving for a vacation, a car, or an emergency fund, you can create a goal here, set a target amount, and log your progress over time visually."
        },
        {
            title: "Analytics",
            icon: <TrendingDownIcon size={22} />,
            description: "Deep dive into your financial history. This section provides detailed charts and graphs comparing your income versus expenses over time, categorizing your spending, and highlighting long-term trends."
        },
        {
            title: "Investments",
            icon: <TrendingUpIcon size={22} />,
            description: "Specifically focuses on your investment portfolio (stocks, bonds, mutual funds). It tracks the performance, growth, and current market value of your holdings."
        },
        {
            title: "Gamification",
            icon: <AwardIcon size={22} />,
            description: "Build financial consistency! Earn milestone badges, track streaks, and monitor your monthly financial score as you practice disciplined saving."
        }
    ];

    const faqs = [
        {
            question: "How do I add a new asset?",
            answer: "Navigate to the Portfolio page using the sidebar and click the '+ Add Asset' button at the top right. Fill in the asset name, type, purchase price, and current value, then save."
        },
        {
            question: "Where is my data stored?",
            answer: "Your data is stored securely in your dedicated account database and synchronized locally for fast performance across sessions."
        },
        {
            question: "How does the Asset Flowchart work?",
            answer: "The flowchart automatically aggregates your transactions and assets to show how money flows from your income into various expense buckets and investments."
        },
        {
            question: "Can I customize expense categories?",
            answer: "Yes, you can select standard categories or define custom ones when creating transactions. The system also learns your preferences based on merchant names."
        }
    ];

    return (
        <div className="help-container">
            <div className="help-hero">
                <h1>Platform Guide & Help Center</h1>
                <p>Everything you need to understand and manage your personal finances effectively.</p>
                <button
                    onClick={handleStartTour}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--primary-color, #4f46e5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        margin: '1.5rem auto 0'
                    }}
                >
                    Start Interactive Tour
                </button>
            </div>

            <div className="help-grid">
                {features.map((feature, index) => (
                    <div className="help-card" key={index}>
                        <div className="help-card-header">
                            <span className="help-icon" style={{ display: 'flex', alignItems: 'center' }}>{feature.icon}</span>
                            <h3>{feature.title}</h3>
                        </div>
                        <p className="help-description">{feature.description}</p>
                    </div>
                ))}
            </div>

            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div className="faq-item" key={index}>
                            <h4>{faq.question}</h4>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Help;
