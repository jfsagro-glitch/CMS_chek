import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  getInspections: (params?: any) => api.get('/inspections', { params }),
  
  // Получить осмотр по ID
  getInspection: (id: number) => api.get(`/inspections/${id}`),
  
  // Создать осмотр
  createInspection: (data: any) => api.post('/inspections', data),
  
  // Обновить статус осмотра
  updateStatus: (id: number, status: string, comment?: string) => 
    api.patch(`/inspections/${id}/status`, { status, comment }),
  
  // Дублировать осмотр
  duplicateInspection: (id: number) => api.post(`/inspections/${id}/duplicate`),
  
  // Экспорт в Excel
  exportToExcel: (params?: any) => api.get('/inspections/export/excel', { params }),
};

// API методы для пользователей
export const usersApi = {
  // Получить профиль пользователя
  getProfile: () => api.get('/users/profile'),
  
  // Обновить профиль
  updateProfile: (data: any) => api.put('/users/profile', data),
};

// API методы для загрузки файлов
export const uploadApi = {
  // Загрузить фото
  uploadPhoto: (formData: FormData) => api.post('/upload/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Удалить фото
  deletePhoto: (id: number) => api.delete(`/upload/photo/${id}`),
};
