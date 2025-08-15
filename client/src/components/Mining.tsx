import React, { useState, useMemo } from "react";
import {
  Send,
  Key,
  Terminal,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Ghost,
  Sparkles,
  Wallet,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { useMining } from "../context/MiningContext";
import { useBlockchain } from "../context/BlockchainContext";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { useTranslation } from "../hooks/useTranslation";
import Withdrawal from "./Withdrawal";
import { useLicense } from "../context/LicenseContext";
import { useLicenseVerification } from "../hooks/useLicenseVerification";
import WalletFoundPopup from "./WalletFoundPopup";
import UpgradePopup from "./ui/UpgradePopup";
import MiningPrepPopup from "./MiningPrepPopup"; // Import the new popup component

function Mining() {
  const { currentBlockchain } = useBlockchain();
  const [showLogs, setShowLogs] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [miningBars, setMiningBars] = useState<number[]>(Array(100).fill(0));
  const { user, profile } = useAuth();
  const { hasTurboAccess } = useLicense();
  const { isTourMode } = useTour();
  const { t } = useTranslation();
  
  // Hook de verificação de licenças para controle do modo turbo
  const { verifyLicenses } = useLicenseVerification(user?.email || null);
  const {
    isRunning,
    setIsRunning,
    turboMode,
    setTurboMode,
    attempts,
    hashRate,
    foundWallets,
    logs,
    lastFoundWallet,
    clearLastFoundWallet,
  } = useMining();
  const [showPrepPopup, setShowPrepPopup] = useState(false); // State for the preparation popup
  const [showTurboTooltip, setShowTurboTooltip] = useState(true); // State for the turbo tooltip
  const turboButtonRef = React.useRef<HTMLButtonElement>(null); // Referência para o botão Turbo

  const totalBalance = foundWallets.reduce((acc, w) => acc + w.balance, 0);

  // Update mining visualization
  React.useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setMiningBars((prev) => {
          const newBars = [...prev];
          const randomIndex = Math.floor(Math.random() * newBars.length);
          newBars[randomIndex] = Math.random();
          return newBars;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleTurboClick = async () => {
    if (isRunning) return;

    if (!user?.email && !isTourMode) return;

    // Se estiver em modo tutorial, permite acesso direto
    if (isTourMode) {
      setTurboMode(!turboMode);
      return;
    }

    try {
      console.log('[Mining] 🔥 VERIFICAÇÃO MODO TURBO: Verificando licença PPPBAHKJ no servidor externo');
      
      // Usar a mesma lógica de verificação de licenças do BlockchainSelector
      const result = await verifyLicenses();
      
      if (!result) {
        console.log('[Mining] ❌ Erro na verificação - Mostrando modal de aquisição');
        setShowUpgradePopup(true);
        return;
      }

      // Verificar especificamente se o modo turbo está habilitado
      if (result.turboModeEnabled) {
        console.log('[Mining] ✅ LICENÇA PPPBAHKJ ATIVA - Ativando modo turbo');
        setTurboMode(!turboMode);
      } else {
        console.log('[Mining] ❌ LICENÇA PPPBAHKJ INATIVA - Mostrando modal de aquisição');
        setShowUpgradePopup(true);
      }
      
    } catch (error) {
      console.error('[Mining] ❌ Erro na verificação de licença turbo:', error);
      setShowUpgradePopup(true);
    }
  };

  // Verificar se é uma demonstração (quando o usuário não tem licença mas acessa a página)
  const isDemoMode = user?.email && !hasTurboAccess && !isTourMode;

  React.useEffect(() => {
    const hasSeenTip = localStorage.getItem("hasSeenTurboTip");
    if (hasSeenTip) {
      setShowTurboTooltip(false);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <div 
        className="p-4 sm:p-6 mb-4 relative overflow-hidden group rounded-xl backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.3)',
          borderColor: 'rgba(123, 104, 238, 0.3)',
          boxShadow: '0 8px 32px rgba(123, 104, 238, 0.1)'
        }}
      >
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
          }}
        />

        {/* Banner de demonstração para usuários sem licença */}


        <div className="relative space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
              >
                <Ghost 
                  className="w-6 h-6 ghost-logo" 
                  style={{ color: 'var(--ghost-primary)' }}
                />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Saldo Estimado</p>
                <div className="flex items-center gap-2">
                  <h2 
                    className="text-2xl sm:text-4xl font-bold tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    {totalBalance.toFixed(4)} {currentBlockchain?.symbol}
                  </h2>
                  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowWithdrawal(true)}
                className="flex-1 sm:flex-none btn border backdrop-blur-sm transition-all duration-300 hover:scale-102"
                style={{
                  backgroundColor: 'rgba(123, 104, 238, 0.2)',
                  borderColor: 'rgba(123, 104, 238, 0.3)',
                  color: 'var(--ghost-primary)',
                  boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(123, 104, 238, 0.3)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(123, 104, 238, 0.2)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
                }}
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">{t('miningExtras.withdraw')}</span>
              </button>
              <div className="flex-1 sm:flex-none relative">
                <button
                  ref={turboButtonRef}
                  onClick={handleTurboClick}
                  disabled={isRunning}
                  className="w-full btn relative overflow-hidden group transition-all duration-300 hover:scale-102 backdrop-blur-md border"
                  style={{
                    background: turboMode
                      ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
                      : 'rgba(39, 39, 42, 0.4)',
                    borderColor: turboMode
                      ? 'rgba(220, 38, 38, 0.5)'
                      : !isRunning ? 'rgba(239, 68, 68, 0.5)' : 'rgba(123, 104, 238, 0.3)',
                    boxShadow: turboMode
                      ? '0 8px 32px rgba(220, 38, 38, 0.3)'
                      : '0 4px 16px rgba(123, 104, 238, 0.1)',
                    opacity: isRunning ? 0.5 : 1,
                    cursor: isRunning ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isRunning && !turboMode) {
                      e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRunning && !turboMode) {
                      e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
                    }
                  }}
                >
                  {/* Background pulsante avermelhado quando turbo ativo */}
                  {turboMode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-red-400/60 to-red-500/40 animate-pulse pointer-events-none z-0"></div>
                  )}

                  {/* Sutil indicador pulsante para chamar atenção quando inativo */}
                  {!turboMode && !isRunning && (
                    <div className="absolute -inset-px rounded-lg opacity-50 pointer-events-none z-0 border border-danger/30 animate-subtle-pulse"></div>
                  )}

                  {/* Efeito de brilho quando turbo ativo */}
                  {turboMode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none z-0"></div>
                  )}
                  <Flame
                    className="w-5 h-5 relative transition-transform z-10"
                    style={{
                      color: turboMode ? '#FFFFFF' : '#EF4444'
                    }}
                  />
                  <span 
                    className="hidden sm:inline relative z-10 font-semibold"
                    style={{
                      color: turboMode ? '#FFFFFF' : 'var(--ghost-primary)'
                    }}
                  >
                    {turboMode ? t('miningExtras.turboActive') : t('miningExtras.activateTurbo')}
                  </span>
                  {turboMode && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/20 to-red-400/20 animate-[turboGlow_2s_ease-in-out_infinite] pointer-events-none z-0" />
                  )}
                </button>

                {/* Tooltip explicativo sobre o botão Turbo - agora posicionado relativamente ao botão */}
                {showTurboTooltip && (
                  <div
                    className="absolute top-full right-0 mt-2 p-3 rounded-lg shadow-xl z-50 animate-fadeIn backdrop-blur-md border"
                    style={{ 
                      width: "220px",
                      backgroundColor: 'rgba(39, 39, 42, 0.9)',
                      borderColor: 'rgba(123, 104, 238, 0.4)',
                      boxShadow: '0 8px 32px rgba(123, 104, 238, 0.2)'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="rounded-full p-1.5 flex-shrink-0"
                        style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
                      >
                        <Flame 
                          className="w-4 h-4" 
                          style={{ color: '#EF4444' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-0.5">
                          {t('miningExtras.activateTurboTitle')}
                        </h4>
                        <p className="text-xs text-neutral-300 leading-tight">
                          {t('miningExtras.activateTurboDescription')}
                        </p>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTurboTooltip(false);
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(55, 55, 58, 0.8)',
                          color: '#9CA3AF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(75, 75, 78, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.8)';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {/* Seta do tooltip rotacionada em 45 graus */}
                    <div 
                      className="absolute -top-2 right-6 w-4 h-4 border-l border-t transform rotate-45"
                      style={{
                        backgroundColor: 'rgba(39, 39, 42, 0.9)',
                        borderColor: 'rgba(123, 104, 238, 0.4)'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              className="group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-102"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
              }}
            >
              <Activity 
                className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" 
                style={{ color: '#00f0ff' }}
              />
              <div 
                className="text-xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {hashRate} H/s
              </div>
              <div className="text-sm text-neutral-400">Taxa de Hash</div>
            </div>
            <div 
              className="group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-102"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
              }}
            >
              <Key 
                className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" 
                style={{ color: '#00ff9d' }}
              />
              <div 
                className="text-xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {attempts}
              </div>
              <div className="text-sm text-neutral-400">Chaves Verificadas</div>
            </div>
            <div 
              className="group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-102"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
              }}
            >
              <Wallet 
                className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" 
                style={{ color: '#ff9d00' }}
              />
              <div 
                className="text-xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {foundWallets.length}
              </div>
              <div className="text-sm text-neutral-400">Carteiras Encontradas</div>
            </div>
            <div 
              className="group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-102"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
              }}
            >
              <Activity 
                className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" 
                style={{ color: '#00ff9d' }}
              />
              <div 
                className="text-xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {((foundWallets.length / Math.max(attempts, 1)) * 100).toFixed(4)}%
              </div>
              <div className="text-sm text-neutral-400">Taxa de Sucesso</div>
            </div>
          </div>

          <div 
            className="rounded-xl p-4 backdrop-blur-md mb-6 border"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.4)',
              borderColor: 'rgba(123, 104, 238, 0.3)',
              boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Performance de Mineração
            </h3>

            {foundWallets.length > 0 && (
              <div 
                className="flex items-center gap-3 mb-4 px-2 animate-ghostAppear p-3 rounded-lg backdrop-blur-md border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)'
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                >
                  <Wallet 
                    className="w-4 h-4" 
                    style={{ color: '#10B981' }}
                  />
                </div>
                <div>
                  <p 
                    className="font-medium"
                    style={{ color: '#10B981' }}
                  >
                    {foundWallets.length} carteira(s) encontrada(s)!
                  </p>
                  <p className="text-xs text-neutral-400">
                    Saldo total: {totalBalance.toFixed(4)}{" "}
                    {currentBlockchain?.symbol}
                  </p>
                </div>
              </div>
            )}

            <div className="mining-grid mb-4">
              {miningBars.map((height, index) => (
                <div
                  key={index}
                  className={`mining-bar ${height > 0 ? (turboMode ? "turbo" : "active") : ""}`}
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Botão de mineração com design impactante */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                if (isRunning) {
                  setIsRunning(false);
                } else {
                  // Iniciar preparação do ambiente
                  setShowPrepPopup(true);
                }
              }}
              className="relative overflow-hidden flex items-center justify-center gap-3 py-4 px-8 rounded-xl transition-all duration-500 transform hover:scale-105 active:scale-95 group text-white backdrop-blur-md border"
              style={{
                background: isRunning 
                  ? 'linear-gradient(135deg, #DC2626, #B91C1C)' 
                  : 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                boxShadow: isRunning 
                  ? '0 8px 32px rgba(220, 38, 38, 0.3)' 
                  : '0 8px 32px rgba(123, 104, 238, 0.3)',
                borderColor: isRunning 
                  ? 'rgba(220, 38, 38, 0.5)' 
                  : 'rgba(123, 104, 238, 0.5)'
              }}

            >
              {/* Efeito de partículas */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full 
                      ${isRunning ? "bg-red-400" : "bg-blue-400"} 
                      animate-particle`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>

              {/* Efeito de resplandor */}
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  background: isRunning 
                    ? 'rgba(220, 38, 38, 0.1)' 
                    : 'rgba(123, 104, 238, 0.1)'
                }}
              ></div>

              {/* Efeito de brilho que passa */}
              <div
                className="absolute inset-0 w-20 h-full bg-white/20 blur-md"
                style={{
                  transform: "skewX(-15deg)",
                  animation: "shimmer 3s infinite",
                }}
              ></div>

              {/* Ícone */}
              <div className="relative">
                <Zap
                  className={`w-6 h-6 ${isRunning ? "text-red-200 animate-pulse" : "text-white"}`}
                />
                {isRunning && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-white/30 pointer-events-none" />
                )}
              </div>

              {/* Texto */}
              <span className="font-bold text-lg z-10 tracking-wider">
                {isRunning ? "Parar Mineração" : "Iniciar Mineração"}
              </span>

              {/* Efeito de borda brilhante */}
              <div
                className={`absolute inset-0 rounded-xl ${isRunning ? "animate-border-red" : "animate-border-primary"} opacity-0 group-hover:opacity-100`}
              ></div>
            </button>
          </div>

          {/* Adicionando keyframes necessários para as animações */}
          <style>{`
            @keyframes shimmer {
              0% {
                transform: translateX(-150%) skewX(-15deg);
              }
              100% {
                transform: translateX(150%) skewX(-15deg);
              }
            }

            @keyframes particle {
              0% {
                transform: translateY(0) scale(1);
                opacity: 0.7;
              }
              100% {
                transform: translateY(-20px) scale(0);
                opacity: 0;
              }
            }

            .animate-particle {
              animation: particle 2s infinite;
            }

            .animate-border-primary {
              animation: border-pulse-primary 2s infinite;
              box-shadow: 0 0 0 2px rgba(140, 100, 255, 0.3);
            }

            .animate-border-red {
              animation: border-pulse-red 2s infinite;
              box-shadow: 0 0 0 2px rgba(255, 100, 100, 0.3);
            }

            @keyframes border-pulse-primary {
              0% {
                box-shadow: 0 0 0 0 rgba(140, 100, 255, 0.7);
              }
              70% {
                box-shadow: 0 0 0 10px rgba(140, 100, 255, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(140, 100, 255, 0);
              }
            }

            @keyframes border-pulse-red {
              0% {
                box-shadow: 0 0 0 0 rgba(255, 100, 100, 0.7);
              }
              70% {
                box-shadow: 0 0 0 10px rgba(255, 100, 100, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(255, 100, 100, 0);
              }
            }
          `}</style>

          <div className="space-y-2 mb-6">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="w-full btn flex justify-between backdrop-blur-md border transition-all duration-300 hover:scale-102"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
              }}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Log de Mineração</span>
              </div>
              {showLogs ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showLogs && (
              <div 
                className="rounded-xl p-4 h-[400px] overflow-auto backdrop-blur-md border"
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.4)',
                  borderColor: 'rgba(123, 104, 238, 0.3)',
                  boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
                }}
              >
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg text-xs font-mono backdrop-blur-md border"
                      style={{
                        backgroundColor: 'rgba(55, 55, 58, 0.4)',
                        borderColor: 'rgba(123, 104, 238, 0.2)'
                      }}
                    >
                      <div className="flex justify-between text-neutral-400 mb-2">
                        <span>
                          {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                        <span style={{ color: 'var(--ghost-primary)' }}>Hash: {log.hash}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="break-all">
                          <span className="text-neutral-400">
                            Chave Privada:{" "}
                          </span>
                          <span style={{ color: 'var(--ghost-secondary)' }}>
                            {log.privateKey}
                          </span>
                        </div>
                        <div className="break-all">
                          <span className="text-neutral-400">
                            Chave Pública:{" "}
                          </span>
                          <span style={{ color: 'var(--ghost-primary)' }}>{log.publicKey}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Saldo: </span>
                          <span
                            style={{ 
                              color: log.balance > 0 ? '#10B981' : '#9CA3AF' 
                            }}
                          >
                            {log.balance.toFixed(4)} {currentBlockchain?.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-neutral-400 py-8">
                      <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum log disponível</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div 
            className="rounded-xl p-4 backdrop-blur-md border"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.4)',
              borderColor: 'rgba(123, 104, 238, 0.3)',
              boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Carteiras Encontradas
            </h3>
            {foundWallets.length === 0 ? (
              <div className="text-center py-12">
                <Ghost className="w-16 h-16 mx-auto text-neutral-500/50 mb-4" />
                <p className="text-neutral-400">
                  Nenhuma carteira encontrada ainda
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Inicie a mineração para começar
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {foundWallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 transition-all duration-300 hover:scale-102 backdrop-blur-md border"
                    style={{
                      backgroundColor: 'rgba(55, 55, 58, 0.4)',
                      borderColor: 'rgba(123, 104, 238, 0.2)',
                      boxShadow: '0 2px 8px rgba(123, 104, 238, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 104, 238, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(123, 104, 238, 0.1)';
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity 
                        className="w-4 h-4" 
                        style={{ color: '#10B981' }}
                      />
                      <span 
                        className="font-medium"
                        style={{ color: '#10B981' }}
                      >
                        {wallet.balance.toFixed(4)} {currentBlockchain?.symbol}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p 
                        className="font-mono text-xs break-all"
                        style={{ color: 'var(--ghost-primary)' }}
                      >
                        {wallet.publicKey}
                      </p>
                      <p 
                        className="font-mono text-xs break-all"
                        style={{ color: 'var(--ghost-secondary)' }}
                      >
                        {wallet.privateKey}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showWithdrawal && (
        <Withdrawal
          isOpen={showWithdrawal}
          onClose={() => setShowWithdrawal(false)}
          balance={totalBalance}
        />
      )}

      {lastFoundWallet && (
        <WalletFoundPopup
          wallet={lastFoundWallet}
          onClose={clearLastFoundWallet}
        />
      )}

      {showUpgradePopup && (
        <UpgradePopup
          isOpen={showUpgradePopup}
          onClose={() => setShowUpgradePopup(false)}
          blockchain={{
            name: "Turbo Mode",
            color: "#f44336",
            icon: Flame,
            id: "turbo",
            stats: {
              growth: "+1000%",
            },
          }}
        />
      )}
      <MiningPrepPopup
        isOpen={showPrepPopup}
        onClose={() => setShowPrepPopup(false)}
        onComplete={() => {
          setShowPrepPopup(false);
          // Iniciar mineração após o popup
          setTimeout(() => {
            setIsRunning(true);
          }, 300);
        }}
      />

      {/* O tooltip agora está dentro do componente do botão para melhor posicionamento */}
    </div>
  );
}

export default Mining;