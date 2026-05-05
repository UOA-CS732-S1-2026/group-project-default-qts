import './InventoryModal.css';
import { useState, useEffect } from 'react';
import Item from '../ui/Item';
import { ITEM_IMAGES } from '../../data/itemAssets';

import { getInventory } from '../../utils/inventoryApi';

function getItemImage(item) {
  if (item.itemCode === 'RANDOM_EGG') return ITEM_IMAGES.egg;
  if (item.itemCode === 'SNACK') return ITEM_IMAGES.snack;
  if (item.itemCode === 'MEAL') return ITEM_IMAGES.sandwich;
  if (item.itemCode === 'FEAST') return ITEM_IMAGES.roastChicken;
  return ITEM_IMAGES.snack;
}

function InventoryModal({ onClose }) {
  const CLOSE_ANIM_MS = 320;
  const [closing, setClosing] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmItem, setConfirmItem] = useState(null);

  function handleClose() {
    setClosing(true);
    setTimeout(() => onClose && onClose(), CLOSE_ANIM_MS);
  }

  useEffect(() => {
    async function fetchInventory() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await getInventory(token);
        setInventoryItems(res?.data?.items || []);
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();

    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleDoubleClick = (item) => {
    // Only food can be fed (prevent eggs from being fed)
    if (item.type !== 'FOOD') return;
    setConfirmItem(item);
  };

  const handleConfirmFeed = () => {
    if (confirmItem) {
      window.dispatchEvent(new CustomEvent('gf-feed-pet', { detail: { itemCode: confirmItem.itemCode } }));
      setConfirmItem(null);
      handleClose();
    }
  };

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

          <p className="inventory-desc">Your items and collected pets. Double click to feed your pet</p>

          <div className="inventory-wrapper">
            <section className="inventory-section">
              <h4 className="section-title">Items</h4>
              {loading ? (
                <p>Loading...</p>
              ) : inventoryItems.length === 0 ? (
                <p>Your inventory is empty.</p>
              ) : (
                <div className="inventory-grid">
                  {inventoryItems.map((item) => (
                    <Item
                      key={item.id}
                      image={getItemImage(item)}
                      name={item.itemName || item.itemCode}
                      quantity={item.quantity}
                      mode="inventory"
                      onDoubleClick={() => handleDoubleClick(item)}
                    />
                  ))}
                </div>
              )}
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

      {/* Confirmation Bubble */}
      {confirmItem && (
        <div className="feed-confirm-bubble" onClick={(e) => e.stopPropagation()}>
          <div className="feed-confirm-content">
            <p>Do you want to feed your pet <b>{confirmItem.itemName || confirmItem.itemCode}</b>?</p>
            <div className="feed-confirm-actions">
              <button className="gf-btn gf-btn-ghost" onClick={() => setConfirmItem(null)}>Cancel</button>
              <button className="gf-btn gf-btn-primary" onClick={handleConfirmFeed}>Feed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryModal;
