import '@/styles/dashboard/DashboardShortcuts.css';

function DashboardShortcuts({ openModal, modalType, closeModal }) {
    return (
        <div className="dashboard-shortcuts">
            <button onClick={() => openModal('p2p')}>
                <img src="public/dashboardicons/board-1.png" alt="P2P Task" />
            </button>
            <button onClick={() => openModal('community')}>
                <img src="public/dashboardicons/calendar_pixel_perfect.png" alt="Community Task" />
            </button>
            <button onClick={() => openModal('mytask')}>
                <img src="public/dashboardicons/scroll_freepik.png" alt="My Task" />
            </button>
            <button onClick={() => openModal('inventory')}>
                <img src="public/dashboardicons/backpack_freepik.png" alt="Inventory" />
            </button>
            <button onClick={() => openModal('store')}>
                <img src="public/dashboardicons/shop_goerge_cresnar.png" alt="Store" />
            </button>
        </div>
    )
}

export default DashboardShortcuts;