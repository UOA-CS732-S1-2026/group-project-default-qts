import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}`;

// get active pet info
export async function getActivePet(token) {
    try {
        const res = await axios.get(`${API_BASE}/api/pets/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw new Error('failed to fetch active pet');
    }
}

// Activate pet
export async function activatePet(petId, token) {
    try {
        const res = await axios.patch(`${API_BASE}/api/pets/${petId}/activate`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw new Error('failed to activate pet');
    }
}

// Feed pet
export async function feedPet(petId, itemCode, token) {
    try {
        const res = await axios.post(
            `${API_BASE}/api/pets/${petId}/feed`,
            { itemCode },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return res.data;
    } catch (error) {
        throw new Error('failed to feed pet');
    }
}

// Evolve pet
export async function evolvePet(petId, token) {
    try {
        const res = await axios.post(`${API_BASE}/api/pets/${petId}/evolve`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        throw new Error('failed to evolve pet');
    }
}