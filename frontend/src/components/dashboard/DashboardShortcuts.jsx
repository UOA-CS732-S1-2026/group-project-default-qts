import './DashboardShortcuts.css';

function DashboardShortcuts({ openModal, modalType, closeModal }) {

    const toggle = (type) => {
        if (modalType === type) closeModal();
        else openModal(type);
    };

    return (
        <div className="dashboard-shortcuts">
            <button onClick={() => toggle('p2p')}>
                <img src="public/dashboardicons/board-1.png" alt="P2P Task" />
            </button>
            <button onClick={() => toggle('community')}>
                <img src="public/dashboardicons/calendar_pixel_perfect.png" alt="Community Task" />
            </button>
            <button onClick={() => toggle('mytask')}>
                <img src="public/dashboardicons/scroll_freepik.png" alt="My Task" />
function DashboardShortcuts({ openModal }) {

    return (
        <div className="dashboard-shortcuts">
            <button onClick={() => toggle('p2p')}>
                <img src="public/dashboardicons/board-1.png" alt="P2P Task" />
            </button>
            <button onClick={() => toggle('community')}>
                <img src="public/dashboardicons/calendar_pixel_perfect.png" alt="Community Task" />
            </button>
            <button onClick={() => toggle('mytask')}>
                <img src="public/dashboardicons/scroll_freepik.png" alt="My Task" />
            </button>
            <button onClick={() => toggle('inventory')}>
                <img src="public/dashboardicons/backpack_freepik.png" alt="Inventory" />
            </button>
            <button onClick={() => toggle('store')}>
            <button onClick={() => openModal('store')}>
                <img src="public/dashboardicons/shop_goerge_cresnar.png" alt="Store" />
            </button>
        </div>
    )
}

export default DashboardShortcuts;