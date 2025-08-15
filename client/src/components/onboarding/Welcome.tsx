import React, { useState, useEffect, useCallback } from 'react';
import { Ghost, ArrowRight, Gift, Wallet, Users, Check, Loader, Sparkles, Zap, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLicense } from '../../context/LicenseContext';
import { supabase } from '../../lib/supabaseClient';
import { syncLicenseStatus } from '../../lib/licenseCheck';

interface WelcomeProps {
  onComplete: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [name, setName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { refreshLicenses } = useLicense();

  // Initialize name from profile only once
  useEffect(() => {
    if (profile?.name && !name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const handleNext = useCallback(async () => {
    if (currentStep === 0 && !name.trim()) {
      setError('Por favor, insira seu nome para continuar');
      return;
    }

    setError(null);

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setLoading(true);
    
    try {
      // Get user ID from email first
      if (!user?.email) {
        console.error('No user email available:', user);
        throw new Error('User email is required');
      }

      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { 
          p_email: user.email 
        });

      if (userIdError) {
        console.error('Error getting user ID:', userIdError);
        throw userIdError;
      }

      if (!userIdResult?.success || !userIdResult?.id) {
        console.error('Invalid user ID result:', userIdResult);
        throw new Error('Could not get user ID');
      }

      // Update profile in database
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile_rpc', {
          p_user_id: userIdResult.id,
          p_name: name.trim(),
          p_onboarding_completed: true
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      if (!updateResult?.success) {
        console.error('Update failed:', updateResult);
        throw new Error(updateResult?.error || 'Failed to update profile');
      }

      // Store profile data
      localStorage.setItem('ghost-wallet-profile', JSON.stringify({
        name: name.trim(),
        onboarding_completed: true
      }));

      // Refresh licenses before completing
// Sync licenses from external API
await syncLicenseStatus(user.email);

// Refresh licenses from Supabase
await refreshLicenses();

      
      // Complete onboarding
      onComplete();
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'Erro ao salvar suas informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentStep, name, onComplete, user?.email, refreshLicenses]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(null);
  }, []);

  const steps = [
    {
      title: 'Bem-vindo ao Ghost Wallet',
      description: 'A plataforma mais avançada para mineração de carteiras cripto',
      icon: Ghost,
      features: [
        'Interface moderna e intuitiva',
        'Tecnologia de ponta',
        'Suporte 24/7',
        'Comunidade ativa'
      ]
    },
    {
      title: 'Mineração Inteligente',
      description: 'Nossa tecnologia avançada encontra carteiras com saldo automaticamente',
      icon: Wallet,
      features: [
        'Algoritmo de última geração',
        'Alta taxa de sucesso',
        'Múltiplas blockchains',
        'Otimização automática'
      ]
    },
    {
      title: 'Sistema de Referência',
      description: 'Ganhe recompensas por cada amigo que você trouxer',
      icon: Gift,
      features: [
        'Ganhos em tempo real',
        'Bônus progressivos',
        'Rankings e conquistas',
        'Recompensas exclusivas'
      ]
    },
    {
      title: 'Comunidade VIP',
      description: 'Faça parte de uma comunidade em crescimento',
      icon: Crown,
      features: [
        'Acesso antecipado',
        'Eventos exclusivos',
        'Networking ativo',
        'Suporte prioritário'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="w-full max-w-4xl">
        <div className="ghost-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse" />
          
          <div className="relative">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    index <= currentStep ? 'bg-[#6C63FF]' : 'bg-neutral-700/20'
                  }`}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Column - Content */}
              <div>
                <div className="mb-6">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                      {React.createElement(steps[currentStep].icon, {
                        className: 'w-8 h-8 text-primary ghost-logo'
                      })}
                    </div>
                    <div className="absolute -right-2 -top-2">
                      <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold ghost-text mb-2">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-neutral-400">
                    {steps[currentStep].description}
                  </p>
                </div>

                {currentStep === 0 && (
                  profile?.name ? (
                    <div className="mb-6">
                      <div className="flex items-center gap-3 bg-success/10 rounded-lg p-4 border border-success/20">
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="text-success font-medium">Bem-vindo de volta, {profile.name}!</p>
                          <p className="text-sm text-success/80">Continue sua jornada na mineração</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
                        Como podemos te chamar? *
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
                              : 'border-neutral-700/20 focus:border-primary focus:ring-1 focus:ring-primary'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Crown className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                      </div>
                      {error && (
                        <p className="text-danger text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {error}
                        </p>
                      )}
                    </div>
                  )
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {steps[currentStep].features.map((feature, index) => (
                    <div 
                      key={index}
                      className="bg-background-light/30 rounded-lg p-3 backdrop-blur-sm border border-neutral-700/20 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-neutral-300">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className={`btn btn-primary flex-1 relative overflow-hidden group ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : currentStep === steps.length - 1 ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Começar</span>
                        </>
                      ) : (
                        <>
                          <span>Próximo</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Column - Illustration */}
              <div className="hidden md:block">
                <div className="aspect-square rounded-2xl bg-background-light/30 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    {React.createElement(steps[currentStep].icon, {
                      className: 'w-32 h-32 text-primary ghost-logo animate-float'
                    })}
                    <div className="absolute -top-4 -right-4">
                      <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}