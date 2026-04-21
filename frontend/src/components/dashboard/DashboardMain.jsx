import { useState } from 'react';
import PetView from './PetView';
import PomodoroModal from '../pomodoro/PomodoroModal';
import './DashboardMain.css'

function DashboardMain() {
    const [showPomo, setShowPomo] = useState(false);

    return(
        <main>
            <div className="main-content">
                <PetView/>
                <button onClick={() => setShowPomo(true)}>POMODORO</button>
            </div>
            <aside className="task-slider-section">
                <div className="task-slider-container">
                    <h2>Task Slider</h2>
                </div>
            </aside>

            {showPomo && (
                <PomodoroModal onRequestClose={() => setShowPomo(false)} />
            )}
        </main>
    )
}

export default DashboardMain;