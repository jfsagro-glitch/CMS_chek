import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inspections from './pages/Inspections';
import CreateInspection from './pages/CreateInspection';
import InspectionDetail from './pages/InspectionDetail';
import MobileInspection from './pages/MobileInspection';
import MobileHome from './pages/MobileHome';
import './App.css';
import './theme.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router basename="/CMS_chek">
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/mobile" element={<MobileHome />} />
              <Route path="/inspection/:id" element={<MobileInspection />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/inspections" replace />} />
                <Route path="inspections" element={<Inspections />} />
                <Route path="inspections/create" element={<CreateInspection />} />
                <Route path="inspections/:id" element={<InspectionDetail />} />
              </Route>
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;