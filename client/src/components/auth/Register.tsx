import React, { useState, useEffect } from 'react';
import { Ghost, Mail, ArrowRight, Loader, AlertCircle, Sparkles, User, ArrowLeft, Check } from 'lucide-react';
import { signInWithEmail } from '../../lib/supabase';
import { supabase } from '../../lib/supabaseClient';
import { useReferral } from '../../context/ReferralContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { syncLicenseStatus } from '../../lib/licenseCheck';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../LanguageSelector';

interface RegisterProps {
  onSuccess: () => void;
}

function Register({ onSuccess }: RegisterProps) {
  const { t } = useTranslation();
  const { referralCode, setReferralCode } = useReferral();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'idle' | 'submitting' | 'verifying' | 'syncing' | 'redirecting' | 'completed'>('idle');
  const [progressStep, setProgressStep] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    const extractReferralCode = () => {
      let extractedCode = null;

      // Captura ?ref=CODE na query string
      const queryParams = new URLSearchParams(location.search);
      extractedCode = queryParams.get('ref');

      // Captura /ref/CODE no pathname
      if (!extractedCode) {
        const match = location.pathname.match(/^\/ref\/([A-Za-z0-9]+)/);
        extractedCode = match ? match[1] : null;
      }

      // Se encontrou um código de referência, atualiza o estado
      if (extractedCode) {
        setReferralCode(extractedCode);
      }
    };

    extractReferralCode();
  }, [location.search, location.pathname, setReferralCode]);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setError(t('auth.emailPlaceholder'));
      isValid = false;
    }

    if (!name.trim()) {
      setNameError(t('auth.invalidEmail'));
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError(t('auth.passwordTooShort'));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNameError(null);
      setAuthState('submitting');
      setProgressStep(1);
      setProgressText(t('common.loading') + '...');

      // Verificar se o usuário já existe
      const { data: userExistsResult } = await supabase
        .rpc('check_user_exists_rpc', { p_email: email });

      // Se o usuário já existe e tem nome configurado, não permitir cadastro duplicado
      if (userExistsResult && userExistsResult.name) {
        setError('Este email já está cadastrado. Por favor, use a opção de login.');
        setAuthState('idle');
        setLoading(false);
        setProgressStep(0);
        setProgressText('');
        return;
      }

      setProgressStep(2);
      setProgressText('Criando sua conta...');

      // Prosseguir com o registro usando o código de referral
      const { data, error: authError } = await signInWithEmail(email, referralCode || undefined);

      if (authError) {
        throw authError;
      }

      // Agora que o usuário foi autenticado, obter o ID para definir o nome
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { 
          p_email: email 
        });

      if (userIdError || !userIdResult?.success || !userIdResult?.id) {
        throw new Error('Não foi possível obter o ID do usuário');
      }

      setProgressStep(3);
      setProgressText('Configurando seu perfil...');

      // Atualizar o perfil do usuário com o nome
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile_rpc', {
          p_user_id: userIdResult.id,
          p_name: name.trim(),
          p_onboarding_completed: false
        });

      if (updateError || !updateResult?.success) {
        console.error('Erro ao atualizar perfil RPC:', updateError);

        // Tentativa alternativa de atualização direta na tabela users
        const { error: directUpdateError } = await supabase
          .from('users')
          .update({ 
            name: name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('email', email);

        if (directUpdateError) {
          console.error('Erro na atualização direta:', directUpdateError);
          throw new Error('Não foi possível atualizar o perfil');
        }
      }

      // Verificar se o nome foi realmente salvo
      const { data: verifyUser } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single();

      console.log('Nome verificado no banco:', verifyUser?.name);

      // Armazenar dados do perfil localmente
      localStorage.setItem('ghost-wallet-profile', JSON.stringify({
        name: name.trim(),
        onboarding_completed: false
      }));

      // Remover código de referência após registro bem-sucedido
      if (referralCode) {
        localStorage.removeItem('referral_code');
      }

      // Limpar blockchain selecionado
      localStorage.removeItem('selected_blockchain');

      setProgressStep(4);
      setProgressText(t('license.verifying') + '...');
      setAuthState('verifying');

      // Verificar status da licença com o Supabase e API externa
        try {
          // Log para rastreamento
          console.log('[GhostWallet][Register] Início da verificação de licença para:', email);
          
          // Verificação de flag de debug/teste
          const temLicencaAtiva = localStorage.getItem('forcar_licenca_ativa') === 'true';
          
          let hasActiveLicense = temLicencaAtiva;
          
          if (!temLicencaAtiva) {
            try {
              // Verificar diretamente com syncLicenseStatus que chama RPC e também usa fallbacks
              console.log('[GhostWallet][Register] Chamando syncLicenseStatus para verificação...');
              const licenses = await syncLicenseStatus(email);
              hasActiveLicense = licenses.some(license => license.status === 'active');
              
              console.log('[GhostWallet][Register] Licenças verificadas:', licenses);
              console.log('[GhostWallet][Register] Resultado da verificação de licença:', hasActiveLicense ? 'ATIVA ✅' : 'INATIVA ❌');
              
              setProgressStep(5);
              setProgressText(t('common.loading') + '...');
              setAuthState('syncing');
            } catch (err) {
              console.error('[GhostWallet][Register] Erro ao verificar licenças, considerando inativa:', err);
              // Em caso de erro, consideramos que não tem licença por segurança
              hasActiveLicense = false;
            }
          } else {
            console.log('[GhostWallet][Register] FLAG DE TESTE: Forçando licença ativa via localStorage');
          }

          // Atualiza informação de licença no localStorage
          localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
            hasLicense: hasActiveLicense,
            checkedAt: new Date().toISOString()
          }));

          // Atualizar o perfil do usuário com a informação da licença
          try {
            const { data: userIdResult, error: userIdError } = await supabase
              .rpc('get_user_id_by_email_rpc', { p_email: email });

            if (userIdError) {
              console.error('[GhostWallet][Register] Erro ao obter ID do usuário:', userIdError);
              throw userIdError;
            }

            if (!userIdResult?.id) {
              console.error('[GhostWallet][Register] ID do usuário não encontrado para:', email);
              throw new Error('ID do usuário não encontrado');
            }

            console.log('[GhostWallet][Register] Atualizando status de licença no perfil, ID:', userIdResult.id);
            
            const { data: updateResult, error: updateError } = await supabase
              .rpc('update_user_license_status_v4', {
                p_user_id: userIdResult.id,
                p_has_license: hasActiveLicense
              });

            if (updateError) {
              console.error('[GhostWallet][Register] Erro ao atualizar status de licença:', updateError);
              // Continuamos com o redirecionamento mesmo com erro na atualização
            } else {
              console.log('[GhostWallet][Register] Status de licença atualizado com sucesso');
            }
          } catch (updateError) {
            console.error('[GhostWallet][Register] Erro ao processar atualização de status:', updateError);
            // Continuamos com o redirecionamento mesmo com erro
          }

          // Remove duplicate setAuthState call
          
          setProgressStep(6);
          setProgressText(t('common.loading') + '...');
          setAuthState('completed');
          
          console.log('[GhostWallet][Register] ✅ Cadastro concluído com sucesso!');
          console.log('[GhostWallet][Register] Status de licença:', hasActiveLicense ? 'ATIVA' : 'INATIVA');
          
          // Call onSuccess callback to trigger authentication state update
          onSuccess();
          
          // Brief delay to show completion state, then redirect
          setTimeout(() => {
            setAuthState('redirecting');
            setProgressText(t('common.loading') + '...');
            
            setTimeout(() => {
              if (hasActiveLicense) {
                console.log('[GhostWallet][Register] Redirecionando para blockchain...');
                navigate('/blockchain', { replace: true });
              } else {
                console.log('[GhostWallet][Register] Redirecionando para onboarding...');
                navigate('/onboarding', { replace: true });
              }
            }, 200);
          }, 800);
        } catch (licenseCheckError) {
          console.error('[GhostWallet][Register] Erro fatal durante verificação de licença:', licenseCheckError);
          setAuthState('completed');
          
          // Atualiza informação de licença no localStorage como inativa em caso de erro
          localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
            hasLicense: false,
            checkedAt: new Date().toISOString(),
            error: true
          }));
          
          // Call onSuccess callback even in error case
          onSuccess();
          
          // Brief delay then redirect
          setTimeout(() => {
            setAuthState('redirecting');
            setProgressText(t('common.loading') + '...');
            
            setTimeout(() => {
              console.log('[GhostWallet][Register] Redirecionando para onboarding (fallback)...');
              navigate('/onboarding', { replace: true });
            }, 200);
          }, 400);
        }

    } catch (err: any) {
      setAuthState('idle');
      setError(
        err?.message?.toLowerCase().includes('invalid')
          ? t('auth.invalidEmail')
          : t('auth.registerError')
      );
    } finally {
      setLoading(false);
      setProgressStep(0);
      setProgressText('');
    }
  };

  const getButtonContent = () => {
    if (authState === 'submitting') {
      return (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>{t('common.loading')}...</span>
        </>
      );
    }

    if (authState === 'verifying') {
      return (
        <>
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>{t('license.verifying')}</span>
        </>
      );
    }

    if (authState === 'syncing') {
      return (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>{t('common.loading')}...</span>
        </>
      );
    }

    if (authState === 'redirecting') {
      return (
        <>
          <Ghost className="w-5 h-5 animate-bounce" />
          <span>{t('common.loading')}...</span>
        </>
      );
    }
    
    if (authState === 'completed') {
      return (
        <>
          <Check className="w-5 h-5 text-green-400" />
          <span>Concluído!</span>
        </>
      );
    }

    return (
      <>
        <span>{t('auth.createAccount')}</span>
        <ArrowRight className="w-5 h-5" />
      </>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden fade-in"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects - Ghost Theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%), linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />
      
      {/* Ghost floating animations */}
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
      />
      <div 
        className="absolute bottom-40 right-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
        style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div 
            className="relative inline-block" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Ghost 
              className="w-24 h-24 mx-auto mb-6" 
              style={{ color: 'var(--ghost-primary)' }}
            />
            <div className="absolute -right-4 -top-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Ghost Wallet
          </motion.h1>
          <motion.p 
            className="text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {t('auth.registerSubtitle')}
          </motion.p>
        </div>

        <motion.div 
          className="p-6 relative overflow-hidden rounded-2xl border backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(123, 104, 238, 0.1)'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div 
            className="absolute inset-0 animate-pulse" 
            style={{
              background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
            }}
          />
          


          <div className="relative">
            <h2 
              className="text-xl font-bold mb-6 text-center"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {t('auth.register')}
            </h2>

            <p className="text-neutral-400 text-sm text-center mb-6">
              {t('auth.registerSubtitle')}
            </p>

            {/* Progress Indicator */}
            {progressStep > 0 && (
              <motion.div 
                className="mb-6 p-4 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.4)',
                  borderColor: 'rgba(123, 104, 238, 0.3)',
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-300">
                    {progressText}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {progressStep}/6
                  </span>
                </div>
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--ghost-primary), var(--ghost-secondary))'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(progressStep / 6) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                {authState === 'completed' && (
                  <motion.div
                    className="flex items-center mt-2 text-green-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('auth.registerSuccess')}</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-2">
                  {t('auth.name')}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError(null);
                    }}
                    placeholder={t('auth.namePlaceholder')}
                    disabled={authState !== 'idle'}
                    className={`w-full rounded-lg pl-12 pr-4 py-3 text-sm border transition-all outline-none backdrop-blur-sm ${
                      nameError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'hover:border-opacity-50 focus:ring-1'
                    } ${authState !== 'idle' ? 'opacity-75 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: 'rgba(39, 39, 42, 0.5)',
                      borderColor: nameError ? '#ef4444' : 'rgba(123, 104, 238, 0.3)',
                      color: '#fff'
                    }}
                    onFocus={(e) => {
                      if (!nameError) {
                        e.target.style.borderColor = 'var(--ghost-primary)';
                        e.target.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!nameError) {
                        e.target.style.borderColor = 'rgba(123, 104, 238, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <User className={`w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    nameError ? 'text-danger' : 'text-neutral-400'
                  }`} />
                </div>
                {nameError && (
                  <div className="flex items-center gap-2 text-danger text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {nameError}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder={t('auth.emailPlaceholder')}
                    disabled={authState !== 'idle'}
                    className={`w-full rounded-lg pl-12 pr-4 py-3 text-sm border transition-all outline-none backdrop-blur-sm ${
                      error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'hover:border-opacity-50 focus:ring-1'
                    } ${authState !== 'idle' ? 'opacity-75 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: 'rgba(39, 39, 42, 0.5)',
                      borderColor: error ? '#ef4444' : 'rgba(123, 104, 238, 0.3)',
                      color: '#fff'
                    }}
                    onFocus={(e) => {
                      if (!error) {
                        e.target.style.borderColor = 'var(--ghost-primary)';
                        e.target.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!error) {
                        e.target.style.borderColor = 'rgba(123, 104, 238, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <Mail className={`w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    error ? 'text-danger' : 'text-neutral-400'
                  }`} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-danger text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading || authState !== 'idle'}
                className={`w-full relative overflow-hidden group py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  loading || authState !== 'idle' ? 'cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{
                  background: loading || authState !== 'idle' 
                    ? 'linear-gradient(135deg, rgba(123, 104, 238, 0.6), rgba(147, 112, 219, 0.6))' 
                    : 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  border: 'none',
                  color: '#fff',
                  boxShadow: loading || authState !== 'idle' 
                    ? '0 4px 15px rgba(123, 104, 238, 0.2)' 
                    : '0 4px 15px rgba(123, 104, 238, 0.3)'
                }}
                whileHover={authState === 'idle' ? { 
                  scale: 1.02,
                  y: -1,
                  boxShadow: '0 8px 25px rgba(123, 104, 238, 0.4)'
                } : {}}
                whileTap={authState === 'idle' ? { 
                  scale: 0.98,
                  y: 0 
                } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  {getButtonContent()}
                </div>
              </motion.button>

              <div className="mt-6">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-neutral-700/30"></div>
                  <span className="flex-shrink-0 px-3 text-sm text-neutral-500">{t('auth.alreadyHaveAccount')}</span>
                  <div className="flex-grow border-t border-neutral-700/30"></div>
                </div>

                <motion.div 
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    to="/auth" 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border text-neutral-300 transition-all"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(39, 39, 42, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.3)';
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>{t('auth.backToLogin')}</span>
                  </Link>
                </motion.div>
              </div>

              <div className="text-center text-xs text-neutral-500 mt-6">
                <p>
                  {t('auth.agreeTerms')}
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;