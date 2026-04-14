import DashboardShortcuts from './DashboardShortcuts';
import './DashboardFooter.css';

function DashboardFooter({ openModal }){
    return(
        <footer className = "dashboard-footer">
                <div className = "copyright">
                    <p className='copyright'>&copy; 2026 GrowFriend. All rights reserved.</p>
                </div>
                <DashboardShortcuts openModal={openModal} />
        </footer>
    )
}

export default DashboardFooter;