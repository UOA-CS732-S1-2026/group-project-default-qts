import './Item.css';

function Item({
    image,
    name,
    itemCode,
    cost,
    quantity = 0,
    mode = 'store',
    onBuy,
    disabled = false,
    buyLabel = 'Buy'
}) {
    const FOOD_TOOLTIP_META = {
        SNACK: {
            type: 'Snack',
            shortDescription: 'A light bite that gives your pet a quick energy boost.',
            growthValue: 5
        },
        MEAL: {
            type: 'Meal',
            shortDescription: 'A balanced meal that steadily supports pet growth.',
            growthValue: 12
        },
        FEAST: {
            type: 'Feast',
            shortDescription: 'A hearty feast that significantly boosts pet growth.',
            growthValue: 21
        }
    };

    const normalizedCode = String(itemCode || '').toUpperCase();
    const foodMeta = FOOD_TOOLTIP_META[normalizedCode];
    const isFoodItem = Boolean(foodMeta);
    const displayQuantity = mode === 'inventory' ? Number(quantity || 0) : 1;

    if (mode === 'inventory') {
        return (
            <div className="item-card item-card--inventory" title={name}>
                <div className="item-image-wrap">
                    <img src={image} alt={name} className="item-image" />
                    {isFoodItem && (
                        <div className="item-tooltip" role="tooltip">
                            <div className="item-tooltip-name">{name}</div>
                            <div className="item-tooltip-line">{foodMeta.type}: {foodMeta.shortDescription}</div>
                            <div className="item-tooltip-line">Growth Value: +{foodMeta.growthValue}</div>
                            <div className="item-tooltip-line">Quantity: x{displayQuantity}</div>
                        </div>
                    )}
                </div>
                <div className="item-qty">x{quantity}</div>
            </div>
        );
    }

    return (
        <div className="item-card item-card--store">
            <div className="item-image-wrap">
                <img src={image} alt={name} className="item-image" />
                {isFoodItem && (
                    <div className="item-tooltip" role="tooltip">
                        <div className="item-tooltip-name">{name}</div>
                        <div className="item-tooltip-line">{foodMeta.type}: {foodMeta.shortDescription}</div>
                        <div className="item-tooltip-line">Growth Value: +{foodMeta.growthValue}</div>
                        <div className="item-tooltip-line">Quantity: x{displayQuantity}</div>
                    </div>
                )}
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
