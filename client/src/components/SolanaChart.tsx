import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useBlockchain } from '../context/BlockchainContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Ghost, Loader } from 'lucide-react';

const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes 
const FALLBACK_ENDPOINTS = [
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true",
  "https://api.coinpaprika.com/v1/tickers/sol-solana",
  "https://api.kraken.com/0/public/Ticker?pair=SOLUSD",
  "https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD",
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SOL&convert=USD&CMC_PRO_API_KEY=SEU_API_KEY"
];


const RETRY_DELAY = 5000; // 5 seconds between retries
const MAX_RETRIES = 3;

const generateSampleData = (basePrice: number): CandleData[] => {
  const data: CandleData[] = [];
  const now = Date.now();
  const minuteMs = 60000; // 1 minute in milliseconds
  const hoursInMinutes = 24 * 60; // 24 hours in minutes
  
  for (let i = hoursInMinutes; i >= 0; i--) {
    const time = now - (i * minuteMs);
    // Create smoother price variations
    const variation = Math.sin(i * 0.1) * 1.5 + (Math.random() - 0.5);
    const close = basePrice + variation;
    const volume = Math.random() * 1000000;
    
    data.push({ time, close, volume });
  }
  
  return data;
};

interface CandleData {
  time: number;
  close: number;
  volume: number;
}

// Price data cache
const priceCache = new Map<string, { data: CandleData[]; timestamp: number }>();

async function fetchPriceData(currentEndpoint = 0, retries = 0): Promise<CandleData[]> {
  const cached = priceCache.get("solana");
  if (cached && Date.now() - cached.timestamp < UPDATE_INTERVAL) {
    console.log("Usando cache para evitar excesso de requisições.");
    return cached.data;
  }

  try {
    const response = await fetch(FALLBACK_ENDPOINTS[currentEndpoint], { mode: "cors" });

    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    const data = await response.json();

    let priceData: CandleData[] = [];

    // Tratamento de resposta dependendo da API usada
    if (currentEndpoint === 0) {
      priceData = [{ time: Date.now(), close: data.solana.usd, volume: data.solana.usd_market_cap }];
    } else if (currentEndpoint === 1) {
      priceData = [{ time: Date.now(), close: data.price, volume: data.volume_24h }];
    } else if (currentEndpoint === 2) {
      priceData = [{ time: Date.now(), close: parseFloat(data.result.SOLUSD.c[0]), volume: 0 }];
    }

    priceCache.set("solana", { data: priceData, timestamp: Date.now() });
    return priceData;

  } catch (error) {
    console.error("Erro ao buscar preço:", error);

    // Tentar próxima API se disponível
    if (currentEndpoint < FALLBACK_ENDPOINTS.length - 1) {
      return fetchPriceData(currentEndpoint + 1, retries);
    }

    // Se todas as APIs falharem, tenta novamente após um atraso
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchPriceData(0, retries + 1);
    }

    throw new Error("Falha ao buscar preço da Solana após múltiplas tentativas.");
  }
}


const SolanaChart: React.FC = () => {
  const { currentBlockchain } = useBlockchain();
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentEndpoint, setCurrentEndpoint] = useState(0);
  
  // Get symbol for current blockchain
  const symbol = currentBlockchain?.symbol || 'SOL';
  
  // Map blockchain to ID
  const coinId = useMemo(() => {
    return currentBlockchain?.id || 'solana';
  }, [currentBlockchain]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateChartData = async () => {
    const now = Date.now();
    if (now - lastUpdate < UPDATE_INTERVAL && data.length > 0) {
      return;
    }
  
    try {
      setLoading(true);
      const priceData = await fetchPriceData();
      
      // Generate 24h of sample data based on current price
      const basePrice = priceData[0].close;
      const historicalData = generateSampleData(basePrice);
      
      setData(historicalData);
      setError(null);
      setLastUpdate(now);
    } catch (err) {
      console.error("Erro ao buscar preço da Solana:", err);
      setError("Erro ao carregar o preço da Solana. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  

  // Reset and fetch data when blockchain changes
  useEffect(() => {
    setData([]);
    setLoading(true);
    setError(null);
    setRetryCount(0);

    if (currentBlockchain) {
      updateChartData();
    }
  }, [currentBlockchain]);

  // Refresh data periodically only when blockchain is selected
  useEffect(() => {
    if (!currentBlockchain) return;

    let interval: NodeJS.Timeout;

    const startUpdates = () => {
      updateChartData(); // Initial fetch
      interval = setInterval(updateChartData, UPDATE_INTERVAL);
    };

    startUpdates();

    return () => clearInterval(interval);
  }, [currentBlockchain, lastUpdate]);

  const name = currentBlockchain?.name || 'Solana';

  const getDataLimit = () => {
    const width = windowWidth;
    if (width < 640) return 24; // Mobile: 6 hours
    if (width < 1024) return 48; // Tablet: 12 hours
    return 96; // Desktop: 24 hours
  };

  const formatXAxis = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background-card/95 backdrop-blur-sm p-3 rounded-lg border border-primary/20 shadow-lg">
          <p className="text-neutral-400 text-sm mb-1">
            {format(new Date(data.time), 'dd/MM/yyyy HH:mm')}
          </p>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-neutral-400">Preço:</span>
              <span className="text-primary">${data.close.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-neutral-400">Volume:</span>
              <span className="text-secondary">${data.volume.toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="ghost-card p-6 flex items-center justify-center min-h-[300px] relative">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-neutral-400">Carregando dados do mercado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ghost-card p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Ghost className="w-12 h-12 text-danger/50" />
          <p className="text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-2"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ghost-card p-3 sm:p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Ghost className="w-5 h-5 text-primary ghost-logo" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold ghost-text">{name}</h3>
              <p className="text-sm text-neutral-400">Últimas 24 horas</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-background-light/30 rounded-lg px-3 py-1.5">
            <span className="text-sm text-neutral-400">Volume 24h:</span>
            <span className="text-sm font-medium text-secondary">
              ${data[0]?.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-2xl sm:text-3xl font-bold ghost-text">
              ${data[0]?.close.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${data[0]?.close > (data[1]?.close || 0) ? 'text-success' : 'text-danger'}`}>
                {data[0]?.close > (data[1]?.close || 0) ? '+' : ''}
                {(((data[0]?.close - (data[1]?.close || 0)) / (data[1]?.close || 1)) * 100).toFixed(2)}%
              </span>
              <span className="text-xs text-neutral-400">24h</span>
            </div>
          </div>
        </div>

        <div className="h-[200px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              className="animate-ghostAppear"
              data={data}
              margin={{
                top: 10,
                right: windowWidth < 640 ? 10 : 30,
                left: windowWidth < 640 ? 0 : 10,
                bottom: 0
              }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ghost-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--ghost-primary)" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                stroke={windowWidth < 640 ? "#495057" : "#666"}
                fontSize={windowWidth < 640 ? 8 : 10}
                interval={windowWidth < 640 ? 4 : 2}
                tickLine={false}
                axisLine={false}
                dy={5}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={['auto', 'auto']}
                tickFormatter={formatTooltip}
                stroke={windowWidth < 640 ? "#495057" : "#666"}
                fontSize={windowWidth < 640 ? 8 : 10}
                tickLine={false}
                axisLine={false}
                width={windowWidth < 640 ? 35 : 45}
                dx={windowWidth < 640 ? -5 : 0}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'var(--ghost-primary)',
                  strokeWidth: windowWidth < 640 ? 0.5 : 1,
                  strokeDasharray: '3 3'
                }}
                wrapperStyle={{
                  zIndex: 100,
                  outline: 'none'
                }}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1528"
                opacity={windowWidth < 640 ? 0.05 : 0.1}
                vertical={windowWidth >= 640}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                name={`Preço (${symbol})`}
                stroke="var(--ghost-primary)"
                strokeWidth={windowWidth < 640 ? 1.5 : 2}
                fill="url(#colorPrice)"
                animationDuration={300}
                isAnimationActive={true}
                filter="url(#glow)"
                dot={false}
                activeDot={{
                  r: windowWidth < 640 ? 3 : 4,
                  stroke: 'var(--ghost-primary)',
                  strokeWidth: 2,
                  fill: '#fff'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SolanaChart