import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { animations } from './onboardingConfig';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import '../../../index.css';
import './onboardingResponsive.css';

interface NameEntryProps {
  onSubmit: (name: string) => void;
  initialName?: string;
}

const NameEntry: React.FC<NameEntryProps> = ({ onSubmit, initialName = '' }) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState(initialName || '');
  const [isValid, setIsValid] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Se já temos o nome do perfil, usamos ele
    if (profile?.name) {
      setName(profile.name);
      setIsValid(true);

      // Depois de um breve delay, enviamos o nome automaticamente
      const timer = setTimeout(() => {
        setIsReady(true);
        onSubmit(profile.name || '');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [profile, onSubmit]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setIsValid(value.trim().length >= 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(name.trim());
    }
  };

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
      <motion.div variants={itemVariants} className="mb-6 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      </motion.div>

      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white text-center mb-1"
        variants={itemVariants}
      >
        {t('common.welcome')}
      </motion.h1>

      <motion.p
        className="text-neutral-400 text-center mb-6 text-[14px]"
        variants={itemVariants}
      >
        {profile?.name ? `${t('common.hello')}, ${profile.name}! ${t('onboarding.nameEntry.customizeExperience')}` : t('onboarding.nameEntry.preparingEnvironment')}
      </motion.p>

      {isReady ? (
        <motion.div
          className="w-full flex flex-col items-center"
          variants={animations.fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full bg-green-900/20 rounded-xl border border-green-500/20 p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="text-white text-sm font-medium">{t('onboarding.nameEntry.profileLoaded')}</h3>
                <p className="text-xs text-neutral-400">
                  {t('onboarding.nameEntry.proceedingAnalysis')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="w-full flex flex-col items-center"
          variants={itemVariants}
        >
          <div className="w-full bg-background-light/10 rounded-xl border border-white/10 p-5 mb-6">
            <h3 className="text-white text-sm font-medium mb-3">{t('onboarding.nameEntry.loadingProfile')}</h3>
            <div className="w-full h-2 bg-background-light/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NameEntry;