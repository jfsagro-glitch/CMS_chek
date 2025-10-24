import React, { createContext, useContext, useState, useEffect } from 'react';
import { inspectionsApi } from '../services/api';

interface InspectionsContextType {
  inspectionsCount: number;
  updateInspectionsCount: () => Promise<void>;
  addNewInspection: (inspection: any) => void;
}

const InspectionsContext = createContext<InspectionsContextType | undefined>(undefined);

export const useInspections = () => {
  const context = useContext(InspectionsContext);
  if (!context) {
    throw new Error('useInspections must be used within an InspectionsProvider');
  }
  return context;
};

export const InspectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspectionsCount, setInspectionsCount] = useState(0);

  const updateInspectionsCount = async () => {
    // Проверяем, работаем ли мы на GitHub Pages
    const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');
    
    if (IS_GITHUB_PAGES) {
      console.log('GitHub Pages detected, using demo count');
      setInspectionsCount(10); // Демо количество
      return;
    }
    
    try {
      const response = await inspectionsApi.getInspections({ page: 1, limit: 1 });
      setInspectionsCount(response.data?.pagination?.total || 0);
    } catch (error) {
      // В случае ошибки используем демо-данные
      setInspectionsCount(10); // Базовое количество из демо-данных
    }
  };

  const addNewInspection = (inspection: any) => {
    setInspectionsCount(prev => prev + 1);
  };

  useEffect(() => {
    updateInspectionsCount();
  }, []);

  return (
    <InspectionsContext.Provider value={{
      inspectionsCount,
      updateInspectionsCount,
      addNewInspection
    }}>
      {children}
    </InspectionsContext.Provider>
  );
};
