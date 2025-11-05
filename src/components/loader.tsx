import { motion } from "framer-motion";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ size = 'md', className = '' }: LoaderProps) => {
  const sizeClasses = {
    sm: {
      outer: 'w-12 h-12',
      middle: 'w-9 h-9',
      container: 'w-6 h-6',
      dot: 'w-1.5 h-1.5',
      center: 'w-2 h-2',
      radius: 9
    },
    md: {
      outer: 'w-16 h-16',
      middle: 'w-12 h-12',
      container: 'w-8 h-8',
      dot: 'w-2 h-2',
      center: 'w-3 h-3',
      radius: 12
    },
    lg: {
      outer: 'w-24 h-24',
      middle: 'w-18 h-18',
      container: 'w-12 h-12',
      dot: 'w-3 h-3',
      center: 'w-4 h-4',
      radius: 18
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulsing circle */}
      <motion.div
        className={`absolute ${sizes.outer} rounded-full border-2 border-perplexity-accent/20`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Middle pulsing circle */}
      <motion.div
        className={`absolute ${sizes.middle} rounded-full border-2 border-perplexity-accent/40`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
      
      {/* Rotating dots */}
      <motion.div
        className={`relative ${sizes.container}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const angle = (index * 90) * (Math.PI / 180);
          const x = Math.cos(angle) * sizes.radius;
          const y = Math.sin(angle) * sizes.radius;
          return (
            <motion.div
              key={index}
              className={`absolute ${sizes.dot} rounded-full bg-perplexity-accent`}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Center dot */}
      <motion.div
        className={`absolute ${sizes.center} rounded-full bg-perplexity-accent`}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

