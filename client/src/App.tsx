import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { InspectionsProvider } from './contexts/InspectionsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Inspections from './pages/Inspections';
import CreateInspection from './pages/CreateInspection';
import InspectionDetail from './pages/InspectionDetail';
import MobileHome from './pages/MobileHome';
import MobileInspection from './pages/MobileInspection';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Определяем базовый путь для GitHub Pages
const getBasename = () => {
  if (window.location.hostname.includes('github.io')) {
    return '/CMS_chek';
  }
  return '/';
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <InspectionsProvider>
            <Router basename={getBasename()}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Inspections />} />
                  <Route path="inspections" element={<Inspections />} />
                  <Route path="inspections/create" element={<CreateInspection />} />
                  <Route path="inspections/:id" element={<InspectionDetail />} />
                </Route>
                <Route path="/mobile" element={<MobileHome />} />
                <Route path="/inspection/:id" element={<MobileInspection />} />
                {/* Fallback route for GitHub Pages */}
                <Route path="*" element={<Inspections />} />
              </Routes>
            </Router>
          </InspectionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;