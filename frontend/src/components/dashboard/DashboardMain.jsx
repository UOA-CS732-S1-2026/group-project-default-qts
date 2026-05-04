import { useState } from 'react';
import PetView from './PetView';
import PomodoroModal from '../pomodoro/PomodoroModal';
import QuestSlider from './QuestSlider';
import './DashboardMain.css'

function DashboardMain({ onQuestDetails }) {
    const [showPomo, setShowPomo] = useState(false);
    const [pomoIsRunning, setPomoIsRunning] = useState(false);
    const [petExternalAnim, setPetExternalAnim] = useState(null); // null = let PetView decide

    // Called when a Pomodoro focus session completes → pet celebrates
    const handleSessionComplete = () => {
        setPetExternalAnim('celebrating');
        setTimeout(() => setPetExternalAnim(null), 2000); // revert after 2s
    };

    return (
        <main>
            <div className="main-content">
                <PetView
                    pomoIsRunning={pomoIsRunning}
                    externalAnim={petExternalAnim}
                />
                <button onClick={() => setShowPomo(true)}>POMODORO</button>
            </div>
            <aside className="task-slider-section">
                <QuestSlider onDetails={onQuestDetails} />
            </aside>

            {showPomo && (
                <PomodoroModal
                    onRequestClose={() => setShowPomo(false)}
                    onRunningChange={setPomoIsRunning}
                    onSessionComplete={handleSessionComplete}
                />
            )}
        </main>
    )
}

export default DashboardMain;