import './StoreModal.css';
import { useState, useEffect, useRef } from 'react';
import Item from '../ui/Item';
import { ITEM_IMAGES } from '../../data/itemAssets';
import { getStoreItems, purchaseItem } from '../../utils/storeApi';

function normalizeStoreItems(response) {
    const data = response?.data || response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.storeItems)) return data.storeItems;

    return [];
}

function getItemImage(item) {
    if (item.code === 'RANDOM_EGG') return ITEM_IMAGES.egg;
    if (item.code === 'SNACK') return ITEM_IMAGES.snack;
    if (item.code === 'MEAL') return ITEM_IMAGES.sandwich;
    if (item.code === 'FEAST') return ITEM_IMAGES.roastChicken;

    return ITEM_IMAGES.snack;
}

function StoreModal({ onClose, onPurchaseSuccess }) {
    const CLOSE_ANIM_MS = 320;
    const [closing, setClosing] = useState(false);
    const [storeItems, setStoreItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyingCode, setBuyingCode] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const timeoutRef = useRef(null);

    async function loadStoreItems() {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await getStoreItems(token);
            const items = normalizeStoreItems(response);

            setStoreItems(items);
        } catch (err) {
            setError(err.message || 'Failed to load store items');
        } finally {
            setLoading(false);
        }
    }

    async function handleBuy(item) {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        try {
            setBuyingCode(item.code);
            setMessage('');
            setError('');

            const response = await purchaseItem(item.code, 1, token);

            setMessage(response?.message || `${item.name} purchased successfully`);

            if (onPurchaseSuccess) {
                await onPurchaseSuccess(response);
            }

            await loadStoreItems();
        } catch (err) {
            setError(err.message || 'Purchase failed');
        } finally {
            setBuyingCode(null);
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
        loadStoreItems();

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
                        <button className="modal-close" aria-label="Close" onClick={handleClose}>
                            ✕
                        </button>
                    </div>

                    <p className="store-desc">Spend coins to buy items for your pet.</p>

                    {message && <p className="store-success">{message}</p>}
                    {error && <p className="store-error">{error}</p>}

                    {loading ? (
                        <p>Loading store items...</p>
                    ) : storeItems.length === 0 ? (
                        <p>No store items available.</p>
                    ) : (
                        <div className="store-grid">
                            {storeItems.map((item) => {
                                const disabled = item.locked || buyingCode === item.code;
                                const buyLabel = item.locked
                                    ? 'Locked'
                                    : buyingCode === item.code
                                        ? 'Buying...'
                                        : 'Buy';

                                return (
                                    <Item
                                        key={item.id || item._id || item.code}
                                        image={getItemImage(item)}
                                        name={item.name}
                                        cost={item.price}
                                        mode="store"
                                        disabled={disabled}
                                        buyLabel={buyLabel}
                                        onBuy={() => handleBuy(item)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default StoreModal;