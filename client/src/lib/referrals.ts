import { supabase } from './supabase';
import fetch from 'cross-fetch';
import { localDb } from './localDb';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to get current SOL price
async function getCurrentSolPrice(): Promise<number> {
  try {
    // Try multiple price sources
    const endpoints = [
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT',
      'https://api.kraken.com/0/public/Ticker?pair=SOLUSD'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        // Parse price based on endpoint format
        let price = endpoint.includes('coingecko') ? data.solana.usd :
                    endpoint.includes('binance') ? parseFloat(data.price) :
                    parseFloat(data.result.SOLUSD.c[0]);

        if (price && price > 0) {
          return price;
        }
      } catch (err) {
        console.warn(`Failed to fetch price from ${endpoint}:`, err);
        continue;
      }
    }

    throw new Error('Failed to fetch SOL price from all sources');
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    // Fallback to default price if API fails
    return 20;
  }
}

// Helper function to update user's referral balance
async function updateReferralBalance(userId: string, amount: number): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_referral_balance', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error updating referral balance:', err);
    throw err;
  }
}

interface ReferralStats {
  stats: {
    total_referrals: number;
    qualified_referrals: number;
    total_earnings: number;
    total_earnings_usd: number;
    sol_price: number;
    recent_transactions: Array<{
      id: string;
      amount_usd: number;
      amount_sol: number;
      sol_price: number;
      status: string;
      created_at: string;
    }>;
  };
  level: {
    current: {
      name: string;
      color: string;
      bonus: number;
    };
    next?: {
      name: string;
      color: string;
      required_referrals: number;
      required_earnings: number;
      progress_referrals: number;
      progress_earnings: number;
    };
  };
  goals: Array<{
    id: string;
    type: 'daily' | 'weekly';
    target_referrals: number;
    target_earnings: number;
    target_earnings_usd: number;
    bonus_amount: number;
    end_date: string;
    completed: boolean;
    progress: number;
  }>;
  achievements: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    requirement_value: number;
    reward_amount: number;
    reward_amount_usd: number;
    unlocked: boolean;
    unlocked_at: string | null;
  }>;
}

// Obter configurações ativas para o sistema de referências
export async function getActiveSettings(): Promise<{ reward_amount_usd: number; min_withdrawal_usd: number }> {
  try {
    const { data, error } = await supabase
      .rpc('get_active_referral_settings');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting referral settings:', err);
    throw err;
  }
}

export async function getUserGoals(): Promise<any> {
  try {
    // Verificar se o usuário está autenticado
    const { data: authData } = await supabase.auth.getUser();
    if (!authData || !authData.user) {
      console.warn('Usuário não autenticado ao tentar obter metas');
      return getDefaultGoals();
    }

    // Primeira tentativa
    const { data, error } = await supabase
      .rpc('get_user_goals');

    if (error) {
      console.warn('Tentativa inicial getUserGoals falhou:', error);
      
      // Registrar no console para debug
      console.log('Tentando novamente após breve pausa...');
      
      // Esperar 800ms e tentar novamente (pode ser um problema de timing)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Segunda tentativa
      const retryResult = await supabase.rpc('get_user_goals');
      
      if (retryResult.error) {
        console.error('Segunda tentativa getUserGoals falhou:', retryResult.error);
        
        // Tentar uma terceira vez com delay maior
        await new Promise(resolve => setTimeout(resolve, 1200));
        const thirdAttempt = await supabase.rpc('get_user_goals');
        
        if (thirdAttempt.error) {
          console.error('Terceira tentativa getUserGoals falhou:', thirdAttempt.error);
          return getDefaultGoals();
        }
        
        return thirdAttempt.data || getDefaultGoals();
      }
      
      return retryResult.data || getDefaultGoals();
    }
    
    return data && data.length > 0 ? data : getDefaultGoals();
  } catch (err) {
    console.error('Error getting user goals:', err);
    return getDefaultGoals();
  }
}

