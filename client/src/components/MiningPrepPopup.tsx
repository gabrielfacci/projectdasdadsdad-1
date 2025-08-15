import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Cpu,
  Shield,
  CheckCircle,
  Network,
  Database,
  HardDrive,
  Cloud,
  Zap,
  Lock,
  Globe,
  Code,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

interface MiningPrepPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const MiningPrepPopup: React.FC<MiningPrepPopupProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [prepComplete, setPrepComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [stabilityLevel, setStabilityLevel] = useState(0);
  const [securityFluctuations, setSecurityFluctuations] = useState<number[]>([]);
  const [stabilityFluctuations, setStabilityFluctuations] = useState<number[]>([]);

  // Reset state when popup is closed
  useEffect(() => {
    if (!isOpen) {
      // Small delay to avoid visual flash during closing animation
      setTimeout(() => {
        setCurrentStep(0);
        setProgress(0);
        setPrepComplete(false);
        setCountdown(15);
        setElapsedTime(0);
        setSecurityLevel(0);
        setStabilityLevel(0);
        setSecurityFluctuations([]);
        setStabilityFluctuations([]);
      }, 300);
    }
  }, [isOpen]);

  // Environment preparation steps with longer duration
  const steps = [
    {
      icon: Server,
      text: t('miningPrepPopup.step1') || "Allocating dedicated Ghost Chain™ servers...",
      duration: 2800, // Adjusted duration
    },
    {
      icon: Globe,
      text: t('miningPrepPopup.step2') || "Establishing connection with blockchain nodes...",
      duration: 2500, // Adjusted duration
    },
    {
      icon: Shield,
      text: t('miningPrepPopup.step3') || "Configuring P2P security protocols...",
      duration: 2800, // Adjusted duration
    },
    {
      icon: Network,
      text: t('miningPrepPopup.step4') || "Synchronizing Solana network blocks...",
      duration: 2900, // Adjusted duration
    },
    {
      icon: Database,
      text: t('miningPrepPopup.step5') || "Loading advanced detection algorithms...",
      duration: 3000, // Adjusted duration
    },
    {
      icon: Lock,
      text: t('miningPrepPopup.step6') || "Establishing encrypted channel for mining...",
      duration: 2700, // Adjusted duration
    },
    {
      icon: Code,
      text: t('miningPrepPopup.step7') || "Compiling wallet detection scripts...",
      duration: 3200, // Adjusted duration
    },
    {
      icon: Cpu,
      text: t('miningPrepPopup.step8') || "Optimizing hardware for parallel processing...",
      duration: 2600, // Adjusted duration
    },
    {
      icon: Cloud,
      text: t('miningPrepPopup.step9') || "Integrating environment to Ghost private network...",
      duration: 3100, // Adjusted duration
    },
  ];

  // Timer to control total popup time (between 20-35 seconds)
  useEffect(() => {
    if (!isOpen) return;

    const totalTimeNeeded = Math.floor(Math.random() * 15) + 20; // 20-35 seconds
    const intervalId = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= totalTimeNeeded && !prepComplete) {
          // If time reaches total and still hasn't completed all steps,
          // force completion on next step
          if (currentStep < steps.length - 1) {
            setCurrentStep(steps.length - 1);
            setProgress(100);
          } else {
            setPrepComplete(true);
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen, prepComplete, currentStep, steps.length]);

  // Create realistic fluctuations in network and security metrics
  useEffect(() => {
    if (!isOpen) return;

    // Start with base values
    if (securityFluctuations.length === 0) {
      setSecurityFluctuations([65, 68, 72, 69, 66, 70, 75]);
    }

    if (stabilityFluctuations.length === 0) {
      setStabilityFluctuations([55, 62, 58, 64, 60, 65, 59]);
    }

    const fluctuationInterval = setInterval(() => {
      // Simulate connection stability fluctuations (more volatile)
      setStabilityFluctuations(prev => {
        const newFluctuations = [...prev];
        // Add a value with realistic variation
        const lastValue = newFluctuations[newFluctuations.length - 1];
        const maxChange = 8; // Maximum change to simulate network instability
        const randomChange = (Math.random() * maxChange * 2) - maxChange;

        // Ensure base value increases over time, but with fluctuations
        const baseValue = Math.min(95, elapsedTime * 3.5);
        let newValue = lastValue + randomChange;

        // Keep values within reasonable limits and close to base value
        newValue = Math.max(baseValue - 15, Math.min(baseValue + 5, newValue));
        newValue = Math.max(30, Math.min(98, newValue));

        // Keep only the last 10 values for fluctuation graph
        if (newFluctuations.length > 9) {
          newFluctuations.shift();
        }
        newFluctuations.push(newValue);

        // Update stability level with current value
        setStabilityLevel(Math.round(newValue));

        return newFluctuations;
      });

      // Simulate security fluctuations (more stable, with growing trend)
      setSecurityFluctuations(prev => {
        const newFluctuations = [...prev];
        const lastValue = newFluctuations[newFluctuations.length - 1];
        const maxChange = 4; // Maximum change (smaller than stability to appear more robust)
        const randomChange = (Math.random() * maxChange * 2) - maxChange;

        // Ensure base value increases over time, but with fewer fluctuations
        const baseValue = Math.min(98, elapsedTime * 4);
        let newValue = lastValue + randomChange;

        // Keep values within reasonable limits and close to base value
        newValue = Math.max(baseValue - 8, Math.min(baseValue + 2, newValue));
        newValue = Math.max(50, Math.min(99, newValue));

        // Keep only the last 10 values for fluctuation graph
        if (newFluctuations.length > 9) {
          newFluctuations.shift();
        }
        newFluctuations.push(newValue);

        // Update security level with current value
        setSecurityLevel(Math.round(newValue));

        return newFluctuations;
      });
    }, 800); // Update every 800ms to simulate network checks

    return () => clearInterval(fluctuationInterval);
  }, [isOpen, elapsedTime, securityFluctuations.length, stabilityFluctuations.length]);

  // Controls step changes more slowly
  useEffect(() => {
    if (!isOpen) return;

    let timeout: NodeJS.Timeout;

    if (currentStep === 0 && isOpen) {
      console.log("[MiningPrepPopup] Starting preparation sequence");
      setProgress(0);
    }

    if (currentStep < steps.length) {
      console.log(
        `[MiningPrepPopup] Step ${currentStep + 1}/${steps.length}: ${steps[currentStep].text}`,
      );
      timeout = setTimeout(() => {
        setProgress(0);
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].duration);
    } else if (!prepComplete) {
      console.log(
        "[MiningPrepPopup] Preparation complete, starting countdown",
      );
      setPrepComplete(true);
    }

    return () => clearTimeout(timeout);
  }, [currentStep, isOpen, prepComplete, steps]);

  // Manages progress bar for each step with more visible speed
  useEffect(() => {
    if (!isOpen || currentStep >= steps.length) return;

    // Reset progress when changing step
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // More perceptible increment for visualization
        return prev + 2.5;
      });
    }, steps[currentStep].duration / 45); // Adjustment to make animation more visible

    return () => clearInterval(interval);
  }, [currentStep, isOpen, steps]);

  // Manages countdown after preparation is completed
  useEffect(() => {
    if (!isOpen || !prepComplete || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Activate callback after complete countdown
          setTimeout(() => {
            onComplete();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [prepComplete, isOpen, onComplete, countdown]);

  if (!isOpen) return null;

  const CurrentIcon =
    currentStep < steps.length ? steps[currentStep].icon : CheckCircle;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: 'rgba(13, 10, 20, 0.9)' }}
    >
      <motion.div
        className="rounded-xl w-[90%] max-w-md p-5 backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.4)',
          borderColor: 'rgba(123, 104, 238, 0.4)',
          boxShadow: '0 20px 40px rgba(123, 104, 238, 0.3)'
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
            animate={{
              boxShadow: prepComplete
                ? [
                    "0px 0px 0px rgba(123, 104, 238, 0.5)",
                    "0px 0px 25px rgba(123, 104, 238, 0.8)",
                    "0px 0px 0px rgba(123, 104, 238, 0.5)",
                  ]
                : [
                    "0px 0px 0px rgba(123, 104, 238, 0.3)",
                    "0px 0px 15px rgba(123, 104, 238, 0.5)",
                    "0px 0px 0px rgba(123, 104, 238, 0.3)",
                  ],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          >
            <CurrentIcon 
              className="w-8 h-8" 
              style={{ color: 'var(--ghost-primary)' }}
            />
          </motion.div>
        </div>

        <h2 
          className="text-xl font-bold text-center mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {prepComplete
            ? t('miningPrepPopup.environmentReady')
            : t('miningPrepPopup.preparingEnvironment')}
        </h2>

        <p className="text-sm text-neutral-300 text-center mb-4">
          {prepComplete
            ? t('miningPrepPopup.sessionReady')
            : currentStep < steps.length
              ? steps[currentStep].text
              : t('miningPrepPopup.finalizingSettings')}
        </p>

        {/* Status Icons Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: Server, label: t('miningPrepPopup.statusIcons.server'), active: elapsedTime > 2 },
            { icon: Globe, label: t('miningPrepPopup.statusIcons.network'), active: elapsedTime > 4 },
            { icon: Shield, label: t('miningPrepPopup.statusIcons.security'), active: elapsedTime > 6 },
            { icon: Network, label: t('miningPrepPopup.statusIcons.p2p'), active: elapsedTime > 8 },
            { icon: Database, label: t('miningPrepPopup.statusIcons.data'), active: elapsedTime > 10 },
            { icon: Lock, label: t('miningPrepPopup.statusIcons.access'), active: elapsedTime > 12 },
            { icon: Code, label: t('miningPrepPopup.statusIcons.scripts'), active: elapsedTime > 14 },
            { icon: Cpu, label: t('miningPrepPopup.statusIcons.hardware'), active: elapsedTime > 16 },
            { icon: Cloud, label: t('miningPrepPopup.statusIcons.cloud'), active: elapsedTime > 18 },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center justify-center p-2 rounded-lg border"
              style={{
                backgroundColor: item.active 
                  ? 'rgba(123, 104, 238, 0.15)' 
                  : 'rgba(55, 55, 58, 0.3)',
                borderColor: item.active 
                  ? 'rgba(123, 104, 238, 0.3)' 
                  : 'rgba(123, 104, 238, 0.1)'
              }}
              animate={
                item.active
                  ? {
                      y: [0, -2, 0],
                      scale: [1, 1.02, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: item.active ? Infinity : 0,
                repeatType: "mirror",
              }}
            >
              <motion.div
                className="relative w-6 h-6 mb-1 flex items-center justify-center"
                style={{
                  color: item.active ? 'var(--ghost-primary)' : '#6B7280'
                }}
                animate={
                  item.active
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: item.active ? Infinity : 0,
                  repeatType: "mirror",
                }}
              >
                {item.active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0px 0px 0px rgba(123, 104, 238, 0.3)",
                        "0px 0px 8px rgba(123, 104, 238, 0.6)",
                        "0px 0px 0px rgba(123, 104, 238, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  />
                )}
                <item.icon />
              </motion.div>
              <span
                className="text-[10px]"
                style={{
                  color: item.active ? 'var(--ghost-primary)' : '#6B7280'
                }}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {currentStep < steps.length && (
          <div 
            className="w-full h-2 rounded-full overflow-hidden mb-6"
            style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: 'var(--ghost-primary)' }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {prepComplete && (
          <>
            <div 
              className="w-full h-2 rounded-full overflow-hidden mb-2"
              style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
            >
              <motion.div
                className="h-full"
                style={{ 
                  backgroundColor: '#10B981',
                  width: `${((15 - countdown) / 15) * 100}%` 
                }}
              />
            </div>
            <p className="text-xs text-center text-neutral-400 mb-4">
              {t('miningPrepPopup.startingMining')} {countdown} {t('miningPrepPopup.seconds')}
            </p>
          </>
        )}

        {/* Additional spacing to maintain balanced layout */}
        <div className="mb-4"></div>

        <div className="space-y-1.5 mb-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">{t('miningPrepPopup.nodeSynchronization')}</span>
            <span style={{ color: '#10B981' }}>
              {Math.min(100, Math.floor(elapsedTime * 3.3))}%
            </span>
          </div>
          <div 
            className="h-1 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
          >
            <motion.div
              className="h-full"
              style={{ 
                backgroundColor: '#10B981',
                width: `${Math.min(100, Math.floor(elapsedTime * 3.3))}%`
              }}
              animate={{
                width: `${Math.min(100, Math.floor(elapsedTime * 3.3))}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">{t('miningPrepPopup.connectionStability')}</span>
            <span style={{ color: 'var(--ghost-primary)' }}>
              {stabilityLevel}%
            </span>
          </div>
          <div 
            className="h-1 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
          >
            <motion.div
              className="h-full"
              style={{ 
                backgroundColor: 'var(--ghost-primary)',
                width: `${stabilityLevel}%`
              }}
              animate={{ width: `${stabilityLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="h-4 relative w-full mb-3">
            <div className="absolute inset-0 flex items-end">
              {stabilityFluctuations.map((value, index) => (
                <div 
                  key={`stability-${index}`} 
                  className="flex-1 mx-px"
                  style={{ height: `${value}%`, background: `rgba(123, 104, 238, ${0.2 + ((index / stabilityFluctuations.length) * 0.8)})` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">{t('miningPrepPopup.securityStatus')}</span>
            <span style={{ color: '#F59E0B' }}>
              {securityLevel}%
            </span>
          </div>
          <div 
            className="h-1 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
          >
            <motion.div
              className="h-full"
              style={{ 
                backgroundColor: '#F59E0B',
                width: `${securityLevel}%`
              }}
              animate={{ width: `${securityLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="h-4 relative w-full mb-1">
            <div className="absolute inset-0 flex items-end">
              {securityFluctuations.map((value, index) => (
                <div 
                  key={`security-${index}`} 
                  className="flex-1 mx-px"
                  style={{ height: `${value}%`, background: `rgba(255, 211, 102, ${0.2 + ((index / securityFluctuations.length) * 0.8)})` }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[#a3a0a0] text-[12px]">
          {t('miningPrepPopup.footerMessage')}
        </p>
      </motion.div>
    </div>
  );
};

export default MiningPrepPopup;