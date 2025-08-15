import React, { useState, useEffect } from 'react';
import PlanSelectionPopup from './ui/PlanSelectionPopup';
import { Lock, TrendingUp, ArrowRight, Flame, Zap, Sparkles } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLicense } from '../context/LicenseContext';
import { blockchains } from '../lib/blockchains';
import { generateAllStats } from '../lib/stats'; 

interface TrendingBlockchainProps {
  onUpgrade: (chain: { name: string; color: string; icon: any; id?: string; stats?: any }) => void;
}

export default function TrendingBlockchain() {
  const { setBlockchain } = useBlockchain();
  const { checkBlockchainAccess } = useLicense();
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedChain, setSelectedChain] = useState<{
    name: string;
    color: string;
    icon: any;
    id?: string;
    stats?: {
      growth: string;
      potentialDaily: string;
      successRate: string;
      walletsFound: number;
    };
  } | null>(null);

  const [trendingChain, setTrendingChain] = useState<{
    id: string;
    name: string;
    color: string;
    icon: any;
    hasAccess: boolean;
    stats: any;
  } | null>(null);

  // Find a blockchain the user doesn't have access to
  useEffect(() => {
    const findTrendingChain = async () => {
      try {
        // Check access for all chains
        const accessPromises = Object.values(blockchains).map(async chain => ({
          chain,
          hasAccess: await checkBlockchainAccess(chain.id)
        }));

        const results = await Promise.all(accessPromises);

        // Only show chains user doesn't have access to
        const inaccessibleChains = results.filter(r => !r.hasAccess);

        if (inaccessibleChains.length === 0) {
          // If user has access to all chains, don't show trending section
          setTrendingChain(null);
          return;
        }

        // Choose random inaccessible chain
        const randomResult = inaccessibleChains[Math.floor(Math.random() * inaccessibleChains.length)];
        const stats = generateAllStats()[randomResult.chain.id];

        setTrendingChain({
          id: randomResult.chain.id,
          name: randomResult.chain.name,
          color: randomResult.chain.color,
          icon: randomResult.chain.icon,
          hasAccess: false,
          stats
        });
      } catch (error) {
        console.error('Error checking blockchain access:', error);
      }
    };

    findTrendingChain();
    const interval = setInterval(findTrendingChain, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkBlockchainAccess]);

  const handleChainClick = async () => {
    if (!trendingChain) return;

    const hasAccess = await checkBlockchainAccess(trendingChain.id);

    if (!hasAccess) {
      setShowPlanSelection(true);
      return;
    }

    setBlockchain(trendingChain.id as "solana" | "bitcoin" | "ethereum" | "bsc" | "cardano" | "polkadot");
  };

  const Icon = trendingChain?.icon;

  return !trendingChain ? null : (
    <>
    <div 
      className="p-3 sm:p-6 mb-4 sm:mb-8 relative overflow-hidden group rounded-xl backdrop-blur-md border"
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

      <div className="relative">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
          <div className="relative">
            <div 
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
            >
              <Flame 
                className="w-5 h-5 sm:w-6 sm:h-6 animate-[flame_3s_ease-in-out_infinite]" 
                style={{ color: 'var(--ghost-primary)' }}
              />
            </div>
            <div className="absolute -right-1 -top-1">
              <div className="relative">
                <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-500 animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 sm:w-5 sm:h-5 bg-yellow-500/30 animate-ping rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <h2 
              className="text-lg sm:text-xl font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Blockchain em Alta 🔥
            </h2>
            <p className="text-[14px] sm:text-sm text-neutral-400">Maior retorno nas últimas 24h</p>
          </div>
        </div>

        <div 
          className="relative rounded-xl p-2 sm:p-4 border transition-all duration-500 opacity-75 cursor-pointer backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(55, 55, 58, 0.4)',
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}
          onClick={handleChainClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.4)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.opacity = '0.75';
          }}
        >
          <div className="flex items-center gap-1.5 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: `${trendingChain.color}20` }}
              >
                <Icon className="w-5 h-5 sm:w-8 sm:h-8" style={{ color: trendingChain.color }} />
              </div>
              <div className="absolute -top-2 -right-2">
                <Lock 
                  className="w-3 h-3 sm:w-5 sm:h-5 animate-pulse" 
                  style={{ color: '#EF4444' }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1">
                  <div 
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full sm:text-xs whitespace-nowrap text-[#00ffab] text-[12px]"
                    style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981'
                    }}
                  >
                    {trendingChain.stats.growth}
                  </div>
                  <span className="text-[12px] sm:text-xs text-[#d6d6d6]">últimas 24h</span>
                </div>
              </div>
              <p className="text-neutral-400 text-[12px] sm:text-sm truncate mt-0.5 sm:mt-1">
                <span style={{ color: '#EF4444' }} className="text-[#fc5353]">Desbloqueie agora</span>
              </p>
            </div>

            {/* Stats - Visible on both mobile and desktop */}
            <div className="flex flex-col items-end gap-0.5 sm:gap-1 min-w-[70px] sm:min-w-[120px]">
              <div 
                className="text-sm sm:text-2xl font-bold whitespace-nowrap text-[#00ffaa]"
                style={{ color: '#10B981' }}
              >
                {trendingChain.stats.potentialDaily} {trendingChain.id === 'solana' ? 'SOL' :
                 trendingChain.id === 'bitcoin' ? 'BTC' :
                 trendingChain.id === 'ethereum' ? 'ETH' :
                 trendingChain.id === 'bsc' ? 'BSC' :
                 trendingChain.id === 'cardano' ? 'ADA' :
                 trendingChain.id === 'polkadot' ? 'DOT' :
                 trendingChain.id.toUpperCase()}
              </div>
              <div className="text-[12px] sm:text-sm text-[#d6d6d6]">Potencial diário</div>
            </div>

            <div className="group-hover:translate-x-2 transition-transform duration-500 flex-shrink-0">
              <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: trendingChain.color }} />
            </div>
          </div>

          <div className="mt-1.5 sm:mt-4 pt-1.5 sm:pt-4 border-t border-neutral-700/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                <span className="text-[12px] sm:text-sm text-neutral-400">
                  <span className="hidden sm:inline">Crescimento em 24h</span>
                  <span className="sm:hidden text-[#d6d6d6]">Crescimento</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[10px] sm:text-sm font-medium"
                  style={{ color: '#10B981' }}
                ></span>
                <span className="text-[12px] sm:text-sm text-[#d6d6d6]">({trendingChain.stats.walletsFound} carteiras encontradas recentes)</span>
              </div>
            </div>
            <div 
              className="h-1 sm:h-2 rounded-full mt-1 sm:mt-2 overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div 
                className="h-full rounded-full relative"
                style={{ 
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  width: `${Math.min(parseFloat(trendingChain.stats.growth.replace('+', '').replace('%', '')), 100)}%` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_2s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PlanSelectionPopup 
      isOpen={showPlanSelection}
      onClose={() => setShowPlanSelection(false)}
    />
    </>
  );
}