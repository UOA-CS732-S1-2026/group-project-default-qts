import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleParticles from './particles/SparkleParticles';
import './EvolutionOverlay.css';

// Default species list matching the actual asset filenames in src/assets/pets/
const DEFAULT_SPECIES = [
  { id: 'apteryx', name: 'Apteryx' },
  { id: 'lemuera', name: 'Lemuera' },
  { id: 'pateke', name: 'Pateke' },
  { id: 'penguin', name: 'Penguin' },
  { id: 'pukeko', name: 'Pukeko' },
  { id: 'pyro', name: 'Pyro' },
];

const MotionDiv = motion.div;

/* ── Asset map ─────────────────────────────────────── */
const petImages = import.meta.glob('@/assets/pets/*.png', { eager: true, import: 'default' });

function buildAssetMap() {
  const map = {};
  Object.entries(petImages).forEach(([path, src]) => {
    const file = path.split('/').pop() || '';
    const key = file.replace(/\.png$/i, '');
    if (key) map[key] = src;
  });
  return map;
}

const ASSET_MAP = buildAssetMap();

function normalizeSpeciesKey(input) {
  if (!input) return 'apteryx';
  let key = String(input).trim().toLowerCase();
  key = key.replace(/\.(png|gif|jpg|jpeg|webp)$/i, '');
  key = key.replace(/[/\\]/g, '');
  key = key.replace(/\s+/g, '_').replace(/-+/g, '_');
  key = key.replace(/_(egg|kid|adult|stage\d+|1|2)$/i, '');

  const map = {
    tao_kiwi: 'apteryx',
    tao_penguin: 'penguin',
    lemuera: 'lemuera',
    apteryx: 'apteryx',
    pyro: 'pyro',
    manu_pukeko: 'pukeko',
    manu_pateke: 'pateke',
    kiwi: 'apteryx',
    penguin: 'penguin',
    pukeko: 'pukeko',
    pateke: 'pateke',
  };

  return map[key] || key;
}

function normalizeStage(input) {
  const raw = String(input || '').trim().toLowerCase();
  if (raw === 'egg') return 'egg';
  if (raw === 'kid') return 'kid';
  if (raw === 'adult') return 'adult';
  if (raw === 'egg_stage' || raw === 'stage0') return 'egg';
  if (raw === 'stage1') return 'kid';
  if (raw === 'stage2') return 'adult';
  if (raw === 'eggs') return 'egg';
  if (raw === 'kids') return 'kid';
  if (raw === 'adults') return 'adult';
  return 'kid';
}

function getImg(speciesId, stage) {
  const normalizedSpecies = normalizeSpeciesKey(speciesId);
  const normalizedStage = normalizeStage(stage);
  const isEgg = normalizedStage === 'egg';

  const baseKey = isEgg
    ? 'egg'
    : normalizedStage === 'kid'
      ? `${normalizedSpecies}_1`
      : `${normalizedSpecies}_2`;

  if (ASSET_MAP[baseKey]) return ASSET_MAP[baseKey];

  if (isEgg && ASSET_MAP.egg) return ASSET_MAP.egg;
  if (normalizedStage === 'kid' && ASSET_MAP.apteryx_1) return ASSET_MAP.apteryx_1;
  if (normalizedStage === 'adult' && ASSET_MAP.apteryx_2) return ASSET_MAP.apteryx_2;

  const first = Object.values(ASSET_MAP)[0];
  return first || null;
}

export default function EvolutionOverlay({
  currentSpecies,
  currentStage,
  targetStage,
  onEvolve,
  onSkip,
  speciesList = DEFAULT_SPECIES,
}) {
  const [phase, setPhase] = useState('choose'); // 'choose' | 'animating' | 'done'
  const [chosenSpecies, setChosenSpecies] = useState(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const normalizedCurrentSpecies = useMemo(() => normalizeSpeciesKey(currentSpecies), [currentSpecies]);
  const normalizedCurrentStage = useMemo(() => normalizeStage(currentStage), [currentStage]);
  const normalizedTargetStage = useMemo(() => normalizeStage(targetStage), [targetStage]);

  const handleEvolve = (speciesId) => {
    const normalized = normalizeSpeciesKey(speciesId);
    setChosenSpecies(normalized);
    setPhase('animating');
    setShowSparkles(true);

    // After animation, mark done
    setTimeout(() => {
      setPhase('done');
      onEvolve(normalized);
    }, 2800);
  };

  const currentImg = getImg(normalizedCurrentSpecies, normalizedCurrentStage);
  const nextImg = getImg(chosenSpecies || normalizedCurrentSpecies, normalizedTargetStage);

  return (
    <MotionDiv
      className="evolution-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'choose' && (
          <MotionDiv
            key="choose"
            className="evolution-panel"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h2 className="evolution-title">🎉 Your pet is ready to evolve!</h2>
            <p className="evolution-subtitle">
              {normalizedCurrentStage === 'egg' ? 'A companion will be chosen for you!' : 'Your pet is growing stronger!'}
            </p>

            {/* Current pet */}
            <div className="evolution-current">
              {currentImg && <img src={currentImg} alt="current" className="evolution-current-img" />}
              <span className="evolution-arrow">→</span>
              <div className="evolution-question">?</div>
            </div>

            <div className="evolution-confirm-actions">
              <button
                className="evolution-confirm-btn"
                onClick={() => {
                  const chosen = normalizedCurrentStage === 'egg'
                    ? speciesList[Math.floor(Math.random() * speciesList.length)]?.id
                    : normalizedCurrentSpecies;
                  handleEvolve(chosen || normalizedCurrentSpecies);
                }}
              >
                Confirm evolve
              </button>
              <button className="evolution-decline-btn" onClick={onSkip}>
                Not now. Stay as {normalizedCurrentStage}
              </button>
            </div>
          </MotionDiv>
        )}

        {phase === 'animating' && (
          <MotionDiv
            key="animating"
            className="evolution-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Bright glow */}
            <motion.div
              className="evolution-glow-circle"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 3, 2.5, 4],
                opacity: [0, 0.8, 1, 0],
              }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />

            {/* Old form fading out */}
            {currentImg && (
              <motion.img
                src={currentImg}
                alt="old form"
                className="evolution-morph-img"
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                  scale: [1, 1.2, 0],
                  opacity: [1, 0.6, 0],
                  filter: ['brightness(1)', 'brightness(3)', 'brightness(5)'],
                }}
                transition={{ duration: 1.2, ease: 'easeIn' }}
              />
            )}

            {/* New form appearing */}
            {nextImg && (
              <motion.img
                src={nextImg}
                alt="new form"
                className="evolution-morph-img"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.3, 1],
                  opacity: [0, 0, 1],
                  filter: ['brightness(5)', 'brightness(2)', 'brightness(1)'],
                }}
                transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
              />
            )}

            {/* Sparkle burst */}
            {showSparkles && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <SparkleParticles count={16} radius={160} color="#FFD700" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <SparkleParticles count={10} radius={120} color="#FF69B4" />
                </motion.div>
              </>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}