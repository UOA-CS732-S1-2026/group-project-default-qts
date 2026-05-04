import '@/styles/dashboard/DashboardShortcuts.css';

function DashboardShortcuts({ openModal, modalType, closeModal }) {
    return (
        <div className="dashboard-shortcuts">
            <button className="shortcut-btn" onClick={() => openModal('p2p')}>
                <img className="shortcut-icon" src="/dashboardicons/board-1.png" alt="P2P Task" />
            </button>
            <button className="shortcut-btn" onClick={() => openModal('community')}>
                <img className="shortcut-icon" src="/dashboardicons/calendar_pixel_perfect.png" alt="Community Task" />
            </button>
            <button className="shortcut-btn" onClick={() => openModal('mytask')}>
                <img className="shortcut-icon" src="/dashboardicons/scroll_freepik.png" alt="My Task" />
            </button>
            <button className="shortcut-btn" onClick={() => openModal('inventory')}>
                <img className="shortcut-icon" src="/dashboardicons/backpack_freepik.png" alt="Inventory" />
            </button>
            <button className="shortcut-btn" onClick={() => openModal('store')}>
                <img className="shortcut-icon" src="/dashboardicons/shop_goerge_cresnar.png" alt="Store" />
            </button>
        </div>
    )
}

export default DashboardShortcuts;
