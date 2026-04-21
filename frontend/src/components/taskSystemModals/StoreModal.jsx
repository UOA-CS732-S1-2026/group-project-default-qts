import './StoreModal.css';
import { useState, useEffect } from 'react';

function StoreModal({ onClose }) {
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
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="store-item">
                                <div className="store-item-img" />
                                <div className="store-item-title">Item {i + 1}</div>
                                <div className="store-item-cost">10 coins</div>
                                <button className="store-item-buy">Buy</button>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default StoreModal;
