import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface ReferralContextType {
  stats: any;
  loading: boolean;
  error: string | null;
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  currentLevel: Level | null;
  nextLevel: Level | null;
  solPrice: number;
  refreshStats: () => Promise<void>;
  getRankings: (periodType: 'daily' | 'weekly' | 'monthly') => Promise<any>;
  requestWithdrawal: (userId: string, walletAddress: string, amount: number) => Promise<any>;
  copyReferralLink: () => void;
}

interface Level {
  name: string;
  color: string;
  bonus?: number;
  bonus_percentage?: number;
  required_referrals?: number;
  required_earnings?: number;
  progress_referrals?: number;
  progress_earnings?: number;
}

const defaultStats = {
  total_referrals: 0,
  qualified_referrals: 0,
  total_earnings: 0,
  available_balance: 0,
  pending_balance: 0,
  withdrawn_amount: 0,
  total_withdrawn_usd: 0,
  total_rewards_usd: 0,
  last_withdrawal_date: null,
  last_reward_date: null,
  sol_price: 20
};

const defaultLevel = {
  name: 'Bronze',
  color: '#CD7F32',
  bonus: 0,
  bonus_percentage: 0
};

const defaultNextLevel = {
  name: 'Prata',
  color: '#C0C0C0',
  bonus: 5,
  bonus_percentage: 5,
  required_referrals: 5,
  required_earnings: 50,
  progress_referrals: 0,
  progress_earnings: 0
};

