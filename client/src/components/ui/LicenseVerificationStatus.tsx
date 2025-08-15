import React from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
// Componente simplificado de botão para evitar dependência
interface ButtonProps {
  variant?: 'outline';
  size?: 'sm';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden group px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    style={{
      background: disabled 
        ? 'rgba(39, 39, 42, 0.5)' 
        : 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
      border: 'none',
      color: '#fff',
      boxShadow: disabled 
        ? 'none' 
        : '0 4px 15px rgba(123, 104, 238, 0.3)',
      transform: disabled ? 'none' : 'scale(1)',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.4)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 104, 238, 0.3)';
      }
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    <div className="relative flex items-center justify-center gap-2">
      {children}
    </div>
  </button>
);

interface LicenseVerificationStatusProps {
  isVerifying: boolean;
  hasLicense: boolean;
  authorizedBlockchains: string[];
  lastVerification: string | null;
  error: string | null;
  onManualVerify: () => void;
  className?: string;
}

export default function LicenseVerificationStatus({
  isVerifying,
  hasLicense,
  authorizedBlockchains,
  lastVerification,
  error,
  onManualVerify,
  className = ''
}: LicenseVerificationStatusProps) {
  const formatLastVerification = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca verificado';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    return date.toLocaleDateString();
  };

  const getStatusIcon = () => {
    if (isVerifying) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
    }
    
    if (error) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    
    if (hasLicense) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  const getStatusText = () => {
    if (isVerifying) {
      return 'Verificando licenças...';
    }
    
    if (error) {
      return 'Erro na verificação';
    }
    
    if (hasLicense) {
      return `${authorizedBlockchains.length} blockchain${authorizedBlockchains.length !== 1 ? 's' : ''} liberada${authorizedBlockchains.length !== 1 ? 's' : ''}`;
    }
    
    return 'Nenhuma licença ativa';
  };

  const getStatusColor = () => {
    if (isVerifying) return 'text-blue-400';
    if (error) return 'text-red-400';
    if (hasLicense) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${className}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-xs text-neutral-500">
            Última verificação: {formatLastVerification(lastVerification)}
          </span>
          {error && (
            <span className="text-xs text-red-400 mt-1">
              {error}
            </span>
          )}
        </div>
      </div>
      
      <Button
        onClick={() => {
          console.log('[LicenseVerificationStatus] ⚡ Botão "Verificar" clicado - Iniciando verificação REAL no servidor externo');
          onManualVerify();
        }}
        disabled={isVerifying}
        className="min-w-[90px]"
      >
        {isVerifying ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          'Verificar'
        )}
      </Button>
    </div>
  );
}