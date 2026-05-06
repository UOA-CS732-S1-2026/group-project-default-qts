import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/store`;

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}

export async function getStoreItems(token) {
  try {
    const res = await axios.get(`${API_BASE}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'failed to fetch store items'));
  }
}

export async function purchaseItem(itemCode, quantity = 1, token) {
  try {
    const res = await axios.post(
      `${API_BASE}/purchase`,
      { itemCode, quantity },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'failed to purchase item'));
  }
}