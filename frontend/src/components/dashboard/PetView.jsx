import './PetView.css'
import petImg from '@/assets/pets/apteryx_1.png'
import { useState, useEffect } from 'react'
import { getActivePet, feedPet, evolvePet } from '@/utils/petApi'
import { getInventory } from '@/utils/inventoryApi'


function PetView() {
    const token = localStorage.getItem('gf_token');
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [inventory, setInventory] = useState([]);
    const [selectedItemCode, setSelectedItemCode] = useState('');

    // get active pet and inventory on mount
    useEffect(() => {
        async function fetchPet() {
            if (!token) {
                setMessage('No token found. Please log in first.');
                setPet(null);
                return;
            }
            setLoading(true);
            setMessage('');
            try {
                const [petRes, inventoryRes] = await Promise.all([
                    getActivePet(token),
                    getInventory(token)
                ]); // get active pet and inventory in parallel
                const activePet = petRes?.data?.activePet || petRes?.data?.pet || null;
                setPet(activePet);
                if (!activePet) setMessage('No active pet found.');

                const items = inventoryRes?.data?.items || [];
                setInventory(items);
            } catch (error) {
                setMessage('Failed to fetch pet data.');
            } finally {
                setLoading(false);
            }
        }
        fetchPet();
    }, [token]);

    if (loading) return <div className="pet-container">Loading...</div>;

    const handleFeed = async () => {
        if (!pet) return;
        if (!selectedItemCode) {
            setMessage('Please select a food item.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const data = await feedPet(pet.id, selectedItemCode, token);
            setPet(data?.data?.pet || data?.data?.activePet || null);

            const inventoryRes = await getInventory(token);
            setInventory(inventoryRes?.data?.items || []);
            setMessage('Fed pet successfully!');
        } catch (error) {
            setMessage('Failed to feed pet.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvolve = async () => {
        if (!pet) return;
        setLoading(true);
        setMessage('');
        try {
            const data = await evolvePet(pet.id, token);
            setPet(data?.data?.pet || data?.data?.activePet || null);
            setMessage('Evolved pet successfully!');
        } catch (error) {
            setMessage('Failed to evolve pet.');
        } finally {
            setLoading(false);
        }
    };

    const { level, growthPoints } = pet || {};
    const percent = Math.max(0, Math.min(100, Number(growthPoints || 0)));

    return (
        <div className="pet-container">
            <h1 className="pet-name">{pet ? pet.nickname : 'Please select a pet'}</h1>

            <img
                src={petImg}
                alt="pet"
                className="pet-img"
                style={{ cursor: pet && !loading ? 'pointer' : 'default', opacity: loading ? 0.6 : 1 }}
                onClick={() => {
                    if (pet && !loading) handleFeed();
                }}
                title={pet && !loading ? 'Feed' : 'Cannot feed (no active pet or not logged in)'}
            />

            {pet && (
                <div className="pet-exp">
                    <div className="exp-row">
                        <div className="exp-label">Exp.</div>
                        <div className="pet-level">Lv.{level}</div>
                    </div>

                    <div className="exp-bar" aria-hidden>
                        <div className="exp-fill" style={{
                            width: `${percent}%`
                        }}>
                        </div>
                    </div>
                </div>
            )}
            {pet?.evolutionReady && (
                <div style={{ marginTop: 16 }}>
                    <button onClick={handleEvolve} disabled={loading}>Evolve</button>
                </div>
            )}
            {message && <div style={{ marginTop: 8, color: 'red' }}>{message}</div>}
        </div>
    )
}

export default PetView;