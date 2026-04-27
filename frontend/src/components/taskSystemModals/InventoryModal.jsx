import './InventoryModal.css';
import { useState, useEffect } from 'react';

function InventoryModal({ onClose }) {
  const CLOSE_ANIM_MS = 320;
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => onClose && onClose(), CLOSE_ANIM_MS);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="inventory-overlay" onClick={handleClose}>
      <aside
        className={`inventory-panel ${closing ? 'inventory--closing' : 'inventory--open'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Inventory"
      >
        <div className="inventory-modal">
          <div className="inventory-header">
            <h3 className="inventory-title">Inventory</h3>
            <button className="modal-close" onClick={handleClose}>✕</button>
          </div>

          <p className="inventory-desc">Your items and collected pets.</p>

          <div className="inventory-wrapper">
            <section className="inventory-section">
              <h4 className="section-title">Items</h4>
              <div className="inventory-grid">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="inventory-slot">
                    <div className="inventory-slot-img" />
                    <div className="inventory-slot-badge">x1</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="pet-collection-section">
              <h4 className="section-title">Pet Collection</h4>
              <div className="pets-grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="pet-slot">
                    <div className="pet-slot-img" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default InventoryModal;
