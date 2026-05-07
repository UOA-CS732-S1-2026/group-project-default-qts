import '@/styles/dashboard/DashboardHeader.css';
import CoinBadge from "../ui/CoinBadge";
import UserMenu from "../userconfig/UserMenu";

function DashboardHeader({ coins = 0, activePet, onEvolveRequest }) {
    const showEvolve = Boolean(activePet?.evolutionReady);

    return (
        <header className="dashboard-header">
            {showEvolve ? (
                <button className="evolve-header-btn" onClick={onEvolveRequest} type="button">
                    Click to EVOLVE
                    <span className="evolve-tooltip">ready to evolve?</span>
                </button>
            ) : (
                <h1 className="app-title">GrowFriend</h1>
            )}
            <nav className="dashboard-nav">
                <div className="coin-display">
                    <CoinBadge amount={coins} />
                </div>
                <UserMenu />
            </nav>
        </header>
    );
}

export default DashboardHeader;