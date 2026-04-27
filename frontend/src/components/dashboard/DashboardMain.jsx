import { useState } from 'react';
import PetView from './PetView';
import PomodoroModal from '../pomodoro/PomodoroModal';
import QuestSlider from './QuestSlider';
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
                <QuestSlider />
            </aside>

            {showPomo && (
                <PomodoroModal onRequestClose={() => setShowPomo(false)} />
            )}
        </main>
    )
}

export default DashboardMain;