import React, { useState, useEffect } from 'react';
import { Ghost, Activity, AlertCircle, Check, Loader, Users, RefreshCw } from 'lucide-react';
import { startLicenseCheck, getDeploymentStatus } from '../../lib/licenseCheck';

interface LicenseCheckStatus {
  batch_id: string;
  total_users: number;
  processed_users: number;
  success_count: number;
  error_count: number;
  status: string;
  error_details?: any;
}

export default function AdminLicenseCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<LicenseCheckStatus | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  // Poll status when batch is running
  useEffect(() => {
    if (!batchId || (status && status.status !== 'running')) return;

    const interval = setInterval(async () => {
      try {
        const newStatus = await getDeploymentStatus(batchId);
        setStatus(newStatus);

        if (newStatus.status !== 'running') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId, status]);

  const handleStartCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setStatus(null);

      const newBatchId = await startLicenseCheck();
      setBatchId(newBatchId);
      
      setSuccess('Verificação iniciada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
          <Ghost className="w-6 h-6 text-[#6C63FF] ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Verificação de Licenças</h1>
          <p className="text-sm text-neutral-400">Verificar status das licenças dos usuários</p>
        </div>
      </div>

      <div className="ghost-card p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Status Card */}
          {status && (
            <div className="bg-background-light/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#6C63FF]" />
                  <h3 className="text-lg font-semibold ghost-text">Status da Verificação</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  status.status === 'completed' ? 'bg-success/20 text-success' :
                  status.status === 'running' ? 'bg-[#6C63FF]/20 text-[#6C63FF]' :
                  'bg-danger/20 text-danger'
                }`}>
                  {status.status === 'completed' ? 'Concluído' :
                   status.status === 'running' ? 'Em Andamento' :
                   'Erro'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Progresso</span>
                    <span className="text-sm ghost-text">
                      {status.processed_users} / {status.total_users} usuários
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-700/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#6C63FF] transition-all duration-500"
                      style={{ width: `${(status.processed_users / status.total_users) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-success/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">Sucesso</span>
                    </div>
                    <span className="text-xl font-bold text-success">{status.success_count}</span>
                  </div>

                  <div className="bg-danger/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-danger" />
                      <span className="text-sm text-danger">Erros</span>
                    </div>
                    <span className="text-xl font-bold text-danger">{status.error_count}</span>
                  </div>
                </div>

                {status.error_details && status.error_details.length > 0 && (
                  <div className="bg-danger/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-danger" />
                      <span className="text-sm font-medium text-danger">Detalhes dos Erros</span>
                    </div>
                    <div className="space-y-2">
                      {status.error_details.map((error: any, index: number) => (
                        <div key={index} className="text-xs text-danger">
                          {error.email}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-danger bg-danger/10 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg p-3">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleStartCheck}
              className="btn btn-primary"
              disabled={loading || (status?.status === 'running')}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Iniciando...</span>
                </>
              ) : status?.status === 'running' ? (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span>Verificação em Andamento</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Iniciar Verificação</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}