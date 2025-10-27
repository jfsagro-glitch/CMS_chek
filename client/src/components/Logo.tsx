import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Logo.css';

const Logo: React.FC = () => {
  const { theme } = useTheme();

  const getLogoContent = () => {
    switch (theme) {
      case 'windows97':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="4" y="5" width="16" height="10" fill="currentColor" opacity="0.3"/>
            <circle cx="6" cy="7" r="1" fill="currentColor"/>
            <circle cx="8" cy="7" r="1" fill="currentColor"/>
            <circle cx="10" cy="7" r="1" fill="currentColor"/>
          </svg>
        );
      case 'windowsXP':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'ios':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="6" y="4" width="12" height="16" rx="1" fill="currentColor" opacity="0.3"/>
            <circle cx="12" cy="6" r="1" fill="currentColor"/>
          </svg>
        );
      case 'matrix':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2"/>
            <circle cx="6" cy="6" r="1" fill="currentColor"/>
            <circle cx="18" cy="18" r="1" fill="currentColor"/>
          </svg>
        );
      case 'nokia3110':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="8" y="4" width="8" height="16" rx="1" fill="currentColor" opacity="0.3"/>
            <rect x="10" y="6" width="4" height="2" fill="currentColor"/>
            <rect x="10" y="10" width="4" height="2" fill="currentColor"/>
            <rect x="10" y="14" width="4" height="2" fill="currentColor"/>
          </svg>
        );
      case 'dark':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'light':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
    }
  };

  const getLogoText = () => {
    switch (theme) {
      case 'windows97':
        return 'CMS 97';
      case 'windowsXP':
        return 'CMS XP';
      case 'ios':
        return 'CMS';
      case 'matrix':
        return 'MATRIX';
      case 'nokia3110':
        return 'CMS';
      case 'dark':
        return 'CMS Dark';
      case 'light':
        return 'CMS Check';
      default:
        return 'CMS Check';
    }
  };

  return (
    <div className="logo-container">
      <div className="logo-pulse">
        <div className="logo-icon">
          {getLogoContent()}
        </div>
      </div>
      <div className="logo-text">
        {getLogoText()}
      </div>
    </div>
  );
};

export default Logo;