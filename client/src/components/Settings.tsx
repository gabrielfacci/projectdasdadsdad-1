import React, { useState, useEffect } from 'react';
import { Ghost, Save, AlertCircle, Check, Loader, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMining } from '../context/MiningContext';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

export default function Settings() {
  const { t } = useTranslation();
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

  useEffect(() => {
    setFormData({
      name: profile?.name || '',
      email: user?.email || ''
    });
  }, [profile, user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile in localStorage
      const stored = localStorage.getItem('ghost-wallet-profile');
      const currentProfile = stored ? JSON.parse(stored) : {};
      localStorage.setItem('ghost-wallet-profile', JSON.stringify({
        ...currentProfile,
        name: formData.name.trim()
      }));
      
      await updateProfile();
      setSuccess('Suas informações foram atualizadas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Não foi possível atualizar suas informações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDemoSettings = () => {
    try {
      const attempts = parseInt(findAfterAttempts.toString());
      if (attempts < 1) {
        throw new Error('O número de tentativas deve ser maior que 0');
      }

      // Save settings to localStorage
      const newSettings = { ...demoSettings, findAfterAttempts: attempts };
      localStorage.setItem('demo_settings', JSON.stringify(newSettings));
      setDemoSettings(newSettings);
      setSuccess('Configurações salvas com sucesso!');
      setError(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const hasChanges = formData.name.trim() !== profile?.name;

  return (
    <div 
      className="relative min-h-screen"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects - Ghost Theme */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 600px 400px at 20% 30%, rgba(123, 104, 238, 0.12), transparent 60%),
            radial-gradient(ellipse 800px 500px at 80% 70%, rgba(147, 112, 219, 0.12), transparent 60%),
            radial-gradient(ellipse 400px 300px at 50% 50%, rgba(139, 92, 246, 0.08), transparent 70%),
            linear-gradient(135deg, rgba(123, 104, 238, 0.03), rgba(147, 112, 219, 0.03))
          `
        }}
      />
      {/* Ghost floating animations */}
      <div 
        className="absolute top-20 left-20 w-48 h-48 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ 
          backgroundColor: 'rgba(123, 104, 238, 0.06)',
          animation: 'ghost-pulse 4s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute bottom-40 right-32 w-64 h-64 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"
        style={{ 
          backgroundColor: 'rgba(147, 112, 219, 0.06)',
          animation: 'ghost-pulse 6s ease-in-out infinite reverse'
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 pt-[50px] pb-[50px]">
        <div className="flex items-center gap-3 mt-[30px] mb-[30px]">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
          >
            <Ghost 
              className="w-6 h-6 ghost-logo" 
              style={{ color: 'var(--ghost-primary)' }}
            />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold ghost-text"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {t('settings.title')}
            </h1>
            <p className="text-sm text-neutral-400">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* Profile Section */}
        <div 
          className="p-6 max-w-2xl rounded-xl backdrop-blur-md border mb-6"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)',
            borderColor: 'rgba(123, 104, 238, 0.3)',
            boxShadow: '0 8px 32px rgba(123, 104, 238, 0.15)'
          }}
        >
          <div 
            className="absolute inset-0 rounded-xl animate-pulse pointer-events-none" 
            style={{
              background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
            }}
          />
          
          <div className="relative">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {t('settings.userProfile')}
            </h3>
            
            <div className="space-y-4">

              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {t('auth.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                  className="w-full rounded-lg px-4 py-3 text-sm border outline-none transition-all backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.5)',
                    borderColor: 'rgba(123, 104, 238, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ghost-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full rounded-lg px-4 py-3 text-sm border outline-none opacity-75 backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.3)',
                    borderColor: 'rgba(123, 104, 238, 0.15)'
                  }}
                />
              </div>

              {error && (
                <div 
                  className="flex items-center gap-2 text-danger rounded-lg p-3 backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div 
                  className="flex items-center gap-2 text-success rounded-lg p-3 backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading || !hasChanges}
                  className={`btn backdrop-blur-md border transition-all duration-300 hover:scale-102 ${(!hasChanges || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: loading || !hasChanges 
                      ? 'rgba(55, 55, 58, 0.4)'
                      : 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    borderColor: 'rgba(123, 104, 238, 0.5)',
                    boxShadow: loading || !hasChanges 
                      ? 'none'
                      : '0 8px 32px rgba(123, 104, 238, 0.3)',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && hasChanges) {
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(123, 104, 238, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && hasChanges) {
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(123, 104, 238, 0.3)';
                    }
                  }}
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
        </div>

        {/* Demo Mode Section (Admin Only) */}
        {user?.role === 'admin' && (
          <div 
            className="p-6 max-w-2xl rounded-xl backdrop-blur-md border relative"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.4)',
              borderColor: 'rgba(123, 104, 238, 0.3)',
              boxShadow: '0 8px 32px rgba(123, 104, 238, 0.15)'
            }}
          >
            <div 
              className="absolute inset-0 rounded-xl animate-pulse pointer-events-none" 
              style={{
                background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
              }}
            />
            
            <div className="relative">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Modo Demonstração
              </h3>
              
              <div className="space-y-4">
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.4)',
                    borderColor: 'rgba(123, 104, 238, 0.2)'
                  }}
                >
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
                  <div 
                    className="w-10 h-6 rounded-full transition-all"
                    style={{
                      backgroundColor: demoMode 
                        ? 'rgba(123, 104, 238, 0.2)' 
                        : 'rgba(55, 55, 58, 0.6)'
                    }}
                  >
                    <div 
                      className="absolute left-1 top-1 w-4 h-4 rounded-full transition-all"
                      style={{
                        backgroundColor: demoMode 
                          ? 'var(--ghost-primary)' 
                          : '#9CA3AF',
                        transform: demoMode ? 'translateX(16px)' : 'translateX(0)'
                      }}
                    />
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
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    Encontrar carteira a cada X tentativas
                  </div>
                </label>
                <input
                  type="number"
                  value={findAfterAttempts}
                  onChange={(e) => setFindAfterAttempts(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg px-4 py-3 text-sm border outline-none transition-all backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.5)',
                    borderColor: 'rgba(123, 104, 238, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ghost-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  min="1"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Define após quantas tentativas uma carteira será encontrada
                </p>
              </div>
            )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveDemoSettings}
                    className="btn backdrop-blur-md border transition-all duration-300 hover:scale-102"
                    style={{
                      background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                      borderColor: 'rgba(123, 104, 238, 0.5)',
                      boxShadow: '0 8px 32px rgba(123, 104, 238, 0.3)',
                      color: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(123, 104, 238, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(123, 104, 238, 0.3)';
                    }}
                  >
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}