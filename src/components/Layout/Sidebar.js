import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  WalletIcon,
  UserIcon,
  BriefcaseIcon,
  ReceiptIcon,
  TrendingUpIcon,
  SparklesIcon,
  TargetIcon,
  BarChartIcon,
  PieChartIcon,
  AwardIcon,
  HelpCircleIcon
} from '../common/Icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/profile', icon: <UserIcon size={18} />, label: 'Profile' },
    { path: '/portfolio', icon: <BriefcaseIcon size={18} />, label: 'Portfolio' },
    { path: '/expenses', icon: <ReceiptIcon size={18} />, label: 'Expenses' },
    { path: '/flowchart', icon: <PieChartIcon size={18} />, label: 'Asset Flowchart' },
    { path: '/insights', icon: <SparklesIcon size={18} />, label: 'Smart Insights' },
    { path: '/goals', icon: <TargetIcon size={18} />, label: 'Goals' },
    { path: '/analytics', icon: <BarChartIcon size={18} />, label: 'Analytics' },
    { path: '/investments', icon: <TrendingUpIcon size={18} />, label: 'Investments' },
    { path: '/gamification', icon: <AwardIcon size={18} />, label: 'Gamification' },
    { path: '/help', icon: <HelpCircleIcon size={18} />, label: 'Help & Guide' },
  ];

  return (
    <aside className={`sidebar ${isDarkMode ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <WalletIcon size={22} />
        <h2>Finance Tracker</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
