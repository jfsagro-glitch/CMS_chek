import React from 'react';
import './Logo.css';

const Logo: React.FC = () => {
  const logoContent = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );

  const logoText = 'CMS Check';

  return (
    <div className="logo-container">
      <div className="logo-pulse">
        <div className="logo-icon">
          {logoContent}
        </div>
      </div>
      <div className="logo-text">
        {logoText}
      </div>
    </div>
  );
};

export default Logo;