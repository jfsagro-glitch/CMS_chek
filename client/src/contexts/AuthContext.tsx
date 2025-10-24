import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Демо-пользователь для GitHub Pages
const DEMO_USER: User = {
  id: 1,
  email: 'demo@cms-check.ru',
  fullName: 'Демо Пользователь',
  role: 'admin'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

  const verifyToken = useCallback(async () => {
    if (IS_GITHUB_PAGES) {
      // Автоматический вход в демо-режиме на GitHub Pages
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('token', demoToken);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [IS_GITHUB_PAGES]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (email: string, password: string) => {
    if (IS_GITHUB_PAGES) {
      // Демо-режим: любой email/пароль работает
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('token', demoToken);
      setUser({
        ...DEMO_USER,
        email,
        fullName: email.split('@')[0] || 'Пользователь'
      });
      return;
    }
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка входа');
    }
  };

  const register = async (userData: RegisterData) => {
    if (IS_GITHUB_PAGES) {
      // Демо-режим: автоматическая регистрация
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('token', demoToken);
      setUser({
        id: Date.now(),
        email: userData.email,
        fullName: userData.fullName,
        role: 'user'
      });
      return;
    }
    
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // На GitHub Pages перезагружаем страницу для сброса демо-режима
    if (IS_GITHUB_PAGES) {
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};