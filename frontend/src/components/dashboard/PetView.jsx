import './PetView.css'
import { useState, useEffect } from 'react'
import { getActivePet, feedPet, evolvePet } from '@/utils/petApi'
import { getInventory } from '@/utils/inventoryApi'
import PetSprite from '../petAnimations/PetSprite'


function PetView({ pomoIsRunning = false }) {
    const token = localStorage.getItem('token');
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [inventory, setInventory] = useState([]);
    const [selectedItemCode, setSelectedItemCode] = useState('');
    const [animState, setAnimState] = useState('idle');


    useEffect(() => {
        // only switch between idle and sleeping based on pomo state (don't interrupt feeding/clicked/celebrating animations)
        setAnimState(prev => {
            if (prev === 'feeding' || prev === 'clicked' || prev === 'celebrating') {
                return prev; // play full animation even if pomo state changes, don't cut it short
            }
            return pomoIsRunning ? 'idle' : 'sleeping';
        });
    }, [pomoIsRunning]);

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
            setAnimState('feeding');
            setTimeout(() => setAnimState('idle'), 1500);
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

    // helper functions
    // Backend returns speciesCode (e.g. "APTERYX"). map to lowercase for image filename matching
    function getPetSpecies(pet) {
        if (!pet) return 'apteryx';
        return (pet.speciesCode || 'apteryx').toLowerCase();
    }
    // Backend returns stage in uppercase: 'EGG' | 'KID' | 'ADULT'
    function getPetStage(pet) {
        if (!pet) return 'egg';
        const stage = (pet.stage || '').toUpperCase();
        if (stage === 'EGG') return 'egg';
        if (stage === 'KID') return 'kid';
        if (stage === 'ADULT') return 'adult';
        return 'egg'; // fallback
    }


    const { level, growthPoints } = pet || {};
    const percent = Math.max(0, Math.min(100, Number(growthPoints || 0)));

    return (
        <div className="pet-container">
            <h1 className="pet-name">{pet ? pet.nickname : 'Please select a pet'}</h1>

            <div style={{ opacity: loading ? 0.6 : 1 }}>
                <PetSprite
                    species={getPetSpecies(pet)}
                    stage={getPetStage(pet)}
                    animState={animState}
                    onClick={() => {
                        if (pet && !loading) {
                            setAnimState('clicked');        // click for animation 
                            setTimeout(() => {
                                setAnimState('idle');
                            }, 800);
                            handleFeed();
                        }
                    }}
                    size={280}
                />
            </div>

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