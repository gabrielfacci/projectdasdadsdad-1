
import React, { useState, useEffect } from 'react';
import { Ghost, Mail, ArrowRight, Loader, AlertCircle, Sparkles, UserPlus } from 'lucide-react';
import { signInWithEmail } from '../../lib/supabase';
import { supabase } from '../../lib/supabaseClient';
import { useReferral } from '../../context/ReferralContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { syncLicenseStatus } from '../../lib/licenseCheck';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../LanguageSelector';

interface LoginProps {
  onSuccess: () => void;
}

function Login({ onSuccess }: LoginProps) {
  const { t } = useTranslation();
  const { referralCode, setReferralCode } = useReferral();
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'idle' | 'submitting' | 'redirecting'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email) {
      setError(t('auth.emailPlaceholder'));
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setAuthState('submitting');
  
      // Verificar se o usuário existe e tem nome configurado
      const { data: userResult } = await supabase
        .rpc('check_user_exists_rpc', { p_email: email });

      // Se o usuário não existir ou não tiver nome, não permitir login
      if (!userResult || !userResult.name) {
        setError(t('auth.dontHaveAccount') + ' ' + t('auth.createAccount'));
        setAuthState('idle');
        setLoading(false);
        return;
      }
      
      const { data, error: authError } = await signInWithEmail(email, undefined);
  
      if (authError) {
        throw authError;
      }
  
      // Clear selected blockchain
      localStorage.removeItem('selected_blockchain');
  
      setAuthState('redirecting');
      
      const licenses = await syncLicenseStatus(email);
      const hasActiveLicense = licenses.some(license => license.status === 'active');

      localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
        hasLicense: hasActiveLicense,
        checkedAt: new Date().toISOString()
      }));

      // Call onSuccess callback to trigger authentication state update
      onSuccess();
      
      // Allow more time for auth context to update before navigation
      setTimeout(() => {
        if (hasActiveLicense) {
          navigate('/app', { replace: true });
        } else if (userResult.onboarding_completed) {
          navigate('/licenca-requerida', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }, 500);

    } catch (err: any) {
      setAuthState('idle');
      setError(
        err?.message?.toLowerCase().includes('invalid')
          ? t('auth.invalidEmail')
          : t('auth.loginError')
      );
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (authState === 'submitting') {
      return (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>{t('common.loading')}</span>
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

    return (
      <>
        <span>{t('auth.login')}</span>
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
        <div className="text-center mb-6">
          <motion.div 
            className="relative inline-block" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Ghost 
              className="w-24 h-24 mx-auto mb-4" 
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
            {t('auth.loginSubtitle')}
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
          transition={{ delay: 0.5, duration: 0.6 }}
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
              {t('auth.loginTitle')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                className={`w-full relative overflow-hidden group py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  loading || authState !== 'idle' ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{
                  background: loading || authState !== 'idle' 
                    ? 'rgba(39, 39, 42, 0.5)' 
                    : 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  border: 'none',
                  color: '#fff',
                  boxShadow: loading || authState !== 'idle' 
                    ? 'none' 
                    : '0 4px 15px rgba(123, 104, 238, 0.3)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  {getButtonContent()}
                </div>
              </motion.button>
              
              <div className="mt-6">
                <div className="relative flex items-center mb-4">
                  <div className="flex-grow border-t border-neutral-700/30"></div>
                  <span className="flex-shrink-0 px-3 text-sm text-neutral-500">{t('auth.dontHaveAccount')}</span>
                  <div className="flex-grow border-t border-neutral-700/30"></div>
                </div>
                
                <Link to="/auth/register">
                  <motion.div
                    className="relative rounded-xl p-3 border transition-all duration-300 cursor-pointer overflow-hidden group"
                    style={{
                      backgroundColor: 'rgba(39, 39, 42, 0.3)',
                      borderColor: 'rgba(255, 107, 107, 0.3)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="absolute inset-0 animate-pulse" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1))'
                      }}
                    />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}
                      >
                        <UserPlus className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{t('auth.register')}</h3>
                        <p className="text-xs text-neutral-400">{t('auth.registerSubtitle')}</p>
                      </div>
                      
                      <div className="group-hover:translate-x-2 transition-transform duration-500">
                        <ArrowRight className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
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

export default Login;
