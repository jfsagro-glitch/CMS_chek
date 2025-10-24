export const APP_CONFIG = {
  IS_GITHUB_PAGES: window.location.hostname.includes('github.io'),
  BASE_PATH: '/CMS_chek',
  API_BASE_URL: window.location.hostname.includes('github.io') ? '' : '/api',
  DEMO_MODE: window.location.hostname.includes('github.io'),
  MAX_OBJECTS_PER_INSPECTION: 150,
  SUPPORT_EMAIL: 'cmsauto@bk.ru',
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const;
