import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { login, logout, register } from '../utils/authApi';

const AppContext = createContext(null);


export const SECURITY_QUESTIONS = [
    "What's my mother's first name?",
    "Where is my favourite spot in campus?",
    "What is the name of my first pet?",
];

// ============================================================
// 1. Context providers and hooks: included in the context and can be accessed via useApp()
// ============================================================
export function AppProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('gf_current_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // --- Dark Mode State & Action ---
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('gf_dark_mode') === 'true';
    });
    // Apply dark mode class to document
    if (darkMode) {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }

    function toggleDarkMode() {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('gf_dark_mode', next);
        if (next) document.documentElement.classList.add('dark-mode');
        else document.documentElement.classList.remove('dark-mode');
    }


    // --- Auth Actions ---
    async function handleLogin(email, password) {
        try {
            await login(email, password, setCurrentUser);
            return { success: true };
        } catch (err) {
            return { success: false, error: err?.response?.data?.message || 'Login failed' };
        }
    }

    async function handleLogout() {
        await logout(setCurrentUser);
        localStorage.removeItem('gf_current_user');
    }

    async function handleRegister(formData) {
        if (!isValidUniEmail(formData.email)) {
            return { success: false, error: 'Email must be a valid University of Auckland address.' };
        }
        try {
            await register(formData);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Register failed' };
        }
    }


    // --- Password Reset ---
    function findUserForReset(emailOrUsername) {
        const users = getUsers();
        const user = users.find(
            (u) =>
                u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
                u.username.toLowerCase() === emailOrUsername.toLowerCase()
        );
        if (!user) return { success: false, error: 'No such username or email found.' };
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                securityQuestion: SECURITY_QUESTIONS[user.securityQuestion],
                securityQuestionIndex: user.securityQuestion,
            },
        };
    }

    function resetPassword(userId, email, securityAnswer, newPassword) {
        const users = getUsers();
        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex === -1) return { success: false, error: 'User not found.' };
        const user = users[userIndex];
        if (user.email.toLowerCase() !== email.toLowerCase()) {
            return { success: false, emailError: 'Email does not match our records.' };
        }
        if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
            return { success: false, answerError: 'Security answer is incorrect.' };
        }
        users[userIndex] = { ...user, password: newPassword };
        saveUsers(users);
        return { success: true };
    }

    // --- Update Settings ---
    function updateUsername(newUsername) {
        const users = getUsers();
        if (users.find((u) => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== currentUser.id)) {
            return { success: false, error: 'This username is already taken.' };
        }
        const updated = users.map((u) => (u.id === currentUser.id ? { ...u, username: newUsername } : u));
        saveUsers(updated);
        const updatedUser = { ...currentUser, username: newUsername };
        setCurrentUser(updatedUser);
        localStorage.setItem('gf_current_user', JSON.stringify(updatedUser));
        return { success: true };
    }

    function updatePetName(newPetName) {
        const users = getUsers();
        const updated = users.map((u) => (u.id === currentUser.id ? { ...u, petName: newPetName } : u));
        saveUsers(updated);
        const updatedUser = { ...currentUser, petName: newPetName };
        setCurrentUser(updatedUser);
        localStorage.setItem('gf_current_user', JSON.stringify(updatedUser));
        return { success: true };
    }

    function updatePassword(currentPassword, newPassword) {
        const users = getUsers();
        const user = users.find((u) => u.id === currentUser.id);
        if (!user || user.password !== currentPassword) {
            return { success: false, error: 'Current password is incorrect.' };
        }
        const updated = users.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u));
        saveUsers(updated);
        return { success: true };
    }

    function updateAvatar(avatarDataUrl) {
        const users = getUsers();
        const updated = users.map((u) => (u.id === currentUser.id ? { ...u, avatar: avatarDataUrl } : u));
        saveUsers(updated);
        const updatedUser = { ...currentUser, avatar: avatarDataUrl };
        setCurrentUser(updatedUser);
        localStorage.setItem('gf_current_user', JSON.stringify(updatedUser));
        return { success: true };
    }

    const value = {
        currentUser,
        darkMode,
        toggleDarkMode,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
        findUserForReset,
        resetPassword,
        updateUsername,
        updatePetName,
        updatePassword,
        updateAvatar,
        SECURITY_QUESTIONS,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the AppContext
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}

// ============================================================
// 2. Utility: not included in the context and pure utility functions or constants
// ============================================================
// --- Validation Helpers ---
export const ALLOWED_DOMAINS = ['@auckland.ac.nz', '@aucklanduni.ac.nz'];
export function isValidUniEmail(email) {
    return ALLOWED_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export function isValidPassword(password) {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
}

export function isValidDob(dob) {
    // MM-DD-YYYY
    const re = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
    if (!re.test(dob)) return false;
    const [month, day, year] = dob.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}