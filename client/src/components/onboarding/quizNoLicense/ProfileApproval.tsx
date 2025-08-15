import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Brain, Zap, Gauge, ScanLine, Database } from 'lucide-react';
import { animations } from './onboardingConfig';
import { useOnboardingFlow } from '../../../context/OnboardingContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import '../../../index.css';
import './onboardingResponsive.css';

interface ProfileApprovalProps {
  onComplete: () => void;
}

const ProfileApproval: React.FC<ProfileApprovalProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { quizData } = useOnboardingFlow();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setShowButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!showButton) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showButton]);

  const chartVariants = {
    hidden: {
      scaleX: 0
    },
    visible: (custom: number) => ({
      scaleX: 1,
      transition: {
        duration: 1.5,
        delay: 0.5 + (custom * 0.005),
        ease: "easeOut"
      }
    })
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 2
      }
    }
  };

  const profileStats = [
    {
      label: t('onboarding.profileApproval.stats.techInterest'),
      value: 91,
      icon: Brain
    },
    {
      label: t('onboarding.profileApproval.stats.cryptoLevel'),
      value: quizData.cryptoLevel === "advanced" ? 82 : (quizData.cryptoLevel === "intermediate" ? 72 : 64),
      icon: Gauge
    },
    {
      label: t('onboarding.profileApproval.stats.riskOpenness'),
      value: quizData.returnPreference === "high_risk" ? 89 : (quizData.returnPreference === "balanced" ? 84 : 71),
      icon: Shield
    },
    {
      label: t('onboarding.profileApproval.stats.miningPotential'),
      value: quizData.willTest === "yes" ? 97 : (quizData.willTest === "maybe" ? 93 : 89),
      icon: Zap
    }
  ];

  const techSpecs = [
    { spec: t('onboarding.profileApproval.techSpecs.ghostCore'), icon: Brain },
    { spec: t('onboarding.profileApproval.techSpecs.security'), icon: Shield },
    { spec: t('onboarding.profileApproval.specs.scan'), icon: ScanLine },
    { spec: t('onboarding.profileApproval.techSpecs.wallets'), icon: Database }
  ];

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      console.log('Advancing to next step after profile approval');
      // Call callback to advance to next step
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error advancing to next step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="onboarding-card flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 bg-neon-glow"
      initial="hidden"
      animate="visible"
      variants={animations.containerVariants}
    >
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/70 flex items-center justify-center mb-6 shadow-lg"
        variants={animations.itemVariants}
        whileHover={{ scale: 1.05, rotate: 3 }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-2xl blur-md opacity-70"
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
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>
      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white text-center mb-1"
        variants={animations.itemVariants}
      >{t('onboarding.profileApproval.title')}</motion.h1>
      <motion.p
        className="text-green-400 text-sm font-medium text-center mb-6"
        variants={animations.itemVariants}
      >
        {t('onboarding.profileApproval.subtitle')}
      </motion.p>
      <motion.p
        className="text-neutral-300 text-center mb-6 text-[14px]"
        variants={animations.itemVariants}
      >{t('onboarding.profileApproval.description')}</motion.p>
      <motion.div
        className="w-full space-y-3 mb-6 bg-glass p-4 rounded-xl"
        variants={animations.itemVariants}
      >
        <h3 className="text-white text-sm font-medium mb-3">{t('onboarding.profileApproval.technicalAnalysis')}</h3>

        {profileStats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-neutral-300 text-[13px]">{stat.label}</span>
              </div>
              <span className="text-white text-xs font-medium">{stat.value}%</span>
            </div>
            <div className="w-full bg-neutral-700/30 rounded-full h-1.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B7AFF] rounded-full origin-left"
                custom={stat.value}
                variants={chartVariants}
                style={{ width: `${stat.value}%` }}
                initial="hidden"
                animate="visible"
              />
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div
        className="w-full mb-6 space-y-2"
        variants={statsVariants}
      >
        

        <div className="grid grid-cols-2 gap-2 text-xs">
          {techSpecs.map((spec, index) => (
            <motion.div
              key={index}
              className="bg-glass rounded-lg p-2 text-neutral-300"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                {React.createElement(spec.icon, { className: "w-4 h-4 text-primary flex-shrink-0" })}
                <div className="text-[11px] sm:text-xs text-white">{spec.spec}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {showButton && (
        <motion.div
          className="w-full p-4 rounded-xl bg-glass bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-white font-medium">{t('onboarding.profileApproval.preparingEnvironment')}</span>
          </div>
          <p className="text-neutral-300 text-center text-[13px] mb-2">
            <span className="text-white font-medium">{t('onboarding.profileApproval.waiting')}</span> {t('onboarding.profileApproval.redirecting')} 
            <motion.span 
              className="font-bold text-green-400 mx-1 text-base"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {countdown}
            </motion.span>
            {t('onboarding.profileApproval.seconds')}
          </p>
          <motion.div 
            className="w-full h-1 bg-background-light/30 rounded-full mt-3 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="h-full bg-green-500"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileApproval;