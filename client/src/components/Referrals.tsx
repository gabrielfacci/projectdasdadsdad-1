import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Users, Gift, Copy, ChevronRight, TrendingUp, Ghost, Sparkles, Check, MousePointer, Send, AlertCircle, DollarSign, X, Crown, Target, Award, ArrowUpRight, ArrowRight, Wallet } from 'lucide-react';
import { useReferral } from '../context/ReferralContext';
import { useBlockchain } from '../context/BlockchainContext';
import { getActiveSettings } from '../lib/referrals';
import { format } from 'date-fns';
import { trackReferralClick } from '../lib/referrals';
import { useNotification } from '../context/NotificationContext';
import ReferralWithdrawal from './referrals/ReferralWithdrawal';
import ReferralRankings from './referrals/ReferralRankings';
import ReferralGoals from './referrals/ReferralGoals';
import ReferralAchievements from './referrals/ReferralAchievements';
import { FaUsers, FaTrophy, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';


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

  const MIN_WITHDRAWAL_USD = 5; // Minimum $5 USD withdrawal

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError('Por favor, insira um endereço de carteira Solana.');
      return;
    }

    const withdrawalUSD = parseFloat(amountUSD);
    if (isNaN(withdrawalUSD) || withdrawalUSD <= 0) {
      setError('Por favor, insira um valor válido em USD para saque.');
      return;
    }

    if (withdrawalUSD < MIN_WITHDRAWAL_USD) {
      setError(`Valor mínimo para saque: $${MIN_WITHDRAWAL_USD}.00`);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > balance) {
      setError('Saldo insuficiente para este valor de saque.');
      return;
    }

    try {
      await requestWithdrawal('user-id', address, withdrawalAmount);
      onClose();
    } catch (err) {
      setError('Erro ao processar o saque. Tente novamente.');
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
                  <li>Valor mínimo: ${MIN_WITHDRAWAL_USD}.00</li>
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
                  disabled={!amountUSD || parseFloat(amountUSD) < MIN_WITHDRAWAL_USD || parseFloat(amount) > balance}
                >
                  <span>{!amountUSD ? 'Insira um valor' : parseFloat(amountUSD) < MIN_WITHDRAWAL_USD ? `Mínimo $${MIN_WITHDRAWAL_USD}.00` : parseFloat(amount) > balance ? 'Saldo insuficiente' : 'Confirmar'}</span>
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

function Referrals() {
const { stats, loading, error, referralCode, refreshStats, copyReferralLink, currentLevel } = useReferral();
const [settings, setSettings] = useState<{ reward_amount_usd: number; min_withdrawal_usd: number } | null>(null);
const level = stats?.level?.current || { name: 'Bronze', color: '#CD7F32', bonus: 0 };
const userStats = stats?.stats || { 
  total_earnings: 0, 
  total_referrals: 0, 
  qualified_referrals: 0, 
  sol_price: 20,
  total_withdrawn_usd: 0,
  total_rewards_usd: 0,
  last_withdrawal_date: null,
  last_reward_date: null
};

  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'rewards'>('overview');

  // Carregar configurações e dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tentar buscar configurações
        const settings = await getActiveSettings();
        setSettings(settings);
        console.log("[Referrals] Configurações carregadas:", settings);

        // Realizar refresh de estatísticas
        if (refreshStats) {
          await refreshStats();
          console.log("[Referrals] Estatísticas atualizadas");
        }
      } catch (err) {
        console.error('[Referrals] Erro ao carregar dados:', err);
        setSettings({
          reward_amount_usd: 10,
          min_withdrawal_usd: 5
        });
      }
    };

    fetchData();
  }, [refreshStats]);

  // Construir link de referência com o código real do usuário
  const referralLink = useMemo(() => {
    if (!referralCode) {
      console.log('[Referrals] Aguardando código de referência...');
      // Mesmo sem código, mostrar a URL base completa
      return `${window.location.origin}/?ref=...`;
    }
    
    // Mesmo para código temporário, exibir o código no link
    // isso ajuda a identificar problemas mais facilmente
    if (referralCode === 'GW00000000') {
      console.log('[Referrals] Código temporário detectado:', referralCode);
    } else {
      console.log('[Referrals] Código de referência válido:', referralCode);
    }
    
    // Sempre usar o código disponível no momento, mesmo que seja temporário
    return `${window.location.origin}/?ref=${referralCode}`;
  }, [referralCode]);
  
  // Verificar referral code na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode && refCode !== referralCode) {
      try {
        trackReferralClick(refCode);
        console.log("[Referrals] Referência rastreada:", refCode);
      } catch (err) {
        console.error('[Referrals] Erro ao rastrear referência:', err);
      }
    }
  }, [referralCode]);

  // A variável referralLink já foi declarada acima usando useMemo

  // Copiar link para área de transferência
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification({
        type: 'success',
        title: 'Link Copiado',
        message: 'Link de referência copiado para a área de transferência'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível copiar o link'
      });
    }
  };

  // Renderizar loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-background-card/50 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="h-24 bg-background-card/50 rounded-xl" />
            <div className="h-24 bg-background-card/50 rounded-xl" />
            <div className="h-24 bg-background-card/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Caso não tenha dados e não esteja em loading
  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="ghost-card p-8 rounded-lg text-center">
          <Gift className="w-16 h-16 mx-auto text-primary/50 mb-4" />
          <p className="mb-4">Dados de referência não disponíveis</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mx-auto"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Caso de erro crítico, mas ainda tenta mostrar dados básicos
  if (error && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="ghost-card p-8 rounded-lg text-center">
          <Ghost className="w-16 h-16 mx-auto text-danger/50 mb-4" />
          <p className="text-danger mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mx-auto"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderizar conteúdo principal
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-20">
      <div 
        className="p-4 sm:p-6 mb-4 relative overflow-hidden group rounded-xl backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.4)',
          borderColor: 'rgba(123, 104, 238, 0.3)',
          boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
        }}
      >
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
          }}
        />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
                >
                  <Gift 
                    className="w-7 h-7 ghost-logo" 
                    style={{ color: 'var(--ghost-primary)' }}
                  />
                </div>
                {level && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: level.color }}>
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Ganhos de Referência</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 
                          className="text-2xl sm:text-3xl font-bold"
                          style={{
                            background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                          }}
                        >
                          ${((userStats.total_earnings || 0) * (userStats.sol_price || 20)).toFixed(2)}
                        </h2>
                        <Sparkles 
                          className="w-5 h-5 animate-pulse" 
                          style={{ color: '#F59E0B' }}
                        />
                        <button
                          onClick={() => setShowWithdrawal(true)}
                          className="btn btn-sm h-8 ml-2 backdrop-blur-md border transition-all duration-300 hover:scale-102"
                          style={{
                            background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                            borderColor: 'rgba(123, 104, 238, 0.5)',
                            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.2)';
                          }}
                        >
                          <Send className="w-4 h-4" />
                          <span>Sacar</span>
                        </button>
                      </div>
                      <div className="text-sm text-neutral-400">
                        ≈ {(userStats.total_earnings || 0).toFixed(4)} SOL
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-neutral-400">Nível</span>
                      <span className="text-xs font-medium" style={{ color: level.color || 'white' }}>
                        {level.name}
                      </span>
                      {level.bonus > 0 && (
                        <span className="text-xs text-success">
                          (+{level.bonus}% bônus)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Link de Referência */}
          <div 
            className="mt-6 p-4 rounded-xl border relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(55, 55, 58, 0.4)',
              borderColor: 'rgba(123, 104, 238, 0.2)'
            }}
          >
            <div 
              className="absolute inset-0 animate-pulse" 
              style={{
                background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.03), rgba(147, 112, 219, 0.03))'
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-neutral-400">Seu Link de Referência</label>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: '#10B981' }}
                  >
                    Ganhe ${(settings?.reward_amount_usd || 10).toFixed(2)} USD
                  </span>
                  <Gift 
                    className="w-4 h-4 animate-pulse" 
                    style={{ color: '#10B981' }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="w-full rounded-lg px-4 py-3 text-sm border backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(55, 55, 58, 0.5)',
                      borderColor: 'rgba(123, 104, 238, 0.2)'
                    }}
                  />
                </div>
                <button 
                  onClick={copyToClipboard} 
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg transition-all backdrop-blur-md"
                  style={{
                    backgroundColor: copied 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(123, 104, 238, 0.2)',
                    color: copied 
                      ? '#10B981' 
                      : 'var(--ghost-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) {
                      e.currentTarget.style.backgroundColor = 'rgba(123, 104, 238, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!copied) {
                      e.currentTarget.style.backgroundColor = 'rgba(123, 104, 238, 0.2)';
                    }
                  }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm font-medium">{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-xs text-neutral-400 mt-2">
                Compartilhe seu link e ganhe por cada referido qualificado
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-md border"
              style={{
                background: activeTab === 'overview'
                  ? 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))'
                  : 'rgba(55, 55, 58, 0.4)',
                borderColor: activeTab === 'overview'
                  ? 'rgba(123, 104, 238, 0.5)'
                  : 'rgba(123, 104, 238, 0.2)',
                color: activeTab === 'overview'
                  ? '#FFFFFF'
                  : '#9CA3AF'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">Visão Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-md border"
              style={{
                background: activeTab === 'stats'
                  ? 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))'
                  : 'rgba(55, 55, 58, 0.4)',
                borderColor: activeTab === 'stats'
                  ? 'rgba(123, 104, 238, 0.5)'
                  : 'rgba(123, 104, 238, 0.2)',
                color: activeTab === 'stats'
                  ? '#FFFFFF'
                  : '#9CA3AF'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'stats') {
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'stats') {
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">Estatísticas</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-md border"
              style={{
                background: activeTab === 'rewards'
                  ? 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))'
                  : 'rgba(55, 55, 58, 0.4)',
                borderColor: activeTab === 'rewards'
                  ? 'rgba(123, 104, 238, 0.5)'
                  : 'rgba(123, 104, 238, 0.2)',
                color: activeTab === 'rewards'
                  ? '#FFFFFF'
                  : '#9CA3AF'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'rewards') {
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'rewards') {
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">Recompensas</span>
            </button>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div 
                  className="rounded-xl p-4 border relative overflow-hidden group backdrop-blur-md transition-all duration-300 hover:scale-102"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.4)',
                    borderColor: 'rgba(123, 104, 238, 0.2)',
                    boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.1)';
                  }}
                >
                  <div 
                    className="absolute inset-0 animate-pulse" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.03), rgba(147, 112, 219, 0.03))'
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
                      >
                        <Wallet 
                          className="w-5 h-5" 
                          style={{ color: 'var(--ghost-primary)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-400">Total Sacado</h3>
                        <div className="flex items-center gap-2">
                          <p 
                            className="text-xl font-bold"
                            style={{
                              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent'
                            }}
                          >
                            ${(userStats.total_withdrawn_usd || 0).toFixed(2)}
                          </p>
                          <DollarSign 
                            className="w-4 h-4" 
                            style={{ color: 'rgba(123, 104, 238, 0.5)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Último saque:</span>
                      <span className="text-neutral-300">
                        {userStats.last_withdrawal_date ? 
                          format(new Date(userStats.last_withdrawal_date), 'dd/MM/yyyy HH:mm') :
                          'Nenhum saque ainda'}
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  className="rounded-xl p-4 border relative overflow-hidden group backdrop-blur-md transition-all duration-300 hover:scale-102"
                  style={{
                    backgroundColor: 'rgba(55, 55, 58, 0.4)',
                    borderColor: 'rgba(147, 112, 219, 0.2)',
                    boxShadow: '0 4px 16px rgba(147, 112, 219, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 112, 219, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(147, 112, 219, 0.1)';
                  }}
                >
                  <div 
                    className="absolute inset-0 animate-pulse" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.03), rgba(16, 185, 129, 0.03))'
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(147, 112, 219, 0.2)' }}
                      >
                        <Gift 
                          className="w-5 h-5" 
                          style={{ color: 'var(--ghost-secondary)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-400">Total em Recompensas</h3>
                        <div className="flex items-center gap-2">
                          <p 
                            className="text-xl font-bold"
                            style={{
                              background: 'linear-gradient(135deg, var(--ghost-secondary), var(--ghost-primary))',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent'
                            }}
                          >
                            ${(userStats.total_rewards_usd || 0).toFixed(2)}
                          </p>
                          <Sparkles 
                            className="w-4 h-4" 
                            style={{ color: 'rgba(147, 112, 219, 0.5)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Última recompensa:</span>
                      <span className="text-neutral-300">
                        {userStats.last_reward_date ? 
                          format(new Date(userStats.last_reward_date), 'dd/MM/yyyy HH:mm') :
                          'Nenhuma recompensa ainda'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="stat-card group hover:bg-background-card/70 transition-all duration-300">
                  <Users className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <div className="stat-value">{userStats.total_referrals || 0}</div>
                  <div className="stat-label">Total de Referidos</div>
                </div>

                <div className="stat-card group hover:bg-background-card/70 transition-all duration-300">
                  <Target className="w-6 h-6 text-success mb-2 group-hover:scale-110 transition-transform" />
                  <div className="stat-value">{userStats.qualified_referrals || 0}</div>
                  <div className="stat-label">Referidos Qualificados</div>
                </div>

                <div className="stat-card group hover:bg-background-card/70 transition-all duration-300">
                  <ArrowUpRight className="w-6 h-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                  <div className="stat-value">
                    {userStats.total_referrals > 0
                      ? ((userStats.qualified_referrals / userStats.total_referrals) * 100).toFixed(1)
                      : '0.0'}%
                  </div>
                  <div className="stat-label">Taxa de Qualificação</div>
                </div>

                <div className="stat-card group hover:bg-background-card/70 transition-all duration-300">
                  <Gift className="w-6 h-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                  <div className="stat-value">
                    {userStats.qualified_referrals > 0
                      ? (userStats.total_earnings / userStats.qualified_referrals).toFixed(4)
                      : '0.0000'} SOL
                  </div>
                  <div className="stat-label">Média por Qualificado</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold ghost-text mb-4">Rankings</h3>
              <ReferralRankings />
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold ghost-text mb-4">Metas</h3>
              <ReferralGoals />

              <h3 className="text-lg font-semibold ghost-text mb-4">Conquistas</h3>
              <ReferralAchievements />
            </div>
          )}
        </div>
      </div>

      {stats && (
        <WithdrawalModal
          isOpen={showWithdrawal}
          onClose={() => setShowWithdrawal(false)}
          balance={userStats.total_earnings || 0}
        />
      )}
    </div>
  );
}

export default Referrals;