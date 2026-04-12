import './ModalBase.css';

const MODAL_TABS = [
  { type: 'mytask', label: 'My Tasks' },
  { type: 'p2p', label: 'P2P Tasks' },
  { type: 'community', label: 'Community' },
];

const MODAL_DESCRIPTIONS = {
  mytask: 'My Tasks — personal tasks you have created',
  p2p: 'P2P Tasks — tasks from other players you can accept',
  community: 'Community Tasks — tasks created by admins for all players',
};

function ModalBase({ isOpen, onClose, modalType, onChangeType, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-tabs">
            {MODAL_TABS.map((tab) => (
              <button
                key={tab.type}
                className={`modal-tab ${modalType === tab.type ? 'modal-tab--active' : ''}`}
                onClick={() => onChangeType(tab.type)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-description">{MODAL_DESCRIPTIONS[modalType]}</p>

        <div className="modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}

export default ModalBase;
