import useModal from '../../hooks/useModal';
import ModalBase from '../modals/ModalBase';
import MyTaskModal from '../modals/MyTaskModal';
import P2PModal from '../modals/P2PModal';
import CommunityModal from '../modals/CommunityModal';

const MODAL_CONTENTS = {
  mytask: <MyTaskModal />,
  p2p: <P2PModal />,
  community: <CommunityModal />,
};

function Dashboard() {
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

export default Dashboard;
