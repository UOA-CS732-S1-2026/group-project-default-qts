import '../../styles/dashboard/PetView.css'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getActivePet, feedPet, evolvePet, updateActivePetNickname } from '@/utils/petApi'
import { getInventory } from '@/utils/inventoryApi'
import PetSprite from '../petAnimations/PetSprite'
import EvolutionOverlay from '../petAnimations/EvolutionOverlay'
import { useApp } from '../../context/AppContext'
import editIcon from '/edit.png'

// ── Helpers ─────────────────────────────────────────────────────────────────

// Backend returns speciesCode (e.g. "APTERYX") → map to lowercase image filename
function getPetSpecies(pet) {
    if (!pet) return 'apteryx';

    if (pet.spriteKey) return pet.spriteKey;

    const code = (pet.speciesCode || '').toUpperCase();

    const speciesMap = {
        TAO_KIWI: 'apteryx',
        TAO_PENGUIN: 'penguin',
        LEMUERA: 'lemuera',
        APTERYX: 'apteryx',
        PYRO: 'pyro',
        MANU_PUKEKO: 'pukeko',
        MANU_PATEKE: 'pateke',
    };

    return speciesMap[code] || 'apteryx';
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
const MAX_LEVEL = 10;
const MAX_GROWTH_POINTS = 99;
const STATUS_POPUP_MS = 2000;
const MAX_UNLOCK_MS = 3000;


// ── Component ────────────────────────────────────────────────────────────────

function PetView({ pomoIsRunning = false, externalAnim = null, onPetLoaded, evolveRequestId = 0 }) {
    const token = localStorage.getItem('token');
    const { currentUser } = useApp();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorBubbleMessage, setErrorBubbleMessage] = useState('');
    const [statusPopupMessage, setStatusPopupMessage] = useState('');
    const [maxUnlockMessage, setMaxUnlockMessage] = useState('');
    const [inventory, setInventory] = useState([]);
    const [selectedItemCode, setSelectedItemCode] = useState('');
    const [animState, setAnimState] = useState('idle');
    const [showEvolution, setShowEvolution] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [petNameDraft, setPetNameDraft] = useState('');
    const [savingPetName, setSavingPetName] = useState(false);
    const clickCountRef = useRef(0); // track double-click for playing animation
    const evolveRequestRef = useRef(0);
    const bubbleTimerRef = useRef(null);
    const errorBubbleTimerRef = useRef(null);
    const statusPopupTimerRef = useRef(null);
    const maxUnlockTimerRef = useRef(null);
    const wasMaxRef = useRef(false);

    function showSuccessBubble(text) {
        setSuccessMessage(text);
        if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = window.setTimeout(() => {
            setSuccessMessage('');
        }, 1000);
    }

    function showErrorBubble(text) {
        setErrorBubbleMessage(text);
        if (errorBubbleTimerRef.current) window.clearTimeout(errorBubbleTimerRef.current);
        errorBubbleTimerRef.current = window.setTimeout(() => {
            setErrorBubbleMessage('');
        }, 2000);
    }

    function showStatusPopup(text) {
        setStatusPopupMessage(text);
        if (statusPopupTimerRef.current) window.clearTimeout(statusPopupTimerRef.current);
        statusPopupTimerRef.current = window.setTimeout(() => {
            setStatusPopupMessage('');
        }, STATUS_POPUP_MS);
    }

    function showMaxUnlockBubble() {
        setMaxUnlockMessage('Unlocked new egg!');
        if (maxUnlockTimerRef.current) window.clearTimeout(maxUnlockTimerRef.current);
        maxUnlockTimerRef.current = window.setTimeout(() => {
            setMaxUnlockMessage('');
        }, MAX_UNLOCK_MS);
    }

    async function fetchPetData() {
        if (!token) {
            setErrorMessage('');
            setSuccessMessage('');
            setPet(null);
            return;
        }
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const [petRes, inventoryRes] = await Promise.all([
                getActivePet(token),
                getInventory(token)
            ]);
            const activePet = petRes?.data?.activePet || petRes?.data?.pet || null;
            setPet(activePet);
            setPetNameDraft(activePet?.nickname || '');
            if (onPetLoaded) onPetLoaded(activePet);
            if (!activePet) setErrorMessage('No active pet found.');

            const items = inventoryRes?.data?.items || [];
            setInventory(items);
        } catch {
            setErrorMessage('Failed to fetch pet data.');
        } finally {
            setLoading(false);
        }
    }


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
    
    // Normalizes various backend response shapes to a consistent pet object/    
    function normalizePetResponse(res) {
        const data = res?.data ?? res;

        if (!data) return null;
        if (data.activePet) return data.activePet;
        if (data.pet) return data.pet;

        // if backend returns pet directly as data
        if (data.id || data._id || data.speciesCode || data.spriteKey) return data;

        return null;
    }
    // ── Fetch pet & inventory on mount ───────────────────────────────────────

    useEffect(() => {
        async function fetchPet() {
            if (!token) {
                setErrorMessage('');
                setSuccessMessage('');
                setPet(null);
                return;
            }
            setLoading(true);
            setErrorMessage('');
            setSuccessMessage('');
            try {
                const [petRes, inventoryRes] = await Promise.all([
                    getActivePet(token),
                    getInventory(token)
                ]);
                const activePet = normalizePetResponse(petRes);
                setPet(activePet);
                if (onPetLoaded) onPetLoaded(activePet);
                if (!activePet) setErrorMessage('No active pet found.');

                const items = inventoryRes?.data?.items || [];
                setInventory(items);
            } catch {
                setErrorMessage('Failed to fetch pet data.');
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

    useEffect(() => {
        return () => {
            if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
            if (errorBubbleTimerRef.current) window.clearTimeout(errorBubbleTimerRef.current);
            if (statusPopupTimerRef.current) window.clearTimeout(statusPopupTimerRef.current);
            if (maxUnlockTimerRef.current) window.clearTimeout(maxUnlockTimerRef.current);
        };
    }, []);

    // ── Global Event Listener for Feeding from Inventory ─────────────────────
    useEffect(() => {
        const onFeedEvent = (e) => {
            const itemCode = e.detail?.itemCode;
            if (itemCode) {
                handleFeed(itemCode);
            }
        };
        const onActivePetChanged = async (e) => {
            const nextActivePet = e.detail?.activePet || null;
            if (nextActivePet) {
                setPet(nextActivePet);
                setPetNameDraft(nextActivePet.nickname || '');
                setIsEditingName(false);
                if (onPetLoaded) onPetLoaded(nextActivePet);
                setAnimState(pomoIsRunning ? 'idle' : 'sleeping');
                return;
            }
            await fetchPetData();
        };
        window.addEventListener('gf-feed-pet', onFeedEvent);
        window.addEventListener('gf-active-pet-changed', onActivePetChanged);
        return () => {
            window.removeEventListener('gf-feed-pet', onFeedEvent);
            window.removeEventListener('gf-active-pet-changed', onActivePetChanged);
        };
    }, [pet, token, pomoIsRunning]); // Add dependencies used in handleFeed

    // ── Feed ─────────────────────────────────────────────────────────────────
    async function handleFeed(itemCode) {
        if (!pet) return;
        if (!itemCode) { setErrorMessage('Please select a food item.'); return; }
        const isMax = Number(pet.level || 0) >= MAX_LEVEL && Number(pet.growthPoints || 0) >= MAX_GROWTH_POINTS;
        if (pet.evolutionReady) {
            showStatusPopup("No more food! I'm ready to evolve already!");
            return;
        }
        if (isMax) {
            showStatusPopup("I've already grown up. No more feeding! Get a new buddy from the store!");
            return;
        }
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const data = await feedPet(pet.id, itemCode, token);
            const updatedPet = normalizePetResponse(data);
            setPet(updatedPet);
            if (onPetLoaded) onPetLoaded(updatedPet);
            const inventoryRes = await getInventory(token);
            setInventory(inventoryRes?.data?.items || []);
            setAnimState('feeding');
            setTimeout(() => setAnimState(pomoIsRunning ? 'idle' : 'sleeping'), 1500);
            showSuccessBubble('Fed pet successfully!');
        } catch {
            if (pet.evolutionReady) {
                showStatusPopup("No more food! I'm ready to evolve already!");
                return;
            }
            const isMaxNow = Number(pet.level || 0) >= MAX_LEVEL && Number(pet.growthPoints || 0) >= MAX_GROWTH_POINTS;
            if (isMaxNow) {
                showStatusPopup("I've already grown up. No more feeding! Get a new buddy from the store!");
                return;
            }
            showErrorBubble('Failed to feed pet.');
        } finally {
            setLoading(false);
        }
    }

    const handleStartEditPetName = () => {
        if (!pet || loading) return;
        setPetNameDraft(pet.nickname || '');
        setIsEditingName(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelEditPetName = () => {
        setPetNameDraft(pet?.nickname || '');
        setIsEditingName(false);
    };

    const handleSavePetName = async () => {
        if (!token || !pet || savingPetName) return;
        const nextName = String(petNameDraft || '').trim();
        if (!nextName) {
            setErrorMessage('Pet name cannot be empty.');
            return;
        }

        try {
            setSavingPetName(true);
            setErrorMessage('');
            setSuccessMessage('');
            const data = await updateActivePetNickname(nextName, token);
            const updatedPet = data?.data?.activePet || null;
            if (updatedPet) {
                setPet(updatedPet);
                setPetNameDraft(updatedPet.nickname || '');
                if (onPetLoaded) onPetLoaded(updatedPet);
                window.dispatchEvent(new CustomEvent('gf-active-pet-changed', {
                    detail: {
                        activePetId: updatedPet.id,
                        activePet: updatedPet
                    }
                }));
            }
            setIsEditingName(false);
            showSuccessBubble('Pet name updated!');
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update pet name.');
        } finally {
            setSavingPetName(false);
        }
    };

    // ── Evolve ───────────────────────────────────────────────────────────────
    const handleEvolve = async () => {
        if (!pet) return;
        // Show the evolution overlay (visual animation) first
        setShowEvolution(true);
    };

    useEffect(() => {
        if (!pet?.evolutionReady) return;
        if (evolveRequestId === evolveRequestRef.current) return;
        evolveRequestRef.current = evolveRequestId;
        if (!showEvolution) {
            handleEvolve();
        }
    }, [evolveRequestId, pet?.evolutionReady, showEvolution]);

    // Called by EvolutionOverlay when user confirms the evolution
    const handleEvolutionConfirm = async (chosenSpeciesId) => {
        setShowEvolution(false);
        setAnimState('evolving');
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const data = await evolvePet(pet.id, token);
            const updatedPet = data?.data?.pet || data?.data?.activePet || null;
            setPet(updatedPet);
            if (onPetLoaded) onPetLoaded(updatedPet);
            showSuccessBubble('Evolved pet successfully!');
            // Brief celebrating after evolve
            setTimeout(() => setAnimState('celebrating'), 200);
            setTimeout(() => setAnimState('idle'), 2500);
        } catch (error) {
            setAnimState('idle');
            setErrorMessage('Failed to evolve pet.');
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
    const isMax = Number(level || 0) >= MAX_LEVEL && Number(growthPoints || 0) >= MAX_GROWTH_POINTS;
    const percent = Math.max(
        0,
        Math.min(100, (Number(growthPoints || 0) / MAX_GROWTH_POINTS) * 100)
    );

    useEffect(() => {
        if (!pet) return;
        if (isMax && !wasMaxRef.current) {
            showMaxUnlockBubble();
        }
        wasMaxRef.current = isMax;
    }, [isMax, pet]);

    const displaySpecies = getPetSpecies(pet);
    const displayStage = getPetStage(pet);
    const displayAnim = animState;

    return (
        <div className="pet-container">
            {loading && !pet ? <div>Loading...</div> : null}
            <div className="pet-name-row">
                {isEditingName ? (
                    <div className="pet-name-editor">
                        <input
                            className="pet-name-input"
                            value={petNameDraft}
                            onChange={(e) => setPetNameDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePetName();
                                if (e.key === 'Escape') handleCancelEditPetName();
                            }}
                            maxLength={30}
                            disabled={savingPetName}
                            placeholder="Enter pet name"
                        />
                        <button
                            type="button"
                            className="pet-name-action square24px pet-name-action-confirm"
                            onClick={handleSavePetName}
                            disabled={savingPetName}
                            aria-label="Confirm pet name"
                            title="Confirm pet name"
                        >
                            <span className="pet-name-action-icon">✓</span>
                        </button>
                        <button
                            type="button"
                            className="pet-name-action square24px pet-name-action-cancel"
                            onClick={handleCancelEditPetName}
                            disabled={savingPetName}
                            aria-label="Cancel pet name edit"
                            title="Cancel"
                        >
                            <span className="pet-name-action-icon">✕</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="pet-name">{pet ? (pet.nickname || 'Buddy') : 'Please select a pet'}</h1>
                        {pet && (
                            <button
                                type="button"
                                className="pet-name-edit-btn"
                                onClick={handleStartEditPetName}
                                aria-label="Edit pet name"
                                title="Edit pet name"
                            >
                                <img className="square24px edit-icon" src={editIcon} alt="Edit" />
                            </button>
                        )}
                    </>
                )}
            </div>

                <div className="pet-sprite-wrap" style={{ opacity: loading ? 0.6 : 1 }}>
                    <PetSprite
                        species={displaySpecies}
                        stage={displayStage}
                        animState={displayAnim}
                        onClick={handlePetClick}
                        size={280}
                    />
                    {statusPopupMessage && (
                        <div className="pet-status-pop">{statusPopupMessage}</div>
                    )}
                </div>

                {pet && (
                    <div className="pet-exp">
                        <div className="exp-row">
                            <div className="exp-label">{isMax ? '' : 'Exp.'}</div>
                            <div className="pet-level">{isMax ? 'MAX' : `Lv.${level}`}</div>
                        </div>
                        <div className="exp-bar" aria-hidden>
                            <div className="exp-fill" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                )}

                {errorMessage && <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>}
                {successMessage && (
                    <div className="pet-bubble-overlay">
                        <div className="pet-bubble">{successMessage}</div>
                    </div>
                )}
                {maxUnlockMessage && (
                    <div className="pet-bubble-overlay">
                        <div className="pet-bubble">{maxUnlockMessage}</div>
                    </div>
                )}
                {errorBubbleMessage && (
                    <div className="pet-bubble-overlay">
                        <div className="pet-bubble pet-bubble-error">{errorBubbleMessage}</div>
                    </div>
                )}

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
