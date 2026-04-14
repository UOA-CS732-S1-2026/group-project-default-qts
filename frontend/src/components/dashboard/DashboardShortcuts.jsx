import './DashboardShortcuts.css';

function DashboardShortcuts({ openModal }) {

    return (
        <div className="dashboard-shortcuts">
            <button onClick={() => openModal('p2p')}>
                <img src="public/dashboardicons/board-1.png" alt="Public Task" />
            </button>
            <button onClick ={() => openModal('community')}>
                <img src="public/dashboardicons/calendar_pixel_perfect.png" alt="Public Task" />
            </button>
            <button onClick={() => openModal('mytask')}>
                <img src="public/dashboardicons/scroll_freepik.png" alt="Public Task" />
            </button>
            <button>
                <img src="public/dashboardicons/backpack_freepik.png" alt="Public Task" />
            </button>
            <button onClick={() => openModal('store')}>
                <img src="public/dashboardicons/shop_goerge_cresnar.png" alt="Store" />
            </button>
        </div>
    )
}

export default DashboardShortcuts;