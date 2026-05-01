import axios from 'axios';

export async function getInventory(token) {
  try {
    const res = await axios.get('/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error('failed to fetch inventory');
  }
}
