import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './NavigationButtons.css';

interface NavigationButtonsProps {
  onClose?: () => void;
  onBack?: () => void;
  showClose?: boolean;
  showBack?: boolean;
  backLabel?: string;
  closeLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onClose,
  onBack,
  showClose = false,
  showBack = false,
  backLabel = 'Назад',
  closeLabel = 'Закрыть'
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const getButtonClass = (type: 'back' | 'close') => {
    const baseClass = 'nav-button';
    if (theme === 'windows97') {
      return `${baseClass} win97-button`;
    } else if (theme === 'nokia3110') {
      return `${baseClass} nokia-button`;
    }
    return `${baseClass} ${type}-button`;
  };

  return (
    <div className="navigation-buttons">
      {showBack && (
        <button
          className={getButtonClass('back')}
          onClick={handleBack}
        >
          {theme === 'nokia3110' ? '◀' : '↩'} {backLabel}
        </button>
      )}
      
      {showClose && (
        <button
          className={getButtonClass('close')}
          onClick={handleClose}
        >
          {theme === 'nokia3110' ? '✖' : '×'} {closeLabel}
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
