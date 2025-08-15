import React, { useEffect, useState, useMemo } from 'react';
import { Ghost, Copy, Check, PartyPopper, Sparkles } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

interface WalletFoundPopupProps {
  wallet: {
    publicKey: string;
    privateKey: string;
    balance: number;
  };
  onClose: () => void;
}

interface AnimatedGhost {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  speed: number;
  direction: number;
}

const WalletFoundPopup: React.FC<WalletFoundPopupProps> = ({ wallet, onClose }) => {
  const { currentBlockchain } = useBlockchain();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [ghosts, setGhosts] = useState<AnimatedGhost[]>([]);
  const symbol = currentBlockchain?.symbol || 'SOL';

  useEffect(() => {
    // Tocar som mais realista de sucesso quando carteira for encontrada
    const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3");
    successSound.volume = 0.7;
    successSound.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
    
    // Create flying ghosts with more varied animations
    const ghostCount = 30;
    const newGhosts = Array.from({ length: ghostCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: 0.3 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      speed: 1 + Math.random() * 3,
      direction: Math.random() > 0.5 ? 1 : -1
    }));
    setGhosts(newGhosts);

    // Animate ghosts
    const interval = setInterval(() => {
      setGhosts(prev => prev.map(ghost => {
        let newX = ghost.x + (Math.sin(Date.now() * 0.001) * ghost.speed * ghost.direction);
        let newY = ghost.y - ghost.speed;

        // Reset position if ghost goes off screen
        if (newY < -50) {
          newY = window.innerHeight + 50;
          newX = Math.random() * window.innerWidth;
        }
        if (newX < -50) newX = window.innerWidth + 50;
        if (newX > window.innerWidth + 50) newX = -50;

        return {
          ...ghost,
          x: newX,
          y: newY,
          rotation: ghost.rotation + ghost.speed * ghost.direction
        };
      }));
    }, 16); // 60fps animation

    // Auto-close after 10 seconds
    const timeout = setTimeout(onClose, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onClose]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* Celebration Effects Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Flying Ghosts */}
        {ghosts.map(ghost => (
          <div
            key={ghost.id}
            className="absolute transition-transform duration-100 ease-out"
            style={{
              left: `${ghost.x}px`,
              top: `${ghost.y}px`,
              transform: `scale(${ghost.scale}) rotate(${ghost.rotation}deg)`,
              opacity: 0.8,
            }}
          >
            <Ghost className="w-8 h-8 text-primary animate-bounce" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Popup Content */}
      <div className="bg-background-card max-w-lg w-full rounded-2xl shadow-xl relative animate-ghostAppear p-6 border border-primary/20 z-50">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse">
              <PartyPopper className="w-24 h-24 text-primary/50" />
            </div>
            <Ghost className="w-24 h-24 text-primary animate-float" />
          </div>
        </div>

        <div className="text-center mb-8 mt-8">
          <h2 className="text-3xl font-bold ghost-text mb-2">Carteira Encontrada!</h2>
          <p className="text-2xl font-semibold text-success">
            {wallet.balance.toFixed(4)} {symbol}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-background-light rounded-lg p-4">
            <label className="block text-sm text-neutral-400 mb-2">Chave Pública</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={wallet.publicKey}
                className="flex-1 bg-transparent border-none text-primary font-mono text-sm p-0 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(wallet.publicKey, 'public')}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {copiedField === 'public' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-background-light rounded-lg p-4">
            <label className="block text-sm text-neutral-400 mb-2">Chave Privada</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={wallet.privateKey}
                className="flex-1 bg-transparent border-none text-secondary font-mono text-sm p-0 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(wallet.privateKey, 'private')}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {copiedField === 'private' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary w-full mt-6"
        >
          Continuar Minerando
        </button>
      </div>
    </div>
  );
};

export default WalletFoundPopup;