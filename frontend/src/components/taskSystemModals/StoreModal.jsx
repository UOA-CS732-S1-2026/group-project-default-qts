import './StoreModal.css';

function StoreModal({ onClose }) {
    return (
        <div className="store-modal">
            <div className="store-header">
                <h3 className="store-title">Store</h3>
                <button className="modal-close" onClick={onClose}>✕</button>
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
    );
}

export default StoreModal;
