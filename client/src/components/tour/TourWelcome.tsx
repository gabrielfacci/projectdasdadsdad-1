import React from 'react';
import { Ghost, Sparkles, ArrowRight, Gift, Wallet, Users, Check } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { useNavigate } from 'react-router-dom';

export default function TourWelcome() {
  const { setTourMode } = useTour();
  const navigate = useNavigate();

  const startTour = () => {
    setTourMode(true);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Ghost className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-primary ghost-logo mb-4 sm:mb-6" />
            <div className="absolute -right-4 -top-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold ghost-text mb-2 sm:mb-4">
            Bem-vindo ao Ghost Wallet
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 mb-6 sm:mb-8">
            Faça um tour gratuito e descubra o poder da mineração inteligente
          </p>
        </div>

        <div className="ghost-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
          
          <div className="relative space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-background-light/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 sm:mb-4">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Mineração Inteligente</h3>
                <p className="text-sm text-neutral-400">
                  Descubra como nossa tecnologia encontra carteiras com saldo automaticamente
                </p>
              </div>

              <div className="bg-background-light/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sistema de Referência</h3>
                <p className="text-sm text-neutral-400">
                  Ganhe recompensas por cada amigo que você trouxer para a plataforma
                </p>
              </div>
            </div>

            <div className="bg-background-light/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Durante o Tour Você Pode:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-success" />
                  </div>
                  <span>Usar o sistema de referência</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-success" />
                  </div>
                  <span>Ganhar recompensas reais</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-success" />
                  </div>
                  <span>Explorar todas as funcionalidades</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startTour}
              className="w-full btn btn-primary group"
            >
              <span>Começar Tour Gratuito</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}