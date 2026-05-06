import '../../styles/dashboard/PetView.css'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getActivePet, feedPet, evolvePet } from '@/utils/petApi'
import { getInventory } from '@/utils/inventoryApi'
import PetSprite from '../petAnimations/PetSprite'
import EvolutionOverlay from '../petAnimations/EvolutionOverlay'
import { useApp } from '../../context/AppContext'
//import petImg from '@/assets/pets/apteryx_1.png'

// ── Helpers ─────────────────────────────────────────────────────────────────

// Backend returns speciesCode (e.g. "APTERYX") → map to lowercase image filename
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
    return 'egg';
}

// One-shot animations that should not be interrupted
const ONE_SHOT_ANIMS = new Set(['feeding', 'clicked', 'celebrating', 'evolving']);


// ── Component ────────────────────────────────────────────────────────────────

function PetView({ pomoIsRunning = false, externalAnim = null, onPetLoaded }) {
    const token = localStorage.getItem('gf_token') ?? localStorage.getItem("token");
    const { currentUser } = useApp();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [inventory, setInventory] = useState([]);
    const [selectedItemCode, setSelectedItemCode] = useState('');
    const [animState, setAnimState] = useState('idle');
    const [showEvolution, setShowEvolution] = useState(false);
    const clickCountRef = useRef(0); // track double-click for playing animation


    // ── Pomodoro sleeping / idle toggle ──────────────────────────────────────
    useEffect(() => {
        setAnimState(prev => {
            if (ONE_SHOT_ANIMS.has(prev)) return prev; // don't interrupt one-shots
            return pomoIsRunning ? 'idle' : 'sleeping';
        });
    }, [pomoIsRunning]);

    // ── External anim signal (e.g. celebrating from Pomodoro) ────────────────
    useEffect(() => {
        if (!externalAnim) return;
        setAnimState(externalAnim);
        const timer = setTimeout(() => setAnimState(pomoIsRunning ? 'idle' : 'sleeping'), 2000);
        return () => clearTimeout(timer);
    }, [externalAnim, pomoIsRunning]);

    // ── Sad state: pet has been frozen (needs to evolve) ────────────────────
    useEffect(() => {
        if (!pet) return;
        setAnimState(prev => {
            if (ONE_SHOT_ANIMS.has(prev)) return prev;
            if (pet.isGrowthFrozen) return 'sad';
            return pomoIsRunning ? 'idle' : 'sleeping';
        });
    }, [pet?.isGrowthFrozen, pomoIsRunning]);

    // ── Fetch pet & inventory on mount ───────────────────────────────────────
    useEffect(() => {
        async function fetchPet() {
            if (!token) {
                setMessage('');
                setPet(null);
                return;
            }
            setLoading(true);
            setMessage('');
            try {
                const [petRes, inventoryRes] = await Promise.all([
                    getActivePet(token),
                    getInventory(token)
                ]);
                const activePet = petRes?.data?.activePet || petRes?.data?.pet || null;
                setPet(activePet);
                if (onPetLoaded) onPetLoaded(activePet);
                if (!activePet) setMessage('No active pet found.');

                const items = inventoryRes?.data?.items || [];
                setInventory(items);
            } catch {
                setMessage('Failed to fetch pet data.');
            } finally {
                setLoading(false);
            }
        }
        fetchPet();
    }, [token]);

    useEffect(() => {
        if (!currentUser?.petName) return;
        setPet((prev) => (prev ? { ...prev, nickname: currentUser.petName } : prev));
    }, [currentUser?.petName]);

    // ── Global Event Listener for Feeding from Inventory ─────────────────────
    useEffect(() => {
        const onFeedEvent = (e) => {
            const itemCode = e.detail?.itemCode;
            if (itemCode) {
                handleFeed(itemCode);
            }
        };
        window.addEventListener('gf-feed-pet', onFeedEvent);
        return () => window.removeEventListener('gf-feed-pet', onFeedEvent);
    }, [pet, token, pomoIsRunning]); // Add dependencies used in handleFeed

    // ── Feed ─────────────────────────────────────────────────────────────────
    async function handleFeed(itemCode) {
        if (!pet) return;
        if (!itemCode) { setMessage('Please select a food item.'); return; }
        setLoading(true);
        setMessage('');
        try {
            const data = await feedPet(pet.id, itemCode, token);
            const updatedPet = data?.data?.pet || data?.data?.activePet || null;
            setPet(updatedPet);
            if (onPetLoaded) onPetLoaded(updatedPet);
            const inventoryRes = await getInventory(token);
            setInventory(inventoryRes?.data?.items || []);
            setAnimState('feeding');
            setTimeout(() => setAnimState(pomoIsRunning ? 'idle' : 'sleeping'), 1500);
            setMessage('Fed pet successfully!');
        } catch {
            setMessage('Failed to feed pet.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="pet-container">Loading...</div>;

    // ── Evolve ───────────────────────────────────────────────────────────────
    const handleEvolve = async () => {
        if (!pet) return;
        // Show the evolution overlay (visual animation) first
        setShowEvolution(true);
    };

    // Called by EvolutionOverlay when user confirms the evolution
    const handleEvolutionConfirm = async (chosenSpeciesId) => {
        setShowEvolution(false);
        setAnimState('evolving');
        setLoading(true);
        setMessage('');
        try {
            const data = await evolvePet(pet.id, token);
            const updatedPet = data?.data?.pet || data?.data?.activePet || null;
            setPet(updatedPet);
            if (onPetLoaded) onPetLoaded(updatedPet);
            setMessage('Evolved pet successfully!');
            // Brief celebrating after evolve
            setTimeout(() => setAnimState('celebrating'), 200);
            setTimeout(() => setAnimState('idle'), 2500);
        } catch (error) {
            setAnimState('idle');
            setMessage('Failed to evolve pet.');
        } finally {
            setLoading(false);
        }
    };

    // Called by EvolutionOverlay when user skips
    const handleEvolutionSkip = () => {
        setShowEvolution(false);
    };

    // ── Pet click: single = clicked anim, double = playing anim ─────────────
    const handlePetClick = () => {
        if (!pet || loading) return;

        clickCountRef.current += 1;
        if (clickCountRef.current === 1) {
            // Single click: clicked animation ONLY
            setAnimState('clicked');
            setTimeout(() => {
                setAnimState(pomoIsRunning ? 'idle' : 'sleeping');
                clickCountRef.current = 0;
            }, 800);
        } else if (clickCountRef.current === 2) {
            // Double click: playing animation (no feed)
            clearTimeout(clickCountRef.timeout);
            setAnimState('playing');
            setTimeout(() => {
                setAnimState(pomoIsRunning ? 'idle' : 'sleeping');
                clickCountRef.current = 0;
            }, 1500);
        }
    };

    const { level, growthPoints } = pet || {};
    const percent = Math.max(0, Math.min(100, Number(growthPoints || 0)));

    const displaySpecies = getPetSpecies(pet);
    const displayStage = getPetStage(pet);
    const displayAnim = animState;

    return (
        <div className="pet-container">
            <h1 className="pet-name">{pet ? (pet.nickname || currentUser?.petName || 'Buddy') : 'Please select a pet'}</h1>

                <div style={{ opacity: loading ? 0.6 : 1 }}>
                    <PetSprite
                        species={displaySpecies}
                        stage={displayStage}
                        animState={displayAnim}
                        onClick={handlePetClick}
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
                            <div className="exp-fill" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                )}

                {/* Evolve button — shown when pet.evolutionReady */}
                {pet?.evolutionReady && !showEvolution && (
                    <div style={{ marginTop: 16 }}>
                        <button onClick={handleEvolve} disabled={loading}>Evolve ✨</button>
                    </div>
                )}

                {message && <div style={{ marginTop: 8, color: 'red' }}>{message}</div>}

                {/* Evolution overlay — full-screen animation */}
                <AnimatePresence>
                    {showEvolution && (
                        <EvolutionOverlay
                            currentSpecies={getPetSpecies(pet)}
                            currentStage={getPetStage(pet)}
                            targetStage={getPetStage(pet) === 'egg' ? 'kid' : 'adult'}
                            onEvolve={handleEvolutionConfirm}
                            onSkip={handleEvolutionSkip}
                        />
                    )}
                </AnimatePresence>
            </div>
        )
    }

    export default PetView;
