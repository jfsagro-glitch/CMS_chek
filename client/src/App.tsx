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
import InspectionDetail from './pages/InspectionDetail';
import MobileHome from './pages/MobileHome';
import MobileInspection from './pages/MobileInspection';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <InspectionsProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Inspections />} />
                  <Route path="inspections" element={<Inspections />} />
                  <Route path="inspections/:id" element={<InspectionDetail />} />
                </Route>
                <Route path="/mobile" element={<MobileHome />} />
                <Route path="/inspection/:id" element={<MobileInspection />} />
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