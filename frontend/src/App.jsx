import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { TasksProvider } from './context/TasksContext';

import LandingPage from './pages/LandingPage';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AdminPage from './pages/AdminPage';
import NotFound from './components/404page/NotFound';

import './App.css';

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <TasksProvider>
          <AppRoutes />
        </TasksProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
