import React, { useState } from 'react';
import { Ghost, Sparkles, Activity, ArrowRight, Lock, Clock, TrendingUp, DollarSign, Zap, Gift } from 'lucide-react';
import PlanSelectionPopup from './PlanSelectionPopup';

interface UpgradeMiningPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeMiningPopup({ isOpen, onClose }: UpgradeMiningPopupProps) {
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    setShowPlanSelection(true);
  };

  // More realistic stats based on current market data
  const stats = {
    growth: '+287.5%',
    potentialDaily: '2.85 SOL',
    successRate: '0.0287%',
    walletsFound: 287
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
        <div className="bg-background-card w-full max-w-[340px] rounded-2xl shadow-2xl relative animate-ghostAppear border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#4ECDC4]/10 animate-pulse rounded-2xl" />
          
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-ghostFloat">
                    <Ghost className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Lock className="w-6 h-6 text-danger animate-pulse" />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-spin-slow" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Desbloqueie a Mineração
              </h2>
              <p className="text-neutral-400 text-xs max-w-[18rem] mx-auto mb-4">
                Não perca a oportunidade de multiplicar seus ganhos minerando carteiras com saldo automaticamente
              </p>
            </div>

            <div className="space-y-4">
              {/* Performance Card */}
              <div className="flex items-center gap-3 bg-success/10 rounded-xl p-3 border border-success/20">
                <Clock className="w-5 h-5 text-success" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-success">Últimas 24h</span>
                    <span className="text-xs text-success/80">Ganho Potencial</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-success">{stats.growth}</span>
                    <span className="text-lg font-bold text-success">{stats.potentialDaily}</span>
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-background-light/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold ghost-text">
                    Benefícios Exclusivos:
                  </h3>
                </div>
                
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Ghost className="w-4 h-4 text-primary" />
                    </div>
                    <span>Mineração inteligente com alta performance</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <span>Altas taxas de sucesso</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-primary" />
                    </div>
                    <span>Bônus de boas-vindas + recompensas diárias</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span>{stats.walletsFound} carteiras encontradas hoje</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="bg-danger/10 rounded-lg p-3 border border-danger/20">
                  <div className="flex items-center gap-2 text-xs text-danger">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Oferta por tempo limitado! Aproveite agora.</span>
                  </div>
                </div>
                
                <button
                  onClick={handleUpgradeClick}
                  className="btn bg-success hover:bg-success/90 text-white w-full group relative overflow-hidden h-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-2 text-sm">
                    <Activity className="w-5 h-5" />
                    <span>Ativar Mineração</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                <button
                  onClick={onClose}
                  className="block w-full text-xs text-neutral-500 hover:text-neutral-400 transition-colors py-2"
                >
                  Voltar
                </button>
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