import { motion } from 'framer-motion';

export default function TearParticles({ x = -20, y = 10 }) {
  return (
    <div style={{ position: 'absolute', top: y, left: x, pointerEvents: 'none', zIndex: 50 }}>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: i * 55,
            fontSize: 14,
          }}
          animate={{
            y: [0, 25, 50],
            opacity: [0, 1, 0],
            scale: [0.6, 1, 0.4],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.9,
            ease: 'easeIn',
          }}
        >
          💧
        </motion.span>
      ))}
    </div>
  );
}
