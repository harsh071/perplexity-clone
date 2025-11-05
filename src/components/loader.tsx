import { motion } from "framer-motion";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ size = 'sm', className = '' }: LoaderProps) => {
  const sizeClasses = {
    sm: {
      width: 28,
      height: 28,
    },
    md: {
      width: 36,
      height: 36,
    },
    lg: {
      width: 48,
      height: 48,
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: sizes.width + 16,
          height: sizes.height + 16,
          background: 'radial-gradient(circle, rgba(45, 139, 139, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Inner glow effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: sizes.width + 8,
          height: sizes.height + 8,
          background: 'radial-gradient(circle, rgba(45, 139, 139, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Main pulsing and rotating star */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.85, 1, 0.85],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
          opacity: {
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        className="relative z-10"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(45, 139, 139, 0.6))',
        }}
      >
        <svg
          width={sizes.width}
          height={sizes.height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#2D8B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Central vertical line */}
            <line x1="12" y1="4" x2="12" y2="20" />
            {/* Top inverted V */}
            <line x1="12" y1="4" x2="8" y2="8" />
            <line x1="12" y1="4" x2="16" y2="8" />
            {/* Horizontal arms (top) */}
            <line x1="8" y1="8" x2="8" y2="12" />
            <line x1="8" y1="12" x2="6" y2="12" />
            <line x1="16" y1="8" x2="16" y2="12" />
            <line x1="16" y1="12" x2="18" y2="12" />
            {/* Bottom V */}
            <line x1="12" y1="20" x2="8" y2="16" />
            <line x1="12" y1="20" x2="16" y2="16" />
            {/* Horizontal arms (bottom) */}
            <line x1="8" y1="16" x2="8" y2="12" />
            <line x1="16" y1="16" x2="16" y2="12" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

