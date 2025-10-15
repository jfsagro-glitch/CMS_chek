import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FileText, 
  Plus, 
  LogOut, 
  X,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  Sun,
  Moon,
  Monitor,
  Zap
} from 'lucide-react';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [showThemeSelector, setShowThemeSelector] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Мобильное меню - убрано */}

      {/* Боковая панель */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">CMS</div>
            {!sidebarCollapsed && <span className="logo-text">Check</span>}
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/inspections') ? 'active' : ''}`}
            onClick={() => {
              navigate('/inspections');
              setSidebarOpen(false);
            }}
          >
            <FileText size={20} />
            <span>Осмотры</span>
            <span className="badge">13</span>
          </button>
          
          <button
            className={`nav-item ${isActive('/create-inspection') ? 'active' : ''}`}
            onClick={() => {
              navigate('/create-inspection');
              setSidebarOpen(false);
            }}
          >
            <Plus size={20} />
            <span>Новый осмотр</span>
          </button>

          <button
            className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
            onClick={() => {
              navigate('/analytics');
              setSidebarOpen(false);
            }}
          >
            <BarChart3 size={20} />
            <span>Аналитика</span>
          </button>

          <button
            className={`nav-item ${isActive('/users') ? 'active' : ''}`}
            onClick={() => {
              navigate('/users');
              setSidebarOpen(false);
            }}
          >
            <Users size={20} />
            <span>Пользователи</span>
          </button>

          <button
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => {
              navigate('/settings');
              setSidebarOpen(false);
            }}
          >
            <Settings size={20} />
            <span>Настройки</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* Селектор тем */}
          <div className="theme-selector">
            <button 
              className="theme-toggle-btn"
              onClick={() => setShowThemeSelector(!showThemeSelector)}
            >
              <Palette size={16} />
              {!sidebarCollapsed && <span>Темы</span>}
            </button>
            
            {showThemeSelector && (
              <div className="theme-options">
                <button 
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={14} />
                  {!sidebarCollapsed && <span>Светлая</span>}
                </button>
                <button 
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={14} />
                  {!sidebarCollapsed && <span>Темная</span>}
                </button>
                <button 
                  className={`theme-option ${theme === 'gray' ? 'active' : ''}`}
                  onClick={() => setTheme('gray')}
                >
                  <Monitor size={14} />
                  {!sidebarCollapsed && <span>Серая</span>}
                </button>
                <button 
                  className={`theme-option ${theme === 'monochrome' ? 'active' : ''}`}
                  onClick={() => setTheme('monochrome')}
                >
                  <Zap size={14} />
                  {!sidebarCollapsed && <span>Монохром</span>}
                </button>
                <button 
                  className={`theme-option ${theme === 'windows97' ? 'active' : ''}`}
                  onClick={() => setTheme('windows97')}
                >
                  <Monitor size={14} />
                  {!sidebarCollapsed && <span>Windows 97</span>}
                </button>
              </div>
            )}
          </div>

          {/* Кнопка сворачивания */}
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed && <span>Свернуть</span>}
          </button>

          <div className="user-info">
            <div className="user-avatar">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.fullName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="main-content">
        <div className="content-body">
          <Outlet />
        </div>
      </main>

      {/* Оверлей для мобильных устройств */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
