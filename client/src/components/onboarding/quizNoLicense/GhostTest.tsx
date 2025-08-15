import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Ghost,
  Zap,
  ChevronRight,
  ArrowRight,
  Activity,
  Shield,
  Cpu,
  Server,
  Sparkles,
  CheckCircle,
  Brain,
  Lock,
  ScanLine,
  Database,
  BarChart4,
  Network,
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import "../../../index.css";
import "./onboardingResponsive.css";

interface GhostTestProps {
  onComplete: (willTest: string) => void;
}

const GhostTest: React.FC<GhostTestProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [profileScore, setProfileScore] = useState(0);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [patternRecognition, setPatternRecognition] = useState(0);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [dataProcessed, setDataProcessed] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(65);
  const [matchScore, setMatchScore] = useState(0);
  const [anomalyDetection, setAnomalyDetection] = useState(0);
  const [profileNodes, setProfileNodes] = useState<
    { x: number; y: number; size: number; type: string }[]
  >([]);

  const networkRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Analysis phases
  const analyzingPhases = t('onboarding.ghostTest.phases', { returnObjects: true }) as string[] || [
    "Starting analysis...",
    "Processing data...",
    "Calculating patterns...",
    "Verifying compatibility...",
    "Analyzing algorithms...",
    "Processing responses...",
    "Identifying psychometric profile",
    "Preparing personalized environment",
    "Applying machine learning",
    "Finalizing compatibility analysis",
  ];

  // Simulated data for charts
  const maxDataPoints = 25;
  const [profileData, setProfileData] = useState(Array(maxDataPoints).fill(0));
  const [analysisData, setAnalysisData] = useState(
    Array(maxDataPoints).fill(0),
  );
  const [compatibilityData, setCompatibilityData] = useState(
    Array(maxDataPoints).fill(0),
  );

  // Generate profile nodes for network visualization
  useEffect(() => {
    const generateNetworkNodes = () => {
      if (!networkRef.current) return;

      const container = networkRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const newNodes = [];

      // Central node (user profile)
      newNodes.push({
        x: width / 2,
        y: height / 2,
        size: 12,
        type: "user",
      });

      // Primary analysis nodes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.35;

        newNodes.push({
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          size: 4 + Math.random() * 4,
          type: i % 3 === 0 ? "profile" : i % 3 === 1 ? "analysis" : "data",
        });
      }

      // Secondary analysis nodes
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.6;

        newNodes.push({
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          size: 2 + Math.random() * 3,
          type:
            i % 4 === 0
              ? "security"
              : i % 4 === 1
                ? "neural"
                : i % 4 === 2
                  ? "pattern"
                  : "data",
        });
      }

      setProfileNodes(newNodes);
    };

    generateNetworkNodes();

    window.addEventListener("resize", generateNetworkNodes);
    return () => window.removeEventListener("resize", generateNetworkNodes);
  }, []);

  // Update progress
  useEffect(() => {
    // Redirect after 20 seconds
    const redirectTimer = setTimeout(() => {
      setShowRedirectMessage(true);

      // Actually redirect 3 seconds after message
      const finalRedirectTimer = setTimeout(() => {
        onComplete("yes");
      }, 3000);

      return () => clearTimeout(finalRedirectTimer);
    }, 20000);

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 0.5;
      });
    }, 100);

    // Update phases
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) =>
        prev < analyzingPhases.length - 1 ? prev + 1 : prev,
      );
    }, 2000);

    // Profile score simulation
    const profileInterval = setInterval(() => {
      setProfileScore((prev) => {
        const newScore = prev + Math.random() * 1.2;
        return Math.min(95, newScore);
      });
    }, 300);

    // Compatibility simulation
    const compatibilityInterval = setInterval(() => {
      setCompatibilityScore((prev) => {
        const newScore = prev + Math.random() * 0.8;
        return Math.min(98, newScore);
      });
    }, 400);

    // Simulação de reconhecimento de padrões
    const patternInterval = setInterval(() => {
      setPatternRecognition((prev) => {
        const newRate = Math.min(100, prev + Math.random() * 2);
        return parseFloat(newRate.toFixed(1));
      });
    }, 200);

    // Update chart data
    const dataInterval = setInterval(() => {
      setProfileData((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push(60 + Math.random() * 40); // Valor entre 60-100
        return newData;
      });

      setAnalysisData((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push(40 + Math.random() * 55); // Valor entre 40-95
        return newData;
      });

      setCompatibilityData((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push(70 + Math.random() * 25); // Valor entre 70-95
        return newData;
      });
    }, 300);

    // Percentage of processed data
    const dataProcessInterval = setInterval(() => {
      setDataProcessed((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 3;
      });
    }, 500);

    // Security level
    const securityInterval = setInterval(() => {
      setSecurityLevel((prev) => {
        const variation = Math.random() * 10 - 5; // Between -5 and +5
        const newValue = prev + variation;
        return Math.min(98, Math.max(60, newValue));
      });
    }, 1000);

    // Score de compatibilidade
    const matchInterval = setInterval(() => {
      setMatchScore((prev) => {
        if (prev >= 95) return 95 + Math.random() * 5;
        return prev + Math.random() * 2.5;
      });
    }, 600);

    // Detecção de anomalias
    const anomalyInterval = setInterval(() => {
      setAnomalyDetection((prev) => {
        const variation = Math.random() * 6 - 3; // Between -3 and +3
        const newValue = prev + variation;
        return Math.min(15, Math.max(0, newValue));
      });
    }, 800);

    // Nó ativo da rede
    const nodeInterval = setInterval(() => {
      if (profileNodes.length > 0) {
        const randomIndex = Math.floor(Math.random() * profileNodes.length);
        setActiveNode(randomIndex);
      }
    }, 800);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(interval);
      clearInterval(phaseInterval);
      clearInterval(profileInterval);
      clearInterval(compatibilityInterval);
      clearInterval(patternInterval);
      clearInterval(dataInterval);
      clearInterval(dataProcessInterval);
      clearInterval(securityInterval);
      clearInterval(matchInterval);
      clearInterval(anomalyInterval);
      clearInterval(nodeInterval);
    };
  }, [onComplete, profileNodes.length]);

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
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

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated icon */}
      <motion.div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center mb-6 relative"
        variants={itemVariants}
      >
        <motion.div
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-[#6C63FF]" />
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
      </motion.div>
      {/* Title */}
      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white text-center mb-1"
        variants={itemVariants}
      >
        {t('onboarding.ghostTest.title')}
      </motion.h1>
      {/* Subtitle */}
      <motion.p
        className="text-neutral-300 text-sm text-center mb-6"
        variants={itemVariants}
      >{t('onboarding.ghostTest.subtitle')}</motion.p>
      {/* Progress */}
      <motion.div className="w-full mb-6 space-y-1" variants={itemVariants}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-neutral-400">
            {analyzingPhases[currentPhase]}
          </span>
          <span className="text-xs font-medium text-[#6C63FF]">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-700/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B7AFF] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </motion.div>
      {/* Network analysis visualization */}
      <motion.div
        className="w-full bg-background-light/10 rounded-xl border border-white/10 p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#6C63FF]" />
            <span className="text-white text-sm font-medium">
              {t('onboarding.ghostTest.networkMapping')}
            </span>
          </div>
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <Brain className="w-4 h-4 text-green-400" />
          </motion.div>
        </div>

        {/* Network visualization */}
        <div
          ref={networkRef}
          className="w-full h-[140px] sm:h-[160px] relative bg-background/40 rounded-lg overflow-hidden mb-3"
        >
          {/* Conexões de rede */}
          <svg className="absolute inset-0 w-full h-full z-10">
            {profileNodes.map((node, i) =>
              profileNodes.map((targetNode, j) => {
                // Conectar o nó central aos demais e alguns nós aleatórios entre si
                if (
                  (i === 0 && j > 0) ||
                  (Math.random() > 0.9 && i !== j && i > 0 && j > 0)
                ) {
                  const opacity = i === 0 ? 0.6 : 0.2 + Math.random() * 0.3;
                  const isActive = i === activeNode || j === activeNode;

                  return (
                    <motion.line
                      key={`connection-${i}-${j}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isActive ? "#6C63FF" : "#6C63FF"}
                      strokeWidth={isActive ? "1.5" : "0.8"}
                      opacity={isActive ? 0.8 : opacity}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isActive ? [opacity, 0.8, opacity] : opacity,
                      }}
                      transition={{
                        duration: isActive ? 1.5 : 0,
                        repeat: isActive ? Infinity : 0,
                      }}
                    />
                  );
                }
                return null;
              }),
            )}
          </svg>

          {/* Nós da rede */}
          {profileNodes.map((node, i) => (
            <motion.div
              key={`node-${i}`}
              className={`absolute rounded-full z-20 
                ${
                  node.type === "user"
                    ? "bg-[#6C63FF]"
                    : node.type === "profile"
                      ? "bg-yellow-400"
                      : node.type === "analysis"
                        ? "bg-green-400"
                        : node.type === "security"
                          ? "bg-red-400"
                          : node.type === "neural"
                            ? "bg-blue-400"
                            : node.type === "pattern"
                              ? "bg-purple-400"
                              : "bg-teal-400"
                }`}
              style={{
                left: node.x - node.size / 2,
                top: node.y - node.size / 2,
                width: node.size,
                height: node.size,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: i === activeNode ? [1, 1.3, 1] : 1,
                opacity: 1,
                boxShadow:
                  i === activeNode
                    ? [
                        "0 0 0 rgba(108, 99, 255, 0)",
                        "0 0 10px rgba(108, 99, 255, 0.5)",
                        "0 0 0 rgba(108, 99, 255, 0)",
                      ]
                    : "none",
              }}
              transition={{
                delay: i * 0.02,
                duration: i === activeNode ? 1.5 : 0.3,
                repeat: i === activeNode ? Infinity : 0,
              }}
            />
          ))}

          {/* Efeito de escaneamento */}
          <motion.div
            className="absolute inset-0 w-full bg-[#6C63FF]/10"
            initial={{ top: 0 }}
            animate={{
              top: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{
              height: "3px",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Processing metrics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Cpu className="w-3 h-3 text-[#6C63FF]" />
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.dataProcessing')}
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-sm font-medium text-white">
                {dataProcessed.toFixed(1)}%
              </span>
              <div className="flex-1 h-1 bg-neutral-700/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#6C63FF]"
                  style={{ width: `${dataProcessed}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.securityLevel')}
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-sm font-medium text-white">
                {securityLevel.toFixed(1)}%
              </span>
              <div className="flex-1 h-1 bg-neutral-700/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#4CAF50]"
                  style={{ width: `${securityLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Profile analysis chart */}
      <motion.div
        className="w-full bg-background-light/10 rounded-xl border border-white/10 p-3 sm:p-4 mb-4 sm:mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart4 className="w-4 h-4 text-[#6C63FF]" />
            <span className="text-white text-sm font-medium">
              {t('onboarding.ghostTest.profileAnalysis')}
            </span>
          </div>
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <Activity className="w-4 h-4 text-green-400" />
          </motion.div>
        </div>

        {/* Gráfico dinâmico */}
        <div className="h-[120px] w-full relative mb-3 sm:mb-4">
          {/* Grid lines */}
          {[1, 2, 3].map((i) => (
            <div
              key={`grid-${i}`}
              className="absolute w-full h-px bg-white/5"
              style={{ top: `${i * 25}%` }}
            />
          ))}

          {/* Chart data */}
          <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
            {profileData.map((value, index) => (
              <div key={`point-${index}`} className="relative flex-1 h-full flex items-end justify-center">
                {/* Vertical lines (candle shadows) */}
                <motion.div
                  className="w-px bg-[#6C63FF]/30"
                  style={{ height: `${value}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: index * 0.03 }}
                />

                {/* Pontos do gráfico de perfil */}
                {index > 0 && (
                  <motion.div
                    className="absolute h-2 w-2 rounded-full bg-[#6C63FF]"
                    style={{
                      bottom: `${profileData[index]}%`,
                      left: `${(index / (profileData.length - 1)) * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  />
                )}

                {/* Secondary line chart (analysis) */}
                {index > 0 && index < analysisData.length - 1 && (
                  <motion.div
                    className="absolute h-1 w-1 rounded-full bg-yellow-400"
                    style={{
                      bottom: `${analysisData[index]}%`,
                      left: `${(index / (analysisData.length - 1)) * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    transition={{ delay: index * 0.03 + 0.2 }}
                  />
                )}

                {/* Gráfico de linha terciário (compatibilidade) */}
                {index > 0 && index < compatibilityData.length - 1 && (
                  <motion.div
                    className="absolute h-1 w-1 rounded-full bg-green-400"
                    style={{
                      bottom: `${compatibilityData[index]}%`,
                      left: `${(index / (compatibilityData.length - 1)) * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    transition={{ delay: index * 0.03 + 0.3 }}
                  />
                )}
              </div>
            ))}

            {/* Linha de conexão para o gráfico principal */}
            <svg className="absolute inset-0 h-full w-full">
              <motion.path
                d={`M0,${100 - profileData[0]} ${profileData
                  .map((value, index) => {
                    const x = (index / (profileData.length - 1)) * 100;
                    const y = 100 - value;
                    return `L${x},${y}`;
                  })
                  .join(" ")}`}
                fill="none"
                stroke="url(#profileGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient
                  id="profileGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Linha de conexão para o gráfico secundário */}
            <svg className="absolute inset-0 h-full w-full">
              <motion.path
                d={`M0,${100 - analysisData[0]} ${analysisData
                  .map((value, index) => {
                    const x = (index / (analysisData.length - 1)) * 100;
                    const y = 100 - value;
                    return `L${x},${y}`;
                  })
                  .join(" ")}`}
                fill="none"
                stroke="url(#analysisGradient)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 2.8, ease: "easeInOut", delay: 0.3 }}
              />
              <defs>
                <linearGradient
                  id="analysisGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FFD166" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#FFD166" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Linha de conexão para o gráfico terciário */}
            <svg className="absolute inset-0 h-full w-full">
              <motion.path
                d={`M0,${100 - compatibilityData[0]} ${compatibilityData
                  .map((value, index) => {
                    const x = (index / (compatibilityData.length - 1)) * 100;
                    const y = 100 - value;
                    return `L${x},${y}`;
                  })
                  .join(" ")}`}
                fill="none"
                stroke="url(#compatibilityGradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
              />
              <defs>
                <linearGradient
                  id="compatibilityGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#4ECDC4" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Analysis metrics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-2 bg-background-light/20 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Brain className="w-3 h-3 text-[#6C63FF]" />
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.profileScore')}
              </span>
            </div>
            <motion.div
              className="text-sm font-medium text-white"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              {profileScore.toFixed(1)}
              <span className="text-xs text-neutral-500 ml-1">{t('onboarding.ghostTest.scoreUnit')}</span>
            </motion.div>
          </div>

          <div className="p-2 bg-background-light/20 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-neutral-300">{t('onboarding.ghostTest.recognition')}</span>
            </div>
            <motion.div
              className="text-sm font-medium text-white"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              {patternRecognition.toFixed(1)}
              <span className="text-xs text-neutral-500 ml-1">%</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {/* Analysis results */}
      <motion.div
        className="w-full bg-background-light/10 rounded-xl border border-white/10 p-3 sm:p-4 mb-4 sm:mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">
              {t('onboarding.ghostTest.preliminaryResults')}
            </span>
          </div>
          <ScanLine className="w-4 h-4 text-[#6C63FF] animate-pulse" />
        </div>

        <div className="space-y-3">
          {/* Compatibility score */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.ghostChainCompatibility')}
              </span>
              <span className="text-xs font-medium text-green-400">
                {matchScore.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-700/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4CAF50]"
                style={{ width: `${matchScore}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${matchScore}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Anomaly detection */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.anomalyDetection')}
              </span>
              <span className="text-xs font-medium text-yellow-400">
                {anomalyDetection.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600/30">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${anomalyDetection}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${anomalyDetection}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Processing conclusion */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-300">
                {t('onboarding.ghostTest.processingConclusion')}
              </span>
              <span className="text-xs font-medium text-[#6C63FF]">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600/30">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B7AFF] rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      {/* Security footer */}
      <motion.div
        className="text-[10px] text-neutral-400 text-center mb-4"
        variants={itemVariants}
      >
        <p>
          {t('onboarding.ghostTest.securityFooter')}
        </p>
      </motion.div>
      {/* Redirect message */}
      {showRedirectMessage && (
        <motion.div
          className="w-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 rounded-lg p-3 text-center text-white text-sm"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>{t('onboarding.ghostTest.redirectMessage')}</span>
          </div>
        </motion.div>
      )}
      {/* Blinking hot spots */}
      <div className="absolute bottom-4 left-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#4ECDC4]"
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
          className="w-2 h-2 rounded-full bg-[#FFD166]"
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

export default GhostTest;
