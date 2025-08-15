import React, { useState, useEffect } from 'react';
import { Share2, Users, Gift, Copy, ChevronRight, TrendingUp, Ghost, Sparkles, Check, MousePointer, Send, AlertCircle, DollarSign, X, Crown, Target, Award, ArrowUpRight, ArrowRight, Wallet } from 'lucide-react';
import { useReferral } from '../context/ReferralContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useAuth } from '../context/AuthContext';
import { getActiveSettings } from '../lib/referrals';
import { format } from 'date-fns';
import { trackReferralClick } from '../lib/referrals';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, balance }) => {
  const { currentBlockchain } = useBlockchain();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [addressPlaceholder, setAddressPlaceholder] = useState('');
  const { requestWithdrawal } = useReferral();

  const symbol = currentBlockchain?.symbol || 'SOL';
  const name = currentBlockchain?.name || 'Solana';
  const MIN_WITHDRAWAL_SOL = 1; // Minimum 1 SOL withdrawal

  // Set address placeholder based on blockchain
  useEffect(() => {
    const placeholders = {
      solana: 'Ex: 7nR6HrYGhv...X2fA9Mh',
      bitcoin: 'Ex: bc1qxy2k...gn5qjxf',
      ethereum: 'Ex: 0x742d35...e468',
      bsc: 'Ex: 0x742d35...e468',
      cardano: 'Ex: addr1qxy...gn5q',
      polkadot: 'Ex: 1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWx1CrKTyrVYhAjZDj'
    };
    
    setAddressPlaceholder(currentBlockchain ? placeholders[currentBlockchain.id] : placeholders.solana);
  }, [currentBlockchain]);

useEffect(() => {
  if (!isOpen) return; // Evita rodar desnecessariamente

  const fetchSolPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      setSolPrice(0);
    } finally {
      setLoading(false);
    }
  };

  fetchSolPrice();
}, [isOpen]);


  const handleSetMaxAmount = () => {
    setAmountUSD((balance * solPrice).toFixed(2));
    setAmount(balance.toFixed(4));
    setError(null);
  };

  const handleAmountUSDChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmountUSD(value);
      // Calculate SOL amount based on USD input
      const usdAmount = parseFloat(value);
      if (!isNaN(usdAmount) && solPrice > 0) {
        setAmount((usdAmount / solPrice).toFixed(4));
      } else {
        setAmount('');
      }
      setError(null);
    }
  };

  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setError(null);
    setLoading(true);

    if (!address) {
      setError('Por favor, insira um endereço de carteira Solana.');
      setLoading(false);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Por favor, insira um valor válido para saque.');
      setLoading(false);
      return;
    }

    if (withdrawalAmount < MIN_WITHDRAWAL_SOL) {
      setError(`Valor mínimo para saque: ${MIN_WITHDRAWAL_SOL} ${symbol}`);
      setLoading(false);
      return;
    }

    if (withdrawalAmount > balance) {
      setError('Saldo insuficiente para este valor de saque.');
      setLoading(false);
      return;
    }

    try {
      await requestWithdrawal(user.id, address, withdrawalAmount);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar o saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
      style={{ backgroundColor: 'rgba(13, 10, 20, 0.9)' }}
    >
      <div 
        className="relative w-full sm:max-w-md animate-ghostSlideIn backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.4)',
          borderColor: 'rgba(123, 104, 238, 0.4)',
          boxShadow: '0 20px 40px rgba(123, 104, 238, 0.3)'
        }}
      >
        <div 
          className="absolute inset-0 animate-pulse rounded-t-2xl sm:rounded-2xl" 
          style={{
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
          }}
        />
        
        <div className="relative h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
          <div 
            className="sticky top-0 z-20 backdrop-blur-md border-b rounded-t-2xl px-4 py-3 sm:p-4 flex items-center justify-between"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.95)',
              borderColor: 'rgba(123, 104, 238, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
              >
                <Send 
                  className="w-5 h-5 ghost-logo" 
                  style={{ color: 'var(--ghost-primary)' }}
                />
              </div>
              <div>
                <h2 
                  className="text-lg font-bold ghost-text"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Solicitar Saque
                </h2>
                <p className="text-xs text-neutral-400">Retire seus ganhos em SOL</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div 
              className="rounded-xl p-3 backdrop-blur-md border"
              style={{
                backgroundColor: 'rgba(55, 55, 58, 0.4)',
                borderColor: 'rgba(123, 104, 238, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-400">Saldo disponível em USD:</span>
                <span 
                  className="font-medium ghost-text"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  ${(balance * solPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Saldo em {symbol}:</span>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--ghost-primary)' }}
                >
                  {balance.toFixed(4)} {symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Cotação</span>
                <span className="text-xs">
                  {loading ? (
                    "Carregando..."
                  ) : (
                    <span style={{ color: 'var(--ghost-primary)' }}>
                      {formatUSD(solPrice)} por SOL
                    </span>
                  )}
                </span>
              </div>
            </div>

            <form id="withdrawal-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-neutral-300 mb-2">
                  Valor para Saque (USD)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="amount"
                    value={amountUSD}
                    pattern="[0-9]*"
                    inputMode="decimal"
                    onChange={(e) => handleAmountUSDChange(e.target.value)}
                    placeholder="Digite o valor em USD"
                    className="w-full rounded-lg h-12 px-4 text-sm border outline-none transition-all backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(55, 55, 58, 0.5)',
                      borderColor: 'rgba(123, 104, 238, 0.2)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ghost-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSetMaxAmount}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium rounded-lg transition-colors duration-200"
                    style={{ color: 'var(--ghost-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--ghost-secondary)';
                      e.currentTarget.style.backgroundColor = 'rgba(123, 104, 238, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--ghost-primary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Max
                  </button>
                </div>
                {amountUSD && !isNaN(parseFloat(amountUSD)) && (
                  <p className="text-sm text-neutral-400 mt-1">
                    ≈ {parseFloat(amount).toFixed(4)} {symbol}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-neutral-300 mb-2">
                  Endereço da Carteira {name}
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={addressPlaceholder}
                  className="w-full rounded-lg h-12 px-4 text-sm border outline-none transition-all backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.5)',
                    borderColor: 'rgba(123, 104, 238, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ghost-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--ghost-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123, 104, 238, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>


              {error && (
                <div className="flex items-center gap-2 text-danger text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div 
                className="rounded-lg p-3 text-xs sm:text-sm text-neutral-400 backdrop-blur-md border"
                style={{
                  backgroundColor: 'rgba(55, 55, 58, 0.4)',
                  borderColor: 'rgba(123, 104, 238, 0.2)'
                }}
              >
                <p 
                  className="font-medium mb-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Informações Importantes:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Valor mínimo: {MIN_WITHDRAWAL_SOL} {symbol}</li>
                  <li>O processamento pode levar até 24 horas</li>
                  <li>Verifique o endereço com atenção</li>
                  <li>Apenas carteiras {name} são aceitas</li>
                </ul>
              </div>
            </form>
          
            <div 
              className="sticky bottom-0 left-0 right-0 p-4 backdrop-blur-md border-t"
              style={{
                backgroundColor: 'rgba(39, 39, 42, 0.95)',
                borderColor: 'rgba(123, 104, 238, 0.2)'
              }}
            >
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn flex-1 h-12 backdrop-blur-md border transition-all duration-300 hover:scale-102"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.4)',
                    borderColor: 'rgba(123, 104, 238, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
                  }}
                >
                  Cancelar
                </button>
<button
  type="submit"
  form="withdrawal-form"
  className="btn flex-1 group h-12 backdrop-blur-md border transition-all duration-300 hover:scale-102"
  style={{
    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
    borderColor: 'rgba(123, 104, 238, 0.5)',
    boxShadow: '0 8px 32px rgba(123, 104, 238, 0.3)',
    color: '#FFFFFF'
  }}
  onMouseEnter={(e) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.boxShadow = '0 10px 40px rgba(123, 104, 238, 0.4)';
    }
  }}
  onMouseLeave={(e) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(123, 104, 238, 0.3)';
    }
  }}
  disabled={!amount || parseFloat(amount) < MIN_WITHDRAWAL_SOL || parseFloat(amount) > balance}
>
  <span>
    {!amount
      ? "Insira um valor"
      : parseFloat(amount) < MIN_WITHDRAWAL_SOL
      ? `Mínimo ${MIN_WITHDRAWAL_SOL} ${symbol}`
      : parseFloat(amount) > balance
      ? "Saldo insuficiente"
      : "Confirmar"}
  </span>
  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
</button>
              </div>
              <p className="text-xs text-neutral-400 text-center mt-2">Retire seus ganhos em USD convertidos para {symbol}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default WithdrawalModal;