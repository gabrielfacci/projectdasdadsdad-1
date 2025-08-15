import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, checkSessionHealth, clearSessionData, type User, type Session } from '../lib/supabase';
import { loginUser, updateUser } from '../lib/api';
import { syncLicenseStatus } from '../lib/licenseCheck';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: {
    name: string | null;
    onboarding_completed: boolean;
    hasActiveLicense?: boolean;
    adminMode?: boolean;
  } | null;
  loading: boolean;
  session: Session | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  updateProfile: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  isReturningUser: boolean;
  toggleAdminMode: () => Promise<void>;
  reloadUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    session: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  const fetchProfile = useCallback(async (email: string) => {
    try {
      // Get user profile
      const { data: userResult, error: userError } = await supabase
        .rpc('check_user_exists_rpc', { p_email: email });

      if (userError) {
        console.error('Error checking user:', userError);
        return {
          name: null,
          onboarding_completed: false,
          hasActiveLicense: false
        };
      }

      // Check local license status first to avoid multiple API calls
      const cachedLicenseStatus = localStorage.getItem('ghost-wallet-license-status');
      let hasActiveLicense = false;
      
      if (cachedLicenseStatus) {
        try {
          const parsed = JSON.parse(cachedLicenseStatus);
          hasActiveLicense = parsed.hasLicense === true;
          console.log('Usando status de licença em cache:', hasActiveLicense);
        } catch (e) {
          console.warn('Erro ao ler cache de licença:', e);
        }
      }
      
      // Only sync if no cache or cache is old
      if (!cachedLicenseStatus) {
        const licenses = await syncLicenseStatus(email);
        hasActiveLicense = licenses.some(license => license.status === 'active');
      }

      return {
        name: userResult?.name || null,
        onboarding_completed: userResult?.onboarding_completed || false,
        hasActiveLicense: hasActiveLicense || false
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        name: null,
        onboarding_completed: false,
        hasActiveLicense: false
      };
    }
  }, []);

  const reloadUserProfile = useCallback(async () => {
    if (!state.user?.email) return;
    
    try {
      // Verificar licença diretamente para garantir informações atualizadas
      console.log('[GhostWallet][AuthContext] Recarregando perfil do usuário com verificação de licença');
      const licenses = await syncLicenseStatus(state.user.email);
      const hasActiveLicense = licenses.some(license => license.status === 'active');
      
      // Obter demais informações do perfil
      const baseProfile = await fetchProfile(state.user.email);
      
      // Combinar informações
      const updatedProfile = {
        ...baseProfile,
        hasActiveLicense: hasActiveLicense
      };
      
      console.log('[GhostWallet][AuthContext] Status de licença atualizado:', hasActiveLicense);
      
      // Atualizar estado
      setState(prev => ({
        ...prev,
        profile: updatedProfile
      }));
      
      // Atualizar localStorage para manter consistência
      localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
        hasLicense: hasActiveLicense,
        checkedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error('[GhostWallet][AuthContext] Erro ao recarregar perfil:', err);
    }
  }, [state.user?.email, fetchProfile]);

  const handleAuthStateChange = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        if (!session.user.email) {
          console.error('No email found in session user');
          setState(prev => ({ ...prev, loading: false }));
          navigate('/auth', { replace: true });
          return;
        }

        let profile;
        try {
          profile = await fetchProfile(session.user.email);
        } catch (err) {
          console.error('Error fetching profile:', err);
          profile = { 
            name: null, 
            onboarding_completed: false, 
            hasActiveLicense: false 
          };
        }
        
        setIsReturningUser(true);
        setState({
          user: session.user,
          profile,
          loading: false,
          session,
        });

        // Tentar verificar licenças ativas com o Supabase
        try {
          // Primeiro, vamos verificar se há uma licença/status salvo no localStorage
          const storedLicenseStatus = localStorage.getItem('ghost-wallet-license-status');
          let hasActiveLicense = false;
          
          if (storedLicenseStatus) {
            try {
              const parsedStatus = JSON.parse(storedLicenseStatus);
              hasActiveLicense = parsedStatus.hasLicense === true;
              
              // Se o status foi verificado recentemente (últimas 24h), usamos ele
              const lastChecked = new Date(parsedStatus.checkedAt || 0);
              const isRecent = (Date.now() - lastChecked.getTime()) < 24 * 60 * 60 * 1000;
              
              if (isRecent) {
                console.log('Usando status de licença em cache:', hasActiveLicense);
                profile.hasActiveLicense = hasActiveLicense;
                
                setState({
                  user: session.user,
                  profile,
                  loading: false,
                  session,
                });
                
                // Don't auto-navigate on auth state change - let the routing system handle it
                // This prevents conflicts with Login/Register navigation
                console.log('Auth state loaded, letting routing handle navigation based on state');
                return;
              }
            } catch (e) {
              console.error('Erro ao analisar status de licença do localStorage:', e);
            }
          }
          
          // Se não temos cache ou não é recente, verificamos no servidor
          const { data: licenseResult, error: licenseError } = await supabase
            .rpc('validate_all_licenses_rpc', { p_email: session.user.email });
            
          if (!licenseError && licenseResult?.licenses) {
            hasActiveLicense = licenseResult.licenses.some((license: any) => license.status === 'active');
            
            // Salvar no localStorage para uso futuro
            localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
              hasLicense: hasActiveLicense,
              checkedAt: new Date().toISOString()
            }));
            
            // Atualiza o profile local com a informação correta de licença
            profile.hasActiveLicense = hasActiveLicense;
            
            // Salvamos o estado final antes de redirecionar
            setState({
              user: session.user,
              profile,
              loading: false,
              session,
            });
            
            // Redirecionar para a tela de verificação de boas-vindas
            console.log('Usuário autenticado, redirecionando para tela de verificação');
            navigate('/welcome-verification', { replace: true });
            return;
          }
        } catch (err) {
          console.error('Erro ao verificar licenças ativas:', err);
          // Em caso de erro, continua o fluxo normal baseado no perfil
        }
        
        // Salvamos o estado antes de redirecionar
        setState({
          user: session.user,
          profile,
          loading: false,
          session,
        });
        
        // Verificar status de licença
        const hasActiveLicense = profile.hasActiveLicense === true;
        
        console.log('[GhostWallet][AuthContext] Status de licença:', hasActiveLicense ? 'ATIVA ✅' : 'INATIVA ❌');
        console.log('[GhostWallet][AuthContext] Onboarding concluído:', profile.onboarding_completed ? 'SIM' : 'NÃO');
        
        // Atualizar informações de licença no localStorage para garantir consistência
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: hasActiveLicense,
          checkedAt: new Date().toISOString()
        }));
        
        // Lógica de redirecionamento modificada:
        // Sempre direcionar para tela de verificação primeiro
        console.log('[GhostWallet][AuthContext] Redirecionando para tela de verificação');
        navigate('/welcome-verification', { replace: true });
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          session: null,
        });
        navigate('/auth', { replace: true });
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchProfile, navigate]);

  useEffect(() => {
    if (!state.loading && state.session) {
      const checkSession = async () => {
        const isHealthy = await checkSessionHealth();
        if (!isHealthy) await signOut();
      };
      checkSession();
      const interval = setInterval(checkSession, 30000);
      return () => clearInterval(interval);
    }
  }, [state.loading, state.session]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (session?.user?.email) {
          const isHealthy = await checkSessionHealth();
          if (isHealthy) {
            await handleAuthStateChange(session);
          } else {
            await signOut();
          }
        } else {
          if (session?.user) {
            console.error('No email found in session user');
          }
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, [handleAuthStateChange]);

  const signOut = async () => {
    try {
      await auth.signOut();
      clearSessionData();
      setState({
        user: null,
        profile: null,
        loading: false,
        session: null,
      });
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = useCallback(async () => {
    if (!state.user?.email) {
      console.error('No user email available for profile update');
      return;
    }

    try {
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: state.user.email });

      if (userIdError) {
        console.error('Error getting user ID:', userIdError);
        throw userIdError;
      }

      if (!userIdResult?.success || !userIdResult?.id) {
        console.error('Invalid user ID result:', userIdResult);
        throw new Error('Could not get user ID');
      }

      const stored = localStorage.getItem('ghost-wallet-profile');
      const currentProfile = stored ? JSON.parse(stored) : {};

      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_profile_rpc', {
          p_user_id: userIdResult.id,
          p_name: currentProfile.name,
          p_onboarding_completed: currentProfile.onboarding_completed
        });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      if (!updateResult?.success) {
        console.error('Update failed:', updateResult);
        throw new Error(updateResult?.error || 'Failed to update profile');
      }

      const licenses = await syncLicenseStatus(state.user.email);
      const hasActiveLicense = licenses.some(license => license.status === 'active');

      setState(prev => ({
        ...prev,
        profile: {
          ...currentProfile,
          hasActiveLicense: hasActiveLicense || false
        }
      }));

      if (!currentProfile.name) {
        navigate('/onboarding', { replace: true });
      } else if (hasActiveLicense) {
        navigate('/app', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  }, [state.user?.email, navigate]);

  const checkAuth = async () => {
    try {
      const isHealthy = await checkSessionHealth();
      if (!isHealthy) {
        await signOut();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  const toggleAdminMode = async () => {
    if (state.user?.role === 'admin') {
      const stored = localStorage.getItem('ghost-wallet-profile');
      const profile = stored ? JSON.parse(stored) : null;
      
      const updatedProfile = {
        ...profile,
        adminMode: !profile?.adminMode
      };
      
      localStorage.setItem('ghost-wallet-profile', JSON.stringify(updatedProfile));
      
      setState(prev => ({
        ...prev,
        profile: updatedProfile
      }));
      
      navigate(updatedProfile.adminMode ? '/admin' : '/', { replace: true });
    }
  };



  return (
    <AuthContext.Provider value={{
      ...state,
      signOut,
      updateProfile,
      checkAuth,
      isReturningUser,
      toggleAdminMode,
      reloadUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}