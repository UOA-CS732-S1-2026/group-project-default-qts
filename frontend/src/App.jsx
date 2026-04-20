import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';

import LandingPage from './pages/LandingPage';
import Dashboard from './components/dashboard/Dashboard.jsx';
import NotFound from './components/404page/NotFound';

import useModal from './hooks/useModal';
import ModalBase from './components/taskSystemModals/ModalBase';
import MyTaskModal from './components/taskSystemModals/MyTaskModal';
import P2PModal from './components/taskSystemModals/P2PModal';
import CommunityModal from './components/taskSystemModals/CommunityModal';

import './App.css';

const MODAL_CONTENTS = {
  mytask: <MyTaskModal />,
  p2p: <P2PModal />,
  community: <CommunityModal />,
};

function TaskSystemDemo() {
  const { isOpen, modalType, openModal, closeModal } = useModal();

  return (
    <div className="app-container">
      <h1 className="app-title">GrowFriend</h1>

      <button className="btn-open-board" onClick={() => openModal('mytask')}>
        Open Task Board
      </button>

      <ModalBase
        isOpen={isOpen}
        onClose={closeModal}
        modalType={modalType}
        onChangeType={openModal}
      >
        {modalType && MODAL_CONTENTS[modalType]}
      </ModalBase>
    </div>
  );
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskSystemDemo />} />
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
