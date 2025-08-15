import React from 'react';
import { Ghost, Sparkles, Gift, Wallet, ArrowRight, Crown, Target } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

// Assumed to be defined elsewhere
function generateUTMUrl(url) {
  //Implementation to generate UTM URL
  return url + "?utm_source=tourdashboard"; //Example UTM Parameter
}

export default function TourDashboard() {
  const { currentBlockchain } = useBlockchain();
  const symbol = currentBlockchain?.symbol || 'SOL';

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      {/* Tour Banner */}
      <div className="ghost-card p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse" />

        <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Ghost className="w-7 h-7 sm:w-10 sm:h-10 text-primary ghost-logo" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg sm:text-2xl font-bold ghost-text mb-1 sm:mb-2">
              Modo Tour Ativado
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              Explore todas as funcionalidades e ganhe recompensas reais através do sistema de referência!
            </p>
          </div>

          <a 
            href={generateUTMUrl("https://go.perfectpay.com.br/PPU38CP0O8E")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary whitespace-nowrap group w-full sm:w-auto"
          >
            <Wallet className="w-5 h-5" />
            <span>Ativar Mineração</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Demo Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card group">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-value">98.7%</div>
          <div className="stat-label">Taxa de Sucesso</div>
        </div>

        <div className="stat-card group">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
            <Wallet className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-value">1,234</div>
          <div className="stat-label">Carteiras Encontradas</div>
        </div>

        <div className="stat-card group">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
            <Gift className="w-6 h-6 text-success group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-value">567</div>
          <div className="stat-label">Referências Ativas</div>
        </div>

        <div className="stat-card group">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-value">123.45 {symbol}</div>
          <div className="stat-label">Total Minerado</div>
        </div>
      </div>

      {/* Call to Action Card */}
      <div className="ghost-card p-4 sm:p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Ghost className="w-8 h-8 sm:w-10 sm:h-10 text-primary ghost-logo" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold ghost-text mb-2 sm:mb-3">
                Desbloqueie Todo o Potencial
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 mb-3 sm:mb-4">
                Ative sua licença agora e comece a minerar carteiras com saldo automaticamente. 
                Aproveite nossa tecnologia avançada e maximize seus resultados!
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={generateUTMUrl("https://go.perfectpay.com.br/PPU38CP0O8E")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex-1 group"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Começar a Minerar</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <button className="btn bg-background-light hover:bg-background-light/80 flex-1">
                  <Gift className="w-5 h-5" />
                  <span>Sistema de Referência</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}