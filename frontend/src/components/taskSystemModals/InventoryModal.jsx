import '@/styles/components/InventoryModal.css';
import { useEffect, useRef, useState } from 'react';
import Item from '../ui/Item';
import { ITEM_IMAGES } from '../../data/itemAssets';
import { getInventory, normalizeInventoryItems } from '../../utils/inventoryApi';

function getItemImage(item) {
  const code = item?.itemCode || item?.code;

  if (code === 'RANDOM_EGG') return ITEM_IMAGES.egg;
  if (code === 'SNACK') return ITEM_IMAGES.snack;
  if (code === 'MEAL') return ITEM_IMAGES.sandwich;
  if (code === 'FEAST') return ITEM_IMAGES.roastChicken;

  return ITEM_IMAGES.snack;
}

function isEggItem(item) {
  const code = String(item?.itemCode || item?.code || '').toUpperCase();
  const name = String(item?.itemName || item?.name || '').toUpperCase();
  return code === 'RANDOM_EGG' || code === 'EGG' || name === 'EGG';
}

function InventoryModal({ onClose }) {
  const MAX_PET_SLOTS = 9;
  const CLOSE_ANIM_MS = 320;
  const [closing, setClosing] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timeoutRef = useRef(null);

  async function loadInventory() {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getInventory(token);
      const items = normalizeInventoryItems(response);
      setInventoryItems(items);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (closing) return;
    setClosing(true);
    timeoutRef.current = setTimeout(() => {
      onClose && onClose();
      timeoutRef.current = null;
    }, CLOSE_ANIM_MS);
  }

  useEffect(() => {
    loadInventory();

    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const petCollectionItems = inventoryItems.filter(isEggItem);
  const inventoryListItems = inventoryItems.filter((item) => !isEggItem(item));
  const petCollectionEggSlots = petCollectionItems.flatMap((item) => {
    const quantity = Math.max(0, Number(item.quantity || 0));
    return Array.from({ length: quantity }, (_, i) => ({
      ...item,
      slotKey: `egg-${item.id || item.storeItemId || item.itemCode}-${i}`
    }));
  });
  const emptyPetSlots = Math.max(0, MAX_PET_SLOTS - petCollectionEggSlots.length);

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
              {loading ? (
                <p>Loading inventory...</p>
              ) : error ? (
                <p>{error}</p>
              ) : inventoryListItems.length === 0 ? (
                <p>No inventory items found.</p>
              ) : (
                <div className="inventory-grid">
                  {inventoryListItems.map((item) => (
                    <Item
                      key={item.id || item.storeItemId || item.itemCode}
                      image={getItemImage(item)}
                      name={item.itemName || item.name || 'Unknown item'}
                      quantity={item.quantity ?? 0}
                      mode="inventory"
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="pet-collection-section">
              <h4 className="section-title">Pet Collection</h4>
              <div className="pets-grid">
                {petCollectionEggSlots.slice(0, MAX_PET_SLOTS).map((item) => (
                  <div key={item.slotKey} className="pet-slot">
                    <img
                      src={getItemImage(item)}
                      alt={item.itemName || item.name || 'Egg'}
                      className="pet-slot-img"
                    />
                  </div>
                ))}
                {Array.from({ length: emptyPetSlots }).map((_, i) => (
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
