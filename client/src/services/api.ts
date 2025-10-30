import axios from 'axios';
import { APP_CONFIG } from '../config/app';

const IS_GITHUB_PAGES = APP_CONFIG.IS_GITHUB_PAGES;

// Конфигурация для разных окружений
const API_CONFIG = {
  baseURL: IS_GITHUB_PAGES ? '' : '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const api = axios.create(API_CONFIG);

// Демо-данные для GitHub Pages
const DEMO_DATA = {
  inspections: {
    list: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      internal_number: `INS-${String(i + 1).padStart(3, '0')}`,
      status: ['В работе', 'Проверка', 'Готов', 'Доработка'][i % 4],
      property_type: 'Автотранспорт',
      address: `г. Москва, ул. Примерная, д. ${i + 1}`,
      inspector_name: 'Иванов Иван Иванович',
      inspector_phone: '+79991234567',
      inspector_email: 'ivanov@example.com',
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 43200000).toISOString(),
    })),
    detail: (id: number) => ({
      id,
      internal_number: `INS-${String(id).padStart(3, '0')}`,
      status: 'В работе',
      property_type: 'Автотранспорт',
      address: 'г. Москва, ул. Тверская, д. 1',
      inspector_name: 'Иванов Иван Иванович',
      inspector_phone: '+79991234567',
      inspector_email: 'ivanov@example.com',
      created_at: new Date().toISOString(),
      objects: [
        {
          id: 1,
          vin: '1HGBH41JXMN109186',
          license_plate: 'А123БВ777',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Белый'
        }
      ],
      photos: [],
      comments: 'Осмотреть передние фары и бампер',
      status_history: [
        {
          status: 'Создан',
          timestamp: new Date().toISOString(),
          user: 'Администратор'
        }
      ]
    })
  }
};

// Умный интерцептор запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логируем запросы в development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Умный интерцептор ответов
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // На GitHub Pages игнорируем сетевые ошибки и возвращаем демо-данные
    if (IS_GITHUB_PAGES && (!error.response || error.code === 'NETWORK_ERROR')) {
      console.log('GitHub Pages: Returning demo data due to network error');
      return Promise.resolve({ data: DEMO_DATA.inspections.list });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Используем window.location для надежного перехода
      setTimeout(() => {
        window.location.href = '/CMS_chek/login';
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

// Универсальный API клиент с демо-режимом
const createApiHandler = <T>(demoData: T, realCall: () => Promise<any>) => {
  if (IS_GITHUB_PAGES) {
    console.log('GitHub Pages: Returning demo data');
    return Promise.resolve({ data: demoData });
  }
  return realCall();
};

export const inspectionsApi = {
  getInspections: (params?: any) => 
    createApiHandler(
      { inspections: DEMO_DATA.inspections.list, pagination: { total: 10, pages: 1 } },
      () => api.get('/inspections', { params })
    ),
  
  getInspection: (id: number) =>
    createApiHandler(
      { inspection: DEMO_DATA.inspections.detail(id) },
      () => api.get(`/inspections/${id}`)
    ),
  
  createInspection: (data: any) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating inspection creation');
      // Имитируем задержку сети
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              message: 'Осмотр успешно создан!',
              inspection: {
                id: Date.now(),
                internal_number: `INS-${Date.now()}`,
                status: 'В работе',
                created_at: new Date().toISOString(),
                photos_count: 0,
                ...data
              }
            }
          });
        }, 1000);
      });
    }
    return api.post('/inspections', data);
  },
  
  updateStatus: (id: number, status: string, comment?: string) =>
    createApiHandler(
      {
        message: 'Статус обновлен (демо)',
        inspection: { id, status, comment }
      },
      () => api.patch(`/inspections/${id}/status`, { status, comment })
    ),
  
  duplicateInspection: (id: number) =>
    createApiHandler(
      {
        message: 'Осмотр дублирован (демо)',
        inspection: { id: Date.now(), internal_number: `INS-${Date.now()}` }
      },
      () => api.post(`/inspections/${id}/duplicate`)
    ),
  
  exportToExcel: (params?: any) =>
    createApiHandler(
      {
        message: 'Экспорт выполнен (демо)',
        url: '/demo-export.xlsx',
        inspections: DEMO_DATA.inspections.list
      },
      () => api.get('/inspections/export/excel', { params, responseType: 'blob' })
    ),
};

export const usersApi = {
  getProfile: () =>
    createApiHandler(
      {
        id: 1,
        email: 'admin@demo.com',
        fullName: 'Администратор Демо',
        role: 'admin',
        phone: '+7 (999) 123-45-67',
        department: 'Отдел осмотров'
      },
      () => api.get('/users/profile')
    ),
  
  updateProfile: (data: any) =>
    createApiHandler(
      {
        message: 'Профиль обновлен (демо)',
        user: data
      },
      () => api.put('/users/profile', data)
    ),
};

export const uploadApi = {
  uploadPhoto: (formData: FormData) => {
    if (IS_GITHUB_PAGES) {
      // Имитируем задержку загрузки
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              message: 'Фото загружено (демо)',
              photo: {
                id: Date.now(),
                filename: 'demo-photo.jpg',
                size: 1024,
                url: '/demo-photo.jpg',
                coordinates: { lat: 55.7558, lng: 37.6173 },
                timestamp: new Date().toISOString()
              }
            }
          });
        }, 1000);
      });
    }
    return api.post('/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    });
  },
  
  deletePhoto: (id: number) =>
    createApiHandler(
      { message: 'Фото удалено (демо)', photoId: id },
      () => api.delete(`/upload/photo/${id}`)
    ),
};