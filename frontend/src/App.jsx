import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AcceptedTasksProvider } from './context/AcceptedTasksContext';
import { TasksProvider } from './context/TasksContext';

import LandingPage from './pages/LandingPage';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AdminPage from './pages/AdminPage';
import NotFound from './components/404page/NotFound';

import './App.css';

function getAuthToken() {
  return localStorage.getItem('token');
}

function RequireAuth({ children }) {
  const [token, setToken] = useState(() => getAuthToken());

  useEffect(() => {
    const syncToken = () => setToken(getAuthToken());

    function handleStorage(event) {
      if (!event || TOKEN_KEYS.includes(event.key)) {
        syncToken();
      }
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncToken);
    document.addEventListener('visibilitychange', syncToken);

    // Poll to detect token removal in the same tab (e.g. manual localStorage clear).
    const intervalId = window.setInterval(syncToken, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncToken);
      document.removeEventListener('visibilitychange', syncToken);
      window.clearInterval(intervalId);
    };
  }, []);

  if (!token) return <Navigate to="/landingpage" replace />;
  return children;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={(
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          )}
        />
        <Route
          path="/admin"
          element={(
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AcceptedTasksProvider>
          <TasksProvider>
            <AppRoutes />
          </TasksProvider>
        </AcceptedTasksProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
