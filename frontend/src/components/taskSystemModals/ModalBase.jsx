import React, { useEffect, useState } from 'react';
import '../../styles/components/ModalBase.css';

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
  const CLOSE_ANIM_MS = 320;

  const [render, setRender] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [activeType, setActiveType] = useState(modalType);

  useEffect(() => {
    if (isOpen) {
      setActiveType(modalType);
      setRender(true);
      setClosing(false);
      return;
    }

    // when parent closes, keep rendered state and animate closing for `store` or `inventory`
    if (render) {
      if (activeType === 'store' || activeType === 'inventory') {
        setClosing(true);
        const t = setTimeout(() => {
          setRender(false);
          setClosing(false);
          setActiveType(null);
        }, CLOSE_ANIM_MS);
        return () => clearTimeout(t);
      } else {
        // other modals unmount immediately
        setRender(false);
        setActiveType(null);
      }
    }
  }, [isOpen, modalType]);

  if (!render) return null;

  const isPassThrough = activeType === 'store' || activeType === 'inventory';
  const overlayClass = `modal-overlay ${isPassThrough ? 'modal-overlay--pass-through' : ''}`;
  const containerClass = `modal-container ${isPassThrough ? 'modal--slide-left' : ''} ${closing ? 'modal--closing' : ''}`;

  const overlayProps = isPassThrough ? {} : { onClick: onClose };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-container" onClick={(e) => e.stopPropagation()}>

        <div className="task-modal-header">
          <div className="task-modal-tabs">
            {MODAL_TABS.map((tab) => (
              <button
                key={tab.type}
                className={`task-modal-tab ${modalType === tab.type ? 'task-modal-tab--active' : ''}`}
                onClick={() => onChangeType(tab.type)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="task-modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="task-modal-description">{MODAL_DESCRIPTIONS[modalType]}</p>

        <div className="task-modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}

export default ModalBase;
