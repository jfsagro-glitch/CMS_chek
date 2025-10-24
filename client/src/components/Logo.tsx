import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Logo.css';

const Logo: React.FC = () => {
  const { theme } = useTheme();

  const getLogoContent = () => {
    switch (theme) {
      case 'windows97':
        return '🖥️ CMS 97';
      case 'windowsXP':
        return '🎯 CMS XP';
      case 'ios':
        return '📱 CMS';
      case 'matrix':
        return '🔰 MATRIX';
      case 'nokia3110':
        return '📟 CMS';
      default:
        return '🔍 CMS Check';
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
        CMS Check
      </div>
    </div>
  );
};

export default Logo;
