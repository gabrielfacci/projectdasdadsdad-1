import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import NameEntry from './NameEntry';
import ProfileAnalysis from './ProfileAnalysis';
import CryptoLevel from './CryptoLevel';
import ReturnPreference from './ReturnPreference';
import CryptoInterest from './CryptoInterest';
import WalletExperience from './WalletExperience';
import OpportunityApproach from './OpportunityApproach';
import MiningExperience from './MiningExperience';
import GhostTest from './GhostTest';
import ProfileApproval from './ProfileApproval';
import MiningSimulation from './MiningSimulation';
import MiningResults from './MiningResults';
import WalletFound from './WalletFound';
import TestCompleted from './TestCompleted';
import { useAuth } from '../../../context/AuthContext';
import { useOnboardingFlow } from '../../../context/OnboardingContext';
import { useTranslation } from '../../../hooks/useTranslation';

const OnboardingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { quizData, setStep, currentStep: savedStep, isLoading: contextLoading } = useOnboardingFlow();
  const [currentStep, setCurrentStep] = useState(savedStep);
  const [userData, setUserData] = useState({
    name: quizData.name || '',
    cryptoLevel: quizData.cryptoLevel || '',
    returnPreference: quizData.returnPreference || '',
    cryptoInterest: quizData.cryptoInterest || [],
    walletExperience: quizData.walletExperience || '',
    opportunityApproach: quizData.opportunityApproach || '',
    miningExperience: quizData.miningExperience || '',
    ghostTest: quizData.ghostTest || '',
    walletFound: quizData.walletFound || '',
    computePower: quizData.computePower || 0
  });
  
  // Sync with saved progress when context changes
  useEffect(() => {
    setCurrentStep(savedStep);
    
    // If we're at step 11 (mining results), activate specific visualizations
    if (savedStep === 11) {
      setShowResults(true);
    }
  }, [savedStep]);

  const [progress, setProgress] = useState(0);
  const [showWalletFound, setShowWalletFound] = useState(false);
  const [showMining, setShowMining] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    // Configure specific states based on saved step
    if (savedStep === 10) {
      setShowMining(true);
      setShowResults(false);
    } else if (savedStep === 11) {
      setShowResults(true);
      setShowMining(false);
    }
  }, [savedStep, quizData.name]);

  const totalSteps = 14; // Updated to include SYSTEM_UNLOCKED step

  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  // Restore userData from quiz data when component mounts
  useEffect(() => {
    if (quizData.name && !userData.name) {
      setUserData(prev => ({
        ...prev,
        name: quizData.name,
        cryptoLevel: quizData.cryptoLevel || prev.cryptoLevel,
        returnPreference: quizData.returnPreference || prev.returnPreference,
        cryptoInterest: quizData.cryptoInterest || prev.cryptoInterest,
        walletExperience: quizData.walletExperience || prev.walletExperience,
        opportunityApproach: quizData.opportunityApproach || prev.opportunityApproach,
        miningExperience: quizData.miningExperience || prev.miningExperience,
        ghostTest: quizData.ghostTest || prev.ghostTest,
        walletFound: quizData.walletFound || prev.walletFound,
        computePower: quizData.computePower || prev.computePower
      }));
    }
  }, [quizData]);

  const handleNext = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep <= totalSteps) {
      setCurrentStep(nextStep);
      setStep(nextStep);
    }
  }, [currentStep, setStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setStep(prevStep);
    }
  }, [currentStep, setStep]);

  const updateUserData = useCallback((field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNameSubmit = useCallback((name: string) => {
    updateUserData('name', name);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleCryptoLevelSubmit = useCallback((level: string) => {
    updateUserData('cryptoLevel', level);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleReturnPreferenceSubmit = useCallback((preference: string) => {
    updateUserData('returnPreference', preference);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleCryptoInterestSubmit = useCallback((interests: string[]) => {
    updateUserData('cryptoInterest', interests);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleWalletExperienceSubmit = useCallback((experience: string) => {
    updateUserData('walletExperience', experience);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleOpportunityApproachSubmit = useCallback((approach: string) => {
    updateUserData('opportunityApproach', approach);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleMiningExperienceSubmit = useCallback((experience: string) => {
    updateUserData('miningExperience', experience);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleGhostTestSubmit = useCallback((result: string, computePower: number) => {
    updateUserData('ghostTest', result);
    updateUserData('computePower', computePower);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleProfileApprovalSubmit = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleMiningSimulationComplete = useCallback(() => {
    setShowMining(false);
    setShowResults(true);
    handleNext();
  }, [handleNext]);

  const handleMiningResultsComplete = useCallback(() => {
    setShowResults(false);
    setShowWalletFound(true);
    handleNext();
  }, [handleNext]);

  const handleWalletFoundSubmit = useCallback((walletData: string) => {
    updateUserData('walletFound', walletData);
    setTestCompleted(true);
    handleNext();
  }, [updateUserData, handleNext]);

  const handleTestCompletedSubmit = useCallback(() => {
    // Mark onboarding as completed and navigate to dashboard
    navigate('/dashboard');
  }, [navigate]);

  // Show loading spinner if context is still loading
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameEntry
            onSubmit={handleNameSubmit}
            initialName={userData.name}
          />
        );
      case 1:
        return (
          <ProfileAnalysis
            name={userData.name}
            onComplete={handleNext}
          />
        );
      case 2:
        return (
          <CryptoLevel
            onSelect={handleCryptoLevelSubmit}
          />
        );
      case 3:
        return (
          <ReturnPreference
            onComplete={handleReturnPreferenceSubmit}
          />
        );
      case 4:
        return (
          <CryptoInterest
            onComplete={handleCryptoInterestSubmit}
          />
        );
      case 5:
        return (
          <WalletExperience
            onComplete={handleWalletExperienceSubmit}
          />
        );
      case 6:
        return (
          <OpportunityApproach
            onComplete={handleOpportunityApproachSubmit}
          />
        );
      case 7:
        return (
          <MiningExperience
            onComplete={handleMiningExperienceSubmit}
          />
        );
      case 8:
        return (
          <GhostTest
            onComplete={handleGhostTestSubmit}
          />
        );
      case 9:
        return (
          <ProfileApproval
            onComplete={handleProfileApprovalSubmit}
          />
        );
      case 10:
        return (
          <MiningSimulation
            onComplete={handleMiningSimulationComplete}
          />
        );
      case 11:
        return (
          <MiningResults
            walletFound={userData.walletFound}
            computePower={Number(userData.computePower)}
            onComplete={handleMiningResultsComplete}
          />
        );
      case 12:
        return (
          <WalletFound
            userData={userData}
            onSubmit={handleWalletFoundSubmit}
          />
        );
      case 13:
        return (
          <TestCompleted
            onComplete={handleTestCompletedSubmit}
            userName={userData.name}
          />
        );
      default:
        return (
          <NameEntry
            onSubmit={handleNameSubmit}
            initialName={userData.name}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,_119,_198,_0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,_119,_198,_0.3),_transparent_50%)]" />
      
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-4">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;