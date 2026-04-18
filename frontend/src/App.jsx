import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import NotFound from './components/404page/NotFound';
import TempDashboard from './pages/TempDashboard';

//   GrowFriend – App Router
function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />

        <Route path="/landingpage" element={<LandingPage />} />

        <Route path="/dashboard" element={<TempDashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
