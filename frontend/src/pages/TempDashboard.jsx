import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UserMenu from '../components/userconfig/UserMenu';
import PomodoroModal from '../components/pomodoro/PomodoroModal';

// ============================================================
//   TempDashboard – route: /dashboard
//   Simple layout for testing navigation and user components. Will be replaced by the actual Dashboard.
// ============================================================

const PLACEHOLDER_STYLES = `
  .dash-placeholder {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-main);
  }
  .dash-navbar {
    display: flex;
    align-items: center;
    padding: 14px 28px;
    background: var(--bg-surface);
    border-bottom: 1.5px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .dash-logo {
    font-family: var(--font-pixel);
    font-size: 1.3rem;
    color: var(--text-main);
    text-decoration: none;
    letter-spacing: 1px;
  }
  .dash-logo:hover { text-decoration: none; opacity: 0.85; }
  .dash-nav-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .dash-pomo-btn {
    font-family: var(--font-pixel);
    font-size: 13px;
    letter-spacing: 1px;
    padding: 8px 20px;
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    box-shadow: 0 2px 0 var(--btn-primary-hover);
    transition: all 0.15s ease;
  }
  .dash-pomo-btn:hover { background: var(--btn-primary-hover); transform: translateY(-1px); box-shadow: 0 3px 0 var(--btn-primary-hover); }
  .dash-pomo-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--btn-primary-hover); }
  .dash-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    gap: 20px;
    text-align: center;
  }
  .dash-placeholder-icon {
    font-size: 72px;
    line-height: 1;
    margin-bottom: 12px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  }
  .dash-placeholder-title {
    font-family: var(--font-pixel);
    font-size: 2rem;
    color: var(--text-main);
  }
  .dash-placeholder-sub {
    font-family: var(--font-hand);
    font-size: 1.1rem;
    color: var(--text-muted);
    max-width: 480px;
    line-height: 1.6;
  }
  .dash-placeholder-badge {
    display: inline-block;
    padding: 6px 16px;
    background: var(--accent-light);
    border: 1.5px solid var(--accent-border);
    border-radius: var(--radius-full);
    font-family: var(--font-code);
    font-size: 12px;
    color: var(--accent);
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .dash-hint-box {
    background: var(--bg-elevated);
    border: 1.5px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 20px 28px;
    max-width: 480px;
    text-align: left;
  }
  .dash-hint-title {
    font-family: var(--font-code);
    font-size: 13px;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }
  .dash-hint-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dash-hint-list li {
    font-family: var(--font-code);
    font-size: 13px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export default function DashboardPlaceholder() {
  const { currentUser } = useApp();
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  return (
    <>
      <style>{PLACEHOLDER_STYLES}</style>
      <div className="dash-placeholder">
        {/* Navbar */}
        <nav className="dash-navbar">
          <Link to="/dashboard" className="dash-logo">🐣 GrowFriend</Link>
          <div className="dash-nav-right">
            <button
              id="pomodoro-btn"
              className="dash-pomo-btn"
              onClick={() => setIsPomodoroOpen(true)}
            >
              🍅 POMODORO
            </button>
            <UserMenu />
          </div>
        </nav>

        {/* Body */}
        <div className="dash-body">
          <div className="dash-placeholder-icon">🏗️</div>
          <span className="dash-placeholder-badge">Under Construction</span>
          <h1 className="dash-placeholder-title">
            Dashboard
          </h1>
          <p className="dash-placeholder-sub">
            Welcome back, <strong>{currentUser?.username || 'friend'}</strong>! 🌱<br />
            This dashboard is being built by the team.<br />
            Your components are ready and working below!
          </p>

          {/* Testing hints */}
          <div className="dash-hint-box">
            <div className="dash-hint-title">✅ TEST YOUR COMPONENTS</div>
            <ul className="dash-hint-list">
              <li>👤 Click the avatar icon (top-right) → User Menu</li>
              <li>📋 Profile → View profile + stats chart</li>
              <li>⚙️ Setting → Side panel with Username / Pet Name / Password / Dark Mode</li>
              <li>🍅 Click POMODORO → Modal timer</li>
              <li>🚪 Sign out → Returns to landing page</li>
            </ul>
          </div>
        </div>
      </div>

      {isPomodoroOpen && (
        <PomodoroModal onRequestClose={() => setIsPomodoroOpen(false)} />
      )}
    </>
  );
}
