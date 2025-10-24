import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { inspectionsApi } from '../services/api';
import { APP_CONFIG } from '../config/app';

interface InspectionsContextType {
  inspectionsCount: number;
  updateInspectionsCount: () => Promise<void>;
  addNewInspection: (newInspection: any) => void;
}

const InspectionsContext = createContext<InspectionsContextType | undefined>(undefined);

export const InspectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inspectionsCount, setInspectionsCount] = useState(0);

  const updateInspectionsCount = useCallback(async () => {
    if (APP_CONFIG.DEMO_MODE) {
      console.log('Demo mode: Using demo count');
      setInspectionsCount(10); // Демо количество
      return;
    }
    
    try {
      const response = await inspectionsApi.getInspections({ page: 1, limit: 1 });
      setInspectionsCount(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch inspections count:', error);
      // В случае ошибки используем демо-данные
      setInspectionsCount(10); // Базовое количество из демо-данных
    }
  }, []);

  const addNewInspection = useCallback((inspection: any) => {
    setInspectionsCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    updateInspectionsCount();
  }, [updateInspectionsCount]);

  return (
    <InspectionsContext.Provider value={{ inspectionsCount, updateInspectionsCount, addNewInspection }}>
      {children}
    </InspectionsContext.Provider>
  );
};

export const useInspections = () => {
  const context = useContext(InspectionsContext);
  if (context === undefined) {
    throw new Error('useInspections must be used within an InspectionsProvider');
  }
  return context;
};