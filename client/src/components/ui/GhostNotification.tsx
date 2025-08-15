import React, { useEffect, useRef } from 'react';
import { Ghost, Sparkles, X } from 'lucide-react';

export interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const GhostNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  useEffect(() => {
    const playSound = async () => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('/notification.mp3');
          audioRef.current.volume = 0.5;
        }
        
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Erro ao tocar som:', error);
          });
        }
      } catch (err) {
        console.error('Erro ao tocar som de notificação:', err);
      }
    };
    
    playSound();
  }, []);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/20 text-success border-success/20';
      case 'error':
        return 'bg-danger/20 text-danger border-danger/20';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-primary/20 text-primary border-primary/20';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-ghostSlideIn">
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-md shadow-xl max-w-sm transform hover:scale-105 transition-all duration-200 ${getTypeStyles()} animate-pulse`}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-ghostShine" />
        
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <Ghost className="w-6 h-6 animate-ghostFloat" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold truncate pr-4">{title}</p>
                <button 
                  onClick={onClose}
                  className="text-current opacity-60 hover:opacity-100 transition-opacity -mr-2 -mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm opacity-90 mt-1">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostNotification;