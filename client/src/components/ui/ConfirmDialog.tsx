import React from 'react';
import { Ghost, Sparkles } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card max-w-md w-full mx-auto rounded-2xl shadow-xl relative animate-ghostAppear">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse rounded-2xl" />
        
        <div className="relative p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-float">
              <Ghost className="w-6 h-6 text-primary ghost-logo" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-primary animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold ghost-text mb-2">{title}</h3>
              <p className="text-neutral-400">{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn bg-background-light hover:bg-background-light/80 flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-primary flex-1"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;