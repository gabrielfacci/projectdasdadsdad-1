import React, { useState, useEffect } from 'react';
import { Ghost, Save, AlertCircle, Check, Loader, Hash, Activity, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMining } from '../../context/MiningContext';
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

export default function AdminSettings() {
  const { user, profile, updateProfile } = useAuth();
  const { demoMode, setDemoMode, demoSettings, setDemoSettings } = useMining();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || ''
  });
  const [findAfterAttempts, setFindAfterAttempts] = useState(
    Number(demoSettings?.findAfterAttempts) || 15
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<LicenseCheckStatus | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: profile?.name || '',
      email: user?.email || ''
    });
  }, [profile, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile({
        name: formData.name
      });

      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Poll license check status when batch is running
  useEffect(() => {
    if (!batchId || (licenseStatus && licenseStatus.status !== 'running')) return;

    const interval = setInterval(async () => {
      try {
        const newStatus = await getDeploymentStatus(batchId);
        setLicenseStatus(newStatus);

        if (newStatus.status !== 'running') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId, licenseStatus]);

  const handleStartLicenseCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setLicenseStatus(null);

      const newBatchId = await startLicenseCheck();
      setBatchId(newBatchId);
      
      setSuccess('Verificação de licenças iniciada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar verificação de licenças');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDemoSettings = () => {
    try {
      const attempts = parseInt(findAfterAttempts.toString());
      
      if (isNaN(attempts) || attempts < 1) {
        throw new Error('Número de tentativas inválido');
      }

      setDemoSettings({
        findAfterAttempts: attempts
      });

      setSuccess('Configurações salvas com sucesso!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Ghost className="w-6 h-6 text-primary ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Configurações</h1>
          <p className="text-sm text-neutral-400">Configurações do administrador</p>
        </div>
      </div>

      <div className="ghost-card p-6 max-w-2xl">
        <h3 className="text-lg font-semibold ghost-text mb-4">Perfil</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="form-input bg-background-light/50"
            />
          </div>

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
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Demo Mode Settings */}
      {user?.is_admin && (
        <div className="ghost-card p-6 max-w-2xl mt-6">
          <h3 className="text-lg font-semibold ghost-text mb-4">Modo Demonstração</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-background-light/30 rounded-lg">
              <div className="flex-1">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="sr-only peer"
                  id="demo-mode"
                />
                <label 
                  htmlFor="demo-mode"
                  className="relative flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-6 bg-background-light rounded-full peer-checked:bg-primary/20 transition-all">
                    <div className="absolute left-1 top-1 bg-neutral-400 w-4 h-4 rounded-full transition-all peer-checked:bg-primary peer-checked:left-5"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ativar Modo Demonstração</p>
                    <p className="text-xs text-neutral-400">Simula encontrar carteiras automaticamente</p>
                  </div>
                </label>
              </div>
            </div>

            {demoMode && (
              <div>
                <label className="block text-sm font-medium mb-1">Encontrar carteira a cada X tentativas</label>
                <input
                  type="number"
                  value={findAfterAttempts}
                  onChange={(e) => setFindAfterAttempts(parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Define após quantas tentativas uma carteira será encontrada
                </p>
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
                onClick={handleSaveDemoSettings}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* License Check Section */}
      <div className="ghost-card p-6 max-w-2xl mt-6">
        <h3 className="text-lg font-semibold ghost-text mb-4">Verificação de Licenças</h3>
        
        <div className="space-y-4">
          {/* Status Card */}
          {licenseStatus && (
            <div className="bg-background-light/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold ghost-text">Status da Verificação</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  licenseStatus.status === 'completed' ? 'bg-success/20 text-success' :
                  licenseStatus.status === 'running' ? 'bg-primary/20 text-primary' :
                  'bg-danger/20 text-danger'
                }`}>
                  {licenseStatus.status === 'completed' ? 'Concluído' :
                   licenseStatus.status === 'running' ? 'Em Andamento' :
                   'Erro'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Progresso</span>
                    <span className="text-sm ghost-text">
                      {licenseStatus.processed_users} / {licenseStatus.total_users} usuários
                    </span>
                  </div>
                  <div className="h-2 bg-background-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(licenseStatus.processed_users / licenseStatus.total_users) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-success/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">Sucesso</span>
                    </div>
                    <span className="text-xl font-bold text-success">{licenseStatus.success_count}</span>
                  </div>

                  <div className="bg-danger/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-danger" />
                      <span className="text-sm text-danger">Erros</span>
                    </div>
                    <span className="text-xl font-bold text-danger">{licenseStatus.error_count}</span>
                  </div>
                </div>

                {licenseStatus.error_details && licenseStatus.error_details.length > 0 && (
                  <div className="bg-danger/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-danger" />
                      <span className="text-sm font-medium text-danger">Detalhes dos Erros</span>
                    </div>
                    <div className="space-y-2">
                      {licenseStatus.error_details.map((error: any, index: number) => (
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

          <div className="flex justify-end">
            <button 
              onClick={handleStartLicenseCheck}
              className="btn btn-primary relative"
              disabled={loading || (licenseStatus?.status === 'running')}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Iniciando...</span>
                </>
              ) : licenseStatus?.status === 'running' ? (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span>Verificação em Andamento</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Iniciar Verificação de Licenças</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}