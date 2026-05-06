import '@/styles/dashboard/DashboardHeader.css';
import CoinBadge from "../ui/CoinBadge";
import UserMenu from "../userconfig/UserMenu";
import { useApp } from '../../context/AppContext';

function DashboardHeader() {
  const { currentUser } = useApp();

  return (
    <header className="dashboard-header">
      <h1 className="app-title">GrowFriend</h1>
      <nav className="dashboard-nav">
        <div className="coin-display">
          <CoinBadge amount={currentUser?.coins ?? 0} />
        </div>
        <UserMenu />
      </nav>
    </header>
  );
}

export default DashboardHeader;

