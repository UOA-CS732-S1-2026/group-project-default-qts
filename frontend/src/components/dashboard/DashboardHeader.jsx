import CoinBadge from "../shared/CoinBadge";

function DashboardHeader(){
    return(
        <header className="dashboard-header">
            <h1 className="app-title">GrowFriend</h1>
            <nav className = "dashboard-nav">
                <div className = "coin-display">
                    <CoinBadge amount={100}/> {/* this will be the amount of coins the user has. Receive a prop named amount */}
                </div>
                <button className = "profile-button">
                    {/* this will be the profile picture of the user */}
                </button>
            </nav>
        </header>

    )
}