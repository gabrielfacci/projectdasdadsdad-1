import React, { useEffect, useState } from 'react';
import { FaTrophy, FaLock, FaCheck, FaSync } from 'react-icons/fa';
import { getUserAchievements, claimAchievementReward } from '../../lib/referrals';
import { useReferral } from '../../context/ReferralContext';
import { supabase } from '../../lib/supabaseClient';

interface Achievement {
  id: string;
  name: string;
  description: string;
  achievement_type: string;
  level: number;
  target_value: number;
  icon_url: string;
  reward_amount_usd: number;
  unlocked: boolean;
  reward_claimed: boolean;
  unlocked_at: string;
  current_value?: number; // Valor atual do progresso (pode não estar presente)
}

const ReferralAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { solPrice, refreshStats } = useReferral();

  useEffect(() => {
    loadAchievements();
    
    // Configurar um intervalo para recarregar as conquistas a cada 30 segundos
    const reloadInterval = setInterval(() => {
      if (!loading) {
        loadAchievements();
      }
    }, 30000);
    
    return () => clearInterval(reloadInterval);
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Carregando conquistas do usuário...");
      const userAchievements = await getUserAchievements();
      console.log("Conquistas recebidas:", userAchievements);
      
      if (Array.isArray(userAchievements)) {
        setAchievements(userAchievements);
        
        // Se recebemos um array vazio mas sabemos que deveria haver dados,
        // podemos tentar recarregar novamente após um breve atraso
        if (userAchievements.length === 0) {
          // Verificar se o usuário está autenticado via Supabase
          const { data: authData } = await supabase.auth.getUser();
          
          if (authData && authData.user) {
            console.log("Usuário autenticado, tentando recarregar conquistas após delay...");
            setTimeout(async () => {
              try {
                const newAchievements = await getUserAchievements();
                if (Array.isArray(newAchievements) && newAchievements.length > 0) {
                  console.log("Conquistas recarregadas com sucesso:", newAchievements);
                  setAchievements(newAchievements);
                } else {
                  console.log("Recarga de conquistas retornou array vazio novamente");
                  // Usar dados padrão após falhas repetidas
                  setAchievements(getDefaultAchievements());
                }
              } catch (retryErr) {
                console.error("Erro na segunda tentativa:", retryErr);
                // Usar dados padrão em caso de erro
                setAchievements(getDefaultAchievements());
              }
            }, 2500);
          } else {
            console.log("Usuário não autenticado, usando dados padrão");
            // Usar dados padrão para usuários não autenticados
            setAchievements(getDefaultAchievements());
          }
        }
      } else {
        console.error("Formato inesperado de dados de conquistas:", userAchievements);
        setAchievements(getDefaultAchievements());
      }
    } catch (error: any) {
      console.error('Erro ao carregar conquistas:', error);
      setError(error?.message || 'Erro ao carregar conquistas');
      // Usar dados padrão em caso de erro
      setAchievements(getDefaultAchievements());
    } finally {
      setLoading(false);
    }
  };

  // Helper para obter dados padrão de conquistas
  const getDefaultAchievements = (): Achievement[] => {
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
  };

  const handleClaimReward = async (achievementId: string) => {
    try {
      const success = await claimAchievementReward(achievementId);
      if (success) {
        await loadAchievements();
        if (refreshStats) refreshStats();
      }
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
    }
  };

  const calculateSolReward = (usdAmount: number) => {
    if (!solPrice || solPrice <= 0) return 0;
    return usdAmount / solPrice;
  };

  // Agrupar conquistas por tipo
  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const type = achievement.achievement_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  // Tradução de tipos de conquistas
  const achievementTypeNames: Record<string, string> = {
    'referrals_count': 'Número de Referidos',
    'earnings_total': 'Total de Ganhos',
    'consecutive_days': 'Dias Consecutivos'
  };
  
  // Cores para cada tipo de conquista
  const typeColors: Record<string, {primary: string, secondary: string, bg: string}> = {
    'referrals_count': {
      primary: '#7B68EE', // Roxo
      secondary: '#9370DB',
      bg: 'from-[#7B68EE]/20 to-[#9370DB]/10'
    },
    'earnings_total': {
      primary: '#00E676', // Verde
      secondary: '#69F0AE',
      bg: 'from-[#00E676]/20 to-[#69F0AE]/10'
    },
    'consecutive_days': {
      primary: '#FF9100', // Laranja
      secondary: '#FFAB40',
      bg: 'from-[#FF9100]/20 to-[#FFAB40]/10'
    },
    'default': {
      primary: '#FFD700', // Dourado
      secondary: '#FFF176',
      bg: 'from-[#FFD700]/20 to-[#FFF176]/10'
    }
  };
  
  // Estados para filtragem
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Filtrar conquistas pelo tipo selecionado
  const filteredAchievements = selectedType === 'all' 
    ? achievements 
    : achievements.filter(a => a.achievement_type === selectedType);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-indigo-400 flex items-center gap-2">
          <FaTrophy /> Conquistas
        </h3>
        
        <button 
          onClick={() => loadAchievements()}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          title="Recarregar conquistas"
        >
          <FaSync className={loading ? "animate-spin" : ""} size={14} />
          <span className="text-sm">Atualizar</span>
        </button>
      </div>
      
      {/* Filtro de categorias */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            selectedType === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Todas
        </button>
        
        {Object.entries(achievementTypeNames).map(([type, name]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === type
                ? `bg-opacity-90 text-white`
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ 
              backgroundColor: selectedType === type 
                ? typeColors[type]?.primary || '#1a1a2e'
                : undefined 
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Nenhuma conquista disponível no momento.</p>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <button 
            onClick={() => loadAchievements()} 
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white mx-auto"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Tentar carregar novamente
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {(selectedType === 'all' ? achievements : filteredAchievements)
          .sort((a, b) => a.level - b.level)
          .map((achievement) => {
            const typeColor = typeColors[achievement.achievement_type] || typeColors['default'];
            
            return (
              <div 
                key={achievement.id}
                className={`bg-gradient-to-br rounded-lg p-4 relative overflow-hidden transition-all border ${
                  achievement.unlocked 
                    ? `border-${achievement.achievement_type === 'earnings_total' ? 'green' : 'indigo'}-500/40` 
                    : 'border-neutral-700/30'
                } ${typeColor.bg}`}
                style={{
                  boxShadow: achievement.unlocked 
                    ? `0 0 15px ${typeColor.primary}30` 
                    : undefined
                }}
              >
                {/* Indicador de status */}
                <div className="absolute top-3 right-3">
                  {achievement.unlocked ? (
                    achievement.reward_claimed ? (
                      <div className="flex items-center gap-1">
                        <FaCheck className="text-green-500" />
                        <span className="text-xs text-green-500">Coletado</span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                        Colete
                      </span>
                    )
                  ) : (
                    <div className="flex items-center gap-1">
                      <FaLock className="text-gray-500" />
                      <span className="text-xs text-gray-500">Bloqueado</span>
                    </div>
                  )}
                </div>

                {/* Badge de categoria */}
                <div className="absolute top-3 left-3">
                  <span 
                    className="text-xs px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: `${typeColor.primary}30`,
                      color: typeColor.primary
                    }}
                  >
                    {achievementTypeNames[achievement.achievement_type] || achievement.achievement_type}
                  </span>
                </div>

                <div className="mb-2 mt-7">
                  <h4 className="text-lg font-medium text-white">{achievement.name}</h4>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>

                {!achievement.unlocked && achievement.current_value !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progresso</span>
                      <span>{achievement.current_value}/{achievement.target_value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (achievement.current_value / achievement.target_value) * 100)}%`,
                          backgroundColor: typeColor.primary
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-gray-300">
                    Recompensa: <span style={{ color: typeColor.secondary }}>
                      {calculateSolReward(achievement.reward_amount_usd).toFixed(2)} SOL
                    </span>
                  </div>

                  {achievement.unlocked && !achievement.reward_claimed && (
                    <button 
                      onClick={() => handleClaimReward(achievement.id)}
                      className="px-4 py-1 text-white rounded-md transition"
                      style={{ backgroundColor: typeColor.primary }}
                    >
                      Coletar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ReferralAchievements;