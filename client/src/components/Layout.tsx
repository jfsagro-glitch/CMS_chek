import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useModal } from '../contexts/ModalContext';
import Logo from './Logo';
import CreateInspection from '../pages/CreateInspection';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, getNextTheme } = useTheme();
  const { isCreateModalOpen, openCreateModal, closeCreateModal } = useModal();
  
  console.log('Layout rendered, isCreateModalOpen:', isCreateModalOpen);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'windows97': return '🪟';
      case 'windowsXP': return '🎯';
      case 'ios': return '📱';
      case 'matrix': return '🔰';
      case 'nokia3110': return '📟';
      default: return '🎨';
    }
  };

  const canGoBack = location.pathname !== '/' && 
                   location.pathname !== '/inspections' && 
                   location.pathname !== '/login' && 
                   location.pathname !== '/register';

  return (
    <div className={`layout theme-${theme}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Logo />
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${location.pathname === '/' || location.pathname === '/inspections' ? 'active' : ''}`}
            onClick={() => navigate('/inspections')}
          >
            📊 Осмотры
          </button>
          
          <button
            className="nav-item"
            onClick={() => {
              console.log('Button clicked, opening modal...');
              openCreateModal();
            }}
          >
            ➕ Новый осмотр
          </button>
          
          <button
            className="nav-item"
            onClick={() => navigate('/analytics')}
          >
            📈 Аналитика
          </button>
          
          <button
            className="nav-item"
            onClick={() => navigate('/users')}
          >
            👥 Пользователи
          </button>
          
          <button
            className="nav-item"
            onClick={() => navigate('/settings')}
          >
            ⚙️ Настройки
          </button>
          
          {canGoBack && (
            <button
              className="nav-item back-button"
              onClick={() => navigate(-1)}
            >
              ↩️ Назад
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span>👤 {user?.fullName}</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-icon">{getThemeIcon()}</span>
            <span className="theme-text">{getNextTheme().toUpperCase()}</span>
          </button>
          <button className="logout-button" onClick={handleLogout}>
            🚪 Выход
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Модальное окно создания осмотра */}
      <CreateInspection 
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />
    </div>
  );
};

export default Layout;