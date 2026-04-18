import React, { useEffect, useState } from 'react';
import './ModalBase.css';

const MODAL_TABS = [
  { type: 'mytask', label: 'My Tasks' },
  { type: 'p2p', label: 'P2P Tasks' },
  { type: 'community', label: 'Community' },
  { type: 'store', label: 'Store' },
];

const MODAL_DESCRIPTIONS = {
  mytask: 'My Tasks — personal tasks you have created',
  p2p: 'P2P Tasks — tasks from other players you can accept',
  community: 'Community Tasks — tasks created by admins for all players',
  store: 'Store — purchase items for your pet',
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
    <div className={overlayClass} {...overlayProps}>
      <div className={containerClass} onClick={(e) => e.stopPropagation()}>

        {activeType !== 'store' && activeType !== 'inventory' ? (
          <>
            <div className="modal-header">
              <div className="modal-tabs">
                {MODAL_TABS
                  .filter((tab) => tab.type !== 'store')
                  .map((tab) => (
                    <button
                      key={tab.type}
                      className={`modal-tab ${activeType === tab.type ? 'modal-tab--active' : ''}`}
                      onClick={() => onChangeType(tab.type)}
                    >
                      {tab.label}
                    </button>
                  ))}
              </div>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <p className="modal-description">{MODAL_DESCRIPTIONS[activeType]}</p>

            <div className="modal-body">
              {children}
            </div>
          </>
        ) : (
          <div className={`modal-body modal-body--store modal-body--inventory`}>
            {children}
          </div>
        )}

      </div>
    </div>
  );
}

export default ModalBase;
