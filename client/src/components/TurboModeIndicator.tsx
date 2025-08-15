import { motion } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

interface TurboModeIndicatorProps {
  enabled: boolean;
  className?: string;
}

export function TurboModeIndicator({ enabled, className = "" }: TurboModeIndicatorProps) {
  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Zap className="w-4 h-4" />
      </motion.div>
      
      <span className="text-yellow-200">MODO TURBO</span>
      
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Sparkles className="w-3 h-3 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
}

// Componente maior para destaque em páginas principais
export function TurboModeBanner({ enabled, className = "" }: TurboModeIndicatorProps) {
  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4 ${className}`}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 animate-pulse" />
      
      <div className="relative flex items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-2 rounded-full bg-yellow-500/20"
        >
          <Zap className="w-6 h-6 text-yellow-300" />
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-yellow-200 font-bold text-lg">
            MODO TURBO ATIVO
          </h3>
          <p className="text-yellow-300/80 text-sm">
            Velocidade de mineração aumentada em 3x
          </p>
        </div>
        
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}