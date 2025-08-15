import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Check, Sparkles, ArrowRight } from 'lucide-react';
import { animations } from './onboardingConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import '../../../index.css';
import './onboardingResponsive.css';

interface CryptoLevelProps {
  onSelect: (level: string) => void;
}

const CryptoLevel: React.FC<CryptoLevelProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    // Pequena pausa antes de avançar para a próxima etapa
    setTimeout(() => {
      onSelect(level);
    }, 500);
  };

  const levels = [
    {
      id: 'beginner',
      title: t('onboarding.cryptoLevel.beginner.title'),
      description: t('onboarding.cryptoLevel.beginner.description'),
      color: '#4ECDC4'
    },
    {
      id: 'intermediate',
      title: t('onboarding.cryptoLevel.intermediate.title'),
      description: t('onboarding.cryptoLevel.intermediate.description'),
      color: '#FFD166'
    },
    {
      id: 'advanced',
      title: t('onboarding.cryptoLevel.advanced.title'),
      description: t('onboarding.cryptoLevel.advanced.description'),
      color: '#FF6B6B'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
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

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    },
    tap: {
      y: 0,
      boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    },
    selected: {
      y: -3,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
    }
  };

  const buttonPulseVariants = {
    idle: {},
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

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main icon */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#F7931A]/90 to-[#F7931A]/70 flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.05, rotate: 3 }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-[#F7931A]/50 to-orange-500/50 rounded-2xl blur-md opacity-70"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative z-10"
        >
          <Bitcoin className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
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
      </motion.div>
      {/* Title and Description */}
      <motion.h2
        className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-3"
        variants={itemVariants}
      >
        {t('onboarding.cryptoLevel.title')}
      </motion.h2>
      <motion.p
        className="text-neutral-300 text-center mb-6 sm:mb-8 max-w-xs text-[14px]"
        variants={itemVariants}
      >
        {t('onboarding.cryptoLevel.subtitle')}
      </motion.p>
      {/* Options */}
      <motion.div
        className="w-full space-y-3 sm:space-y-4 mb-6 sm:mb-8"
        variants={itemVariants}
      >
        {levels.map((level, index) => (
          <motion.div
            key={level.id}
            className={`w-full p-3 sm:p-4 rounded-xl border relative overflow-hidden cursor-pointer transform transition-all ${
              selectedLevel === level.id
                ? 'border-primary/50 bg-background-light/30 option-selected'
                : 'border-white/5 bg-background-light/10 hover:bg-background-light/20'
            }`}
            variants={optionVariants}
            initial="hidden"
            animate={selectedLevel === level.id ? "selected" : "visible"}
            whileHover={selectedLevel !== level.id ? "hover" : {}}
            whileTap="tap"
            custom={index}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleLevelSelect(level.id)}
          >
            {/* Option content */}
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              {/* Status indicator */}
              <div 
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${
                  selectedLevel === level.id
                    ? `border-primary bg-primary/20`
                    : 'border-white/20 bg-background-dark/50'
                }`}
              >
                {selectedLevel === level.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </motion.div>
                )}
              </div>

              {/* Level info */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-medium text-white">{level.title}</h3>
                <p className="text-neutral-400 mt-0.5 text-[14px]">{level.description}</p>
              </div>
            </div>

            {/* Background effect when selected */}
            {selectedLevel === level.id && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r opacity-10"
                style={{ backgroundImage: `linear-gradient(to right, ${level.color}30, transparent)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
              />
            )}

            {/* Animated border on hover */}
            <motion.div 
              className="absolute inset-0 border border-white/0 rounded-xl"
              initial={{ opacity: 0 }}
              whileHover={{ 
                opacity: 1,
                borderColor: `${level.color}50`,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>
      {/* Instrução sutil para informar ao usuário */}
      {!selectedLevel && (
        <motion.div
          className="text-xs text-neutral-400 text-center mt-3"
          variants={itemVariants}
        >
          <p>{t('onboarding.cryptoLevel.selectOption')}</p>
        </motion.div>
      )}
      {/* Animated background elements */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#F7931A]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.5
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
            delay: 1
          }}
        />
      </div>
    </motion.div>
  );
};

export default CryptoLevel;