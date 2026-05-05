import './StoreModal.css';
import { useState, useEffect, useRef } from 'react';
import Item from '../ui/Item';
import { ITEM_IMAGES } from '../../data/itemAssets';

const storeItems = [
    { id: 1, name: 'Egg', cost: 10, image: ITEM_IMAGES.egg },
    { id: 2, name: 'Snack', cost: 15, image: ITEM_IMAGES.snack },
    { id: 3, name: 'Sandwich', cost: 20, image: ITEM_IMAGES.sandwich },
    { id: 4, name: 'Roast Chicken', cost: 30, image: ITEM_IMAGES.roastChicken },
];

function StoreModal({ onClose }) {
    const CLOSE_ANIM_MS = 320;
    const [closing, setClosing] = useState(false);
    const timeoutRef = useRef(null);

    function handleClose() {
        if (closing) return;
        setClosing(true);
        timeoutRef.current = setTimeout(() => {
            onClose && onClose();
            timeoutRef.current = null;
        }, CLOSE_ANIM_MS);
    }

    useEffect(() => {
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

    return (
        <div className="store-overlay" onClick={handleClose}>
            <aside
                className={`store-panel ${closing ? 'store--closing' : 'store--open'}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Store"
            >
                <div className="store-modal">
                    <div className="store-header">
                        <h3 className="store-title">Store</h3>
                        <button className="modal-close" aria-label="Close" onClick={handleClose}>✕</button>
                    </div>

                    <p className="store-desc">Spend coins to buy items for your pet (mock data).</p>

                    <div className="store-grid">
                        {storeItems.map((item) => (
                            <Item
                                key={item.id}
                                image={item.image}
                                name={item.name}
                                cost={item.cost}
                                mode="store"
                                onBuy={() => { }}
                            />
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default StoreModal;
