import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function register(payload) {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
    return res.data; // { success, data: { token, user } }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'failed to register');
  }
}

export async function login(email, password) {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    return res.data; // { success, data: { token, user } }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'failed to login');
  }
}

export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch {
    return null;
  }
}

export function logout(setCurrentUser) {
  setCurrentUser(null);
  localStorage.removeItem('token');
}