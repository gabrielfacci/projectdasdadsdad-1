import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Check, ArrowRight, Sparkles, Zap } from 'lucide-react';
import '../../../index.css';
import './onboardingResponsive.css';

interface WalletFoundProps {
  onComplete: () => void;
}

const WalletFound: React.FC<WalletFoundProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Procurando...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simular uma pesquisa e encontrar a carteira
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 33) {
          setStatus('Procurando carteiras compatíveis...');
          return prev + 1;
        } else if (prev < 66) {
          setStatus('Verificando compatibilidade...');
          return prev + 1;
        } else if (prev < 100) {
          setStatus('Encontrada! Preparando conexão...');
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 0 rgba(123, 104, 238, 0.4)",
        "0 0 20px rgba(123, 104, 238, 0.6)",
        "0 0 0 rgba(123, 104, 238, 0.4)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  const walletDetailsVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main icon with scanning effect */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#6C63FF]/90 to-[#6C63FF]/70 flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
        variants={itemVariants}
      >
        {/* Animated scanning effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6C63FF]/30 to-transparent"
          animate={{ 
            y: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="relative z-10"
        >
          <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>

        {/* Sparkle effect */}
        <motion.div
          className="absolute -right-1 -top-1"
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            delay: 1
          }}
        >
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </motion.div>

        {/* Progress indicator around icon */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(108, 99, 255, 0.2)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#6C63FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="301.6"
            strokeDashoffset={301.6 - (301.6 * progress) / 100}
            animate={{ 
              strokeDashoffset: 301.6 - (301.6 * progress) / 100 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      {/* Title and status */}
      <motion.h2
        className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-3"
        variants={itemVariants}
      >
        {isComplete ? "Carteira Encontrada!" : "Procurando Carteira"}
      </motion.h2>

      <motion.p
        className="text-neutral-300 text-center mb-4 sm:mb-6 max-w-xs text-[14px]"
        variants={itemVariants}
      >
        {isComplete 
          ? "Identificamos uma carteira Ghost compatível para você"
          : status
        }
      </motion.p>

      {/* Progress bar */}
      {!isComplete && (
        <motion.div className="w-full h-2 bg-background-light/20 rounded-full mb-6 sm:mb-8 overflow-hidden" variants={itemVariants}>
          <motion.div 
            className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4ECDC4]"
            style={{ width: `${progress}%` }}
            animate={{ 
              width: `${progress}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}

      {/* Wallet details (shown when complete) */}
      {isComplete && (
        <motion.div
          className="w-full mb-6 sm:mb-8 space-y-3 sm:space-y-4"
          variants={walletDetailsVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-3 sm:p-4 bg-background-light/10 border border-white/10 rounded-xl relative overflow-hidden">
            {/* Animated scan line */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
              animate={{ 
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#6C63FF]/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-[#6C63FF]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-white">Ghost Wallet</h3>
                </div>
                <div className="bg-green-500/20 text-green-400 text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Compatível</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#4ECDC4]" />
                  </div>
                  <span className="text-[14px] text-neutral-300">Carteira integrada ao Ghost Chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#FFD166]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span className="text-[14px] text-neutral-300">Suporte a múltiplas criptomoedas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#FF6B6B]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#FF6B6B]" />
                  </div>
                  <span className="text-[14px] text-neutral-300">Protocolo de segurança avançado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance boost notice */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#FFD166]/10 to-transparent border border-[#FFD166]/20 rounded-xl relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-1.5 sm:p-2 bg-[#FFD166]/20 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD166]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-white">Boost de Performance</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                  A carteira encontrada está otimizada para mineração de alta performance no Ghost Chain
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue button */}
      <motion.button
        onClick={onComplete}
        disabled={!isComplete}
        className={`w-full h-12 sm:h-14 rounded-xl relative overflow-hidden ${
          isComplete ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
        }`}
        variants={itemVariants}
        whileHover={isComplete ? { scale: 1.02 } : {}}
        whileTap={isComplete ? { scale: 0.98 } : {}}
        animate="pulse"
   >

        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] to-[#4ECDC4] opacity-90"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        <span className="relative z-10 text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2">
          {isComplete ? "Continuar" : "Procurando..."}
          {isComplete && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
        </span>

        {/* Animated highlight */}
        <motion.div 
          className="absolute inset-0 bg-white opacity-0"
          animate={{ 
            opacity: [0, 0.2, 0],
            left: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 0.5
          }}
        />
      </motion.button>

      {/* Hot spots animation */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#FFD166]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0
          }}
        />
      </div>

      <div className="absolute top-10 left-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#4ECDC4]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.5
          }}
        />
      </div>
    </motion.div>
  );
};

export default WalletFound;