import './CoinBadge.css';


function CoinBadge({amount}){
    return(
        <div className="coin-badge">
            <span className="coin-badge-icon">🪙</span>
            <span className="coin-badge-amount">{amount}</span>
        </div>
    )
}

export default CoinBadge