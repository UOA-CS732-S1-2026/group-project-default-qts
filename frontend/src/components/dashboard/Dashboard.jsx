import React, { useState } from 'react';
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

const MODAL_CONTENTS = {
  mytask: <MyTaskModal />,
  p2p: <P2PModal />,
  community: <CommunityModal />,
};

function Dashboard() {
  const { isOpen, modalType, openModal, closeModal } = useModal();
  const [questTargetId, setQuestTargetId] = useState(null);

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
      <DashboardHeader></DashboardHeader>

      <DasboardMain onQuestDetails={openQuestDetail}></DasboardMain>

      {/* <button className="btn-open-board" onClick={() => openModal('mytask')}>
        Open Task Board
      </button> */}

      {modalType === 'inventory' ? (
        isOpen && <InventoryModal onClose={handleCloseModal} />
      ) : modalType === 'store' ? (
        isOpen && <StoreModal onClose={handleCloseModal} />
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
