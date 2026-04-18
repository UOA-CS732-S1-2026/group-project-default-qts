import './App.css';
import useModal from './hooks/useModal';
import ModalBase from './components/modals/ModalBase';
import MyTaskModal from './components/modals/MyTaskModal';
import P2PModal from './components/modals/P2PModal';
import CommunityModal from './components/modals/CommunityModal';

const MODAL_CONTENTS = {
  mytask: <MyTaskModal />,
  p2p: <P2PModal />,
  community: <CommunityModal />,
};

function App() {
  const { isOpen, modalType, openModal, closeModal } = useModal();
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import NotFound from './components/404page/NotFound';
import TempDashboard from './pages/TempDashboard';

//   GrowFriend – App Router
function AppRoutes() {
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

export default App;
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
