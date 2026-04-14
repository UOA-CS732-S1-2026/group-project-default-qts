import DashboardShortcuts from './DashboardShortcuts';
import './DashboardFooter.css';

function DashboardFooter(){
    return(
        <footer className = "dashboard-footer">
                <div className = "copyright">
                    <p className='copyright'>&copy; 2026 GrowFriend. All rights reserved.</p>
                </div>
                <DashboardShortcuts/>
        </footer>
    )
}

export default DashboardFooter;