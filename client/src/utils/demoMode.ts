export const demoMode = {
  isEnabled: () => window.location.hostname.includes('github.io'),
  
  simulateApiCall: <T>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  },
  
  generateDemoId: () => Date.now(),
  
  getDemoUser: (email?: string) => ({
    id: 1,
    email: email || 'demo@cms-check.ru',
    fullName: 'Демо Пользователь',
    role: 'admin' as const
  })
};
