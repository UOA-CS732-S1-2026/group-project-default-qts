import { motion } from 'framer-motion';

const FOOD_EMOJIS = ['🍎', '🍇', '🥕', '🌽', '🍰', '🧁', '🍪', '🥜'];

export default function FoodParticle({
  emoji,
  startX = 0,
  startY = 0,
  endX = 0,
  endY = 0,
  onComplete,
}) {
  const food = emoji || FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

  return (
    <motion.div
      style={{
        position: 'fixed',
        fontSize: 36,
        zIndex: 100,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
      }}
      initial={{
        x: startX,
        y: startY,
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: [1, 1, 0.8, 0],
        scale: [1, 1.2, 0.8, 0.3],
        rotate: [0, -15, 10, 0],
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onAnimationComplete={onComplete}
    >
      {food}
    </motion.div>
  );
}
