import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function register(formData) {
	try {
		const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
		return res.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'failed to register');
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
  } catch (error) {
    return null;
  }
}

export async function login(email, password, setCurrentUser) {
	try {
		const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
		setCurrentUser(res.data.user);
		localStorage.setItem('token', res.data.token);
	} catch (error) {
        throw new Error(error.response?.data?.message || 'failed to login');
	}
}

export function logout(setCurrentUser) {
	setCurrentUser(null);
	localStorage.removeItem('token');
}

