import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ProfileModal from './ProfileModal';
import SettingsPanel from './SettingsPanel';
import avatarPlaceholder from '../../assets/avatar_placeholder.png';

export default function UserMenu() {
    const { currentUser, logout } = useApp();
    const [open, setOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    function handleLogout() {
        logout();
        window.location.href = '/landingpage';
    }

    return (
        <>
            <div className="user-menu-wrapper">
                <button
                    id="user-icon-btn"
                    className="user-icon-btn"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Open user menu"
                    aria-expanded={open}
                >
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="User avatar" />
                    ) : (
                        <img src={avatarPlaceholder} alt="User avatar" />
                    )}
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            className="user-dropdown"
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button
                                id="menu-profile-btn"
                                className="user-dropdown-item"
                                onClick={() => { setOpen(false); setShowProfile(true); }}
                            >
                                👤 Profile
                            </button>
                            <div className="user-dropdown-divider" />
                            <button
                                id="menu-settings-btn"
                                className="user-dropdown-item"
                                onClick={() => { setOpen(false); setShowSettings(true); }}
                            >
                                ⚙️ Setting
                            </button>
                            <div className="user-dropdown-divider" />
                            <button
                                id="menu-signout-btn"
                                className="user-dropdown-item danger"
                                onClick={handleLogout}
                            >
                                🚪 Sign out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        </>
    );
}
