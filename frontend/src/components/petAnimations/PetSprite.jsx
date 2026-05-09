import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PetSprite.css';

/* ── Asset map ─────────────────────────────────────── */
const petImages = import.meta.glob('@/assets/pets/*.png', { eager: true });

function getPetImage(species, stage, animState) {
  let suffix = stage === 'egg' ? 'egg' : stage === 'kid' ? `${species}_1` : `${species}_2`;
  
  // Check for specific state images
  if (animState === 'sad') {
    suffix += '_sad';
  } else if (animState === 'sleeping') {
    suffix += '_sleeping';
  }

  let key = Object.keys(petImages).find((k) => k.includes(`/${suffix}.png`));
  
  // Fallback to base image if state image not found
  if (!key) {
    suffix = stage === 'egg' ? 'egg' : stage === 'kid' ? `${species}_1` : `${species}_2`;
    key = Object.keys(petImages).find((k) => k.includes(`/${suffix}.png`));
  }
  
  return key ? petImages[key].default : null;
}

/* ── Component ─────────────────────────────────────── */
export default function PetSprite({
  species = 'apteryx',
  stage = 'kid',
  animState = 'idle', // 'idle' | 'clicked' | 'feeding' | 'playing' | 'celebrating' | 'sad' | 'sleeping' | 'evolving'
  onClick,
  size = 280,
  showShadow = true,
  className = '',
}) {
  const [internalAnim, setInternalAnim] = useState(animState);

  // Sync with external animState
  useEffect(() => {
    setInternalAnim(animState);
  }, [animState]);

  const imgSrc = getPetImage(species, stage, internalAnim);

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div
      className={`pet-sprite-wrapper ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      {/* Pet Shadow */}
      {showShadow && (
        <motion.div
          className="pet-shadow"
          animate={{
            scaleX: internalAnim === 'clicked' ? 0.8 : 1,
            opacity: internalAnim === 'sleeping' ? 0.1 : 0.7,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Egg shimmer overlay */}
      {stage === 'egg' && internalAnim === 'idle' && <div className="egg-shimmer" />}

      {/* Pet Image with CSS animation class */}
      <AnimatePresence mode="wait">
        <motion.img
          key={`${species}-${stage}-${internalAnim}`}
          src={imgSrc}
          alt={`${species} ${stage}`}
          className={`pet-sprite-img stage-${stage} anim-${internalAnim}`}
          initial={false}
          draggable={false}
        />
      </AnimatePresence>
    </div>
  );
}
