import { useState } from 'react';
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

  /* What image to show for preview */
  const petImages = import.meta.glob('@/assets/pets/*.png', { eager: true });
  function getImg(speciesId, stage) {
    const suffix = stage === 'egg' ? 'egg' : stage === 'kid' ? `${speciesId}_1` : `${speciesId}_2`;
    const key = Object.keys(petImages).find((k) => k.includes(`/${suffix}.png`));
    return key ? petImages[key].default : null;
  }

  const handleEvolve = (speciesId) => {
    setChosenSpecies(speciesId);
    setPhase('animating');
    setShowSparkles(true);

    // After animation, mark done
    setTimeout(() => {
      setPhase('done');
      onEvolve(speciesId);
    }, 2800);
  };

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
              {currentStage === 'egg' ? 'Choose your companion!' : 'Your pet is growing stronger!'}
            </p>

            {/* Current pet */}
            <div className="evolution-current">
              <img src={getImg(currentSpecies, currentStage)} alt="current" className="evolution-current-img" />
              <span className="evolution-arrow">→</span>
              <div className="evolution-question">?</div>
            </div>

            {/* Species selection (only when hatching from egg) */}
            {currentStage === 'egg' && (
              <div className="evolution-species-grid">
                {speciesList.map((s) => (
                  <button
                    key={s.id}
                    className="evolution-species-btn"
                    onClick={() => handleEvolve(s.id)}
                  >
                    <img src={getImg(s.id, targetStage)} alt={s.name} className="evolution-species-img" />
                    <span className="evolution-species-name">{s.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Direct evolve (kid → adult) */}
            {currentStage === 'kid' && (
              <div className="evolution-direct">
                <button className="evolution-evolve-btn" onClick={() => handleEvolve(currentSpecies)}>
                  <img src={getImg(currentSpecies, targetStage)} alt="evolved" className="evolution-preview-img" />
                  <span>Evolve to Adult!</span>
                </button>
              </div>
            )}

            <button className="evolution-skip-btn" onClick={onSkip}>
              Not now. Stay as {currentStage}
            </button>
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
            <motion.img
              src={getImg(currentSpecies, currentStage)}
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

            {/* New form appearing */}
            <motion.img
              src={getImg(chosenSpecies, targetStage)}
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
