import React, { useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useModal } from '../contexts/ModalContext';
import Logo from './Logo';
import CreateInspection from '../pages/CreateInspection';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isCreateModalOpen, openCreateModal, closeCreateModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const canGoBack = useMemo(() => {
    return location.pathname !== '/' && 
           location.pathname !== '/inspections' && 
           location.pathname !== '/login' && 
           location.pathname !== '/register';
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as any);
  }, [setTheme]);

  return (
    <div className={`layout theme-${theme}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Logo />
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Свернуть' : 'Развернуть'}
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
            onClick={openCreateModal}
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
          
          <button
            className="nav-item nav-item-with-icons"
            onClick={() => window.open('https://cmsauto.ru/#/registry', '_blank')}
          >
            <Database size={16} />
            <span>CMS AUTO</span>
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
          <div className="theme-selector">
            <label className="theme-label">Тема:</label>
            <select 
              className="theme-select"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
              <option value="windows97">Windows 97</option>
              <option value="windowsXP">Windows XP</option>
              <option value="ios">iOS</option>
              <option value="matrix">Matrix</option>
              <option value="nokia3110">Nokia 3110</option>
            </select>
          </div>
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