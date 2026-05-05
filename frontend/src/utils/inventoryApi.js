import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function getInventory(token) {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error('failed to fetch inventory');
  }
}