function getDefaultGoals() {
  return [
    {
      id: '1',
      name: 'Meta Diária',
      description: 'Complete 5 referências hoje',
      goal_type: 'daily',
      requirement_type: 'referrals',
      target_value: 5,
      reward_amount_usd: 10,
      current_value: 0,
      progress_percentage: 0,
      completed: false,
      reward_claimed: false,
      expires_at: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: '2',
      name: 'Meta Semanal',
      description: 'Ganhe $20 em referências nesta semana',
      goal_type: 'weekly',
      requirement_type: 'earnings',
      target_value: 20,
      reward_amount_usd: 15,
      current_value: 0,
      progress_percentage: 0,
      completed: false,
      reward_claimed: false,
      expires_at: new Date(Date.now() + 604800000).toISOString()
    }
  ];
}

export async function getUserAchievements(): Promise<any> {
  try {
    // Verificar se o usuário está autenticado
    const { data: authData } = await supabase.auth.getUser();
    if (!authData || !authData.user) {
      console.warn('Usuário não autenticado ao tentar obter conquistas');
      return getDefaultAchievements();
    }

    // Primeira tentativa
    const { data, error } = await supabase
      .rpc('get_user_achievements');

    if (error) {
      console.warn('Tentativa inicial getUserAchievements falhou:', error);
      
      // Registrar no console para debug
      console.log('Tentando novamente após breve pausa...');
      
      // Esperar 800ms e tentar novamente (pode ser um problema de timing)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Segunda tentativa
      const retryResult = await supabase.rpc('get_user_achievements');
      
      if (retryResult.error) {
        console.error('Segunda tentativa getUserAchievements falhou:', retryResult.error);
        
        // Tentar uma terceira vez com delay maior
        await new Promise(resolve => setTimeout(resolve, 1200));
        const thirdAttempt = await supabase.rpc('get_user_achievements');
        
        if (thirdAttempt.error) {
          console.error('Terceira tentativa getUserAchievements falhou:', thirdAttempt.error);
          return getDefaultAchievements();
        }
        
        return thirdAttempt.data || getDefaultAchievements();
      }
      
      return retryResult.data || getDefaultAchievements();
    }
    
    return data && data.length > 0 ? data : getDefaultAchievements();
  } catch (err) {
    console.error('Error getting user achievements:', err);
    return getDefaultAchievements();
  }
}

function getDefaultAchievements() {
  return [
    {
      id: '1',
      name: 'Primeiro Passo',
      description: 'Faça sua primeira indicação',
      achievement_type: 'referrals_count',
      level: 1,
      target_value: 1,
      icon_url: '',
      reward_amount_usd: 1,
      unlocked: false,
      reward_claimed: false,
      unlocked_at: '',
      current_value: 0
    },
    {
      id: '2',
      name: 'Iniciante',
      description: 'Indique 5 amigos',
      achievement_type: 'referrals_count',
      level: 2,
      target_value: 5,
      icon_url: '',
      reward_amount_usd: 5,
      unlocked: false,
      reward_claimed: false,
      unlocked_at: '',
      current_value: 0
    },
    {
      id: '3',
      name: 'Primeiros Ganhos',
      description: 'Ganhe $10 com referências',
      achievement_type: 'earnings_total',
      level: 1,
      target_value: 10,
      icon_url: '',
      reward_amount_usd: 2,
      unlocked: false,
      reward_claimed: false,
      unlocked_at: '',
      current_value: 0
    },
    {
      id: '4',
      name: 'Consistência',
      description: 'Faça indicações por 3 dias consecutivos',
      achievement_type: 'consecutive_days',
      level: 1,
      target_value: 3,
      icon_url: '',
      reward_amount_usd: 3,
      unlocked: false,
      reward_claimed: false,
      unlocked_at: '',
      current_value: 0
    }
  ];
}

export async function claimGoalReward(goalId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData || !authData.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { error } = await supabase
      .from('user_goals')
      .update({ reward_claimed: true })
      .eq('goal_id', goalId)
      .eq('user_id', authData.user.id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao reivindicar recompensa de meta:', err);
    return false;
  }
}

export async function claimAchievementReward(achievementId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData || !authData.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { error } = await supabase
      .from('user_achievements')
      .update({ reward_claimed: true })
      .eq('achievement_id', achievementId)
      .eq('user_id', authData.user.id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao reivindicar recompensa de conquista:', err);
    return false;
  }
}

