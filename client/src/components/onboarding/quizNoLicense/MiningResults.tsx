import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Rocket,
  Lock,
  Zap,
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ChevronRight,
  Diamond,
  Globe,
  Star,
  TrendingUp,
  Check,
  MonitorSmartphone,
  Brain,
  RefreshCw,
  Clock8,
  Sparkles,
  BarChart4,
  Radar,
  Key,
  Loader,
} from "lucide-react";
import { useOnboardingFlow } from "../../../context/OnboardingContext";
import PlanSelectionPopup from "../../ui/PlanSelectionPopup";
import { useAuth } from "../../../context/AuthContext";
import { useLicenseVerification } from "../../../hooks/useLicenseVerification";
import { auth } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../../../index.css";
import "./onboardingResponsive.css";

interface MiningResultsProps {
  walletFound: string;
  computePower: number;
  onComplete: (action: "premium" | "skip") => void;
  setStep?: (step: number) => void;
  fromSystemUnlocked?: boolean;
}

const MiningResults: React.FC<MiningResultsProps> = ({
  walletFound,
  computePower,
  onComplete,
  setStep,
  fromSystemUnlocked = true,
}) => {
  const [minutes, setMinutes] = useState(9);
  const [seconds, setSeconds] = useState(42);
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [isActivating, setIsActivating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showMiningEffect, setShowMiningEffect] = useState(false);
  const [showPremiumButton, setShowPremiumButton] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // License verification states (duplicating from LicenseRequired but with different naming)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const verificationRef = useRef<HTMLDivElement>(null);

  const { completeOnboarding } = useOnboardingFlow();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Hook de verificação de licenças - MESMO SISTEMA DO BLOCKCHAIN SELECTOR
  const {
    isVerifying,
    hasLicense,
    authorizedBlockchains,
    productCodes,
    lastVerification,
    error: licenseError,
    verifyLicenses,
  } = useLicenseVerification(user?.email || null);

  // Efeito para obter e definir o email do usuário assim que os dados estiverem disponíveis
  useEffect(() => {
    const getUserEmail = async () => {
      // 1. Tentar obter email do contexto de autenticação
      if (user?.email) {
        setUserEmail(user.email);
        return user.email;
      }

      // 2. Tentar obter da sessão atual
      try {
        const { data: sessionData } = await auth.getSession();
        if (sessionData?.session?.user?.email) {
          setUserEmail(sessionData.session.user.email);
          return sessionData.session.user.email;
        }
      } catch (err) {
        console.error("[MiningResults] Erro ao obter sessão:", err);
      }

      // 3. Fallback: tentar novamente em alguns segundos
      if (!user?.email) {
        console.log(
          "[MiningResults] Email não disponível ainda, tentando novamente...",
        );
        setTimeout(getUserEmail, 2000);
      }
    };

    getUserEmail();
  }, [user?.email]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [minutes, seconds]);

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    const miningEffectTimeout = setTimeout(() => {
      setShowMiningEffect(true);
    }, 1000);

    const completeTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => {
      clearInterval(featureInterval);
      clearTimeout(miningEffectTimeout);
      clearTimeout(completeTimer);
    };
  }, []);

  // Função para verificar licenças - duplicando lógica do LicenseRequired
  const checkLicenseStatus = useCallback(async () => {
    if (!userEmail) {
      console.log("[MiningResults] Email não disponível para verificação");
      return;
    }

    console.log(
      "[MiningResults] 🔄 Iniciando verificação de licenças para:",
      userEmail,
    );

    try {
      await verifyLicenses();
    } catch (error) {
      console.error("[MiningResults] Erro na verificação de licenças:", error);
    }
  }, [userEmail, verifyLicenses]);

  // Função para rolar até a seção de verificação (do LicenseRequired)
  const scrollToVerification = () => {
    setTimeout(() => {
      verificationRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Função para redirecionar para seleção de blockchain quando tiver licença ativa
  const redirectToBlockchainSelection = useCallback(async () => {
    try {
      console.log('[MiningResults] Redirecionando para seleção de blockchain...');
      
      // Primeiro, marcar onboarding como concluído se ainda não foi
      if (!profile?.onboarding_completed) {
        console.log('[MiningResults] Completando onboarding antes do redirecionamento...');
        await completeOnboarding();
      }
      
      // Redirecionar para a tela de blockchain
      navigate('/blockchain', { replace: true });
    } catch (error) {
      console.error('[MiningResults] Erro ao redirecionar:', error);
    }
  }, [navigate, profile?.onboarding_completed, completeOnboarding]);

  const handleResultsComplete = useCallback(
    async (action: "premium" | "skip") => {
      try {
        if (action === "premium") {
          setIsActivating(true);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        console.log("Marcando onboarding como concluído...");
        await completeOnboarding();
        console.log("Onboarding marcado como concluído com sucesso");

        if (setStep) {
          setStep(12); // Move to step 12 after completion
        }

        onComplete(action);
      } catch (error) {
        console.error("Erro ao concluir onboarding:", error);
        onComplete(action);
      }
    },
    [onComplete, completeOnboarding, setStep],
  );

  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current;

      const handleMouseDown = () => {
        button.style.transform = "scale(0.98)";
      };

      const handleMouseUp = () => {
        button.style.transform = "scale(1)";
      };

      button.addEventListener("mousedown", handleMouseDown);
      button.addEventListener("mouseup", handleMouseUp);
      button.addEventListener("mouseleave", handleMouseUp);

      return () => {
        button.removeEventListener("mousedown", handleMouseDown);
        button.removeEventListener("mouseup", handleMouseUp);
        button.removeEventListener("mouseleave", handleMouseUp);
      };
    }
  }, []);

  const profitProjections = [
    { period: "7 dias", min: "R$ 170,00", max: "R$ 820,00" },
    { period: "30 dias", min: "R$ 940,00", max: "R$ 3.200,00" },
    { period: "1 ano", min: "R$ 12.700,00", max: "R$ 49.800,00" },
  ];

  const features = [
    {
      icon: RefreshCw,
      text: "Mineração contínua 24h na blockchain já ativada",
      color: "#4ECDC4",
    },
    {
      icon: Brain,
      text: "IA configurada com base no SEU estilo de decisão",
      color: "#6C63FF",
    },
    {
      icon: Zap,
      text: "Algoritmo Ghost Chain™ minerando com inteligência",
      color: "#FF6B6B",
    },
    {
      icon: Wallet,
      text: "Rastreamento de novas carteiras com saldo",
      color: "#FFD166",
    },
    {
      icon: MonitorSmartphone,
      text: "Painel com acesso restrito e alertas de saldo real",
      color: "#06D6A0",
    },
    {
      icon: ShieldCheck,
      text: "Criptografia Ghost Chain™ com proteção anônima",
      color: "#118AB2",
    },
  ];

  const pulseVariants = {
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0px 0px 0px rgba(108, 99, 255, 0.5)",
        "0px 0px 20px rgba(108, 99, 255, 0.8)",
        "0px 0px 0px rgba(108, 99, 255, 0.5)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  };

  useEffect(() => {
    if (setStep && !fromSystemUnlocked) {
      // Only set step 11 if not already in that step
      console.log("Definindo etapa para 11 a partir do MiningResults");
      setStep(11); // Use step 11 for Sistema Desbloqueado
    }
  }, [setStep, fromSystemUnlocked]);

  if (isActivating) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto px-3 py-4 flex flex-col items-center justify-center min-h-[80vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Lock className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h2
          className="text-xl font-bold text-white mb-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🔓 Ambiente Premium Ghost Wallet
        </motion.h2>

        <motion.p
          className="text-neutral-300 text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Preparando seu ambiente exclusivo de mineração...
        </motion.p>

        <motion.div
          className="w-full max-w-xs h-2 bg-background-light rounded-full overflow-hidden mb-8"
          initial={{ width: "0%" }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="text-sm text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <Sparkles className="inline-block w-4 h-4 mr-2 text-primary" />
          <span>Ativando Ghost Chain™ Protocol</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto px-3 py-2 relative min-h-[80vh] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex gap-3 items-center mt-[30px] mb-[30px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-success/20 rounded-full w-11 h-11 flex items-center justify-center">
          <CheckCircle className="text-success w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Sistema Desbloqueado</h2>
          <p className="text-sm text-neutral-400">
            Carteira encontrada. Blockchain identificada.
          </p>
        </div>
      </motion.div>
      <div className="space-y-4">
        <motion.div
          className="ghost-card bg-background-light/20 border border-primary/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex gap-3 items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">
                Ghost Wallet{" "}
                <span className="text-primary">
                  #{walletFound.substring(0, 8)}
                </span>
              </p>
              <p className="text-xs text-neutral-400">
                Conectado ao seu perfil exclusivo
              </p>
            </div>
          </div>
          <div className="mt-1 mb-2">
            <p className="text-sm text-neutral-300">
              Você foi conectado a um ambiente exclusivo de mineração, criado
              sob medida com base nas suas respostas, decisões e perfil
              comportamental.
            </p>
          </div>

          {showMiningEffect && (
            <div className="relative h-10 w-full mb-2 overflow-hidden bg-background/50 rounded-lg">
              <motion.div
                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
              />
              <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-4 h-4 text-primary" />
                  </motion.div>
                  <p className="text-xs font-mono font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Ambiente gerando resultados em tempo real
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center text-xs text-yellow-300 gap-1.5 bg-yellow-900/20 p-2 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span>
              Este ambiente foi gerado exclusivamente para você. Se sair agora,
              ele será permanentemente deletado.
            </span>
          </div>
        </motion.div>

        <motion.div
          className="ghost-card bg-background-light/20 border border-primary/20 rounded-xl p-4"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="text-primary w-5 h-5" />
            <h3 className="text-white font-medium">Liberação Completa</h3>
          </div>

          <p className="text-sm text-neutral-300 mb-3">
            Desbloqueie agora o sistema Ghost Chain™ completo e mantenha acesso
            contínuo à blockchain onde sua carteira foi detectada.
          </p>

          <div className="bg-gradient-to-r from-background/90 to-background/60 rounded-lg p-4 border border-blue-500/30 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />

            <div className="flex justify-between items-center mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Clock8 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white font-medium">
                  Oportunidade Limitada
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <motion.div
                  className="bg-blue-900/60 border border-blue-500/40 text-white font-mono text-sm px-2 py-1 rounded"
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(59, 130, 246, 0)",
                      "0 0 8px rgba(59, 130, 246, 0.5)",
                      "0 0 0px rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {String(minutes).padStart(2, "0")}
                </motion.div>
                <span className="text-blue-400 font-bold">:</span>
                <motion.div
                  className="bg-blue-900/60 border border-blue-500/40 text-white font-mono text-sm px-2 py-1 rounded"
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(59, 130, 246, 0)",
                      "0 0 8px rgba(59, 130, 246, 0.5)",
                      "0 0 0px rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {String(seconds).padStart(2, "0")}
                </motion.div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="h-1.5 bg-background-light/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-white-600"
                  style={{
                    width: `${((9 * 60 + 42 - (minutes * 60 + seconds)) / (9 * 60 + 42)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-300/80 mt-2 text-center">
                Acesso exclusivo apenas durante esta sessão
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="ghost-card bg-background-light/20 border border-green-500/30 rounded-xl p-4 overflow-hidden relative"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <TrendingUp className="text-green-400 w-5 h-5" />
            <h3 className="text-white font-medium">Potencial de Ganhos</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
            <div className="bg-background/40 p-3 rounded-lg border border-green-500/20 flex flex-col items-center">
              <p className="text-xs text-neutral-300 mb-2">Por dia</p>
              <motion.p
                className="text-green-400 font-mono text-sm font-bold"
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.95, 1, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                US$ 12,55
              </motion.p>
              <p className="text-[10px] text-green-300/70 mt-1">~R$ 64,22</p>
            </div>

            <div className="bg-background/40 p-3 rounded-lg border border-green-500/20 flex flex-col items-center pl-[10px] pr-[10px]">
              <p className="text-xs text-neutral-300 mb-2">Em 7 dias</p>
              <motion.p
                className="text-green-400 font-mono text-sm font-bold"
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.95, 1, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                US$ 87,85
              </motion.p>
              <p className="text-[10px] text-green-300/70 mt-1">~R$ 449,57</p>
            </div>

            <div className="bg-background/40 p-3 rounded-lg border border-green-500/20 flex flex-col items-center">
              <p className="text-xs text-neutral-300 mb-2">Em 30 dias</p>
              <motion.p
                className="text-green-400 font-mono text-sm font-bold"
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.95, 1, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              >
                US$ 376,50
              </motion.p>
              <p className="text-[10px] text-green-300/70 mt-1">~R$ 1.926,79</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-300 px-2 relative z-10">
            <div className="flex items-center gap-1">
              <Sparkles className="text-yellow-400 w-3 h-3" />
              <span>Projeção com 97% de precisão</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart4 className="text-blue-400 w-3 h-3" />
              <span>Mercado atual</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="ghost-card bg-background-light/20 border border-blue-500/20 rounded-xl p-4"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-blue-400 w-5 h-5" />
            <h3 className="text-white font-medium">O Que Você Desbloqueia:</h3>
          </div>

          <div className="space-y-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg ${activeFeature === index ? "bg-background/80" : ""}`}
                animate={
                  activeFeature === index
                    ? {
                        backgroundColor: "rgba(20, 20, 20, 0.8)",
                        borderColor: `rgba(${parseInt(feature.color.slice(1, 3), 16)}, ${parseInt(feature.color.slice(3, 5), 16)}, ${parseInt(feature.color.slice(5, 7), 16)}, 0.3)`,
                        x: [0, 2, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.3,
                  x: { duration: 0.2, repeat: 2 },
                }}
                style={{
                  border:
                    activeFeature === index
                      ? `1px solid ${feature.color}30`
                      : "1px solid transparent",
                }}
              >
                <feature.icon
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: feature.color }}
                />
                <span className="text-sm text-white">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="ghost-card bg-background-light/20 border border-yellow-500/20 rounded-xl p-4"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="text-yellow-400 w-5 h-5" />
            <h3 className="text-white font-medium">Ative agora e receba:</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-yellow-500/20">
              <Radar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">
                Acesso imediato ao Ghost Chain Pro™
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-purple-500/20">
              <Diamond className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">
                Membro VIP Ghost Chain™ com monitoramento prioritário
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="ghost-card bg-background-light/20 border border-primary/20 rounded-xl p-4 relative overflow-hidden"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <div className="relative z-10">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">
                Este é o momento.
              </h2>
              <p className="text-neutral-300 text-[16px] mt-[8px] mb-[8px]">
                Você testemunhou em tempo real o que apenas 0.3% conseguem
                acessar:{" "}
                <span className="text-primary font-medium">
                  a inteligência viva da Ghost Wallet™
                </span>
                .
                <br />
                Agora, ou você entra... ou perde o acesso.
              </p>
            </div>

            <div className="flex justify-center mb-2">
              <motion.button
                ref={buttonRef}
                className="py-2.5 px-5 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg relative overflow-hidden mx-auto mt-[10px] mb-[10px]"
                variants={pulseVariants}
                animate="pulse"
                onClick={() => {
                  console.log(
                    "[GhostWallet][MiningResults] Abrindo modal de seleção de planos",
                  );
                  setShowPlanSelection(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 w-20 h-full bg-white/20 blur-md"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    repeatDelay: 1,
                  }}
                />
                <Rocket className="w-3.5 h-3.5" />
                <span className="z-10">Ativar Ghost Premium</span>
                <ArrowRight className="w-3 h-3 z-10" />
              </motion.button>
            </div>

            <div className="bg-background/60 rounded-lg p-3 border border-primary/20 mt-[28px] mb-[28px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium text-sm">
                  Sua Janela de Acesso Ghost™
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-neutral-300">
                    Mineração Ghost Chain™
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-neutral-300">
                    Saques para sua carteira
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-neutral-300">
                    Potencial de ganhos 5x
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-neutral-300">
                    Suporte técnico exclusivo
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
      <motion.p
        className="text-[10px] text-center text-neutral-500 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Ghost Chain™ Technology © 2023
      </motion.p>
      {/* Seção de Verificação de Licenças - Integração do componente LicenseRequired */}
      <div
        ref={verificationRef}
        id="license-verification"
        className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-neutral-700/30"
      >
        <div className="bg-[#6C63FF]/10 rounded-xl p-6 w-full max-w-xl border border-[#6C63FF]/30 shadow-lg relative">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full border border-[#6C63FF]/30 bg-[#ffffff]">
            <span className="text-sm text-[#6C63FF] font-medium">
              Verificação de Licença
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-[#6C63FF] animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                Verificar Licença Ativa
              </h3>
              <p className="text-neutral-300 text-sm">
                Confirme se você possui uma licença válida para acessar as
                funcionalidades
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email da conta:
            </label>
            <div className="p-3 bg-background rounded-lg border border-neutral-700 font-mono text-white break-all border border-primary/10">
              {userEmail || "Carregando dados do usuário..."}
            </div>
          </div>

          <button
            onClick={checkLicenseStatus}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            disabled={isVerifying || !userEmail}
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando licença...</span>
              </>
            ) : !userEmail ? (
              <>
                <Loader className="w-5 h-5" />
                <span>Aguardando dados...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Verificar Licença Agora</span>
              </>
            )}
          </button>

          {licenseError && licenseError !== "no_license" && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">
                Erro ao verificar licença: {licenseError}
              </span>
            </div>
          )}

          {lastVerification && (
            <div className="mt-4 p-3 bg-background/50 rounded-lg border border-neutral-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">
                  Status da Licença:
                </span>
                <span
                  className={`text-sm font-bold ${hasLicense ? "text-green-400" : "text-red-400"}`}
                >
                  {hasLicense ? "✅ ATIVA" : "❌ INATIVA"}
                </span>
              </div>

              {hasLicense && authorizedBlockchains.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-neutral-400 block mb-2">
                    Blockchains Liberadas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {authorizedBlockchains.map((blockchain, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300 font-medium"
                      >
                        {blockchain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {productCodes.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-neutral-400 block mb-2">
                    Códigos de Produto:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {productCodes.map((code, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300 font-mono"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-neutral-500">
                Última verificação:{" "}
                {new Date(lastVerification).toLocaleString("pt-BR")}
              </div>

              {/* Botão de redirecionamento quando licença estiver ativa */}
              {hasLicense && (
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <button
                    onClick={redirectToBlockchainSelection}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Acessar Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-green-300/70 text-center mt-2">
                    Sua licença está ativa! Clique para continuar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <PlanSelectionPopup
        isOpen={showPlanSelection}
        onClose={() => setShowPlanSelection(false)}
      />
    </motion.div>
  );
};

const generateUTMUrl = (baseUrl: string): string => {
  // Replace with your actual UTM parameter generation logic
  return baseUrl + "?utm_source=ghostwallet&utm_medium=onboarding";
};

export default MiningResults;
