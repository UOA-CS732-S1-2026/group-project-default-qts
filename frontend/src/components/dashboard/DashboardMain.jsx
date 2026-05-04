import { useState } from 'react';
import PetView from './PetView';
import PomodoroModal from '../pomodoro/PomodoroModal';
import QuestSlider from './QuestSlider';
import './DashboardMain.css'

function DashboardMain({ onQuestDetails }) {
    const [showPomo, setShowPomo] = useState(false);
    const [pomoIsRunning, setPomoIsRunning] = useState(false);

    return (
        <main>
            <div className="main-content">
                <PetView pomoIsRunning={pomoIsRunning} />
                <button onClick={() => setShowPomo(true)}>POMODORO</button>
            </div>
            <aside className="task-slider-section">
                <QuestSlider onDetails={onQuestDetails} />
            </aside>

            {showPomo && (
                <PomodoroModal
                    onRequestClose={() => setShowPomo(false)}
                    onRunningChange={setPomoIsRunning}
                />)}
        </main>
    )
}

export default DashboardMain;