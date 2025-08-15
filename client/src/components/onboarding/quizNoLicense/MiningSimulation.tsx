import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import {
  Wallet,
  Cpu,
  Zap,
  Server,
  Shield,
  Search,
  AlarmClock,
  CheckCircle,
  Lock,
  Key,
  WalletCards,
  Network,
  BarChart4,
  Activity,
  AlertCircle,
  BellRing,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import "../../../index.css";
import "./onboardingResponsive.css";
import { useOnboardingFlow } from "../../../context/OnboardingContext";
import MiningIntroduction from "./MiningIntroduction";
import MiningPrepPopup from "../../MiningPrepPopup";

interface MiningSimulationProps {
  onComplete: (result: { walletFound: string; computePower: number }) => void;
}

const MiningSimulation: React.FC<MiningSimulationProps> = ({ onComplete }) => {
  const { quizData } = useOnboardingFlow();
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [walletFound, setWalletFound] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [miningTime, setMiningTime] = useState(0);
  const [computePower, setComputePower] = useState(0);
  const [processedWallets, setProcessedWallets] = useState(0);
  const [notifications, setNotifications] = useState<
    { id: number; message: string; type: string; seen: boolean }[]
  >([]);
  const [hashRate, setHashRate] = useState(0);
  const [miningBars, setMiningBars] = useState<number[]>(Array(100).fill(0));
  const [securityLevel, setSecurityLevel] = useState(65);
  const [networkStrength, setNetworkStrength] = useState(0);
  const [gpuUtilization, setGpuUtilization] = useState(70);
  const [cpuTemperature, setCpuTemperature] = useState(45);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [dataPoints, setDataPoints] = useState<number[]>(Array(50).fill(0));
  const [hashRateHistory, setHashRateHistory] = useState<number[]>(
    Array(50).fill(0),
  );
  const [miningStarted, setMiningStarted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [miningComplete, setMiningComplete] = useState(false);
  const [miningStartTime, setMiningStartTime] = useState(0);
  const [dataProcessed, setDataProcessed] = useState(0);
  const [totalSimulationTime] = useState(
    () => Math.floor(Math.random() * 26) + 50,
  ); // 50-75 seconds
  const [walletFoundTime, setWalletFoundTime] = useState<Date | null>(null);
  const [walletFoundDetails, setWalletFoundDetails] = useState({
    blockchain: "Solana",
    value: "███,███",
  });
  const [showEnhancementMessage, setShowEnhancementMessage] = useState(false);
  const [showBlockMessage, setShowBlockMessage] = useState(false);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walletTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Solana value states
  const [solanaAmount] = useState(() => Math.random() * (29 - 7) + 7); // Random between 7-29 SOL
  const [solanaPrice, setSolanaPrice] = useState<number>(0);
  const [usdValue, setUsdValue] = useState<number>(0);

  // Simulation timing effect
  useEffect(() => {
    if (!miningStarted) return;

    // Enhancement message (15-20s)
    const enhancementDelay = Math.floor(Math.random() * 5000) + 15000;
    const enhancementTimer = setTimeout(() => {
      setShowEnhancementMessage(true);
      addNotification({
        message: "Aprimorando algoritmos de mineração...",
        seen: false,
      });
      setTimeout(() => setShowEnhancementMessage(false), 5000);
    }, enhancementDelay);

    // Block message (30-40s)
    const blockDelay = Math.floor(Math.random() * 10000) + 30000;
    const blockTimer = setTimeout(() => {
      setShowBlockMessage(true);
      addNotification({
        message: "Novo bloco detectado! Iniciando exploração...",
        seen: false,
      });
      setTimeout(() => setShowBlockMessage(false), 5000);
    }, blockDelay);

    // Wallet found (45-60s)
    const walletDelay = Math.floor(Math.random() * 15000) + 45000;
    const walletTimer = setTimeout(() => {
      setWalletFound(true);
      setWalletFoundTime(new Date());
      setWalletAddress(generateWalletAddress()); // Generate wallet address when found
      addNotification({
        message: "WALLET ENCONTRADA! Validando credenciais...",
        seen: false,
      });

      // Wallet found - no automatic completion, user must click button
    }, walletDelay);

    // No automatic completion - user controls progression via button

    // Cleanup
    return () => {
      clearTimeout(enhancementTimer);
      clearTimeout(blockTimer);
      clearTimeout(walletTimer);
    };
  }, [miningStarted]);
  const [showPrepPopup, setShowPrepPopup] = useState(true); // State to control the popup display
  const [allowMiningStart, setAllowMiningStart] = useState(false); // State to only allow mining after popup completes

  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walletFinderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const miningTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Mensagens de notificação mais empolgantes e cativantes
  const notificationMessages = [
    {
      message: "Rede Ghost Chain™ detectada! Iniciando conexão segura...",
    },
    {
      message: "Carteiras inativas identificadas na blockchain Solana",
    },
    {
      message: "Processando blocos órfãos em busca de transações abandonadas",
    },
    {
      message: "Nós de mineração avançada conectados com sucesso",
    },
    {
      message: "Detectando padrões de wallets com baixa segurança",
    },
    {
      message: "Cluster de mineração Ghost operando a 92% da capacidade",
    },
    {
      message: "Tokens não reclamados encontrados em blocos antigos",
    },
    {
      message: "Possíveis wallets encontradas! Verificando consistência...",
    },
    {
      message: "Aplicando algoritmos de detecção proprietários Ghost",
    },
    {
      message: "Padrão único de atividade identificado em blockchain",
    },
    {
      message: "Aumentando potência de processamento para finalização",
    },
    {
      message: "Wallet com potencial identificada! Analisando...",
    },
  ];

  const generateWalletAddress = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let address = "";
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  };

  const maskWalletAddress = (address: string) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-6);
  };

  // Fetch Solana price function
  const fetchSolanaPrice = async (): Promise<number> => {
    const endpoints = [
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
      "https://api.kraken.com/0/public/Ticker?pair=SOLUSD",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        let price = endpoint.includes("coingecko")
          ? data.solana.usd
          : endpoint.includes("binance")
            ? parseFloat(data.price)
            : parseFloat(data.result.SOLUSD.c[0]);

        if (price && price > 0) {
          return price;
        }
      } catch (err) {
        console.warn(`Failed to fetch price from ${endpoint}:`, err);
        continue;
      }
    }

    // Fallback price if all APIs fail
    return 20;
  };

  // Effect to fetch Solana price and calculate USD value
  useEffect(() => {
    const updateSolanaValue = async () => {
      try {
        const price = await fetchSolanaPrice();
        setSolanaPrice(price);
        setUsdValue(solanaAmount * price);
      } catch (error) {
        console.error("Error fetching Solana price:", error);
        // Set fallback values
        setSolanaPrice(20);
        setUsdValue(solanaAmount * 20);
      }
    };

    updateSolanaValue();

    // Update price every 30 seconds
    const interval = setInterval(updateSolanaValue, 30000);
    return () => clearInterval(interval);
  }, [solanaAmount]);

  const startMining = () => {
    // Only start mining if allowed (after popup completion) or popup is not shown
    if (!showPrepPopup || allowMiningStart) {
      console.log("[MiningSimulation] Iniciando mineração");
      setMiningStarted(true);
      setIsStarted(true);
      setProgressPercentage(0);
      setMiningComplete(false);
      setShowComplete(false);
      setWalletFound(false);
      setIsComplete(false);

      // Schedule enhancement message (15-20s)
      const enhancementDelay = Math.floor(Math.random() * 6000) + 15000;
      messageTimerRef.current = setTimeout(() => {
        setShowEnhancementMessage(true);
        addNotification({
          message:
            "Estamos aprimorando os recursos de mineração para melhorar seu desempenho...",
          seen: false,
        });
        setTimeout(() => setShowEnhancementMessage(false), 5000);
      }, enhancementDelay);

      // Schedule block message (30-40s)
      const blockDelay = Math.floor(Math.random() * 10000) + 30000;
      setTimeout(() => {
        setShowBlockMessage(true);
        addNotification({
          message: "Um novo bloco foi detectado. Iniciando exploração...",
          seen: false,
        });
        setTimeout(() => setShowBlockMessage(false), 5000);
      }, blockDelay);

      // Schedule wallet discovery (45-60s)
      const walletDelay = Math.floor(Math.random() * 15000) + 45000;
      walletTimerRef.current = setTimeout(() => {
        setWalletFound(true);
        setWalletFoundTime(new Date());
        setWalletAddress(generateWalletAddress());
        addNotification({
          message: "WALLET ENCONTRADA! Validando credenciais de acesso...",
          seen: false,
        });
      }, walletDelay);

      // No automatic completion - user controls via button

      // Timer para rastrear o tempo de mineração
      miningTimeRef.current = setInterval(() => {
        setMiningTime((prev) => prev + 1);
      }, 1000);
    } else {
      return; // Não continuar se não estiver permitido
    }

    // Determinar o tempo total da mineração (45-80 segundos)
    const totalMiningTime = Math.floor(Math.random() * 36) + 45;

    // Determinar o ponto de descoberta da carteira (entre 65-80% do progresso)
    const walletDiscoveryPercentage = 65 + Math.floor(Math.random() * 16);
    const walletDiscoveryTime = Math.floor(
      (totalMiningTime * walletDiscoveryPercentage) / 100,
    );

    // Configurar o timer para encontrar a carteira no ponto determinado
    walletFinderTimerRef.current = setTimeout(() => {
      setWalletFound(true);
      setWalletAddress(generateWalletAddress());

      addNotification({
        message: "WALLET ENCONTRADA! Validando credenciais de acesso...",
        seen: false,
      });
    }, walletDiscoveryTime * 1000);

    // No automatic completion timer - user controls progression

    // Configurar os timers de notificação
    scheduleNotifications(totalMiningTime);
  };

  // Flag para controlar a exibição de notificações
  const isNotificationQueueEmpty = useRef(true);
  const pendingNotifications = useRef<
    Array<{ message: string; type: string; seen: boolean }>
  >([]);

  const scheduleNotifications = (totalTime: number) => {
    // Reduzir número de notificações para uma experiência mais limpa
    const notificationCount = Math.max(4, Math.floor(Math.random() * 2) + 3);
    const notificationTimes: number[] = [];

    // Primeira notificação após 4-7 segundos para não aparecer imediatamente
    notificationTimes.push(Math.floor(Math.random() * 3) + 4);

    // Distribuir as notificações com mais espaçamento ao longo do tempo
    const timeSegments = totalTime / (notificationCount + 0.5);

    for (let i = 1; i < notificationCount; i++) {
      // Adicionar mais espaçamento entre notificações
      const variableTiming = timeSegments * i + Math.random() * 5;
      notificationTimes.push(Math.floor(variableTiming));
    }

    // Momentos críticos quando garantir notificações
    const criticalTimes = [
      Math.floor(totalTime * 0.3), // Início da mineração
      Math.floor(totalTime * 0.75), // Próximo de encontrar a carteira
    ];

    // Combinar tempos críticos com tempos calculados e ordenar
    const allTimes = [...notificationTimes, ...criticalTimes].sort(
      (a, b) => a - b,
    );

    // Remover duplicatas ou tempos muito próximos (menos de 15 segundos para mais espaçamento)
    const uniqueTimes = allTimes.filter(
      (time, index, array) => index === 0 || time - array[index - 1] >= 15,
    );

    // Marcar todas as notificações agendadas
    uniqueTimes.forEach((timeInSeconds, index) => {
      setTimeout(() => {
        // Evitar notificações repetidas
        let availableMessages = [...notificationMessages];
        if (notifications.length > 0) {
          const usedMessages = notifications.map((n) => n.message);
          availableMessages = availableMessages.filter(
            (m) => !usedMessages.includes(m.message),
          );
        }

        // Escolher notificação apropriada para o momento
        let messageToUse;

        // Usar notificações específicas para pontos críticos
        if (Math.abs(timeInSeconds - Math.floor(totalTime * 0.3)) < 5) {
          // Momento inicial - usar notificação de inicialização
          messageToUse =
            notificationMessages.find(
              (m) =>
                m.message.includes("conexão") ||
                m.message.includes("iniciando"),
            ) || availableMessages[0];
        } else if (Math.abs(timeInSeconds - Math.floor(totalTime * 0.75)) < 5) {
          // Próximo à descoberta - usar notificação de progresso
          messageToUse =
            notificationMessages.find(
              (m) =>
                m.message.includes("Possíveis wallets") ||
                m.message.includes("potencial"),
            ) || availableMessages[0];
        } else {
          // Outras notificações aleatórias
          messageToUse =
            availableMessages.length > 0
              ? availableMessages[
                  Math.floor(Math.random() * availableMessages.length)
                ]
              : notificationMessages[
                  Math.floor(Math.random() * notificationMessages.length)
                ];
        }

        // Adicionar a notificação ou à fila se já houver uma exibida
        const notification = {
          message: messageToUse.message,
          seen: false,
        };

        if (isNotificationQueueEmpty.current) {
          addNotification(notification);
        } else {
          pendingNotifications.current.push(notification);
        }
      }, timeInSeconds * 1000);
    });
  };

  const addNotification = (notification: {
    message: string;
    seen: boolean;
  }) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
    };

    // Marcar que uma notificação está sendo exibida
    isNotificationQueueEmpty.current = false;

    // Mostrar apenas uma notificação por vez
    setNotifications([newNotification]);

    // Marcar como vista após 3 segundos
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === newNotification.id ? { ...n, seen: true } : n,
        ),
      );
    }, 3000);

    // Remover a notificação e processar a próxima (se houver) após 7 segundos
    setTimeout(() => {
      setNotifications([]);

      // Aguardar 3 segundos antes de mostrar a próxima notificação (total 10s de intervalo)
      setTimeout(() => {
        if (pendingNotifications.current.length > 0) {
          // Pegar a próxima notificação da fila
          const nextNotification = pendingNotifications.current.shift();
          if (nextNotification) {
            addNotification(nextNotification);
          } else {
            isNotificationQueueEmpty.current = true;
          }
        } else {
          isNotificationQueueEmpty.current = true;
        }
      }, 3000);
    }, 7000);
  };

  const stopAllProcesses = () => {
    // Limpar todos os timers em execução
    if (miningTimeRef.current) clearInterval(miningTimeRef.current);
    if (notificationTimerRef.current)
      clearTimeout(notificationTimerRef.current);
    if (walletFinderTimerRef.current)
      clearTimeout(walletFinderTimerRef.current);
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);

    // Interromper todas as animações e cálculos
    setIsStarted(false);
    setMiningStarted(false);

    // Manter os resultados finais visíveis
    setMiningComplete(true);
    setProgressPercentage(100); // Garantir que a barra esteja em 100%
    setShowComplete(true);
  };

  // Handle mining completion and show modal
  const handleComplete = () => {
    stopAllProcesses();

    // Random delay between 8-20 seconds before showing modal
    console.log("Modal will appear in", delay / 1000, "seconds");

    setTimeout(() => {
      setShowCompletionModal(true);
      console.log("Modal visible");
    }, delay);
  };

  // Proceed to next step
  const handleContinue = () => {
    onComplete({
      walletFound: walletAddress,
      computePower: computePower,
    });
  };

  // Completion Modal Component
  const CompletionModal = () => (
    <AnimatePresence mode="wait">
      <div
        key="completion-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(0,0,0,0.92)",
        }}
      >
        <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0d0a14]/90 to-[#0d0a14]/95 backdrop-blur-xl rounded-2xl p-8 border border-[#7B68EE]/20 overflow-hidden">
          {/* Ghost Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7B68EE]/10 via-[#9370DB]/5 to-transparent rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#7B68EE]/10 via-transparent to-[#9370DB]/5 rounded-2xl" />
            {/* Ghost floating particles - Reduzidas */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-[#7B68EE]/20 rounded-full"
                  style={{
                    left: `${25 + i * 25}%`,
                    top: `${30 + i * 20}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10">
            {/* Ghost Icon header */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#7B68EE]/30 to-[#9370DB]/20 rounded-2xl flex items-center justify-center relative">
                <Sparkles className="w-10 h-10 text-[#7B68EE]" />
                <div className="absolute -right-2 -top-2">
                  <Zap className="w-6 h-6 text-[#9370DB]" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-tight">
              Ghost Chain™ Mineração
            </h2>

            {/* Content */}
            <div className="space-y-5 text-center mb-8">
              <div className="space-y-4">
                <p className="text-primary font-medium text-lg">
                  💥 Você ultrapassou 97% dos usuários
                </p>
                <p className="text-neutral-200 text-[15px]">
                  A tecnologia{" "}
                  <span className="text-primary font-medium">
                    Ghost Chain™
                  </span>{" "}
                  montou uma configuração sob medida para seu perfil. O
                  resultado? Uma performance extrema — o tipo de descoberta que{" "}
                  <span className="text-primary font-semibold">
                    só 0.3% dos usuários
                  </span>{" "}
                  conseguem alcançar.
                </p>
                <p className="text-neutral-300 text-[15px]">
                  Você está agora a um passo do acesso restrito onde os{" "}
                  <span className="text-primary font-medium">
                    mineradores da ghost wallet
                  </span>{" "}
                  evoluem. Prepare-se para desbloquear o próximo nível.
                </p>
              </div>
            </div>

            {/* Ghost CTA Button */}
            <button
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#7B68EE] to-[#9370DB] hover:from-[#7B68EE]/90 hover:to-[#9370DB]/90 text-white rounded-xl font-medium relative overflow-hidden group shadow-lg shadow-[#7B68EE]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10 font-semibold tracking-wide">
                Desbloquear Próximo Nível
              </span>
            </button>

            {/* Rarity indicator */}
            <p className="text-center text-neutral-400 text-xs mt-4">
              Apenas 0.3% dos usuários chegam a este nível
            </p>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );

  const handleStartMining = () => {
    setShowIntroduction(false);
    // A tela de simulação de mineração será mostrada com o popup de preparação
    // A mineração real só começa após a conclusão do popup
  };

  // Manipulador para quando o popup de preparação concluir
  const handlePrepComplete = () => {
    // Resetar estados importantes primeiro
    setProgressPercentage(0);
    setMiningComplete(false);
    setShowComplete(false);
    setWalletFound(false);
    setIsComplete(false);

    // Configurar para permitir início da mineração
    setShowPrepPopup(false);
    setAllowMiningStart(true);

    // Iniciar a simulação de mineração após um pequeno atraso para efeito visual
    setTimeout(() => {
      setMiningStarted(true);
      setIsStarted(true);

      // Inicializar as barras de mineração
      setMiningBars((prev) => {
        return Array(100)
          .fill(0)
          .map(() => Math.random() * 0.5);
      });

      // Chamar startMining explicitamente
      startMining();
    }, 300);
  };

  useEffect(() => {
    // Iniciar a mineração automaticamente quando o componente for montado
    if (allowMiningStart || !showPrepPopup) {
      setTimeout(() => {
        startMining();
      }, 500);
    }

    return () => {
      // Limpar todos os timers quando o componente for desmontado
      stopAllProcesses();
    };
  }, []);

  const updateSimulationValues = useCallback(() => {
    if (!miningStarted) return;

    // Cálculo otimizado de valores
    const calculateNewProgress = (prev: number) => {
      if (isComplete) return 100;
      const remainingProgress = 100 - prev;
      const increment =
        remainingProgress > 50 ? 0.7 : remainingProgress > 20 ? 1.2 : 0.3;
      const newProgress = prev + Math.random() * increment;
      return Math.min(newProgress, 100);
    };

    // Atualização em batch
    setProgressPercentage((prev) => {
      const newProgress = calculateNewProgress(prev);
      if (newProgress >= 100 && !isComplete) {
        setIsComplete(true);
        setMiningComplete(true);
        stopAllProcesses();
      }
      return newProgress;
    });

    // Cálculo dinâmico da taxa de hash
    const now = Date.now();
    const baseMin = 29;
    const baseMax = 63;
    const frequency = 0.0002; // Reduzido para mudanças mais suaves
    const amplitude = (baseMax - baseMin) / 2;
    const offset = (baseMax + baseMin) / 2;

    const wave1 = Math.sin(now * frequency);
    const wave2 = Math.sin(now * frequency * 1.1); // Reduzida a diferença de frequência
    const wave3 = Math.sin(now * frequency * 0.9); // Reduzida a diferença de frequência

    const combinedWave = (wave1 + wave2 + wave3) / 3;
    const newHashRate =
      offset + amplitude * combinedWave + (Math.random() * 2 - 1); // Reduzida a variação aleatória

    // Suavizar a transição da taxa de hash
    setHashRate((prev) => prev * 0.95 + newHashRate * 0.05);

    // Atualização ultra-rápida do contador de carteiras (9x mais rápido)
    setProcessedWallets((prev) => {
      const increment = Math.floor(Math.random() * 45) + 27; // Incremento multiplicado por 3
      return prev + increment;
    });

    // Outras métricas secundárias
    setComputePower((prev) => Math.min(prev + 0.5, 100));
    setSecurityLevel((prev) =>
      Math.max(50, Math.min(98, prev + (Math.random() * 2 - 1))),
    );
    setNetworkStrength((prev) => Math.min(prev + 0.5, 100));
    setGpuUtilization((prev) =>
      Math.max(60, Math.min(95, prev + (Math.random() * 4 - 2))),
    );
    setCpuTemperature((prev) =>
      Math.max(45, Math.min(75, prev + (Math.random() * 1.5 - 0.5))),
    );

    // Updates visuais otimizados
    const dataUpdate = () => {
      setDataPoints((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push(75 + Math.random() * 25); // Range reduzido
        return newData;
      });

      setHashRateHistory((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push(baseMin + Math.random() * (baseMax - baseMin));
        return newData;
      });
    };

    // Reduz frequência de updates visuais
    if (Date.now() % 300 === 0) dataUpdate();
  }, [miningStarted, isComplete, stopAllProcesses]);

  useEffect(() => {
    if (!miningStarted) return;

    const interval = setInterval(updateSimulationValues, 500);
    return () => clearInterval(interval);
  }, [miningStarted, updateSimulationValues]);

  // Variantes removidas para eliminar tremulação

  // Memoizar componentes estáticos
  const MemoizedMiningPrepPopup = React.memo(MiningPrepPopup);

  // Se estiver na tela de introdução, mostrar o componente MiningIntroduction
  if (showIntroduction) {
    return <MiningIntroduction onStartMining={handleStartMining} />;
  }

  // Caso contrário, mostrar a tela de simulação de mineração
  return (
    <>
      {" "}
      {/* Added to wrap the content */}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
          </div>
        }
      >
        <MemoizedMiningPrepPopup
          isOpen={showPrepPopup}
          onClose={() => {}}
          onComplete={handlePrepComplete}
        />
      </Suspense>
      {/* Só exibir o conteúdo principal quando o popup não estiver aberto */}
      {!showPrepPopup && (
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6 relative">
          {/* Ghost Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a14]/20 to-[#0d0a14]/40 rounded-3xl" />
          <div className="absolute inset-0">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#7B68EE]/30 rounded-full"
                style={{
                  left: `${30 + i * 40}%`,
                  top: `${25 + i * 20}%`,
                }}
              />
            ))}
          </div>
          {/* Ghost Cabeçalho da área de mineração */}
          <div className="mb-6 flex items-center justify-center relative z-10">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7B68EE]/20 to-[#9370DB]/10 flex items-center justify-center rounded-xl border border-[#7B68EE]/30 shadow-lg shadow-[#7B68EE]/10">
                <Zap className="w-8 h-8 text-[#7B68EE]" />
              </div>

              <div className="absolute -right-1 -top-1">
                <Sparkles className="w-4 h-4 text-[#9370DB]/70" />
              </div>
            </div>
          </div>

          {/* Ghost Título da simulação */}
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#7B68EE] to-[#9370DB] bg-clip-text text-transparent text-center mb-1 relative z-10">
            Mineração Ghost Chain™
          </h1>

          <p className="text-neutral-300 text-sm text-center mb-6 relative z-10">
            Ambiente de mineração criado com base no seu perfil
          </p>

          {isStarted && (
            <div className="w-full bg-gradient-to-br from-[#0d0a14]/60 to-[#0d0a14]/40 rounded-xl border border-[#7B68EE]/20 p-3 sm:p-4 mb-4 overflow-hidden backdrop-blur-sm relative z-10">
              {/* Ghost glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B68EE]/5 via-transparent to-[#9370DB]/5 rounded-xl" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#7B68EE]" />
                  <span className="text-white text-sm font-medium">
                    Performance de Mineração
                  </span>
                </div>
                <div>
                  <Server className="w-4 h-4 text-[#9370DB]" />
                </div>
              </div>

              <div className="w-full relative overflow-hidden">
                {/* Área de visualização do gráfico sem linhas de grade */}

                {/* Mining Grid estática */}
                {isStarted && (
                  <div className="absolute inset-0 z-10 mining-grid bg-transparent p-0 m-0 border-0 shadow-none">
                    {Array(60)
                      .fill(0)
                      .map((_, index) => {
                        const height = 30 + Math.random() * 60;
                        const isActive = Math.random() > 0.6;
                        return (
                          <div
                            key={`bar-${index}`}
                            className={`mining-bar ${isActive ? "active" : ""}`}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        );
                      })}
                  </div>
                )}

                {/* Área do gráfico sem visualização SVG */}

                {/* Pontos estáticos */}
                {isStarted && (
                  <>
                    <div
                      className="absolute h-1 w-1 rounded-full bg-[#7B68EE]/40"
                      style={{ left: "25%", top: "30%" }}
                    />
                    <div
                      className="absolute h-1 w-1 rounded-full bg-[#9370DB]/40"
                      style={{ left: "75%", top: "60%" }}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-neutral-300">
                      Taxa de Hash
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {Math.round(hashRate)}{" "}
                    <span className="text-xs text-neutral-500">Th/s</span>
                  </span>
                </div>

                <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Wallet className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-neutral-300">Carteiras</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {processedWallets.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-xs text-neutral-300">Sucesso</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {walletFound ? "1" : "0"}
                  </span>
                </div>

                <div className="flex flex-col bg-background-light/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Network className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-neutral-300">Blockchain</span>
                  </div>
                  <span className="text-sm font-medium text-white">Solana</span>
                </div>
              </div>
            </div>
          )}

          {walletFound && (
            <div className="w-full bg-gradient-to-br from-[#0d0a14]/60 to-[#0d0a14]/40 rounded-xl border border-[#7B68EE]/20 p-3 sm:p-4 mb-4 backdrop-blur-sm relative z-10">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm">
                    Blockchain: {walletFoundDetails.blockchain}
                  </span>
                  <span className="text-neutral-400 text-xs">
                    {walletFoundTime?.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Primeira seção: Carteira Solana (endereço mascarado) */}
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <WalletCards className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          Carteira Encontrada
                        </span>
                        <span className="text-green-400/80 text-xs">
                          Carteira Ativa Detectada
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Key className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-background/40 rounded-lg mb-4 border border-green-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent" />
                    <span className="font-mono text-sm text-green-300 relative">
                      {maskWalletAddress(walletAddress)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <span className="text-red-400/80 text-sm">
                        Acesso Bloqueado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400/80 text-sm">
                        Alto Potencial
                      </span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segunda seção: Solana Discovery Component - Clear Values */}
              <div className="relative bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-emerald-500/20 backdrop-blur-xl overflow-hidden">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 rounded-2xl" />

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center border border-emerald-500/30">
                        <WalletCards className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          Solana Encontrada
                        </h3>
                        <p className="text-emerald-400/70 text-sm font-medium">
                          Saldo atual da carteira
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-mono">
                        {walletFoundTime?.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-emerald-400/60 mt-1">
                        Live Price
                      </div>
                    </div>
                  </div>

                  {/* Values Display */}
                  <div className="space-y-4">
                    {/* Solana Amount */}
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-sm font-medium mb-1">
                            Quantidade Encontrada
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-emerald-400 text-[16px] font-bold">
                              {solanaAmount.toFixed(4)}
                            </span>
                            <span className="text-emerald-400/70 text-lg font-medium">
                              SOL
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* USD Value */}
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-sm font-medium mb-1">
                            Valor Estimado (USD)
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-green-400 text-[16px]">
                              $
                              {usdValue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-green-400/70 text-sm font-medium">
                              USD
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-mono">
                            1 SOL = ${solanaPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">
                            Preço Atual
                          </div>
                          <div className="text-xs text-green-400 font-mono mt-1">
                            Live
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão para prosseguir */}
              <div className="mt-4 relative z-50">
                <button
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#7B68EE] to-[#9370DB] hover:from-[#7B68EE]/90 hover:to-[#9370DB]/90 text-white font-medium rounded-xl border border-[#7B68EE]/20 shadow-lg shadow-[#7B68EE]/20 transition-all duration-200 relative z-50 cursor-pointer"
                  onClick={() => {
                    console.log(
                      "Botão clicado - prosseguir para próxima etapa",
                    );
                    setShowCompletionModal(true);
                    setIsComplete(true);
                    setMiningStarted(false);
                    setIsStarted(false);
                    // Stop all timers
                    if (completionTimerRef.current)
                      clearTimeout(completionTimerRef.current);
                    if (miningTimeRef.current)
                      clearInterval(miningTimeRef.current);
                    if (notificationTimerRef.current)
                      clearTimeout(notificationTimerRef.current);
                    if (walletFinderTimerRef.current)
                      clearTimeout(walletFinderTimerRef.current);
                  }}
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <span>Prosseguir para próxima etapa</span>
                    <span>→</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {isStarted && (
            <div className="w-full bg-gradient-to-br from-[#0d0a14]/60 to-[#0d0a14]/40 rounded-xl border border-[#7B68EE]/20 p-3 sm:p-4 mb-4 backdrop-blur-sm relative z-10">
              {/* Ghost glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B68EE]/5 via-transparent to-[#9370DB]/5 rounded-xl" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <BarChart4 className="w-4 h-4 text-[#7B68EE]" />
                  <span className="text-white text-sm font-medium">
                    Desempenho do Sistema
                  </span>
                </div>
                <div>
                  <Activity className="w-4 h-4 text-[#9370DB]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400 mb-1">
                    Poder Computacional
                  </span>
                  <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7B68EE] to-[#9370DB] shadow-lg"
                      style={{ width: `${Math.max(computePower, 5)}%` }}
                    />
                  </div>
                  <span className="text-xs text-right text-[#7B68EE] mt-1 font-medium">
                    {computePower.toFixed(1)}%
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400 mb-1">
                    Utilização de GPU
                  </span>
                  <div className="w-full h-1.5 bg-background/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${gpuUtilization}%` }}
                    />
                  </div>
                  <span className="text-xs text-right text-neutral-500 mt-1">
                    {gpuUtilization.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-neutral-400" />
                  <span className="text-neutral-400">Temperatura: </span>
                  <span
                    className={`font-medium ${cpuTemperature > 70 ? "text-red-400" : cpuTemperature > 60 ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {cpuTemperature.toFixed(1)}°C
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Network className="w-3 h-3 text-neutral-400" />
                  <span className="text-neutral-400">Nós Conectados: </span>
                  <span className="font-medium text-[#7B68EE]">
                    {networkStrength}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Removidas as notificações do meio da tela */}

          {/* Sistema de notificações */}
          <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`w-11/12 max-w-sm bg-gradient-to-r backdrop-blur-xl rounded-xl shadow-2xl 
                ${
                  notification.type === "success"
                    ? "from-green-900/30 to-green-600/20 border-l-4 border-green-500"
                    : notification.type === "warning"
                      ? "from-yellow-900/30 to-yellow-600/20 border-l-4 border-yellow-500"
                      : "from-blue-900/30 to-primary/20 border-l-4 border-primary"
                } p-4 mb-3 ${notification.seen ? "opacity-90" : ""} pointer-events-auto`}
                  exit="exit"
                  style={{ zIndex: 100 - index }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent rounded-xl" />
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex-shrink-0 rounded-lg p-2 
                    ${
                      notification.type === "success"
                        ? "bg-green-500/20 text-green-400"
                        : notification.type === "warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-primary/20 text-primary"
                    }`}
                    >
                      {notification.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : notification.type === "warning" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <BellRing className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white mb-1">
                        {notification.message}
                      </div>
                      <div
                        className={`h-0.5 rounded-full ${
                          notification.type === "success"
                            ? "bg-green-500/30"
                            : notification.type === "warning"
                              ? "bg-yellow-500/30"
                              : "bg-primary/30"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>

          <p className="text-center mt-4 text-neutral-400 text-[13px] relative z-10">
            Sua mineração foi executada em ambiente seguro com tecnologia{" "}
            <span className="text-[#7B68EE] font-medium">Ghost Chain™</span>.
            <br />
            Todos os dados protegidos por protocolo{" "}
            <span className="text-[#9370DB] font-medium">SHA-512</span>.
          </p>

          {/* Ghost Hot spots que piscam */}
          <div className="absolute bottom-4 left-4">
            <div className="w-2 h-2 rounded-full bg-[#7B68EE]" />
          </div>

          <div className="absolute top-10 right-4">
            <div className="w-2 h-2 rounded-full bg-[#9370DB]" />
          </div>
        </div>
      )}
      {showCompletionModal && <CompletionModal />}
    </>
  );
};

export default MiningSimulation;
