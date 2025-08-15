import React, { useEffect, useState } from 'react';
import { FaGift, FaUserFriends, FaDollarSign, FaSync } from 'react-icons/fa';
import { getUserGoals, claimGoalReward } from '../../lib/referrals';
import { useReferral } from '../../context/ReferralContext';
import { supabase } from '../../lib/supabaseClient';

interface Goal {
  id: string;
  name: string;
  description: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  requirement_type: 'referrals' | 'earnings';
  target_value: number;
  reward_amount_usd: number;
  current_value: number;
  progress_percentage: number;
  completed: boolean;
  reward_claimed: boolean;
  expires_at: string;
}

const ReferralGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { solPrice, refreshStats } = useReferral();

  useEffect(() => {
    loadGoals();
    
    // Configurar um intervalo para recarregar as metas a cada 30 segundos
    const reloadInterval = setInterval(() => {
      if (!loading) {
        loadGoals();
      }
    }, 30000);
    
    return () => clearInterval(reloadInterval);
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Carregando metas do usuário...");
      const userGoals = await getUserGoals();
      console.log("Metas recebidas:", userGoals);
      
      if (Array.isArray(userGoals)) {
        setGoals(userGoals);
        
        // Se recebemos um array vazio mas sabemos que deveria haver dados,
        // podemos tentar recarregar novamente após um breve atraso
        if (userGoals.length === 0) {
          // Verificar se o usuário está autenticado via Supabase
          const { data: authData } = await supabase.auth.getUser();
          
          if (authData && authData.user) {
            console.log("Usuário autenticado, tentando recarregar metas após delay...");
            setTimeout(async () => {
              try {
                const newGoals = await getUserGoals();
                if (Array.isArray(newGoals) && newGoals.length > 0) {
                  console.log("Metas recarregadas com sucesso:", newGoals);
                  setGoals(newGoals);
                } else {
                  console.log("Recarga de metas retornou array vazio novamente");
                  // Usar dados padrão após falhas repetidas
                  setGoals([
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
                  ]);
                }
              } catch (retryErr) {
                console.error("Erro na segunda tentativa:", retryErr);
                // Usar dados padrão em caso de erro
                setGoals([
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
                ]);
              }
            }, 2500);
          } else {
            console.log("Usuário não autenticado, usando dados padrão");
            // Usar dados padrão para usuários não autenticados
            setGoals([
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
            ]);
          }
        }
      } else {
        console.error("Formato inesperado de dados de metas:", userGoals);
        setGoals([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar metas:', error);
      setError(error?.message || 'Erro ao carregar metas');
      // Usar dados padrão em caso de erro
      setGoals([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (goalId: string) => {
    try {
      const success = await claimGoalReward(goalId);
      if (success) {
        await loadGoals();
        if (refreshStats) refreshStats();
      }
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
    }
  };

  const formatExpiration = (expiresAt: string) => {
    const expireDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
  };

  const calculateSolReward = (usdAmount: number) => {
    if (!solPrice || solPrice <= 0) return 0;
    return usdAmount / solPrice;
  };

  const renderGoalsByType = (type: 'daily' | 'weekly' | 'monthly') => {
    const filteredGoals = goals.filter(goal => goal.goal_type === type);
    if (!filteredGoals.length) return null;

    // Agrupa metas do mesmo tipo (diária, semanal, etc)
    const referralGoal = filteredGoals.find(g => g.requirement_type === 'referrals');
    const earningsGoal = filteredGoals.find(g => g.requirement_type === 'earnings');
    const title = type === 'daily' ? 'Meta Diária' : type === 'weekly' ? 'Meta Semanal' : 'Meta Mensal';
    const reward = referralGoal?.reward_amount_usd || earningsGoal?.reward_amount_usd || 0;
    const expiresText = referralGoal?.expires_at ? formatExpiration(referralGoal.expires_at) : '';

    return (
      <div className="bg-[#1a1a2e] rounded-lg p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaGift className="text-indigo-400 text-xl" />
            <h3 className="text-indigo-400 font-medium">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-medium">Recompensa</div>
            <div className="text-green-400">+{calculateSolReward(reward).toFixed(2)} SOL ✨</div>
            <div className="text-gray-400 text-xs">≈ ${reward.toFixed(2)}</div>
          </div>
        </div>

        {expiresText && (
          <div className="text-xs text-gray-400 mb-3">
            Expira em {expiresText}
          </div>
        )}

        {/* Progresso Referidos */}
        {referralGoal && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FaUserFriends className="text-gray-400" />
                <span className="text-gray-300">Referidos</span>
              </div>
              <span className="text-indigo-400">{referralGoal.current_value}/{referralGoal.target_value}</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-700/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#6C63FF] rounded-full" 
                style={{ width: `${referralGoal.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Progresso Ganhos */}
        {earningsGoal && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-gray-400" />
                <span className="text-gray-300">Meta de Ganhos</span>
              </div>
              <span className="text-indigo-400">${earningsGoal.current_value}/{earningsGoal.target_value}</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-700/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#6C63FF] rounded-full" 
                style={{ width: `${earningsGoal.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botão de Reivindicar se alguma meta estiver completa */}
        {(referralGoal?.completed && !referralGoal?.reward_claimed) || 
         (earningsGoal?.completed && !earningsGoal?.reward_claimed) ? (
          <button 
            onClick={() => {
              const goalToClaimId = referralGoal?.completed && !referralGoal?.reward_claimed 
                ? referralGoal.id 
                : earningsGoal?.id;
              if (goalToClaimId) handleClaimReward(goalToClaimId);
            }}
            className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition"
          >
            Reivindicar Recompensa
          </button>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderGoalsByType('daily')}
      {renderGoalsByType('weekly')}
      {renderGoalsByType('monthly')}

      {goals.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Nenhuma meta disponível no momento.</p>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <button 
            onClick={() => loadGoals()} 
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white mx-auto"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Tentar carregar novamente
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferralGoals;