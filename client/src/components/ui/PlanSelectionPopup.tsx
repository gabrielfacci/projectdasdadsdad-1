import React from 'react';
import { createPortal } from 'react-dom';
import { Ghost, Diamond, Crown, Sparkles, ArrowRight, Check, Rocket } from 'lucide-react';
import { generateUTMUrl } from '../../lib/utils';

interface PlanSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanSelectionPopup({ isOpen, onClose }: PlanSelectionPopupProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<'start' | 'black' | 'diamond' | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'start',
      name: 'Plano Start',
      icon: Rocket,
      color: '#4ECDC4',
      price: '49.90',
      originalPrice: '97.00',
      features: [
        'Acesso à Blockchain Solana',
        'Mineração inteligente 24h',
        'Suporte básico',
        'Dashboard personalizado',
      ]
    },
    {
      id: 'black',
      name: 'Plano Black',
      icon: Crown,
      color: '#FFD700',
      price: '147.00',
      features: [
        'Acesso à Blockchain Solana',
        'Acesso à Blockchain Bitcoin',
        'Acesso à Blockchain Ethereum',
        'Suporte prioritário',
      ]
    },
    {
      id: 'diamond',
      name: 'Plano Diamond',
      icon: Diamond,
      color: '#B9F2FF',
      price: '247.00',
      features: [
        'Acesso a TODAS as Blockchains',
        'Suporte VIP 24/7',
        'Recompensas premium',
        'Acesso antecipado a novidades',
      ]
    }
  ];

  const getPurchaseLink = () => {
    if (selectedPlan === 'start') {
      return 'https://global.disruptybr.com.br/vnvlt';
    }

    if (selectedPlan === 'black') {
      return 'https://global.disruptybr.com.br/gu8irclcpz';
    }

    if (selectedPlan === 'diamond') {
      return 'https://global.disruptybr.com.br/hpp1v9v1ji';
    }

    return null;
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-[99999] p-2 sm:p-4 backdrop-blur-sm"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="w-full max-w-4xl h-[90vh] sm:h-auto rounded-2xl shadow-2xl relative animate-ghostAppear overflow-hidden transform scale-100 transition-all duration-300" 
        style={{ 
          backgroundColor: '#0d0a14',
          border: '2px solid rgba(123, 104, 238, 0.4)',
          boxShadow: '0 25px 80px -12px rgba(123, 104, 238, 0.4), 0 0 0 1px rgba(123, 104, 238, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          animation: 'modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="absolute inset-0 rounded-2xl" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(123, 104, 238, 0.1) 0%, transparent 70%)',
          animation: 'ghost-pulse 3s ease-in-out infinite'
        }} />

        <div className="relative h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 backdrop-blur-md border-b p-4 sm:p-6" style={{
            backgroundColor: 'rgba(13, 10, 20, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <div className="text-center">
              <div className="relative inline-block">
                <Ghost className="w-12 h-12 sm:w-16 sm:h-16 ghost-logo" style={{ 
                  color: 'var(--ghost-primary)',
                  filter: 'drop-shadow(0 0 10px rgba(123, 104, 238, 0.5))'
                }} />
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-4 text-white" style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 2px rgba(123, 104, 238, 0.15)'
              }}>
                Escolha seu Plano
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm">
                Selecione o melhor plano para começar sua jornada na mineração
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6" style={{ backgroundColor: '#0d0a14' }}>
            <div className="grid grid-cols-1 gap-6">
              {/* Plans */}
              <div className="space-y-3 sm:space-y-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan.id as 'start' | 'black' | 'diamond');
                      }}
                      className={`w-full text-left p-4 sm:p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                        isSelected 
                          ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20' 
                          : 'border-white/10 bg-background-light/10 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                      style={{ 
                        backgroundColor: isSelected ? 'rgba(123, 104, 238, 0.15)' : 'rgba(39, 39, 42, 0.3)',
                        borderColor: isSelected ? 'var(--ghost-primary)' : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {/* Badge de Oferta para o Plano Start */}
                      {plan.id === 'start' && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div 
                            className="text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse mt-[10px] mb-[10px] ml-[10px] mr-[10px] text-left pt-[4px] pb-[4px] pl-[4px] pr-[4px]"
                            style={{
                              background: 'linear-gradient(135deg, #ff6b6b, #ffa726)',
                              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
                            }}
                          >
                            OFERTA!
                          </div>
                        </div>
                      )}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                          <div 
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isSelected ? 'scale-110 shadow-lg' : 'group-hover:scale-110'
                            }`}
                            style={{ 
                              backgroundColor: isSelected ? `${plan.color}30` : `${plan.color}20`,
                              boxShadow: isSelected ? `0 4px 15px ${plan.color}40` : 'none'
                            }}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: plan.color }} />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-white" style={{ 
                              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent'
                            }}>
                              {plan.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="sm:text-2xl font-bold text-[16px]" style={{
                                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent'
                              }}>
                                R$ {plan.price}
                              </p>
                              {'originalPrice' in plan && plan.originalPrice && (
                                <div className="flex flex-col">
                                  <span className="text-xs line-through" style={{ color: '#ff6b6b' }}>
                                    De R$ {plan.originalPrice}
                                  </span>
                                  <span className="text-xs font-medium" style={{ 
                                    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent'
                                  }}>
                                    OFERTA ESPECIAL
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2">
                              <div 
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                                  boxShadow: '0 0 10px rgba(123, 104, 238, 0.5)'
                                }}
                              >
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--ghost-primary)' }} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="sticky bottom-0 left-0 right-0 p-4 sm:p-6 backdrop-blur-md border-t z-50"
            style={{ 
              backgroundColor: 'rgba(13, 10, 20, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="btn flex-1 sm:flex-none order-2 sm:order-1 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              >
                Voltar
              </button>

              <a
                href={getPurchaseLink() ? generateUTMUrl(getPurchaseLink()!) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={`btn flex-1 sm:flex-none order-1 sm:order-2 group transition-all duration-300 ${
                  selectedPlan 
                    ? 'hover:scale-105 shadow-lg' 
                    : 'cursor-not-allowed'
                }`}
                style={{ 
                  pointerEvents: selectedPlan ? 'auto' : 'none',
                  background: selectedPlan 
                    ? 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))' 
                    : 'rgba(39, 39, 42, 0.5)',
                  color: selectedPlan ? '#fff' : '#888',
                  boxShadow: selectedPlan ? '0 4px 15px rgba(123, 104, 238, 0.3)' : 'none',
                  border: 'none'
                }}
              >
                <span>Ativar Agora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}