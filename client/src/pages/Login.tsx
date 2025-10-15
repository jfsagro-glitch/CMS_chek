import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

const schema = yup.object({
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  password: yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
});

const registerSchema = yup.object({
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  password: yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
  fullName: yup.string().required('ФИО обязательно'),
  phone: yup.string().matches(/^\+7\d{10}$/, 'Неверный формат телефона').required('Телефон обязателен'),
  department: yup.string().optional(),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  department?: string;
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const registerForm = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmitLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Успешный вход в систему');
      navigate('/inspections');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRegister = async (data: any) => {
    setIsLoading(true);
    try {
      await register(data);
      toast.success('Регистрация успешна');
      navigate('/inspections');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAdminAccess = () => {
    const subject = 'Запрос на регистрацию администратора';
    const body = `ФИО: \nПодразделение: \nEmail: ${registerForm.getValues('email') || ''}`;
    const mailtoLink = `mailto:cmsauto@bk.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    toast.success('Откройте почтовый клиент для отправки запроса');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">CMS Check</h1>
          <p className="login-subtitle">Система дистанционных осмотров имущества</p>
        </div>

        {/* Demo mode banner */}
        <div className="demo-banner" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Демо-режим:</strong> Backend сервер не подключен. 
          Для полной функциональности необходимо задеплоить backend. 
          <a href="https://github.com/jfsagro-glitch/CMS_chek#readme" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ color: '#856404', textDecoration: 'underline', marginLeft: '4px' }}>
            Инструкция
          </a>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="login-form">
            <div className="form-group">
              <label className="form-label required">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                {...loginForm.register('email')}
                placeholder="Введите email"
              />
              {loginForm.formState.errors.email && (
                <div className="form-error">
                  {loginForm.formState.errors.email.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                <Lock size={16} />
                Пароль
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  {...loginForm.register('password')}
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <div className="form-error">
                  {loginForm.formState.errors.password.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="login-form">
            <div className="form-group">
              <label className="form-label required">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                {...registerForm.register('email')}
                placeholder="Введите email"
              />
              {registerForm.formState.errors.email && (
                <div className="form-error">
                  {registerForm.formState.errors.email.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                <Lock size={16} />
                Пароль
              </label>
              <input
                type="password"
                className="form-input"
                {...registerForm.register('password')}
                placeholder="Введите пароль"
              />
              {registerForm.formState.errors.password && (
                <div className="form-error">
                  {registerForm.formState.errors.password.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                <User size={16} />
                ФИО
              </label>
              <input
                type="text"
                className="form-input"
                {...registerForm.register('fullName')}
                placeholder="Введите ФИО полностью"
              />
              {registerForm.formState.errors.fullName && (
                <div className="form-error">
                  {registerForm.formState.errors.fullName.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                <Phone size={16} />
                Телефон
              </label>
              <input
                type="tel"
                className="form-input"
                {...registerForm.register('phone')}
                placeholder="+7 (999) 123-45-67"
              />
              {registerForm.formState.errors.phone && (
                <div className="form-error">
                  {registerForm.formState.errors.phone.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={16} />
                Подразделение
              </label>
              <input
                type="text"
                className="form-input"
                {...registerForm.register('department')}
                placeholder="Введите подразделение (необязательно)"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div className="admin-request">
              <p>Нужны права администратора?</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={requestAdminAccess}
              >
                Запросить доступ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
