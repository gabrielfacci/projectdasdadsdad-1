import React, { useState, useEffect } from "react";
import { Ghost, Lock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { useMining } from "../context/MiningContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { blockchains } from "../lib/blockchains";
import { syncLicenseStatus } from "../lib/licenseCheck";
import { getAuthorizedBlockchains, hasBlockchainAccess } from "../lib/productLicenses";
import { useLicenseVerification } from "../hooks/useLicenseVerification";
import { testExternalAPI } from "../lib/testLicenseAPI";
import ConfirmDialog from "./ui/ConfirmDialog";
import UpgradeAccessPopup from "./ui/UpgradeAccessPopup";
import LicenseVerificationStatus from "./ui/LicenseVerificationStatus";
import { TurboModeIndicator, TurboModeBanner } from "./TurboModeIndicator";

export default function BlockchainSelector() {
  const [accessibleChains, setAccessibleChains] = useState<
    Record<string, boolean>
  >({});
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    blockchain: selectedBlockchain,
    setBlockchain,
    showConfirmDialog,
    setShowConfirmDialog,
  } = useBlockchain();
  const { isRunning, setIsRunning } = useMining();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Hook de verificação de licenças com controle de estado
  const {
    isVerifying,
    hasLicense,
    authorizedBlockchains,
    productCodes,
    turboModeEnabled,
    lastVerification,
    error: licenseError,
    verifyLicenses,
    hasBlockchainAccess
  } = useLicenseVerification(user?.email || null);

  // Teste da API externa na inicialização
  useEffect(() => {
    if (user?.email) {
      testExternalAPI(user.email).then(result => {
        console.log('🧪 TESTE CONCLUÍDO:', result);
      });
    }
  }, [user?.email]);

  // Redirecionamento automático para página sem licença
  useEffect(() => {
    if (!user?.email || isVerifying) return;
    
    // Se não há licença e verificação foi concluída, redirecionar
    if (licenseError === 'no_license' && !hasLicense && authorizedBlockchains.length === 0) {
      console.log('[BlockchainSelector] 🚫 NENHUMA LICENÇA ATIVA - Redirecionando para página sem licença');
      navigate('/license-required', { replace: true });
      return;
    }
  }, [user?.email, isVerifying, licenseError, hasLicense, authorizedBlockchains, navigate]);

  // Atualizar acessos quando o status de licença mudar
  useEffect(() => {
    if (!user?.email) return;
    
    const chainAccess: Record<string, boolean> = {};
    
    Object.values(blockchains).forEach((chain) => {
      // Durante a verificação, todas as blockchains ficam bloqueadas
      if (isVerifying) {
        chainAccess[chain.id as keyof typeof blockchains] = false;
      } else {
        // APENAS blockchains autorizadas podem ser acessadas (licenseRequired agora é true para todas)
        chainAccess[chain.id as keyof typeof blockchains] = 
          authorizedBlockchains.includes(chain.id);
      }
    });

    setAccessibleChains(chainAccess);
    setLoading(isVerifying);
  }, [hasLicense, authorizedBlockchains, user?.email, isVerifying]);

  const handleBlockchainSelect = async (chain: string) => {
    if (isRunning) {
      setShowConfirmDialog(true);
      return;
    }

    // Verificar se está em processo de verificação
    if (isVerifying) {
      alert(t('blockchainSelector.waitVerification'));
      return;
    }

    const hasAccess = accessibleChains[chain];

    if (!hasAccess) {
      const chainName = blockchains[chain]?.name || chain;
      const blockchain = blockchains[chain];
      
      if (blockchain?.licenseRequired) {
        alert(t('blockchainSelector.accessRequires', { name: chainName }));
      } else {
        alert(t('blockchainSelector.temporarilyUnavailable', { name: chainName }));
      }
      return;
    }

    // Blockchain selecionada
    setBlockchain(chain as "solana" | "bitcoin" | "ethereum" | "bsc" | "cardano" | "polkadot");
    
    // Navegar para a tela de mineração após seleção
    console.log(`[BlockchainSelector] ✅ Blockchain ${chain} selecionada - Redirecionando para mineração`);
    navigate('/app/mining', { replace: true });
  };

  const handleConfirmChange = () => {
    setIsRunning(false);
    setBlockchain(null);
    setShowConfirmDialog(false);
  };

  if (loading && Object.keys(accessibleChains).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
        <div className="animate-pulse">
          <Ghost className="w-16 h-16 text-primary ghost-logo" />
        </div>
      </div>
    );
  }

  if (licenseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
        <div className="ghost-card p-8 text-center max-w-md">
          <Ghost className="w-16 h-16 mx-auto text-danger/50 mb-4" />
          <p className="text-danger mb-4">{licenseError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects - Ghost Theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%), linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />
      
      {/* Ghost floating animations */}
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
      />
      <div 
        className="absolute bottom-40 right-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
        style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}
      />
      
      <div className="relative z-10 flex-col items-center justify-center w-full max-w-sm mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 animate-ghostFloat">
            <Ghost 
              className="w-full h-full" 
              style={{ color: 'var(--ghost-primary)' }}
            />
          </div>
          <h1 
            className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Ghost Wallet
          </h1>
          <p className="text-sm sm:text-base text-neutral-400">
            Selecione uma blockchain para começar
          </p>
          
          {/* Status de verificação de licenças */}
          <div className="mt-4">
            <LicenseVerificationStatus
              isVerifying={isVerifying}
              hasLicense={hasLicense}
              authorizedBlockchains={authorizedBlockchains}
              lastVerification={lastVerification}
              error={licenseError}
              onManualVerify={() => {
                console.log('[BlockchainSelector] Botão "Verificar" clicado - Forçando verificação real no servidor');
                verifyLicenses();
              }}
              className="border"
            />
          </div>

          {/* Banner do Modo Turbo */}
          {turboModeEnabled && (
            <div className="mt-4">
              <TurboModeBanner enabled={turboModeEnabled} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-xs mx-auto">
          {Object.values(blockchains).map((chain) => {
            const Icon = chain.icon;
            const isSelected = selectedBlockchain === chain.id;
            const hasAccess = accessibleChains[chain.id];

            return (
              <button
                key={chain.id}
                onClick={() => handleBlockchainSelect(chain.id)}
                className={`relative group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 
                  ${hasAccess && !isVerifying ? "cursor-pointer" : "opacity-75 cursor-not-allowed"}
                  ${isVerifying ? "animate-pulse" : ""}
                `}
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.3)',
                  borderColor: isSelected 
                    ? 'rgba(123, 104, 238, 0.5)' 
                    : hasAccess && !isVerifying 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(239, 68, 68, 0.3)',
                  boxShadow: isSelected ? '0 4px 15px rgba(123, 104, 238, 0.2)' : 'none',
                  '--chain-color': chain.color
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (hasAccess && !isVerifying && !isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasAccess && !isVerifying && !isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                disabled={!hasAccess || isVerifying}
              >
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${chain.gradient} opacity-0 
                  ${hasAccess && !isVerifying ? "group-hover:opacity-10" : ""} 
                  transition-opacity duration-300`}
                />

                <div className="flex relative flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                    style={{
                      backgroundColor: isSelected
                        ? `${chain.color}40`
                        : hasAccess
                          ? `${chain.color}20`
                          : `${chain.color}10`,
                    }}
                  >
                    <Icon
                      className={`w-6 h-6 transition-transform duration-300 ${hasAccess && !isVerifying ? "group-hover:scale-110" : ""}`}
                      style={{ color: chain.color }}
                    />
                  </div>

                  <div className="text-center">
                    <span
                      className="text-sm font-medium block"
                      style={{
                        color: hasAccess ? chain.color : `${chain.color}80`,
                      }}
                    >
                      {chain.name}
                    </span>
                    {!hasAccess && !isVerifying && (
                      <span className="text-xs text-danger/75 flex items-center justify-center gap-1 mt-1">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </span>
                    )}
                    {isVerifying && (
                      <span className="text-xs text-blue-400 flex items-center justify-center gap-1 mt-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Verificando...
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmChange}
        title="Interromper Mineração?"
        message="Para alterar a blockchain, precisamos interromper a mineração atual. Deseja continuar?"
      />

      <UpgradeAccessPopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        blockchain={blockchains.solana}
      />
    </div>
  );
}
