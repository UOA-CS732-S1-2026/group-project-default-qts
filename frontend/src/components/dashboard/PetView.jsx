import './PetView.css'
import petImg from '@/assets/pets/apteryx_1.png'
import { useState, useEffect } from 'react'
import { getActivePet, feedPet, evolvePet } from '@/utils/petApi'


function PetView() {
    const token = localStorage.getItem('token');
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // get active pet data on mount
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
                const data = await getActivePet(token);
                const activePet = data?.data?.activePet || data?.data?.pet || null;
                setPet(activePet);
                if (!activePet) setMessage('No active pet found.');
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
        setLoading(true);
        setMessage('');
        try {
            const data = await feedPet(pet.id, 'KIWI_FOOD', token); // temporary hardcoded item code
            setPet(data?.data?.pet || data?.data?.activePet || null);
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