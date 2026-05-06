import { motion } from 'framer-motion';

export default function ZzzParticles({ x = 0, y = -60 }) {
  return (
    <div style={{ position: 'absolute', top: y, left: x, pointerEvents: 'none', zIndex: 50 }}>
      {['Z', 'z', 'Z'].map((letter, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            fontSize: 22 - i * 4,
            fontWeight: 800,
            color: '#7c9ab5',
            opacity: 0.8,
            fontFamily: 'serif',
          }}
          animate={{
            y: [0, -30 - i * 20],
            x: [0, 15 + i * 10],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.5, 1, 1, 0.7],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeOut',
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
