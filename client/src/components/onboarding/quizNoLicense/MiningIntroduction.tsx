import React from "react";
import { motion } from "framer-motion";
import { Server, Shield, Lock, Play, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import "../../../index.css";
import "./onboardingResponsive.css";

interface MiningIntroductionProps {
  onStartMining: () => void;
}

const MiningIntroduction: React.FC<MiningIntroductionProps> = ({
  onStartMining,
}) => {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mining area header */}
      <motion.div
        className="mb-6 flex items-center justify-center"
        variants={itemVariants}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-xl"
            animate={{
              boxShadow: [
                "0 0 0 rgba(108, 99, 255, 0.4)",
                "0 0 20px rgba(108, 99, 255, 0.6)",
                "0 0 0 rgba(108, 99, 255, 0.4)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <Zap className="w-8 h-8 text-primary" />
          </motion.div>

          <motion.div
            className="absolute -right-1 -top-1"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </div>
      </motion.div>
      {/* Simulation title */}
      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white text-center mb-1"
        variants={itemVariants}
      >
        {t('onboarding.miningIntroduction.title')}
      </motion.h1>
      <motion.p
        className="text-neutral-300 text-center mb-6 text-[14px]"
        variants={itemVariants}
      >{t('onboarding.miningIntroduction.subtitle')}</motion.p>
      <motion.div
        className="w-full flex flex-col items-center"
        variants={itemVariants}
      >
        <div className="w-full bg-background-light/10 rounded-xl border border-white/10 p-4 mb-6">
          <h3 className="text-white text-sm font-medium mb-3">{t('onboarding.miningIntroduction.instructionsTitle')}</h3>
          <p className="text-neutral-300 mb-3 text-[14px]">
            {t('onboarding.miningIntroduction.description1')}
          </p>
          <p className="text-neutral-300 mb-3 text-[14px]">
            {t('onboarding.miningIntroduction.description2')}
          </p>
          <div className="flex items-center gap-2 bg-background-light/20 p-2 rounded-lg mb-1">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-xs text-neutral-400">
              {t('onboarding.miningIntroduction.algorithmReady')}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-background-light/20 p-2 rounded-lg mb-1">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-neutral-400">
              {t('onboarding.miningIntroduction.secureConnection')}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-background-light/20 p-2 rounded-lg">
            <Lock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-neutral-400">
              {t('onboarding.miningIntroduction.encryptionActive')}
            </span>
          </div>
        </div>

        <motion.div
          onClick={onStartMining}
          className="w-full p-4 rounded-xl border relative overflow-hidden cursor-pointer transform transition-all border-primary/50 bg-background-light/30 selectable-option"
          whileHover={{ 
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(123, 104, 238, 0.3)"
          }}
          whileTap={{ 
            y: 0,
            boxShadow: "0 5px 15px -5px rgba(123, 104, 238, 0.2)"
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            {/* Icon container with ghost theme */}
            <div className="bg-primary/20 p-2 rounded-lg">
              <Play className="w-5 h-5 text-primary" />
            </div>
            
            {/* Button text */}
            <div className="flex-1 text-center">
              <h3 className="text-base font-medium text-white">{t('onboarding.miningIntroduction.startMining')}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{t('onboarding.miningIntroduction.startTest')}</p>
            </div>
            
            {/* Arrow indicator */}
            <div className="bg-primary/20 rounded-full p-1">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-neutral-500 text-center"></p>
      </motion.div>
      {/* Blinking hot spots */}
      <div className="absolute bottom-4 left-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.5,
          }}
        />
      </div>
      <div className="absolute top-10 right-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0,
          }}
        />
      </div>
    </motion.div>
  );
};

export default MiningIntroduction;