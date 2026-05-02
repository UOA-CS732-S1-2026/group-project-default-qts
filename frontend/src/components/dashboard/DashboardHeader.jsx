import './DashboardHeader.css';
import CoinBadge from "../ui/CoinBadge";
import UserMenu from "../userconfig/UserMenu";
import { useApp } from '../../context/AppContext';

function DashboardHeader(){
    const { coins } = useApp();
    return(
        <header className="dashboard-header">
            <h1 className="app-title">GrowFriend</h1>
            <nav className = "dashboard-nav">
                <div className = "coin-display">
                    <CoinBadge amount={coins}/>
                </div>
                <UserMenu />
            </nav>
        </header>

    )
}

export default DashboardHeader;