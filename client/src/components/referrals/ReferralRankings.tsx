
import React, { useEffect, useState } from 'react';
import { FaMedal, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { useReferral } from '../../context/ReferralContext';

interface RankingUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  referrals_count: number;
  earnings: number;
  rank: number;
}

const ReferralRankings: React.FC = () => {
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { getRankings } = useReferral();

  useEffect(() => {
    loadRankings();
  }, [periodType]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const result = await getRankings(periodType);
      setRankings(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Erro ao carregar rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'; // Ouro
      case 2: return 'text-gray-400'; // Prata
      case 3: return 'text-amber-600'; // Bronze
      default: return 'text-gray-600';
    }
  };

  const formatUsername = (username: string) => {
    if (!username) return 'Anônimo';
    
    // Se for um email, mostrar apenas a parte antes do @
    if (username.includes('@')) {
      return username.split('@')[0];
    }
    
    // Se for muito longo, truncar
    if (username.length > 15) {
      return username.substring(0, 12) + '...';
    }
    
    return username;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-medium text-indigo-400 flex items-center gap-2">
          <FaMedal /> Ranking de Referências
        </h3>

        <div className="flex bg-[#1a1a2e] rounded-lg overflow-hidden">
          <button 
            className={`px-4 py-2 text-sm ${periodType === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            onClick={() => setPeriodType('daily')}
          >
            Diário
          </button>
          <button 
            className={`px-4 py-2 text-sm ${periodType === 'weekly' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            onClick={() => setPeriodType('weekly')}
          >
            Semanal
          </button>
          <button 
            className={`px-4 py-2 text-sm ${periodType === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            onClick={() => setPeriodType('monthly')}
          >
            Mensal
          </button>
        </div>
      </div>

      {rankings.length > 0 ? (
        <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#131325] text-gray-400 text-left">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FaUsers className="text-indigo-400" />
                    <span>Referidos</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FaMoneyBillWave className="text-green-400" />
                    <span>Ganhos</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-800 hover:bg-[#1e1e36]">
                  <td className="py-3 px-4">
                    <div className={`flex items-center ${getMedalColor(user.rank)}`}>
                      {user.rank <= 3 ? (
                        <FaMedal className="mr-1" />
                      ) : null}
                      {user.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username} 
                          className="w-8 h-8 rounded-full mr-2 bg-gray-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full mr-2 bg-indigo-600 flex items-center justify-center text-white">
                          {formatUsername(user.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-white">{formatUsername(user.username)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-indigo-400 font-medium">
                    {user.referrals_count}
                  </td>
                  <td className="py-3 px-4 text-center text-green-400 font-medium">
                    ${user.earnings?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-400 p-10 bg-[#1a1a2e] rounded-lg">
          Nenhum usuário encontrado para este período. Seja o primeiro no ranking!
        </div>
      )}
    </div>
  );
};

export default ReferralRankings;
