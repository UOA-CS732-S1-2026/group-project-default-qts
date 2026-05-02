import axios from 'axios';

// Start a new focus session
export async function startFocusSession() {
  const res = await axios.post('/api/focus/start');
  return res.data; // should contain session info, e.g. { id, ... }
}

// Complete a focus session (normal or cancelled)
export async function completeFocusSession(sessionId, { cancelled = false } = {}) {
  const res = await axios.post(`/api/focus/${sessionId}/complete`, { cancelled });
  return res.data; // should contain reward info or status
}
