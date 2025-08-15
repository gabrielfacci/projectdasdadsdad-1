import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Ghost,
  Shield,
  ArrowRight,
  CheckCircle,
  Lock,
  CreditCard,
  Sparkles,
  TrendingUp,
  Zap,
  Wallet,
  Flame,
  RefreshCw,
  Key,
  Loader,
  AlertTriangle,
  DollarSign,
  Users,
  LineChart,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { startLicenseSync } from "../lib/licenseSync";
import { auth } from "../lib/supabase";
import { supabase } from "../lib/supabaseClient";
import { syncLicenseStatus } from "../lib/licenseCheck";
import { generateUTMUrl } from "../lib/utils"; // Added import
import { useLicenseVerification } from "../hooks/useLicenseVerification"; // Import hook de verificação

export default function LicenseRequired() {
  const { profile, reloadUserProfile, user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const syncRef = useRef<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  
  // Hook de verificação de licenças - MESMO SISTEMA DO BLOCKCHAIN SELECTOR
  const {
    isVerifying,
    hasLicense,
    authorizedBlockchains,
    productCodes,
    lastVerification,
    error: licenseError,
    verifyLicenses
  } = useLicenseVerification(user?.email || null);

  // Estatísticas de projeção aleatórias
  const [projectionStats] = useState({
    usersCount: Math.floor(Math.random() * 5000) + 6000,
    avgDailyEarning: (Math.random() * 0.4 + 0.1).toFixed(2),
    avgMonthlyEarning: (Math.random() * 450 + 200).toFixed(2),
    successRate: Math.floor(Math.random() * 20 + 80),
  });

  // Função para rolar até a seção de verificação
  const scrollToVerification = () => {
    setTimeout(() => {
      verificationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Efeito para obter e definir o email do usuário assim que os dados estiverem disponíveis
  useEffect(() => {
    const getUserEmail = async () => {
      // 1. Tentar obter email do contexto de autenticação
      if (user?.email) {
        setUserEmail(user.email);
        return user.email;
      }

      // 2. Profile doesn't have email property, skip this check

      // 3. Tentar obter da sessão atual
      try {
        const { data: sessionData } = await auth.getSession();
        if (sessionData?.session?.user?.email) {
          setUserEmail(sessionData.session.user.email);
          return sessionData.session.user.email;
        }
      } catch (err) {
        console.error('[LicenseRequired] Erro ao obter sessão:', err);
      }

      // 4. Tentar obter diretamente do Supabase
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setUserEmail(data.user.email);
          return data.user.email;
        }
      } catch (err) {
        console.error('[LicenseRequired] Erro ao obter usuário do Supabase:', err);
      }

      // 5. Verificar LocalStorage como último recurso
      const storedAuth = localStorage.getItem('supabase.auth.token');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.currentSession?.user?.email) {
            const email = parsed.currentSession.user.email;
            setUserEmail(email);
            return email;
          }
        } catch (err) {
          console.error('[LicenseRequired] Erro ao ler dados de autenticação do localStorage:', err);
        }
      }

      console.error('[LicenseRequired] Não foi possível obter o email do usuário após todas as tentativas');
      return null;
    };

    getUserEmail();
  }, [user, profile]);

  // Inicializar sincronização de licença ao montar o componente
  useEffect(() => {
    if (!profile) return;

    const initSync = async () => {
      try {
        // Iniciar sincronização de licença contínua
        if (typeof window !== 'undefined' && window.location) {
          const currentUrl = window.location.href;
          console.log('[LicenseRequired] Inicializando verificação dinâmica de licença', currentUrl);
        }

        // Obter email do usuário - usar o estado userEmail que foi definido no efeito anterior
        let email = userEmail;

        // Se ainda não tiver o email, tentar mais uma vez obter diretamente
        if (!email) {
          // Verificar session
          try {
            const { data: sessionData } = await auth.getSession();
            email = sessionData?.session?.user?.email || null;
          } catch (err) {
            console.error('[LicenseRequired] Erro ao obter sessão durante sincronização:', err);
          }

          // Verificar usuário atual
          if (!email) {
            try {
              const { data } = await supabase.auth.getUser();
              email = data?.user?.email || null;
            } catch (err) {
              console.error('[LicenseRequired] Erro ao obter usuário do Supabase durante sincronização:', err);
            }
          }
        }

        if (!email) {
          console.error('[LicenseRequired] Email do usuário não disponível para verificação de licença');
          console.log('[LicenseRequired] Profile disponível:', profile);

          // Último recurso - se temos o ID do usuário, tentar obter email via RPC
          if (user?.id) {
            try {
              const { data } = await supabase.rpc('get_user_email_by_id', { p_user_id: user.id });
              if (data?.email) {
                email = data.email;
                console.log('[LicenseRequired] Email obtido via RPC:', email);
              }
            } catch (err) {
              console.error('[LicenseRequired] Erro ao obter email via RPC:', err);
            }
          }

          if (!email) return;
        }

        console.log('[LicenseRequired] Iniciando sincronização para:', email);

        const sync = await startLicenseSync(email, async (hasLicense) => {
          console.log('[LicenseRequired] Mudança de status detectada:', hasLicense);

          if (hasLicense) {
            console.log('[LicenseRequired] Licença ativada! Redirecionando para seleção de blockchain');
            // Recarregar perfil para garantir informações atualizadas
            await reloadUserProfile();
            navigate('/blockchain', { replace: true });
          }
        });

        syncRef.current = sync;
      } catch (err) {
        console.error('[LicenseRequired] Erro ao iniciar sincronização:', err);
      }
    };

    if (userEmail) {
      initSync();
    } else {
      console.warn('[LicenseRequired] Aguardando email do usuário para iniciar sincronização...');
    }

    // Limpar sincronização ao desmontar
    return () => {
      if (syncRef.current?.stopSync) {
        syncRef.current.stopSync();
      }
    };
  }, [profile, navigate, reloadUserProfile, userEmail, user?.id]);

  // Verificar licença manualmente usando o MESMO SISTEMA do BlockchainSelector
  const checkLicenseStatus = async () => {
    if (!user?.email) {
      return;
    }

    console.log('[LicenseRequired] 🔍 VERIFICAÇÃO MANUAL INICIADA via useLicenseVerification hook');
    
    try {
      const result = await verifyLicenses(); // Usar o hook do BlockchainSelector
      
      if (result?.hasLicense && result?.authorizedBlockchains?.length > 0) {
        console.log('[LicenseRequired] ✅ LICENÇA ATIVA DETECTADA!');
        console.log('[LicenseRequired] Blockchains liberadas:', result.authorizedBlockchains);
        
        // Atualizar perfil e redirecionar
        await reloadUserProfile();
        navigate('/blockchain', { replace: true });
      } else {
        console.log('[LicenseRequired] ❌ Nenhuma licença ativa encontrada');
      }
    } catch (error) {
      console.error('[LicenseRequired] Erro na verificação:', error);
    }
  };

  const handleActivateLicense = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const baseUrl = "https://checkout.perfectpay.com.br/pay/PPU38CPJJ4C";

      const raw = localStorage.getItem("utmify_data");
      console.log("[GhostWallet][DEBUG] Conteúdo de utmify_data:", raw);

      try {
        const finalUrl = generateUTMUrl(baseUrl);
        console.log("[GhostWallet][DEBUG] Redirecionando para:", finalUrl);
        window.location.href = finalUrl;
      } catch (err) {
        console.error("[GhostWallet][DEBUG] Erro ao gerar link final:", err);
        // Fallback
        window.location.href = baseUrl;
      }
    }, 1500);
  };

  const features = [
    {
      title: "Acesso ao minerador",
      icon: Wallet,
      description: "Minere carteiras cripto com tecnologia avançada",
    },
    {
      title: "Suporte prioritário",
      icon: Shield,
      description: "Atendimento exclusivo para resolução de dúvidas",
    },
    {
      title: "Atualizações automáticas",
      icon: Zap,
      description: "Receba as melhores atualizações do algoritmo",
    },
    {
      title: "Retiradas ilimitadas",
      icon: TrendingUp,
      description: "Saque seus ganhos sem restrições",
    },
  ];

  // Gerar dados consistentes para o gráfico de barras
  const generateBarData = () => {
    // Base do valor diário em dólares (entre $12 e $18)
    const baseDailyUsd = 15 + (Math.random() * 6 - 3);
    const values = [];
    const now = new Date();

    // Taxa de conversão USD para BRL (aproximadamente)
    const usdToBrl = 5.1 + (Math.random() * 0.3);

    // Dias da semana em português
    const weekdaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Criar tendência realista com crescimento gradual
    let lastValue = baseDailyUsd * (0.8 + Math.random() * 0.2); // Começar um pouco mais baixo

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Gerar variação realista que tende a crescer (+/- 15%)
      const growthBias = (6 - i) * 0.03; // Bias para crescimento conforme se aproxima do dia atual
      const variation = 1 + (Math.random() * 0.15 - 0.05) + growthBias;

      // Calcular próximo valor baseado no anterior (para criar tendência)
      lastValue = lastValue * variation;
      // Limitar entre $10 e $25 para valores visuais agradáveis
      lastValue = Math.min(Math.max(lastValue, 10), 25);

      // Usar os dias da semana em português de forma confiável
      const dayIndex = date.getDay();
      const dayName = weekdaysShort[dayIndex];

      values.push({
        day: dayName,
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valueUsd: parseFloat(lastValue.toFixed(2)),
        valueBrl: parseFloat((lastValue * usdToBrl).toFixed(2))
      });
    }

    return {
      data: values,
      usdToBrl
    };
  };

  // Usar useMemo para garantir que os dados não mudem a cada re-render
  const [barDataInfo] = useState(() => generateBarData());
  const barData = barDataInfo.data;
  const usdToBrl = barDataInfo.usdToBrl;
  const maxBarValue = Math.max(...barData.map(item => item.valueUsd));

  // Calcular rendimento estimado com valores mais realistas
  const calculateEstimatedEarnings = (data: any[], exchangeRate: number) => {
    if (!data || data.length === 0) {
      // Valores padrão caso não haja dados
      return {
        daily: "15.00",
        weekly: "105.00",
        monthly: "450.00",
        yearly: "5,475.00",
        dailyBrl: "76.50",
        weeklyBrl: "535.50",
        monthlyBrl: "2,295.00",
        yearlyBrl: "27,922.50"
      };
    }

    // Usar o último valor (mais recente) como base para as projeções
    // Este é geralmente o valor mais relevante para projeções futuras
    const lastValue = data[data.length - 1].valueUsd;

    // Adicionar pequenas variações para os diferentes períodos
    // para parecer mais natural (crescimento não é perfeitamente linear)
    const weeklyMultiplier = 7 * (1 + Math.random() * 0.05);  // +0-5% de crescimento semanal
    const monthlyMultiplier = 30 * (1 + Math.random() * 0.1); // +0-10% de crescimento mensal
    const yearlyMultiplier = 365 * (1 + Math.random() * 0.15); // +0-15% de crescimento anual

    // Formato de número brasileiro para valores anuais (com separador de milhar)
    const formatYearlyNumber = (num: number) => {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Formato para valores menores (sem separador de milhar)
    const formatNumber = (num: number) => {
      return num.toFixed(2);
    };

    return {
      daily: formatNumber(lastValue),
      weekly: formatNumber(lastValue * weeklyMultiplier),
      monthly: formatNumber(lastValue * monthlyMultiplier),
      yearly: formatYearlyNumber(lastValue * yearlyMultiplier),
      dailyBrl: formatNumber(lastValue * exchangeRate),
      weeklyBrl: formatNumber(lastValue * weeklyMultiplier * exchangeRate),
      monthlyBrl: formatNumber(lastValue * monthlyMultiplier * exchangeRate),
      yearlyBrl: formatYearlyNumber(lastValue * yearlyMultiplier * exchangeRate)
    };
  };

  // Usar useMemo para evitar recálculos desnecessários
  const [estimatedEarnings] = useState(() => calculateEstimatedEarnings(barData, usdToBrl));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="w-full max-w-4xl mb-20 sm:mb-0">
        <div className="ghost-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse" />

          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -right-2 -top-2">
                  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold ghost-text mb-2">
                Ative sua Licença Ghost Wallet
              </h1>
              <p className="text-neutral-400 max-w-lg mb-4">
                {profile?.name ? `${profile.name}, para` : "Para"} continuar
                utilizando todas as funcionalidades da plataforma, é necessário
                ativar sua licença Ghost Wallet.
              </p>

              {/* Link para verificação de licença - movido para cima */}
              <button
                onClick={scrollToVerification}
                className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm mx-auto mb-6 transition-all hover:scale-105"
              >
                <Key className="w-4 h-4" />
                <span>Já tem licença? Verifique aqui</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Projeção de Lucros - Seção redesenhada */}
            <div className="mb-10 bg-gradient-to-br from-background-light/10 to-background/30 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-lg shadow-primary/10 animate-ghostSlideIn overflow-hidden relative">
              {/* Background decorativo */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/20 rounded-full filter blur-3xl"></div>
              </div>

              {/* Linhas decorativas de grade */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(10)].map((_, i) => (
                  <div key={`h-${i}`} className="absolute h-px w-full bg-white/20" style={{ top: `${i * 10}%` }}></div>
                ))}
                {[...Array(10)].map((_, i) => (
                  <div key={`v-${i}`} className="absolute w-px h-full bg-white/20" style={{ left: `${i * 10}%` }}></div>
                ))}
              </div>

              <div className="relative">
                {/* Cabeçalho da seção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center shadow-inner">
                      <LineChart className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Projeção de Lucro</h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Users className="w-3 h-3" />
                        <span>Baseado em <span className="text-primary font-medium">{projectionStats.usersCount.toLocaleString('pt-BR')}</span> usuários ativos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Taxa de sucesso: {projectionStats.successRate}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Projeção Financeira - Redesenhada */}
                  <div className="bg-background/40 backdrop-blur-md rounded-xl p-5 border border-white/5 shadow-inner">
                    <h4 className="text-sm font-medium text-primary/90 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Ganhos Potenciais Estimados</span>
                    </h4>

                    <div className="space-y-4">
                      {/* Diário */}
                      <div className="group p-3 rounded-lg transition-all hover:bg-white/5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">Diário</span>
                              <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                US$ {estimatedEarnings.daily}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-neutral-300">R$ {estimatedEarnings.dailyBrl}</div>
                            <div className="text-xs text-green-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +{Math.floor(Math.random() * 4 + 2)}% hoje
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Semanal */}
                      <div className="group p-3 rounded-lg transition-all hover:bg-white/5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">Semanal</span>
                              <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                US$ {estimatedEarnings.weekly}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-neutral-300">R$ {estimatedEarnings.weeklyBrl}</div>
                          </div>
                        </div>
                      </div>

                      {/* Mensal */}
                      <div className="group p-3 rounded-lg transition-all hover:bg-white/5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Flame className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm text-neutral-400">Mensal</span>
                              <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                US$ {estimatedEarnings.monthly}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-neutral-300">R$ {estimatedEarnings.monthlyBrl}</div>
                          </div>
                        </div>
                      </div>

                      {/* Anual - Destacado */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-900/20 to-primary/10 border border-green-500/20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <span className="text-sm text-neutral-300">Anual</span>
                              <div className="text-lg font-bold text-green-400">
                                US$ {estimatedEarnings.yearly}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-300">R$ {estimatedEarnings.yearlyBrl}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-6 text-center px-4">
                  <p className="text-sm text-neutral-400 max-w-xl mx-auto">
                    Esta projeção é baseada no desempenho real de usuários ativos na plataforma. Os resultados podem variar dependendo das condições de mercado.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-background-light/30 border border-white/5 rounded-xl p-5">
                  <h3 className="font-bold text-lg mb-3 ghost-text">
                    O que está incluso
                  </h3>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                          <feature.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-neutral-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-400 font-medium">
                      Sem compromisso mensal
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Licença de uso vitalício sem taxas recorrentes. Pague apenas
                    uma vez.
                  </p>
                </div>
              </div>

              <div className="relative bg-background-light/30 rounded-xl p-5 border transition-all duration-500 border-primary/20 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/10 to-[#8B7AFF]/10 animate-pulse" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#6C63FF] animate-pulse" />
                      </div>
                      <div className="absolute -right-1 -top-1">
                        <div className="relative">
                          <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                          <div className="absolute inset-0 w-5 h-5 bg-yellow-500/30 animate-ping rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Licença Premium
                      </h2>
                      <p className="text-sm text-neutral-400">
                        Acesso vitalício às funcionalidades
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        R$ 97,00
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-neutral-400 line-through">
                          R$ 297,00
                        </span>
                        <span className="text-xs text-green-400">
                          Economize 68%
                        </span>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-success/20 text-success text-xs whitespace-nowrap">
                      Acesso vitalício
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-300">
                        Minerador Ghost Chain™ ilimitado
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-300">
                        Prioridade no sistema de mineração
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-300">
                        Acesso a todas as blockchains
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-300">
                        Suporte preferencial
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-300">
                        Sem taxas para saques
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <motion.button
                      onClick={handleActivateLicense}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#6C63FF]/80 shadow-lg hover:shadow-[#6C63FF]/20 transition-all duration-300 flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="text-white font-medium">
                            Processando...
                          </span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 text-white" />
                          <span className="text-white font-medium">
                            Ativar Licença Agora
                          </span>
                          <ArrowRight className="w-5 h-5 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-700/20">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Removido botão flutuante de verificação */}

            <div ref={verificationRef} id="license-verification" className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-neutral-700/30">
              <div className="bg-[#6C63FF]/10 rounded-xl p-6 w-full max-w-xl border border-[#6C63FF]/30 shadow-lg relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-background px-4 py-1 rounded-full border border-[#6C63FF]/30">
                  <span className="text-sm text-[#6C63FF] font-medium">Verificação de Licença</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-[#6C63FF] animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Já possui uma licença?</h3>
                    <p className="text-sm text-neutral-300">Verifique o status da sua licença aqui</p>
                  </div>
                </div>

                <div className="bg-background/60 rounded-lg p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-neutral-200">Verificar status para:</span>
                  </div>
                  <div className="bg-background-light/80 backdrop-blur-sm rounded-lg p-3 text-sm font-mono text-white break-all border border-primary/10">
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
                      <motion.div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
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
                {licenseError && licenseError !== 'no_license' && (
                  <div className="mt-4 text-red-500 text-sm">
                    {licenseError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}