import { useState, useEffect, useCallback } from 'react';

// --- usePomodoro Hook: manages pomodoro logic e.g., timer state, mode cycling, pet position ---

export const MODES = {
    focus: { label: 'FOCUS', duration: 25 * 60, short: 25 },
    short: { label: 'SHORT BREAK', duration: 5 * 60, short: 5 },
    long: { label: 'LONG BREAK', duration: 15 * 60, short: 15 },
};

export default function usePomodoro() {
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [focusCount, setFocusCount] = useState(0); // number of completed focus sessions
    const [showBubble, setShowBubble] = useState(false);
    const [nextModeQueued, setNextModeQueued] = useState(null);

    const totalDuration = MODES[mode].duration;
    const elapsed = totalDuration - timeLeft;
    // petPosition: 0 (left) → 1 (right)
    const petProgress = elapsed / totalDuration;

    // Determine next mode
    function getNextMode(currentMode, currentFocusCount) {
        if (currentMode === 'focus') {
            const newCount = currentFocusCount + 1;
            if (newCount >= 4) return { nextMode: 'long', newFocusCount: 0 };
            return { nextMode: 'short', newFocusCount: newCount };
        }
        return { nextMode: 'focus', newFocusCount: currentFocusCount };
    }

    // Timer tick
    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(id);
                    setIsRunning(false);
                    // Determine next mode and show bubble
                    const { nextMode, newFocusCount } = getNextMode(mode, mode === 'focus' ? focusCount : focusCount);
                    if (mode === 'focus') setFocusCount((c) => c + 1);
                    setNextModeQueued({ nextMode, newFocusCount: mode === 'focus' ? focusCount + 1 : focusCount });
                    setShowBubble(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isRunning, mode, focusCount]);

    function start() { setIsRunning(true); }
    function pause() { setIsRunning(false); }

    function dismissBubble() {
        setShowBubble(false);
        if (nextModeQueued) {
            const { nextMode, newFocusCount } = nextModeQueued;
            const adjustedFocusCount = nextMode === 'long' ? 0 : (nextMode === 'focus' ? (newFocusCount >= 4 ? 0 : newFocusCount) : newFocusCount);
            setMode(nextMode);
            setTimeLeft(MODES[nextMode].duration);
            setFocusCount(nextMode === 'long' ? 0 : adjustedFocusCount);
            setNextModeQueued(null);
        }
    }

    function switchMode(newMode) {
        setMode(newMode);
        setTimeLeft(MODES[newMode].duration);
        setIsRunning(false);
        setShowBubble(false);
    }

    // Format time
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // Bubble messages per mode
    const bubbleMessages = {
        focus: { title: "Focus Complete! 🎉", text: "Great work! Time for a break. Your buddy is proud of you!" },
        short: { title: "Break's Over! ⏰", text: "Ready to get back to it? Let's keep the momentum going!" },
        long: { title: "Long Break Done! 🌟", text: "Feeling refreshed? Time to dive back into a focus session!" },
    };

    return {
        mode,
        timeLeft,
        isRunning,
        focusCount: mode === 'focus' ? focusCount : focusCount,
        petProgress,
        showBubble,
        bubbleMessage: bubbleMessages[mode],
        start,
        pause,
        dismissBubble,
        switchMode,
        formatTime,
        totalDuration,
        MODES,
    };
}
