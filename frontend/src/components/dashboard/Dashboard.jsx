import React from 'react';
import useModal from '../../hooks/useModal';
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

  return (
    <div className="app-container">
      <DashboardHeader></DashboardHeader>

      <DasboardMain></DasboardMain>

      {/* <button className="btn-open-board" onClick={() => openModal('mytask')}>
        Open Task Board
      </button> */}

      {modalType === 'inventory' ? (
        isOpen && <InventoryModal onClose={closeModal} />
      ) : modalType === 'store' ? (
        isOpen && <StoreModal onClose={closeModal} />
      ) : (
        <ModalBase
          isOpen={isOpen}
          onClose={closeModal}
          modalType={modalType}
          onChangeType={openModal}
        >
          {modalType && React.cloneElement(MODAL_CONTENTS[modalType], { onClose: closeModal })}
        </ModalBase>
      )}

      <DashboardFooter openModal={openModal} modalType={modalType} closeModal={closeModal} />
    </div>
  );
}

export default Dashboard;
