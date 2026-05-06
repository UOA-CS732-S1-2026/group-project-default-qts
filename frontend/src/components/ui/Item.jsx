import './Item.css';

function Item({
    image,
    name,
    cost,
    quantity = 0,
    mode = 'store',
    onBuy,
    disabled = false,
    buyLabel = 'Buy'
}) {
    if (mode === 'inventory') {
        return (
            <div className="item-card item-card--inventory" title={name}>
                <div className="item-image-wrap">
                    <img src={image} alt={name} className="item-image" />
                </div>
                <div className="item-qty">x{quantity}</div>
            </div>
        );
    }

    return (
        <div className="item-card item-card--store">
            <div className="item-image-wrap">
                <img src={image} alt={name} className="item-image" />
            </div>
            <h4 className="item-name">{name}</h4>
            <div className="item-cost">{cost} coins</div>
            <button
                className="item-buy"
                onClick={onBuy}
                disabled={disabled}
            >
                {buyLabel}
            </button>
        </div>
    );
}

export default Item;