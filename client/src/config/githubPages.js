export const GITHUB_PAGES_CONFIG = {
  basePath: '/CMS_chek',
  isEnabled: window.location.hostname.includes('github.io'),
  
  // Функция для корректного создания ссылок
  createPath: (path) => {
    if (window.location.hostname.includes('github.io')) {
      return `/CMS_chek${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return path;
  },
  
  // Функция для навигации
  navigate: (path, options = {}) => {
    const fullPath = GITHUB_PAGES_CONFIG.createPath(path);
    if (options.replace) {
      window.location.replace(fullPath);
    } else {
      window.location.href = fullPath;
    }
  }
};
