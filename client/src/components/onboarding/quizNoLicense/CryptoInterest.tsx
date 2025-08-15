import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Coins, CreditCard, Sparkles } from 'lucide-react';
import { animations } from './onboardingConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import '../../../index.css';
import './onboardingResponsive.css';

interface CryptoInterestProps {
  onComplete: (interest: string) => void;
}

const CryptoInterest: React.FC<CryptoInterestProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const interests = [
    {
      value: "privacy",
      label: t('onboarding.cryptoInterest.privacy.title'),
      description: t('onboarding.cryptoInterest.privacy.description'),
      icon: Lock,
      color: '#4ECDC4'
    },
    {
      value: "financial_freedom",
      label: t('onboarding.cryptoInterest.financialFreedom.title'),
      description: t('onboarding.cryptoInterest.financialFreedom.description'),
      icon: CreditCard,
      color: '#FFD166'
    },
    {
      value: "balanced",
      label: t('onboarding.cryptoInterest.balanced.title'),
      description: t('onboarding.cryptoInterest.balanced.description'),
      icon: Coins,
      color: '#FF6B6B'
    }
  ];

  const handleSelect = (value: string) => {
    setSelectedInterest(value);
    setTimeout(() => onComplete(value), 500);
  };

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

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main icon */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7B68EE]/90 to-[#6C63FF]/70 flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.05, rotate: 3 }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-[#7B68EE]/50 to-indigo-500/50 rounded-2xl blur-md opacity-70"
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
          <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
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
        {t('onboarding.cryptoInterest.title')}
      </motion.h2>

      <motion.p
        className="text-neutral-300 text-xs sm:text-sm text-center mb-6 sm:mb-8 max-w-xs"
        variants={itemVariants}
      >
        {t('onboarding.cryptoInterest.subtitle')}
      </motion.p>

      {/* Options */}
      <motion.div
        className="w-full space-y-3 sm:space-y-4 mb-6 sm:mb-8"
        variants={itemVariants}
      >
        {interests.map((interest, index) => (
          <motion.div
            key={interest.value}
            className={`w-full p-3 sm:p-4 rounded-xl border relative overflow-hidden cursor-pointer transform transition-all ${
              selectedInterest === interest.value
                ? 'border-primary/50 bg-background-light/30 option-selected'
                : 'border-white/5 bg-background-light/10 hover:bg-background-light/20'
            }`}
            variants={optionVariants}
            onClick={() => handleSelect(interest.value)}
            initial="hidden"
            animate={selectedInterest === interest.value ? "selected" : "visible"}
            whileHover={selectedInterest !== interest.value ? "hover" : {}}
            whileTap="tap"
            custom={index}
            transition={{ delay: index * 0.1 }}
          >
            {/* Option content */}
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              {/* Icon container */}
              <div className="bg-background-light/20 p-2 rounded-lg">
                <interest.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>

              {/* Level info */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-medium text-white">{interest.label}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{interest.description}</p>
              </div>

              {/* Status indicator */}
              {selectedInterest === interest.value && (
                <motion.div 
                  className="bg-primary/20 rounded-full p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Check className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </div>

            {/* Background effect when selected */}
            {selectedInterest === interest.value && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r opacity-10"
                style={{ backgroundImage: `linear-gradient(to right, ${interest.color}30, transparent)` }}
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
                borderColor: `${interest.color}50`,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Instrução sutil para informar ao usuário */}
      {!selectedInterest && (
        <motion.div
          className="text-xs text-neutral-400 text-center mt-3"
          variants={itemVariants}
        >
          <p>{t('onboarding.cryptoInterest.selectOption')}</p>
        </motion.div>
      )}

      {/* Animated background elements */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
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

export default CryptoInterest;