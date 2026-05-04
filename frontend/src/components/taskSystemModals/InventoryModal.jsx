import './InventoryModal.css';
import { useState, useEffect } from 'react';
import Item from '../ui/Item';
import eggItem from '../../assets/items/egg_thoseicons.png';
import sandwichItem from '../../assets/items/sandwich_freepik.png';
import snackItem from '../../assets/items/snack_freepik.png';
import roastChickenItem from '../../assets/items/roast-chicken_freepik.png';

const inventoryItems = [
  { id: 1, name: 'Egg', quantity: 2, image: eggItem },
  { id: 2, name: 'Snack', quantity: 5, image: snackItem },
  { id: 3, name: 'Sandwich', quantity: 1, image: sandwichItem },
  { id: 4, name: 'Roast Chicken', quantity: 1, image: roastChickenItem },
];

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
                {inventoryItems.map((item) => (
                  <Item
                    key={item.id}
                    image={item.image}
                    name={item.name}
                    quantity={item.quantity}
                    mode="inventory"
                  />
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
