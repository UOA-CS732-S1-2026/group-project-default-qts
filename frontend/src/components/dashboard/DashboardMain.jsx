import PetView from './PetView';
import './DashboardMain.css'
function DashboardMain() {
    return(
        <main>
            <div className="main-content">
                <PetView/>
                <button>POMODORO</button>
            </div>
            <aside className="task-slider-section">
                <div className="task-slider-container">
                    <h2>Task Slider</h2>
                </div>
            </aside>
        </main>
    )
}

export default DashboardMain;