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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';
const TOKEN_KEYS = ['token'];

function getAuthToken() {
  return localStorage.getItem('token');
}

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('gf_current_user');
}

async function validateToken(token) {
  if (!token) return { valid: false, user: null };
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { valid: false, user: null };
    const data = await res.json();
    return { valid: true, user: data?.data || data?.user || data || null };
  } catch {
    return { valid: false, user: null };
  }
}

function isAdminUser(user) {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const role = String(user.role || '').toLowerCase();
  return roles.some((r) => String(r).toLowerCase() === 'admin') || role === 'admin';
}

function LandingGate() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setStatus('guest');
        return;
      }

      const { valid, user } = await validateToken(token);
      if (cancelled) return;

      if (valid) setStatus(isAdminUser(user) ? 'admin' : 'authenticated');
      else {
        clearAuthStorage();
        setStatus('guest');
      }
    };

    runCheck();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking') return null;
  if (status === 'admin') return <Navigate to="/admin" replace />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function RequireAuth({ children }) {
  const [authState, setAuthState] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const runValidation = async () => {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setAuthState('invalid');
        return;
      }

      if (!cancelled) setAuthState('checking');
      const { valid } = await validateToken(token);
      if (cancelled) return;

      if (valid) setAuthState('valid');
      else {
        clearAuthStorage();
        setAuthState('invalid');
      }
    };

    function handleStorage(event) {
      if (!event || TOKEN_KEYS.includes(event.key)) {
        runValidation();
      }
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', runValidation);
    document.addEventListener('visibilitychange', runValidation);
    runValidation();

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', runValidation);
      document.removeEventListener('visibilitychange', runValidation);
    };
  }, []);

  if (authState === 'checking') return null;
  if (authState !== 'valid') return <Navigate to="/landingpage" replace />;
  return children;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingGate />} />
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
