
import React, { useState } from 'react';
import { FaWallet, FaExchangeAlt, FaHistory, FaInfoCircle } from 'react-icons/fa';
import { useReferral } from '../../context/ReferralContext';

const ReferralWithdrawal: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { stats, requestWithdrawal, solPrice, refreshStats } = useReferral();

  // Calcular saldo disponível
  const availableBalance = stats?.stats?.available_balance || 0;
  const minWithdrawalUsd = 10; // Valor mínimo para saque em USD
  const minWithdrawalSol = minWithdrawalUsd / (solPrice || 20);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      alert('Por favor, informe um endereço de carteira válido.');
      return;
    }

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Por favor, informe um valor válido para saque.');
      return;
    }

    if (withdrawAmount > availableBalance) {
      alert('Valor de saque não pode ser maior que o saldo disponível.');
      return;
    }

    if (withdrawAmount < minWithdrawalSol) {
      alert(`Valor mínimo para saque é ${minWithdrawalSol.toFixed(2)} SOL (aproximadamente $${minWithdrawalUsd}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal(walletAddress, withdrawAmount);
      setWalletAddress('');
      setWithdrawAmount('');
      await refreshStats();
    } catch (error: any) {
      alert(`Erro ao processar saque: ${error.message || 'Tente novamente mais tarde.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxAmount = () => {
    setWithdrawAmount(availableBalance);
  };

  // Renderizar histórico de transações
  const renderTransactionHistory = () => {
    const transactions = stats?.stats?.recent_transactions || [];

    if (transactions.length === 0) {
      return (
        <div className="text-center text-gray-400 py-6">
          Nenhuma transação encontrada.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-3 px-2">Data</th>
              <th className="py-3 px-2">Valor</th>
              <th className="py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => (
              <tr key={tx.id} className="border-b border-gray-800 text-sm">
                <td className="py-3 px-2 text-gray-300">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-2">
                  <div className="text-green-400 font-medium">
                    {tx.amount_sol?.toFixed(4)} SOL
                  </div>
                  <div className="text-gray-500 text-xs">
                    ≈ ${tx.amount_usd?.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.status === 'completed' ? 'bg-green-900 text-green-300' :
                    tx.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {tx.status === 'completed' ? 'Concluído' :
                     tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Formulário de Saque */}
      <div className="bg-[#1a1a2e] rounded-lg p-6">
        <h3 className="text-xl font-medium text-indigo-400 mb-4 flex items-center gap-2">
          <FaWallet /> Saque de Recompensas
        </h3>

        <div className="mb-6">
          <div className="bg-[#131325] p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Saldo Disponível:</span>
              <div className="text-right">
                <div className="text-green-400 font-medium">{availableBalance.toFixed(4)} SOL</div>
                <div className="text-xs text-gray-500">≈ ${(availableBalance * (solPrice || 20)).toFixed(2)}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valor Mínimo:</span>
              <div className="text-right">
                <div className="text-gray-300">{minWithdrawalSol.toFixed(4)} SOL</div>
                <div className="text-xs text-gray-500">≈ ${minWithdrawalUsd.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleWithdraw}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Endereço da Carteira Solana</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Endereço da sua carteira Solana"
                className="w-full bg-[#131325] border border-gray-700 rounded-lg px-4 py-3 text-white"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Valor em SOL</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  step="0.0001"
                  min="0"
                  max={availableBalance}
                  placeholder="0.0000"
                  className="w-full bg-[#131325] border border-gray-700 rounded-lg px-4 py-3 text-white pr-24"
                  required
                />
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2a2a45] hover:bg-[#343450] text-indigo-400 px-3 py-1 rounded text-sm"
                >
                  MAX
                </button>
              </div>
              
              {withdrawAmount !== '' && (
                <div className="mt-1 text-xs text-gray-400">
                  ≈ ${(parseFloat(withdrawAmount.toString()) * (solPrice || 20)).toFixed(2)} USD
                </div>
              )}
            </div>

            <div className="mb-4 text-xs text-gray-400 flex items-start">
              <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
              <p>
                Os saques são processados em até 24 horas. Certifique-se de informar um endereço de carteira Solana válido.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !walletAddress || !withdrawAmount || withdrawAmount > availableBalance || withdrawAmount < minWithdrawalSol}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                isSubmitting || !walletAddress || !withdrawAmount || withdrawAmount > availableBalance || withdrawAmount < minWithdrawalSol
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <FaExchangeAlt />
                  <span>Solicitar Saque</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Histórico de Transações */}
      <div className="bg-[#1a1a2e] rounded-lg p-6">
        <h3 className="text-xl font-medium text-indigo-400 mb-4 flex items-center gap-2">
          <FaHistory /> Histórico de Transações
        </h3>

        {renderTransactionHistory()}
      </div>
    </div>
  );
};

export default ReferralWithdrawal;
