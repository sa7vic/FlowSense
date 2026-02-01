import React from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h1 className={styles.logo}>FlowSense</h1>
          <span className={styles.tagline}>Cognitive Pattern Dashboard</span>
        </div>

        <button 
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
