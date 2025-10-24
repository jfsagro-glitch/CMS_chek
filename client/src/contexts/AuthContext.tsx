import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    // Проверяем, работаем ли мы на GitHub Pages
    const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');
    
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, skipping token verification');
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Проверяем, работаем ли мы на GitHub Pages
    const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');
    
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating login');
      // Симулируем успешный вход для демо режима
      const demoUser = {
        id: 1,
        email: email,
        name: 'Демо пользователь',
        role: 'admin'
      };
      localStorage.setItem('token', 'demo-token-' + Date.now());
      setUser(demoUser);
      return;
    }
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Backend сервер недоступен. Для полной функциональности необходимо задеплоить backend на Railway/Render. См. документацию BACKEND_DEPLOYMENT.md');
      }
      throw new Error(error.response?.data?.message || 'Ошибка входа в систему');
    }
  };

  const register = async (userData: RegisterData) => {
    // Проверяем, работаем ли мы на GitHub Pages
    const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');
    
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating registration');
      // Симулируем успешную регистрацию для демо режима
      const demoUser = {
        id: 1,
        email: userData.email,
        name: userData.name,
        role: 'admin'
      };
      localStorage.setItem('token', 'demo-token-' + Date.now());
      setUser(demoUser);
      return;
    }
    
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Backend сервер недоступен. Для полной функциональности необходимо задеплоить backend на Railway/Render. См. документацию BACKEND_DEPLOYMENT.md');
      }
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
