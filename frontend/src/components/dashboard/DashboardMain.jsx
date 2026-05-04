import { useState } from 'react';
import PetView from './PetView';
import PomodoroModal from '../pomodoro/PomodoroModal';
import QuestSlider from './QuestSlider';
import '@/styles/dashboard/DashboardMain.css'

function DashboardMain({ onQuestDetails }) {
    const [showPomo, setShowPomo] = useState(false);

    return(
        <main>
            <div className="main-content">
                <PetView/>
                <button onClick={() => setShowPomo(true)}>POMODORO</button>
            </div>
            <aside className="task-slider-section">
                <QuestSlider onDetails={onQuestDetails} />
            </aside>

            {showPomo && (
                <PomodoroModal onRequestClose={() => setShowPomo(false)} />
            )}
        </main>
    )
}

export default DashboardMain;