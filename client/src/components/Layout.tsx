import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  LogOut, 
  X,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Мобильное меню - убрано */}

      {/* Боковая панель */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {/* Логотип убран */}
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
          <div className="user-info">
            <div className="user-avatar">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Выйти
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
