import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const BAZLI_LOGO_SRC = '/bazli-logo.jpg?v=2';
const TAGLINE_WORDS = ['WHY', 'OTHER', 'WHEN', 'HERE', 'IS', 'YOUR', 'BROTHER'];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Use a ref for onComplete to prevent re-triggering the effect if the parent re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Phase state:
  // 'entering': 0s -> 5.2s (Logo rises up, tagline text flutters in ONCE, then stays completely stable)
  // 'exiting' : 5.2s -> 6.0s (Logo glides smoothly into the top-left corner, text fades away, site reveals)
  // 'finished': 6.0s (Unmounts and site is completely open)
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Dynamic coordinates to shift the logo directly into the top-left corner
  const [exitShift, setExitShift] = useState<{ x: number; y: number }>({ x: -160, y: -180 });

  useEffect(() => {
    const calculateTopLeftShift = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 400;
      const height = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Target position of the Bazli logo inside the header navbar:
      // In Navbar.tsx: padding is px-3 (12px) on mobile, px-4/6 on desktop, vertical center around 26-30px
      const targetLeftX = width < 640 ? 32 : 44;
      const targetTopY = width < 640 ? 26 : 30;

      // Splash logo center in its rest position
      const splashCenterX = width / 2;
      // The splash content box sits around 35% of the viewport height
      const splashCenterY = height * 0.35;

      setExitShift({
        x: -(splashCenterX - targetLeftX),
        y: -(splashCenterY - targetTopY)
      });
    };

    calculateTopLeftShift();
    window.addEventListener('resize', calculateTopLeftShift);
    return () => window.removeEventListener('resize', calculateTopLeftShift);
  }, []);

  // Main 6-second timer sequence - runs strictly ONCE on mount
  useEffect(() => {
    // 1. At 5.2 seconds: trigger the exit transition
    // (Logo shifts to top-left corner, tagline text fades out, canvas dissolves)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5200);

    // 2. Exactly at 6.0 seconds: complete splash and reveal the site
    const completeTimer = setTimeout(() => {
      setIsFinished(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 6000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  if (isFinished) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        id="bazli-animated-splash-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
        style={{
          backgroundColor: '#F5EFEB', // Warm beige background
          backgroundImage: 'radial-gradient(circle at 50% 35%, #FAF6F0 0%, #F3EDE3 70%, #ECE4D6 100%)'
        }}
      >
        {/* Subtle decorative background glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isExiting ? 0 : 0.4, scale: isExiting ? 0.9 : 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-[28%] w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none"
        />

        {/* Central Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-xl w-full text-center -mt-8 sm:-mt-12">
          
          {/* ========================================================================= */}
          {/* BAZLI APP ICON LOGO                                                       */}
          {/* Entrance: Rises smoothly from bottom into top-upper position              */}
          {/* Exit    : Shifts smoothly from top-center directly into top-left corner   */}
          {/* ========================================================================= */}
          <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
            <motion.div
              key="splash-logo-card"
              initial={{
                y: 160,
                x: 0,
                opacity: 0,
                scale: 0.75
              }}
              animate={
                isExiting
                  ? {
                      // EXIT: Shifts smoothly into top-left corner to match site header icon!
                      x: exitShift.x,
                      y: exitShift.y,
                      scale: 0.32,
                      opacity: 0.95,
                      transition: {
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }
                  : {
                      // ENTRANCE: Rises up from bottom into center position
                      y: 0,
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 130,
                        damping: 14,
                        mass: 0.9,
                        delay: 0.1
                      }
                    }
              }
              className="relative"
            >
              {/* App Icon Container - Zepto/Blinkit Style Squircle */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl sm:rounded-[32px] p-2 bg-white border-2 sm:border-3 border-amber-400/90 shadow-2xl shadow-amber-950/15 ring-4 ring-amber-400/25 flex items-center justify-center overflow-hidden transition-all">
                <img
                  src={BAZLI_LOGO_SRC}
                  alt="Bazli App Icon"
                  className="w-full h-full object-cover rounded-2xl sm:rounded-[24px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Live Sparkle Pill - Fades out on exit before flying */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isExiting ? 0 : 1,
                  opacity: isExiting ? 0 : 1
                }}
                transition={{ delay: isExiting ? 0 : 0.5, duration: 0.2 }}
                className="absolute -bottom-2.5 right-1/2 translate-x-1/2 bg-slate-950 text-amber-400 border border-amber-400/60 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
                <span>BAZLI</span>
              </motion.div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* TAGLINE TEXT: ( why other when here is your brother)                      */}
          {/* In Algerian font. Enters ONCE with flutter wave, then stays solid.        */}
          {/* At 5.2s, exits smoothly as splash finishes.                               */}
          {/* ========================================================================= */}
          <div className="min-h-[4.5rem] flex flex-col items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-3 px-2 max-w-lg">
              {TAGLINE_WORDS.map((word, wordIndex) => (
                <motion.span
                  key={`tagline-word-${wordIndex}`}
                  initial={{
                    opacity: 0,
                    y: 28,
                    rotateX: 45,
                    scale: 0.8
                  }}
                  animate={
                    isExiting
                      ? {
                          // Clean exit at the end
                          opacity: 0,
                          y: 16,
                          scale: 0.9,
                          transition: {
                            duration: 0.4,
                            delay: wordIndex * 0.02,
                            ease: 'easeInOut'
                          }
                        }
                      : {
                          // Enters ONCE and stays rock-solid
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          scale: 1,
                          transition: {
                            duration: 0.55,
                            delay: 0.75 + wordIndex * 0.07,
                            ease: [0.22, 1, 0.36, 1]
                          }
                        }
                  }
                  className="inline-block"
                >
                  <span
                    className="font-algerian text-lg sm:text-2xl md:text-3xl tracking-wider font-extrabold text-[#111c30] drop-shadow-xs inline-block select-none"
                    style={{
                      textShadow: '0 2px 4px rgba(17, 28, 48, 0.08)'
                    }}
                  >
                    {word}
                  </span>
                </motion.span>
              ))}
            </div>

            {/* Subline: 100% Freshness */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={
                isExiting
                  ? {
                      opacity: 0,
                      y: 10,
                      transition: { duration: 0.3 }
                    }
                  : {
                      opacity: 0.9,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        delay: 1.35,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }
              }
              className="mt-3.5 text-stone-600 font-semibold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 select-none"
            >
              <span className="w-6 h-[1.5px] bg-amber-500/50 inline-block" />
              <span className="font-freshness text-stone-700 font-bold tracking-wide">100% Freshness</span>
              <span className="w-6 h-[1.5px] bg-amber-500/50 inline-block" />
            </motion.div>
          </div>

          {/* Bottom subtle progress line representing the 6-second splash */}
          <div className="w-36 h-1 bg-stone-300/60 rounded-full mt-8 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5.2, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
