import './DashboardHeader.css';
import CoinBadge from "../ui/CoinBadge";

function DashboardHeader(){
    return(
        <header className="dashboard-header">
            <h1 className="app-title">GrowFriend</h1>
            <nav className = "dashboard-nav">
                <div className = "coin-display">
                    <CoinBadge amount={100}/> {/* this will be the amount of coins the user has. Receive a prop named amount */}
                </div>
                <button className = "profile-button">
                    <img className='profile-img' src="public/profilemock.jpg" alt="profile picture" />
                </button>
            </nav>
        </header>

    )
}

export default DashboardHeader;