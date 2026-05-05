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
  const [clickCount, setClickCount] = useState(0);

  // Sync with external animState
  useEffect(() => {
    setInternalAnim(animState);
  }, [animState]);

  const imgSrc = getPetImage(species, stage, internalAnim);

  const handleClick = useCallback(() => {
    // Trigger click animation
    setInternalAnim('clicked');
    setClickCount((c) => c + 1);
    
    // Revert to idle after animation
    setTimeout(() => {
      setInternalAnim(animState === 'idle' ? 'idle' : animState);
    }, stage === 'egg' ? 600 : stage === 'kid' ? 700 : 800);

    if (onClick) onClick();
  }, [animState, onClick, stage]);

  // When anim finishes and it's a one-shot, revert to idle
  const handleAnimationEnd = useCallback(() => {
    if (['clicked', 'feeding', 'playing', 'celebrating'].includes(internalAnim)) {
      // One-shots auto-revert is handled by setTimeout, but this is a fallback
    }
  }, [internalAnim]);

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
          key={`${species}-${stage}-${clickCount}`}
          src={imgSrc}
          alt={`${species} ${stage}`}
          className={`pet-sprite-img stage-${stage} anim-${internalAnim}`}
          initial={false}
          draggable={false}
          onAnimationEnd={handleAnimationEnd}
        />
      </AnimatePresence>
    </div>
  );
}
