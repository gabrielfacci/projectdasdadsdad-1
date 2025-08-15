import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  Clock,
  Wallet,
  Ghost,
  Sparkles,
  Flame,
  Zap,
  ArrowRight,
  Hexagon,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useMining } from "../context/MiningContext";
import { useBlockchain } from "../context/BlockchainContext";
import { useLicense } from "../context/LicenseContext";
import { useTranslation } from "../hooks/useTranslation";
import TrendingBlockchain from "./TrendingBlockchain";
import UpgradePopup from "./ui/UpgradePopup";
import UpgradeAccessPopup from "./ui/UpgradeAccessPopup";
import {
  BitcoinChart,
  EthereumChart,
  BSCChart,
  CardanoChart,
  PolkadotChart,
  SolanaChart,
} from "./charts";

// Componente principal Dashboard
const Dashboard: React.FC = () => {
  const { hashRate, attempts, foundWallets } = useMining();
  const { currentBlockchain } = useBlockchain();
  const { t } = useTranslation();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);
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

  const ChartComponent = {
    solana: SolanaChart,
    bitcoin: BitcoinChart,
    ethereum: EthereumChart,
    bsc: BSCChart,
    cardano: CardanoChart,
    polkadot: PolkadotChart,
  }[currentBlockchain?.id || "solana"];

  const totalBalance = foundWallets.reduce((acc, w) => acc + w.balance, 0);
  const symbol = currentBlockchain?.symbol || "SOL";

  const handleUpgrade = (chain: {
    name: string;
    color: string;
    icon: any;
    id?: string;
    stats?: any;
  }) => {
    setSelectedChain(chain);
    if (chain.id) {
      setShowAccessPopup(true);
    } else {
      setShowUpgradePopup(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 relative">
      <div className="mb-4 sm:mb-8">
        <p 
          className="text-lg font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {t('dashboard.welcome')}
        </p>
      </div>

      <div 
        className="p-4 sm:p-8 mb-4 sm:mb-8 relative overflow-hidden group rounded-xl backdrop-blur-md border"
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
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
            >
              <Ghost 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ color: 'var(--ghost-primary)' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-neutral-400 text-xs sm:text-sm">
                {t('dashboard.estimatedBalance')}
              </p>
              <div className="flex items-center gap-2 overflow-hidden">
                <h2 
                  className="text-2xl sm:text-4xl font-bold truncate"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {totalBalance.toFixed(4)} {symbol}
                </h2>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div 
          className="p-3 sm:p-4 rounded-xl backdrop-blur-md border transition-all duration-300 group hover:scale-105"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <Activity 
            className="w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" 
            style={{ color: 'var(--ghost-primary)' }}
          />
          <div className="text-lg sm:text-xl font-bold text-white truncate">{hashRate} H/s</div>
          <div className="text-xs sm:text-sm text-neutral-400">{t('dashboard.hashRate')}</div>
        </div>

        <div 
          className="p-3 sm:p-4 rounded-xl backdrop-blur-md border transition-all duration-300 group hover:scale-105"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <Clock 
            className="w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" 
            style={{ color: 'var(--ghost-secondary)' }}
          />
          <div className="text-lg sm:text-xl font-bold text-white truncate">{attempts}</div>
          <div className="text-xs sm:text-sm text-neutral-400">{t('miningExtras.totalAttempts')}</div>
        </div>

        <div 
          className="p-3 sm:p-4 rounded-xl backdrop-blur-md border transition-all duration-300 group hover:scale-105"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <Wallet 
            className="w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" 
            style={{ color: '#10B981' }}
          />
          <div className="text-lg sm:text-xl font-bold text-white truncate">{foundWallets.length}</div>
          <div className="text-xs sm:text-sm text-neutral-400">{t('dashboard.foundWallets')}</div>
        </div>

        <div 
          className="p-3 sm:p-4 rounded-xl backdrop-blur-md border transition-all duration-300 group hover:scale-105"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <TrendingUp 
            className="w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" 
            style={{ color: 'var(--ghost-primary)' }}
          />
          <div className="text-lg sm:text-xl font-bold text-white truncate">
            {((foundWallets.length / Math.max(attempts, 1)) * 100).toFixed(4)}%
          </div>
          <div className="text-xs sm:text-sm text-neutral-400">{t('dashboard.successRate')}</div>
        </div>
      </div>
      {/* Trending Blockchain */}
      <TrendingBlockchain onUpgrade={handleUpgrade} />
      <div className="mb-4 sm:mb-8">{ChartComponent && <ChartComponent />}</div>

      <div 
        className="p-4 sm:p-6 rounded-xl backdrop-blur-md border transition-all duration-300"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Ghost 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            style={{ color: 'var(--ghost-primary)' }}
          />
          <h3 
            className="text-base sm:text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {t('dashboard.networkStatus')}
          </h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">{t('dashboard.successRate')}</span>
              <span 
                className="text-sm truncate ml-2 font-medium"
                style={{ color: 'var(--ghost-primary)' }}
              >
                {((foundWallets.length / Math.max(attempts, 1)) * 100).toFixed(
                  4,
                )}
                %
              </span>
            </div>
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  width: `${(foundWallets.length / Math.max(attempts, 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Saldo Médio</span>
              <span 
                className="text-sm truncate ml-2 font-medium"
                style={{ color: 'var(--ghost-secondary)' }}
              >
                {foundWallets.length > 0
                  ? `${(totalBalance / foundWallets.length).toFixed(4)} ${symbol}`
                  : `0.0000 ${symbol}`}
              </span>
            </div>
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{ 
                  background: 'linear-gradient(135deg, var(--ghost-secondary), var(--ghost-primary))',
                  width: foundWallets.length > 0 ? "100%" : "0%" 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showAccessPopup && selectedChain && (
        <UpgradeAccessPopup
          isOpen={showAccessPopup}
          onClose={() => setShowAccessPopup(false)}
          blockchain={selectedChain}
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
    </div>
  );
};

export default Dashboard;