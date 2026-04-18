import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import avatarPlaceholder from '../../assets/avatar_placeholder.png';


const STAT_LABELS = [
    { key: 'publicTaskCompleted', label: 'Platform Tasks' },
    { key: 'p2pTaskCompleted', label: 'P2P Tasks' },
    { key: 'tasksCreated', label: 'Tasks Created' },
];


function StatBar({ label, value, max = 10 }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="stat-item">
            <div className="stat-bar-container">
                <div className="stat-bar" style={{ height: `${Math.max(pct, 6)}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="stat-value">{value}</span>
                </div>
            </div>
            <span className="stat-label">{label}</span>
        </div>
    );
}

export default function ProfileModal({ onClose }) {
    const { currentUser, updateAvatar } = useApp();
    const fileInputRef = useRef(null);

    function handleAvatarClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader(); // Convert image file to base64 string for preview and storage
        reader.onload = (ev) => updateAvatar(ev.target.result);
        reader.readAsDataURL(file);
    }

    const stats = currentUser?.stats || {};

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay profile-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    className="modal-box"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.22 }}
                >
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2 className="modal-title">Profile</h2>

                    {/* Avatar */}
                    <div className="profile-avatar-section">
                        <div
                            className="profile-avatar-wrapper"
                            onClick={handleAvatarClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Change profile photo"
                            onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
                        >
                            <img
                                src={currentUser?.avatar || avatarPlaceholder}
                                alt="Profile avatar"
                                className="profile-avatar-img"
                            />
                            <div className="profile-avatar-overlay">📸</div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            id="profile-avatar-upload"
                        />
                        <div className="profile-username">{currentUser?.username || 'User'}</div>
                        <div className="profile-petname">🐾 {currentUser?.petName || 'Buddy'}</div>
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        {STAT_LABELS.map(({ key, label }) => (
                            <StatBar key={key} label={label} value={stats[key] ?? 0} />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
