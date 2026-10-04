import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { MenuIcon, SunIcon, MoonIcon } from '../common/Icons';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme, fontSize, increaseFontSize, decreaseFontSize } = useTheme();

  return (
    <header className={`header ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header-content">
        <div className="header-title-container">
          <button
            className="mobile-menu-btn"
            onClick={toggleSidebar}
            title="Toggle menu"
          >
            <MenuIcon size={20} />
          </button>
          <h1 className="header-title">Personal Finance Tracker</h1>
        </div>
        <div className="header-controls">
          <div className="font-size-controls">
            <button
              onClick={decreaseFontSize}
              className="control-btn"
              title="Decrease font size"
            >
              A−
            </button>
            <span className="font-size-display">{fontSize}px</span>
            <button
              onClick={increaseFontSize}
              className="control-btn"
              title="Increase font size"
            >
              A+
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isDarkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
