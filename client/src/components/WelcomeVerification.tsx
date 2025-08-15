
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Sparkles, ArrowRight, CheckCircle, Loader, Shield, Brain, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { syncLicenseStatus } from '../lib/licenseCheck';

export default function WelcomeVerification() {
  const { user, profile, reloadUserProfile } = useAuth();
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [progress, setProgress] = useState<number>(0);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const navigate = useNavigate();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize name from profile
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  // Progress bar animation
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current as NodeJS.Timeout);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (50ms * 100)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  // License verification logic
  useEffect(() => {
    const verifyLicense = async () => {
      if (!user?.email) return;
      
      try {
        console.log('[WelcomeVerification] Iniciando verificação de licença para:', user.email);
        
        // Verify license using existing function
        const licenses = await syncLicenseStatus(user.email);
        const hasActiveLicense = licenses.some(license => license.status === 'active');
        
        console.log('[WelcomeVerification] Status da licença:', hasActiveLicense ? 'ATIVA ✅' : 'INATIVA ❌');
        
        // Update local license status
        setLicenseStatus(hasActiveLicense ? 'active' : 'inactive');
        
        // Force reload user profile to update license status
        await reloadUserProfile();
        
        // Set redirect timeout for 5 seconds
        redirectTimeout.current = setTimeout(() => {
          setRedirecting(true);
          
          // Redirect based on license status
          if (hasActiveLicense) {
            console.log('[WelcomeVerification] Licença ATIVA ✅ - Redirecionando para seleção de blockchain');
            navigate('/blockchain', { replace: true });
          } else if (profile?.onboarding_completed) {
            console.log('[WelcomeVerification] Licença INATIVA ❌ + Onboarding concluído - Redirecionando para licença requerida');
            navigate('/licenca-requerida', { replace: true });
          } else {
            console.log('[WelcomeVerification] Licença INATIVA ❌ + Onboarding não concluído - Redirecionando para onboarding');
            navigate('/onboarding', { replace: true });
          }
        }, 5000);
      } catch (err) {
        console.error('[WelcomeVerification] Erro na verificação de licença:', err);
        setError('Erro na verificação. Redirecionando para verificação manual...');
        
        // Fallback: navigate to onboarding in case of error
        redirectTimeout.current = setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 5000);
      }
    };

    verifyLicense();
  }, [user?.email, navigate, profile?.onboarding_completed, reloadUserProfile]);

  // Save user name if provided
  const saveUserName = async () => {
    if (!name.trim() || !user?.email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user ID from email
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: user.email });

      if (userIdError || !userIdResult?.success || !userIdResult?.id) {
        throw new Error('Não foi possível encontrar o usuário');
      }

      // Update user profile
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile_rpc', {
          p_user_id: userIdResult.id,
          p_name: name.trim(),
          p_onboarding_completed: profile?.onboarding_completed || false
        });

      if (updateError || !updateResult?.success) {
        throw new Error(updateResult?.error || 'Erro ao salvar perfil');
      }

      // Store profile in localStorage
      localStorage.setItem('ghost-wallet-profile', JSON.stringify({
        ...profile,
        name: name.trim()
      }));

      console.log('[WelcomeVerification] Nome salvo com sucesso:', name);
    } catch (err: any) {
      console.error('[WelcomeVerification] Erro ao salvar nome:', err);
      setError(err.message || 'Erro ao salvar suas informações');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(null);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUserName();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8 animate-ghostAppear">
          <div className="relative inline-block">
            <div className="relative">
              <Ghost className="w-24 h-24 mx-auto text-[#6C63FF] ghost-logo mb-6" />
              <div className="absolute -right-4 -top-4">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="welcome-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold ghost-text">
                {profile?.name 
                  ? `Bem-vindo(a), ${profile.name}!` 
                  : 'Bem-vindo(a) ao Ghost Wallet!'}
              </h1>
              
              {!profile?.name && (
                <form onSubmit={handleNameSubmit} className="mt-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-300 text-left">
                      Como podemos te chamar?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Seu nome"
                        className={`w-full bg-background-light/50 rounded-lg px-4 py-3 text-sm border transition-all outline-none ${
                          error 
                            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
                            : 'border-neutral-700/20 focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]'
                        }`}
                      />
                    </div>
                    {error && (
                      <p className="text-danger text-sm flex items-center gap-2 text-left">
                        <Zap className="w-4 h-4" />
                        {error}
                      </p>
                    )}
                    <button 
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="btn btn-sm btn-primary mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <span>Confirmar</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="ghost-card p-6 animate-ghostSlideIn relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/5 to-[#8B7AFF]/5 animate-pulse" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                {licenseStatus === 'checking' ? (
                  <Loader className="w-6 h-6 text-[#6C63FF] animate-spin" />
                ) : licenseStatus === 'active' ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <Shield className="w-6 h-6 text-[#6C63FF]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400">
                  {licenseStatus === 'checking' 
                    ? 'Verificando sua licença...' 
                    : licenseStatus === 'active'
                    ? 'Licença ativa detectada!'
                    : 'Preparando sua experiência...'}
                </p>
                <p className="font-medium ghost-text">
                  {licenseStatus === 'checking' 
                    ? 'Aguarde um momento' 
                    : licenseStatus === 'active'
                    ? 'Redirecionando para o app'
                    : 'Bem-vindo ao Ghost Wallet'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-neutral-700/30 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full ${
                  licenseStatus === 'active' 
                    ? 'bg-[#4CAF50]' 
                    : licenseStatus === 'inactive'
                    ? 'bg-[#6C63FF]'
                    : 'bg-[#6C63FF] animate-pulse'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="p-3 rounded-lg bg-background-light/30 border border-neutral-700/20">
                <div className="flex flex-col items-center">
                  <Brain className="w-5 h-5 text-[#6C63FF] mb-1" />
                  <p className="text-xs text-neutral-400">Análise</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background-light/30 border border-neutral-700/20">
                <div className="flex flex-col items-center">
                  <Shield className="w-5 h-5 text-[#6C63FF] mb-1" />
                  <p className="text-xs text-neutral-400">Segurança</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background-light/30 border border-neutral-700/20">
                <div className="flex flex-col items-center">
                  <Ghost className="w-5 h-5 text-[#6C63FF] mb-1 ghost-logo" />
                  <p className="text-xs text-neutral-400">Ghost</p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-neutral-400 mb-2">
              {redirecting 
                ? 'Redirecionando...' 
                : `Carregando sua experiência (${progress}%)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
