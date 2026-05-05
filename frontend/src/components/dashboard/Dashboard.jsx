import React, { useEffect, useState } from 'react';
import useModal from '../../hooks/useModal';
import { AcceptedTasksProvider } from '../../context/AcceptedTasksContext';
import ModalBase from '../taskSystemModals/ModalBase';
import MyTaskModal from '../taskSystemModals/MyTaskModal';
import P2PModal from '../taskSystemModals/P2PModal';
import CommunityModal from '../taskSystemModals/CommunityModal';
import StoreModal from '../taskSystemModals/StoreModal';
import InventoryModal from '../taskSystemModals/InventoryModal';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import DasboardMain from './DashboardMain';
import { ITEM_IMAGE_LIST } from '../../data/itemAssets';
import { getDashboard } from '../../utils/dashboardApi';

const MODAL_CONTENTS = {
  mytask: <MyTaskModal />,
  p2p: <P2PModal />,
  community: <CommunityModal />,
};

function Dashboard() {
  const { isOpen, modalType, openModal, closeModal } = useModal();
  const [questTargetId, setQuestTargetId] = useState(null);
  const [coins, setCoins] = useState(0);

  async function loadDashboardCoins() {
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await getDashboard(token);
      const currentCoins = response?.data?.user?.coins;

      if (typeof currentCoins === 'number') {
        setCoins(currentCoins);
      }
    } catch (err) {
      console.error('Failed to load dashboard coins:', err);
    }
  }

  useEffect(() => {
    loadDashboardCoins();
    // Warm browser cache for store/inventory item images while user is on dashboard.
    ITEM_IMAGE_LIST.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const openQuestDetail = (taskId) => {
    setQuestTargetId(taskId);
    openModal('mytask');
  };

  const handleCloseModal = () => {
    closeModal();
    setQuestTargetId(null);
  };

  return (
    <AcceptedTasksProvider>
    <div className="app-container">
      <DashboardHeader coins={coins} />

      <DasboardMain onQuestDetails={openQuestDetail}></DasboardMain>

      {/* <button className="btn-open-board" onClick={() => openModal('mytask')}>
        Open Task Board
      </button> */}

      {modalType === 'inventory' ? (
        isOpen && <InventoryModal onClose={handleCloseModal} />
      ) : modalType === 'store' ? (
        isOpen && (
        <StoreModal
          onClose={handleCloseModal}
          onPurchaseSuccess={async (response) => {
            const updatedCoins = response?.data?.coins;

            if (typeof updatedCoins === 'number') {
              setCoins(updatedCoins);
            } else {
              await loadDashboardCoins();
            }
          }}
        />
        )
      ) : (
        <ModalBase
          isOpen={isOpen}
          onClose={handleCloseModal}
          modalType={modalType}
          onChangeType={openModal}
        >
          {modalType && React.cloneElement(MODAL_CONTENTS[modalType], {
            onClose: handleCloseModal,
            onNavigate: openModal,
            questTargetId: modalType === 'mytask' ? questTargetId : undefined,
          })}
        </ModalBase>
      )}

      <DashboardFooter openModal={openModal} modalType={modalType} closeModal={handleCloseModal} />
    </div>
    </AcceptedTasksProvider>
  );
}

export default Dashboard;
