import React from 'react';
import { Ghost, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { useNavigate } from 'react-router-dom';

interface NewUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewUserPopup({ isOpen, onClose }: NewUserPopupProps) {
  const { startTour } = useTour();
  const navigate = useNavigate();

  const handleStartTour = () => {
    startTour();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
      <div className="bg-background-card w-full max-w-sm rounded-2xl shadow-2xl relative animate-ghostAppear my-auto border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 animate-pulse rounded-2xl" />
        
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-float">
                <Ghost className="w-10 h-10 text-primary" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Novo por aqui?
            </h2>
            <p className="text-neutral-400 text-sm max-w-[15rem] mx-auto mb-6">
              Faça um tour gratuito e descubra o poder da mineração inteligente
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleStartTour}
              className="btn bg-primary hover:bg-primary/90 text-white w-full group relative overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                <span>Começar Tour Gratuito</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <a
              href={generateUTMUrl("https://go.perfectpay.com.br/PPU38CP0O8E")}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors py-2 text-center"
            >
              Ativar mineração agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}