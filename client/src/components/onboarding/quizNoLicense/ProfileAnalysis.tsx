import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  BarChart3,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import "../../../index.css";
import "./onboardingResponsive.css";
import { useTranslation } from "../../../hooks/useTranslation";

// Import CSS module for component-specific styles
import "./ProfileAnalysis.css";

interface ProfileAnalysisProps {
  onComplete: () => void;
}

const ProfileAnalysis: React.FC<ProfileAnalysisProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isButtonActive, setIsButtonActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonActive(true);
    }, 2000);

    // Animação de progresso
    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 0 rgba(123, 104, 238, 0.4)",
        "0 0 20px rgba(123, 104, 238, 0.6)",
        "0 0 0 rgba(123, 104, 238, 0.4)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror",
      },
    },
  };

  const features = [
    {
      icon: BarChart3,
      title: t('onboarding.profileAnalysis.features.adaptive'),
      description: t('onboarding.profileAnalysis.features.adaptiveDesc'),
      color: "#4ECDC4",
    },
    {
      icon: Zap,
      title: t('onboarding.profileAnalysis.features.optimization'),
      description: t('onboarding.profileAnalysis.features.optimizationDesc'),
      color: "#FFD166",
    },
    {
      icon: Lock,
      title: t('onboarding.profileAnalysis.features.encryption'),
      description: t('onboarding.profileAnalysis.features.encryptionDesc'),
      color: "#6C63FF",
    },
    {
      icon: Shield,
      title: t('onboarding.profileAnalysis.features.personalized'),
      description: t('onboarding.profileAnalysis.features.personalizedDesc'),
      color: "#FF6B6B",
    },
  ];

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-hidden profile-analysis-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with icon */}
      <div className="relative w-full mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 text-center text-[16px]">
          <div className="relative">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-[#6C63FF]" />
              </motion.div>
            </div>
            <div className="absolute -right-1 -top-1">
              <div className="relative">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500/30 animate-ping rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white">
              {t('onboarding.profileAnalysis.title')}
              <motion.span
                className="inline-block ml-1"
                animate={{ rotate: [0, 10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: 6,
                  repeatType: "mirror",
                  delay: 1,
                }}
              >
                🔍
              </motion.span>
            </h2>
            <p className="text-[13px] sm:text-sm text-neutral-400"></p>
          </div>
        </div>
      </div>
      {/* Main content */}
      <motion.div
        className="w-full px-2 sm:px-4 mb-4 sm:mb-6"
        variants={itemVariants}
      >
        {/* Content */}
        <motion.p
          className="text-neutral-300 sm:text-sm text-center mb-4 relative z-10 text-[14px]"
          variants={itemVariants}
        >{t('onboarding.profileAnalysis.subtitle')}</motion.p>

        {/* Features */}
        <motion.div
          className="space-y-2 sm:space-y-3 feature-cards"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start p-2.5 sm:p-3 bg-background-light/10 border border-white/10 rounded-xl relative overflow-hidden transform hover:scale-102 transition-transform duration-300"
              variants={featureItemVariants}
              custom={index}
              whileHover={{
                y: -2,
                boxShadow: `0 4px 20px ${feature.color}15`,
              }}
            >
              {/* Feature animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${feature.color}10, transparent)`,
                  opacity: 0.3,
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                  delay: index * 0.5,
                }}
              />

              <div
                className="p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 relative z-10 feature-icon"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <feature.icon
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: feature.color }}
                />
              </div>
              <div className="relative z-10 feature-content">
                <h3 className="text-white text-xs sm:text-sm font-medium">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5 sm:mt-1">
                  {feature.description}
                </p>
              </div>

              {/* Animated spark */}
              {index === 0 && (
                <motion.div
                  className="absolute -right-1 -top-1"
                  animate={{
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 1,
                  }}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                </motion.div>
              )}

              {index === 1 && (
                <motion.div
                  className="absolute -right-1 -top-1"
                  animate={{
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 1.5,
                  }}
                >
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      {/* Footer message */}
      <motion.div
        className="text-[10px] sm:text-xs text-neutral-400 text-center mb-4 sm:mb-6 border-t border-white/5 pt-2 sm:pt-4 w-full"
        variants={itemVariants}
      >
        <p className="flex items-center justify-center gap-1 sm:gap-2">
          <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-500" />
          {t('onboarding.profileAnalysis.subtitle')}
        </p>
      </motion.div>
      {/* Continue button */}
      <motion.button
        onClick={onComplete}
        className="w-full h-12 sm:h-14 rounded-xl relative overflow-hidden action-button"
        variants={isButtonActive ? pulseVariants : itemVariants}
        animate={isButtonActive ? "pulse" : "idle"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] to-[#4ECDC4] opacity-90"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        <span className="relative z-10 text-white text-sm sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2">
          {animationProgress < 100 ? (
            <>
              {t('onboarding.profileAnalysis.analyzing')}
              <motion.span
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                ...
              </motion.span>
            </>
          ) : (
            <>
              {t('onboarding.profileAnalysis.startButton')}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}
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
            delay: 0.5,
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
            delay: 0,
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
            delay: 0.5,
          }}
        />
      </div>
    </motion.div>
  );
};

export default ProfileAnalysis;
