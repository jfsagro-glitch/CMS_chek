import axios from 'axios';

// Backend URL на Render - отключен для GitHub Pages
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cms-chek.onrender.com/api';
const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

// Отладочная информация
console.log('Current hostname:', window.location.hostname);
console.log('IS_GITHUB_PAGES:', IS_GITHUB_PAGES);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка 404 ошибок - не показываем ошибку, используем демо данные
    if (error.response?.status === 404) {
      console.log('API endpoint not found, using demo data');
      return Promise.resolve({ data: { inspections: [], pagination: { total: 0, pages: 1 } } });
    }
    
    // Обработка сетевых ошибок
    if (!error.response) {
      console.log('Network error, using demo data');
      return Promise.resolve({ data: { inspections: [], pagination: { total: 0, pages: 1 } } });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API методы для осмотров
export const inspectionsApi = {
  // Получить список осмотров
  getInspections: (params?: any) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, using demo data');
      return Promise.resolve({ 
        data: { 
          inspections: [], 
          pagination: { total: 0, pages: 1 } 
        } 
      });
    }
    return api.get('/inspections', { params });
  },
  
  // Получить осмотр по ID
  getInspection: (id: number) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, using demo data for inspection', id);
      return Promise.resolve({ 
        data: { 
          inspection: {
            id: id,
            internal_number: `INS-${String(id).padStart(3, '0')}`,
            property_type: 'Автотранспорт',
            address: 'г. Москва, ул. Тверская, д. 1',
            latitude: 55.7558,
            longitude: 37.6176,
            inspector_name: 'Иванов Иван Иванович',
            inspector_phone: '+79991234567',
            inspector_email: 'inspector@example.com',
            status: 'В работе',
            comment: 'Демо осмотр для тестирования мобильного интерфейса',
            created_at: new Date().toISOString(),
          },
          objects: [
            {
              id: 1,
              inspection_id: id,
              vin: '1HGBH41JXMN109186',
              registration_number: 'А123БВ77',
              category: 'Легковой автомобиль',
              type: 'Седан',
              make: 'Toyota',
              model: 'Camry'
            }
          ],
          photos: []
        } 
      });
    }
    return api.get(`/inspections/${id}`);
  },
  
  // Создать осмотр
  createInspection: (data: any) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating inspection creation');
      return Promise.resolve({ 
        data: { 
          inspection: {
            id: Date.now(),
            internal_number: `DEMO-${Date.now()}`,
            ...data,
            status: 'В работе',
            created_at: new Date().toISOString()
          }
        } 
      });
    }
    return api.post('/inspections', data);
  },
  
  // Обновить статус осмотра
  updateStatus: (id: number, status: string, comment?: string) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating status update');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Status updated successfully (demo mode)'
        } 
      });
    }
    return api.patch(`/inspections/${id}/status`, { status, comment });
  },
  
  // Дублировать осмотр
  duplicateInspection: (id: number) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating inspection duplication');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Inspection duplicated successfully (demo mode)'
        } 
      });
    }
    return api.post(`/inspections/${id}/duplicate`);
  },
  
  // Экспорт в Excel
  exportToExcel: (params?: any) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating Excel export');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Export completed successfully (demo mode)'
        } 
      });
    }
    return api.get('/inspections/export/excel', { params });
  },
};

// API методы для пользователей
export const usersApi = {
  // Получить профиль пользователя
  getProfile: () => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, using demo profile');
      return Promise.resolve({ 
        data: { 
          id: 1,
          email: 'demo@example.com',
          name: 'Демо пользователь',
          role: 'admin'
        } 
      });
    }
    return api.get('/users/profile');
  },
  
  // Обновить профиль
  updateProfile: (data: any) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating profile update');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Profile updated successfully (demo mode)'
        } 
      });
    }
    return api.put('/users/profile', data);
  },
};

// API методы для загрузки файлов
export const uploadApi = {
  // Загрузить фото
  uploadPhoto: (formData: FormData) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating photo upload');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Photo uploaded successfully (demo mode)',
          photoId: Date.now()
        } 
      });
    }
    return api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Удалить фото
  deletePhoto: (id: number) => {
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, simulating photo deletion');
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Photo deleted successfully (demo mode)'
        } 
      });
    }
    return api.delete(`/upload/photo/${id}`);
  },
};