// Default data for when we can't load from backend
const defaultReferralData = {
  stats: defaultStats,
  level: {
    current: defaultLevel,
    next: defaultNextLevel
  },
  goals: [
    {
      id: '1',
      type: 'daily',
      target_referrals: 5,
      target_earnings: 0.5,
      target_earnings_usd: 10,
      bonus_amount: 0.25,
      end_date: new Date(Date.now() + 86400000).toISOString(),
      completed: false,
      progress: 40
    },
    {
      id: '2',
      type: 'weekly',
      target_referrals: 10,
      target_earnings: 1.0,
      target_earnings_usd: 20,
      bonus_amount: 0.5,
      end_date: new Date(Date.now() + 604800000).toISOString(),
      completed: false,
      progress: 20
    }
  ],
  achievements: [
    {
      id: '1',
      type: 'referrals',
      name: 'Primeiro Passo',
      description: 'Faça sua primeira indicação',
      requirement_value: 1,
      reward_amount: 0.05,
      reward_amount_usd: 1,
      unlocked: false,
      unlocked_at: null
    },
    {
      id: '2',
      type: 'referrals',
      name: 'Rede em Expansão',
      description: 'Indique 5 amigos',
      requirement_value: 5,
      reward_amount: 0.25,
      reward_amount_usd: 5,
      unlocked: false,
      unlocked_at: null
    },
    {
      id: '3',
      type: 'earnings',
      name: 'Ganhos Iniciais',
      description: 'Ganhe seu primeiro $10 em referências',
      requirement_value: 0.5,
      reward_amount: 0.1,
      reward_amount_usd: 2,
      unlocked: false,
      unlocked_at: null
    },
    {
      id: '4',
      type: 'streak',
      name: 'Consistência',
      description: 'Faça indicações por 3 dias consecutivos',
      requirement_value: 3,
      reward_amount: 0.15,
      reward_amount_usd: 3,
      unlocked: false,
      unlocked_at: null
    }
  ]
};

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function useReferral() {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within ReferralProvider');
  }
  return context;
}

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [stats, setStats] = useState<any>(defaultReferralData);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(defaultLevel);
  const [nextLevel, setNextLevel] = useState<Level | null>(defaultNextLevel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number>(20);

  // Load referral stats
  const loadReferralStats = useCallback(async () => {
    console.log('[ReferralContext] loadReferralStats called, user:', user);

    if (!user || !user.email) {
      console.log('[ReferralContext] User not authenticated or incomplete:', user);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try to get user ID by email
      let userId = user.id;

      if (!userId && user.email) {
        try {
          // Check if user exists
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
          
          if (checkError) {
            console.log('[ReferralContext] Error checking user existence:', checkError);
          } else if (existingUser) {
            // If user exists, use their ID
            userId = existingUser.id;
            console.log('[ReferralContext] User ID found:', userId);
          } else {
            // If user doesn't exist, create a new record
            console.log('[ReferralContext] User not found, creating new record');
            
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([{ 
                email: user.email,
                referral_code: 'GW' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select('id')
              .single();
            
            if (insertError) {
              console.log('[ReferralContext] Error creating user:', insertError);
            } else if (newUser) {
              userId = newUser.id;
              console.log('[ReferralContext] New user created with ID:', userId);
            }
          }
        } catch (idErr) {
          console.log('[ReferralContext] Error processing user by email:', idErr);
        }
      }

      // If still no user ID, use default data
      if (!userId) {
        console.log('[ReferralContext] No user ID available, using default data');
        setStats(defaultReferralData);
        setCurrentLevel(defaultLevel);
        setNextLevel(defaultNextLevel);
        setSolPrice(20);
        setError(null);
        setLoading(false);
        return;
      }

      // Get referral code
      try {
        const { data: userData, error: codeError } = await supabase
          .from('users')
          .select('referral_code')
          .eq('id', userId)
          .maybeSingle();

        if (!codeError && userData && userData.referral_code) {
          console.log('[ReferralContext] Referral code found:', userData.referral_code);
          setReferralCode(userData.referral_code);
        } else {
          // Generate a new code if none exists
          const tempCode = 'GW' + Math.random().toString(36).substring(2, 10).toUpperCase();
          setReferralCode(tempCode);
          
          // Try to update the user's referral code
          const { error: updateError } = await supabase
            .from('users')
            .update({ referral_code: tempCode })
            .eq('id', userId);
            
          if (updateError) {
            console.error('[ReferralContext] Error updating referral code:', updateError);
          }
        }
      } catch (codeErr) {
        console.error('[ReferralContext] Error getting referral code:', codeErr);
      }

      // Get complete stats
      try {
        const { data, error: statsError } = await supabase
          .rpc('get_complete_referral_stats', { p_user_id: userId });

        if (statsError) {
          console.error('[ReferralContext] Error getting stats:', statsError);
          return;
        }

        if (!data) {
          console.log('[ReferralContext] No data returned from RPC');
          return;
        }

        console.log('[ReferralContext] Stats loaded:', data);

        // Set loaded data
        setStats(data);

        // Update levels
        if (data.level) {
          if (data.level.current) {
            setCurrentLevel(data.level.current);
          }

          if (data.level.next) {
            setNextLevel(data.level.next);
          }
        }

        // Set SOL price
        if (data.stats && data.stats.sol_price) {
          setSolPrice(data.stats.sol_price);
        }

        setError(null);
      } catch (rpcErr) {
        console.error('[ReferralContext] Error getting complete stats:', rpcErr);
      }
    } catch (err: any) {
      console.error('[ReferralContext] General error loading stats:', err);
      // Handle specific auth errors gracefully
      if (err.name === 'AuthSessionMissingError' || err.__isAuthError) {
        console.log('[ReferralContext] Auth session missing, using default data');
        setError(null); // Don't show error for auth issues
      } else {
        setError(err.message || 'Erro ao carregar estatísticas de referência');
      }
      setStats(defaultReferralData);
      setCurrentLevel(defaultLevel);
      setNextLevel(defaultNextLevel);
      setSolPrice(20);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch SOL price
  const fetchSolPrice = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sol_price_feed')
        .select('price')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching SOL price:', error);
        return; // Keep default price on error
      }

      if (data && data.length > 0) {
        setSolPrice(data[0].price);
      }
    } catch (error) {
      console.error('Error fetching SOL price:', error);
    }
  }, []);

  // Initialize data when component loads
  useEffect(() => {
    console.log('[ReferralContext] Initializing context, user:', user);

    if (!user) {
      setLoading(false);
      console.log('[ReferralContext] No user found, using default data');
      return;
    }

    // Check authentication
    const checkAuth = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError) {
          // Silenciar erros de sessão para evitar spam no console
          if (authError && typeof authError === 'object' && 'name' in authError && authError.name === 'AuthSessionMissingError') {
            console.warn('[ReferralContext] Sessão não encontrada, usando dados padrão');
          } else {
            console.error('[ReferralContext] Erro inesperado de autenticação:', authError);
          }
          setLoading(false);
          setStats(defaultReferralData);
          setCurrentLevel(defaultLevel);
          setNextLevel(defaultNextLevel);
          setSolPrice(20);
          return;
        }

        if (!authData || !authData.user) {
          console.log('[ReferralContext] User not authenticated in Supabase');
          setLoading(false);
          setStats(defaultReferralData);
          setCurrentLevel(defaultLevel);
          setNextLevel(defaultNextLevel);
          setSolPrice(20);
          return;
        }

        console.log('[ReferralContext] Auth verified, loading data');
        await loadReferralStats();
        await fetchSolPrice();
      } catch (err) {
        // Silenciar erros de sessão para evitar spam no console
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AuthSessionMissingError') {
          console.warn('[ReferralContext] Sessão não encontrada, usando dados padrão');
        } else {
          console.error('[ReferralContext] Erro inesperado ao verificar autenticação:', err);
        }
        setLoading(false);
        setStats(defaultReferralData);
        setCurrentLevel(defaultLevel);
        setNextLevel(defaultNextLevel);
        setSolPrice(20);
      }
    };

    checkAuth();
  }, [user, loadReferralStats, fetchSolPrice]);

  // Refresh stats function
  const refreshStats = useCallback(async () => {
    console.log('[ReferralContext] refreshStats called');

    if (!user) {
      console.log('[ReferralContext] No user, skipping refresh');
      return;
    }

    try {
      await loadReferralStats();
      await fetchSolPrice();
    } catch (err: any) {
      console.error('[ReferralContext] Error refreshing stats:', err);
    }
  }, [user, loadReferralStats, fetchSolPrice]);

  // Copy referral link function
  const copyReferralLink = useCallback(() => {
    if (!referralCode) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Código de referência não disponível'
      });
      return;
    }

    const referralLink = `${window.location.origin}/join?ref=${referralCode}`;

    try {
      navigator.clipboard.writeText(referralLink);
      showNotification({
        type: 'success',
        title: 'Link Copiado',
        message: 'Link de referência copiado para a área de transferência'
      });
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível copiar o link. Tente novamente.'
      });
    }
  }, [referralCode, showNotification]);

  // Get rankings function
  const getRankings = useCallback(async (periodType: 'daily' | 'weekly' | 'monthly') => {
    try {
      const { data, error } = await supabase
        .rpc('get_referral_rankings', { 
          p_period_type: periodType,
          p_limit: 10 
        });

      if (error) {
        console.error('[ReferralContext] Error fetching rankings:', error);
        // Return mock data on error
        return {
          rankings: [
            { 
              user_id: '1', 
              user_name: 'TopReferrer', 
              total_referrals: 42, 
              total_earnings: 8.5,
              level: { name: 'Ouro', color: '#FFD700' } 
            },
            { 
              user_id: '2', 
              user_name: 'CryptoQueen', 
              total_referrals: 34, 
              total_earnings: 6.2,
              level: { name: 'Prata', color: '#C0C0C0' } 
            },
            { 
              user_id: '3', 
              user_name: 'BlockchainKing', 
              total_referrals: 25, 
              total_earnings: 5.0,
              level: { name: 'Bronze', color: '#CD7F32' } 
            },
          ]
        };
      }

      return data;
    } catch (err: any) {
      console.error('[ReferralContext] Error fetching rankings:', err);
      // Return mock data on error
      return {
        rankings: [
          { 
            user_id: '1', 
            user_name: 'TopReferrer', 
            total_referrals: 42, 
            total_earnings: 8.5,
            level: { name: 'Ouro', color: '#FFD700' } 
          },
          { 
            user_id: '2', 
            user_name: 'CryptoQueen', 
            total_referrals: 34, 
            total_earnings: 6.2,
            level: { name: 'Prata', color: '#C0C0C0' } 
          },
          { 
            user_id: '3', 
            user_name: 'BlockchainKing', 
            total_referrals: 25, 
            total_earnings: 5.0,
            level: { name: 'Bronze', color: '#CD7F32' } 
          },
        ]
      };
    }
  }, []);

  // Request withdrawal function
  const requestWithdrawal = useCallback(async (userId: string, walletAddress: string, amount: number) => {
    if (!user || !user.id) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Usuário não autenticado'
      });
      throw new Error('Usuário não autenticado');
    }

    try {
      // Validate inputs
      if (!walletAddress.trim()) {
        throw new Error('Endereço da carteira é obrigatório');
      }

      if (amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      try {
        // Process withdrawal
        const { data, error } = await supabase
          .rpc('process_referral_withdrawal', {
            p_user_id: user.id,
            p_wallet_address: walletAddress,
            p_amount: amount
          });

        if (error) throw error;

        if (!data || !data.success) {
          throw new Error(data?.message || 'Erro ao processar saque');
        }

        // Show success notification
        showNotification({
          type: 'success',
          title: 'Saque Solicitado',
          message: 'Seu saque será processado em até 24 horas'
        });

        // Update stats after withdrawal
        await refreshStats();
        return data;
      } catch (supabaseErr) {
        console.error('Supabase API error:', supabaseErr);

        // Simulate success in development
        if (process.env.NODE_ENV === 'development') {
          showNotification({
            type: 'success',
            title: 'Saque Solicitado (DEV)',
            message: 'Seu saque seria processado em até 24 horas'
          });

          // Update simulated data
          setStats((prevStats: any) => {
            if (!prevStats) return defaultReferralData;

            const newStats = {
              ...prevStats,
              stats: {
                ...prevStats.stats,
                total_earnings: Math.max(0, (prevStats.stats.total_earnings || 0) - amount),
                total_withdrawn_usd: (prevStats.stats.total_withdrawn_usd || 0) + (amount * (prevStats.stats.sol_price || 20)),
                last_withdrawal_date: new Date().toISOString()
              }
            };

            return newStats;
          });

          return { success: true, message: 'Processado em modo desenvolvimento' };
        }

        // In production, propagate the error
        throw supabaseErr;
      }
    } catch (err: any) {
      console.error('[ReferralContext] Error requesting withdrawal:', err);
      showNotification({
        type: 'error',
        title: 'Erro no Saque',
        message: err.message || 'Erro ao processar saque. Tente novamente.'
      });
      throw err;
    }
  }, [user, refreshStats, showNotification]);

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!user || !user.id) return;

    try {
      const channel = supabase.channel(`referral_updates:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'referral_transactions',
            filter: `user_id=eq.${user.id}`
          },
          () => refreshStats()
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'referral_stats',
            filter: `user_id=eq.${user.id}`
          },
          () => refreshStats()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('[ReferralContext] Error setting up update channel:', err);
    }
  }, [user, refreshStats]);

  return (
    <ReferralContext.Provider value={{
      stats, 
      referralCode,
      setReferralCode,
      currentLevel,
      nextLevel,
      loading,
      error,
      solPrice,
      refreshStats,
      getRankings,
      requestWithdrawal,
      copyReferralLink
    }}>
      {children}
    </ReferralContext.Provider>
  );
}