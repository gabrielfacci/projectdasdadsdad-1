import React from 'react';
import { Sparkles, Zap, Flame, ArrowRight } from 'lucide-react';

const purchaseLinks = {
  bitcoin: 'https://go.perfectpay.com.br/PPU38CPJPCT',
  bsc: 'https://go.perfectpay.com.br/PPU38CPJPD8',
  cardano: 'https://go.perfectpay.com.br/PPU38CPJPDM',
  ethereum: 'https://go.perfectpay.com.br/PPU38CPJPD4',
  polkadot: 'https://go.perfectpay.com.br/PPU38CPJPDR',
  turbo: 'https://go.perfectpay.com.br/PPU38CPJPCT' // Using Bitcoin link for turbo as placeholder
};

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  blockchain: {
    name: string;
    color: string;
    icon: React.ElementType;
    id: string;
    stats?: {
      growth: string;
    };
  };
}

const UpgradePopup: React.FC<UpgradePopupProps> = ({ isOpen, onClose, blockchain }) => {
  if (!isOpen) return null;

  const Icon = blockchain.icon;
  const purchaseLink = 'https://global.disruptybr.com.br/kf1o3dp2tz';

  return (
    <div 
      className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-[100] p-4"
      style={{ backgroundColor: 'rgba(13, 10, 20, 0.9)' }}
    >
      <div 
        className="w-full max-w-sm rounded-2xl relative animate-ghostAppear my-auto backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.4)',
          borderColor: 'rgba(123, 104, 238, 0.4)',
          boxShadow: '0 20px 40px rgba(123, 104, 238, 0.3)'
        }}
      >
        {/* Removed the gradient animation div */}

        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center animate-ghostFloat"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Flame 
                  className="w-10 h-10" 
                  style={{ color: '#EF4444' }}
                />
                <Sparkles 
                  className="absolute -top-1 -right-1 w-5 h-5 animate-pulse" 
                  style={{ color: '#F59E0B' }}
                />
              </div>
            </div>

            <h2 
              className="text-2xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Modo Turbo
            </h2>
            <p className="text-neutral-400 text-sm max-w-[15rem] mx-auto mb-6">
              Acelere sua mineração em até <span 
                className="font-semibold"
                style={{ color: '#EF4444' }}
              >10x</span> e maximize seus resultados
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                window.open(purchaseLink, '_blank');
                onClose();
              }}
              className="btn text-white w-full group relative overflow-hidden transition-all duration-300 hover:scale-102 backdrop-blur-md border"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.3)';
              }}
            >
              <div className="relative flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Ativar Modo Turbo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={onClose}
              className="text-xs py-2 transition-colors duration-200"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              Continuar sem turbo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePopup;