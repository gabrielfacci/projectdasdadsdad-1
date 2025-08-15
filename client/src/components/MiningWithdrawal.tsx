import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';

interface MiningWithdrawalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

export default function MiningWithdrawal({ isOpen, onClose, balance }: MiningWithdrawalProps) {
  const { currentBlockchain } = useBlockchain();
  const { showNotification } = useNotification();
  const [address, setAddress] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [addressPlaceholder, setAddressPlaceholder] = useState('');

  const symbol = currentBlockchain?.symbol || 'SOL';
  const name = currentBlockchain?.name || 'Solana';
  const minWithdrawalUSD = 5; // Minimum $5 USD withdrawal

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

  // Load SOL price
  useEffect(() => {
    if (!isOpen) return;

    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error('Error fetching SOL price:', error);
        setSolPrice(20); // Fallback price
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
      setError('Por favor, insira um endereço de carteira.');
      return;
    }

    const withdrawalUSD = parseFloat(amountUSD);
    if (isNaN(withdrawalUSD) || withdrawalUSD <= 0) {
      setError('Por favor, insira um valor válido em USD para saque.');
      return;
    }

    if (withdrawalUSD < minWithdrawalUSD) {
      setError(`Valor mínimo para saque: $${minWithdrawalUSD.toFixed(2)}`);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > balance) {
      setError('Saldo insuficiente para este valor de saque.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement mining withdrawal logic
      showNotification({
        type: 'success',
        title: 'Saque Solicitado',
        message: 'Seu saque será processado em até 24 horas'
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]">
      <div className="relative w-full sm:max-w-md bg-background-card animate-ghostSlideIn">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse rounded-t-2xl sm:rounded-2xl" />
        
        <div className="relative h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
          <div className="sticky top-0 z-20 bg-background-card/95 backdrop-blur-md border-b border-neutral-700/20 rounded-t-2xl px-4 py-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary ghost-logo" />
              </div>
              <div>
                <h2 className="text-lg font-bold ghost-text">Solicitar Saque</h2>
                <p className="text-xs text-neutral-400">Retire seus ganhos em {symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-background-light/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-400">Saldo disponível em USD:</span>
                <span className="font-medium ghost-text">${(balance * solPrice).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Saldo em {symbol}:</span>
                <span className="text-xs text-primary">{balance.toFixed(4)} {symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Cotação</span>
                <span className="text-xs">
                  {loading ? (
                    "Carregando..."
                  ) : (
                    <span className="text-primary">${solPrice.toFixed(2)} por {symbol}</span>
                  )}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Valor para Saque (USD)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amountUSD}
                    pattern="[0-9]*"
                    inputMode="decimal"
                    onChange={(e) => handleAmountUSDChange(e.target.value)}
                    placeholder="Digite o valor em USD"
                    className="w-full bg-background-light/50 rounded-lg h-12 px-4 text-sm border border-neutral-700/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSetMaxAmount}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium text-primary hover:text-primary-light transition-colors hover:bg-primary/10 rounded-lg"
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
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Endereço da Carteira {name}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={addressPlaceholder}
                  className="w-full bg-background-light/50 rounded-lg h-12 px-4 text-sm border border-neutral-700/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-danger text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="bg-background-light/30 rounded-lg p-3 text-xs sm:text-sm text-neutral-400">
                <p className="font-medium text-white mb-2">Informações Importantes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Valor mínimo: ${minWithdrawalUSD.toFixed(2)}</li>
                  <li>O processamento pode levar até 24 horas</li>
                  <li>Verifique o endereço com atenção</li>
                  <li>Apenas carteiras {name} são aceitas</li>
                </ul>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn bg-background-light hover:bg-background-light/80 flex-1"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary flex-1 group"
                  disabled={loading || !amountUSD || parseFloat(amountUSD) < minWithdrawalUSD || parseFloat(amountUSD) > balance}
                >
                  <span>
                    {!amountUSD
                      ? "Insira um valor"
                      : parseFloat(amountUSD) < minWithdrawalUSD
                      ? `Mínimo $${minWithdrawalUSD.toFixed(2)}`
                      : parseFloat(amountUSD) > balance
                      ? "Saldo insuficiente"
                      : "Confirmar"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}