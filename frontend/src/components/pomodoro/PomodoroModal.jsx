import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePomodoro from '../../hooks/usePomodoro';
import petImg from '../../assets/pet_placeholder.png';
import '../../styles/pomodoro.css';

const MotionDiv = motion.div;

export default function PomodoroModal({ onRequestClose, onRunningChange, onSessionComplete } = {}) {
	const {
		mode, timeLeft, isRunning, petProgress,
		showBubble, bubbleMessage, start, pause, dismissBubble,
		switchMode, formatTime, MODES: modes,
	} = usePomodoro();

	const handleClose = () => {
		if (typeof onRequestClose === 'function') onRequestClose();
	};

	useEffect(() => {
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = prevOverflow; };
	}, []);

	useEffect(() => {
		if (typeof onRunningChange === 'function') {
			onRunningChange(isRunning);
		}
	}, [isRunning, onRunningChange]);

	// Notify parent when a focus session completes so pet can celebrate
	useEffect(() => {
		if (showBubble && mode === 'focus' && typeof onSessionComplete === 'function') {
			onSessionComplete();
		}
	}, [showBubble, mode, onSessionComplete]);


	const modeKeys = ['focus', 'short', 'long'];
	const modeLabels = { focus: 'FOCUS', short: 'SHORT BREAK', long: 'LONG BREAK' };
	const tabLabels = {
		focus: 'FOCUS',
		short: <>SHORT<br />BREAK</>,
		long: <>LONG<br />BREAK</>,
	};
	const petLeft = `calc(${petProgress * 100}% - ${petProgress * 60}px)`;

	return (
		<MotionDiv
			className="pomodoro-page"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.35 }}
		>
			<div className={`pomo-modal mode-${mode}`} role="dialog" aria-modal="true" aria-label="Pomodoro timer">
				{/* Exit Button */}
				<button
					id="pomo-exit-btn"
					className="pomo-exit-btn"
					onClick={handleClose}
				>
					← Exit
				</button>

				{/* Mode Tabs */}
				<div className="pomo-tabs" role="tablist">
					{modeKeys.map((m) => (
						<button
							key={m}
							id={`pomo-tab-${m}`}
							className={`pomo-tab mode-${m}${mode === m ? ' active' : ''}`}
							role="tab"
							aria-selected={mode === m}
							onClick={() => switchMode(m)}
						>
							{tabLabels[m]}
						</button>
					))}
				</div>

				{/* Timer Display */}
				<div className="pomo-timer-wrapper">
					<div id="pomo-time-display" className="pomo-time-display">
						{formatTime(timeLeft)}
					</div>

					{/* Controls */}
					<div className="pomo-controls">
						{!isRunning ? (
							<button id="pomo-start-btn" className="pomo-start-btn" onClick={start}>
								START
							</button>
						) : (
							<button id="pomo-pause-btn" className="pomo-pause-btn" onClick={pause}>
								PAUSE
							</button>
						)}
					</div>

					{/* Mode info */}
					<div className="pomo-mode-info">
						{mode === 'focus' && `Focus session · ${modes.focus.short} minutes`}
						{mode === 'short' && `Short break · ${modes.short.short} minutes`}
						{mode === 'long' && `Long break · ${modes.long.short} minutes`}
					</div>
				</div>

				{/* Progress Track + Pet */}
				<div className="pomo-progress-section">
					<div className="pomo-track-wrapper">
						{/* Pet character */}
						<img
							src={petImg}
							alt="Your pet companion"
							className="pomo-pet"
							style={{ left: petLeft }}
						/>
						{/* Track */}
						<div className="pomo-track">
							<div
								className="pomo-track-fill"
								style={{ width: `${petProgress * 100}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Pet Notification Bubble */}
			<AnimatePresence>
				{showBubble && (
					<MotionDiv
						className="pomo-bubble-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={dismissBubble}
					>
						<MotionDiv
							className="pomo-bubble"
							initial={{ scale: 0.8, y: 30 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.85, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 280, damping: 22 }}
							onClick={(e) => e.stopPropagation()}
						>
							<img src={petImg} alt="Pet" className="pomo-bubble-pet" />
							<div className="pomo-bubble-title">{bubbleMessage.title}</div>
							<div className="pomo-bubble-text">{bubbleMessage.text}</div>
							<div className="pomo-bubble-hint">Click anywhere to continue</div>
						</MotionDiv>
					</MotionDiv>
				)}
			</AnimatePresence>
		</MotionDiv>
	);
}