// Rastrear clique em link de referência
export async function trackReferralClick(referralCode: string): Promise<void> {
  try {
    // Validar o formato do código de referência
    if (!referralCode.match(/^GW[A-Za-z0-9]{8}$/)) {
      console.warn('Código de referência inválido:', referralCode);
      return;
    }

    // Obter endereço IP do usuário para a API de tracking
    let ipAddress;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (ipErr) {
      console.error('Erro ao obter IP:', ipErr);
      ipAddress = '0.0.0.0';
    }

    // Registrar o clique no backend
    const { error } = await supabase
      .rpc('track_referral_click', {
        p_referral_code: referralCode,
        p_ip_address: ipAddress,
        p_user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Erro ao registrar clique:', error);
    }
  } catch (err) {
    console.error('Erro ao rastrear clique de referência:', err);
  }
}

// Obter estatísticas completas
export async function getReferralStats(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .rpc('get_complete_referral_stats', { p_user_id: userId });

    if (error) {
      console.error('Erro ao buscar estatísticas de referência:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Erro ao buscar estatísticas de referência:', err);
    // Retornar dados padrão em caso de erro
    return {
      stats: {
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
      },
      level: {
        current: {
          name: 'Bronze',
          color: '#CD7F32',
          bonus: 0
        },
        next: {
          name: 'Prata',
          color: '#C0C0C0',
          bonus: 5,
          required_referrals: 5,
          required_earnings: 50,
          progress_referrals: 0,
          progress_earnings: 0
        }
      },
      goals: [],
      achievements: []
    };
  }
}

export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    // First check format
    if (!code || !code.match(/^GW[A-Za-z0-9]{8}$/)) {
      console.log(`Código de referência inválido: ${code} - Formato incorreto`);
      return false;
    }

    // Check for reserved/temporary codes
    if (code === 'GW00000000') {
      console.log('Código de referência temporário detectado');
      return false;
    }

    // Then check if exists in database
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Código não encontrado (PGRST116 = "No rows returned")
        console.log(`Código de referência não encontrado no banco: ${code}`);
        return false;
      }
      throw error;
    }
    
    console.log(`Código de referência válido: ${code} - ID do usuário: ${data?.id}`);
    return !!data;
  } catch (err) {
    console.error('Error validating referral code:', err);
    return false;
  }
}

// Subscribe to referral events
export function subscribeToReferrals(userId: string, onUpdate: () => void) {
  const channel = supabase
    .channel(`referral_updates:${userId}`) 
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'referral_transactions',
        filter: `user_id=eq.${userId}`
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function requestWithdrawal(userId: string, walletAddress: string, amount: number): Promise<void> {
  if (!userId) throw new Error('User not authenticated');

  // Validate wallet address format
  if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
    throw new Error('Invalid wallet address format');
  }

  // Validate amount
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  try {
    // Get current SOL price for conversion
    const solPrice = await getCurrentSolPrice();

    // Get user's current balance
    const { data: user } = await supabase
      .from('users')
      .select('referral_balance')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    if (amount > user.referral_balance) {
      throw new Error('Insufficient balance');
    }

    // Get minimum withdrawal amount
    const { data: settings } = await supabase
      .from('referral_settings')
      .select('min_withdrawal_usd')
      .eq('active', true)
      .single();

    if (settings && amount < settings.min_withdrawal_usd) {
      throw new Error(`Minimum withdrawal amount is $${settings.min_withdrawal_usd}`);
    }

    // Process withdrawal through RPC function
    let retryCount = 0;
    let lastError;

    while (retryCount < MAX_RETRIES) {
      try {
        const { error } = await supabase.rpc('process_withdrawal', {
          p_user_id: userId,
          p_wallet_address: walletAddress,
          p_amount_usd: amount,
          p_sol_price: solPrice
        });

        if (!error) {
          // Store withdrawal request locally
          await localDb.recordWithdrawal({
            userId,
            walletAddress,
            amountUSD: amount,
            amountSOL: amount / solPrice,
            solPrice,
            status: 'pending'
          });

          return;
        }

        lastError = error;
      } catch (err) {
        lastError = err;
      }

      retryCount++;
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    throw lastError || new Error('Failed to process withdrawal after retries');

  } catch (err) {
    console.error('Error requesting withdrawal:', err);
    throw err;
  }
}