import React from 'react';
import { Shield, ShieldCheck, ShieldX, RefreshCw, Clock } from 'lucide-react';
import { useRealtimeLicenseSync } from '../../lib/realtimeLicenseSync';

interface LicenseStatusIndicatorProps {
  userEmail: string | null;
  className?: string;
}

export default function LicenseStatusIndicator({ userEmail, className = "" }: LicenseStatusIndicatorProps) {
  const { status, syncNow } = useRealtimeLicenseSync(userEmail);

  const handleManualSync = async () => {
    if (userEmail && !status.syncInProgress) {
      try {
        await syncNow();
      } catch (error) {
        console.error('Erro ao sincronizar licença:', error);
      }
    }
  };

  const getStatusIcon = () => {
    if (status.syncInProgress) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (status.hasLicense) {
      return <ShieldCheck className="w-4 h-4 text-green-500" />;
    }
    
    return <ShieldX className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (status.syncInProgress) {
      return "Sincronizando...";
    }
    
    if (status.hasLicense) {
      const blockchainsText = status.authorizedBlockchains.length > 0 
        ? status.authorizedBlockchains.join(', ').toUpperCase()
        : 'Nenhuma';
      return `Licença Ativa - ${blockchainsText}`;
    }
    
    return "Licença Inativa";
  };

  const getStatusColor = () => {
    if (status.syncInProgress) return "text-blue-600";
    if (status.hasLicense) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {status.lastSync && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Última sync: {new Date(status.lastSync).toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {!status.syncInProgress && (
        <button
          onClick={handleManualSync}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Sincronizar agora"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
}