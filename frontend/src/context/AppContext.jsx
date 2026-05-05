import { createContext, useContext, useState } from 'react';
import { login, logout, register } from '../utils/authApi';
import {
  updateProfile,
  updatePassword as updatePasswordApi,
  identifyUserForReset,
  resetPasswordWithSecurityAnswer
} from '../utils/userApi';
import {
  SECURITY_QUESTIONS,
  isValidUniEmail,
} from './appConstants';

const AppContext = createContext(null);

const SECURITY_QUESTION_CODES = ['MOTHER_NAME', 'FAV_SPOT', 'PET_NAME'];

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

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('gf_dark_mode') === 'true';
  });

  if (darkMode) document.documentElement.classList.add('dark-mode');
  else document.documentElement.classList.remove('dark-mode');

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
      const res = await login(email, password);
      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;

      if (token) localStorage.setItem('token', token);
      if (user) {
        const mappedUser = { ...user, username: user.name };
        setCurrentUser(mappedUser);
        localStorage.setItem('gf_current_user', JSON.stringify(mappedUser));
      }

      return { success: true, user, token };
    } catch (err) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  }

  async function handleLogout() {
    await logout(setCurrentUser);
    localStorage.removeItem('gf_current_user');
    localStorage.removeItem('token');
  }

  async function handleRegister(formData) {
    if (!isValidUniEmail(formData.email)) {
      return { success: false, error: 'Email must be a valid University of Auckland address.' };
    }

    const securityQuestionCode =
      SECURITY_QUESTION_CODES[Number(formData.securityQuestion)] || 'PET_NAME';

    const payload = {
      name: formData.username,
      email: formData.email,
      password: formData.password,
      securityQuestionCode,
      securityAnswer: formData.securityAnswer,
    };

    try {
      const res = await register(payload);
      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;

      if (token) localStorage.setItem('token', token);
      if (user) {
        const mappedUser = { ...user, username: user.name };
        setCurrentUser(mappedUser);
        localStorage.setItem('gf_current_user', JSON.stringify(mappedUser));
      }

      return { success: true, user, token };
    } catch (err) {
      return { success: false, error: err?.message || 'Register failed' };
    }
  }

  // --- Forgot Password ---
  async function findUserForReset(identifier) {
    try {
      const res = await identifyUserForReset(identifier);
      return {
        success: true,
        user: {
          id: res.data?.userId || res.userId,
          email: res.data.email,
          securityQuestion: res.data.securityQuestionLabel
        }
      };
    } catch (err) {
      return { success: false, error: err?.message || 'No such user found.' };
    }
  }

  async function resetPassword(userId, email, securityAnswer, newPassword) {
    try {
      await resetPasswordWithSecurityAnswer({ userId, email, securityAnswer, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Failed to reset password.' };
    }
  }

  // --- Settings: Username / PetName / Password ---
  async function updateUsername(newUsername) {
    try {
      const res = await updateProfile({ username: newUsername });
      const updated = res.data?.user;
      const updatedUser = {
        ...(currentUser || {}),
        username: updated?.name || newUsername,
        name: updated?.name || newUsername
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('gf_current_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Failed to update username.' };
    }
  }

  async function updatePetName(newPetName) {
    try {
      const res = await updateProfile({ petName: newPetName });
      const nickname = res.data?.activePet?.nickname || newPetName;
      const updatedUser = { ...(currentUser || {}), petName: nickname };
      setCurrentUser(updatedUser);
      localStorage.setItem('gf_current_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Failed to update pet name.' };
    }
  }

  async function updatePassword(currentPassword, newPassword) {
    try {
      await updatePasswordApi({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      if (err.status === 401 && /password/i.test(err.message)) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      if (err.status === 401) {
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      return { success: false, error: err?.message || 'Failed to update password.' };
    }
  }

  async function refreshCoins() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await axios.get(`${API_BASE_URL}/api/coins/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res?.data?.success) {
      // keep coins in currentUser if you store it there
      setCurrentUser((prev) => prev ? { ...prev, coins: res.data.data.coins } : prev);
    }
  }

  function updateAvatar(avatarDataUrl) {
    const updatedUser = { ...(currentUser || {}), avatar: avatarDataUrl };
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
    refreshCoins,
    SECURITY_QUESTIONS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}