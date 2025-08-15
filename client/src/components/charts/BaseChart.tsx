import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
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
import { useBlockchain } from '../../context/BlockchainContext';

const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

interface CandleData {
  time: number;
  close: number;
  volume: number;
}

interface BaseChartProps {
  coinId: string;
  endpoints: string[];
  icon: React.ElementType;
}

const generateSampleData = (basePrice: number): CandleData[] => {
  const data: CandleData[] = [];
  const now = Date.now();
  const minuteMs = 60000;
  const hoursInMinutes = 24 * 60;
  
  for (let i = hoursInMinutes; i >= 0; i--) {
    const time = now - (i * minuteMs);
    const variation = Math.sin(i * 0.1) * 1.5 + (Math.random() - 0.5);
    const close = basePrice + variation;
    const volume = Math.random() * 1000000;
    
    data.push({ time, close, volume });
  }
  
  return data;
};

const priceCache = new Map<string, { data: CandleData[]; timestamp: number }>();

const BaseChart: React.FC<BaseChartProps> = ({ coinId, endpoints, icon: Icon }) => {
  const { currentBlockchain } = useBlockchain();
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const symbol = currentBlockchain?.symbol || '';
  const name = currentBlockchain?.name || '';

  const getDataLimit = () => {
    if (windowWidth < 640) return 24; // Mobile: 6 hours
    if (windowWidth < 1024) return 48; // Tablet: 12 hours
    return 96; // Desktop: 24 hours
  };

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
      const cached = priceCache.get(coinId);
      
      if (cached && now - cached.timestamp < UPDATE_INTERVAL) {
        setData(cached.data);
        setLastUpdate(cached.timestamp);
        return;
      }

      const response = await fetch(endpoints[0]);
      const priceData = await response.json();
      const basePrice = priceData.solana?.usd || priceData[coinId]?.usd || 100;
      
      const historicalData = generateSampleData(basePrice);
      setData(historicalData.slice(-getDataLimit()));
      
      priceCache.set(coinId, {
        data: historicalData.slice(-getDataLimit()),
        timestamp: now
      });
      
      setLastUpdate(now);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${name} price:`, err);
      setError(`Error loading ${name} price. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBlockchain) {
      updateChartData();
      const interval = setInterval(updateChartData, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [currentBlockchain]);

  const formatXAxis = (timestamp: number) => format(new Date(timestamp), 'HH:mm');
  const formatTooltip = (value: number) => `$${value.toFixed(2)}`;

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
              <span className="text-neutral-400">Price:</span>
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
      <div className="ghost-card p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-neutral-400">Loading market data...</p>
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
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-3 sm:p-6 relative overflow-hidden group rounded-xl backdrop-blur-md border"
      style={{
        backgroundColor: 'rgba(39, 39, 42, 0.3)',
        borderColor: 'rgba(123, 104, 238, 0.3)',
        boxShadow: '0 8px 32px rgba(123, 104, 238, 0.1)'
      }}
    >
      <div 
        className="absolute inset-0 animate-pulse" 
        style={{
          background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />
        
      <div className="relative">
        <div className="flex mb-4 sm:mb-6">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: `${currentBlockchain?.color}20` }}
            >
              <Icon 
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: currentBlockchain?.color }}
              />
            </div>
            <div className="flex flex-col">
              <h3 
                className="text-base sm:text-lg font-semibold"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">Últimas 24 horas</p>
              <div className="flex items-center flex-wrap mt-1">
                <p 
                  className="text-2xl sm:text-3xl font-bold mr-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  ${data[0]?.close.toFixed(2)}
                </p>
                <div className="flex items-center">
                  <span 
                    className="text-sm"
                    style={{ 
                      color: data[0]?.close > (data[1]?.close || 0) ? '#10B981' : '#EF4444' 
                    }}
                  >
                    {data[0]?.close > (data[1]?.close || 0) ? '+' : ''}
                    {(((data[0]?.close - (data[1]?.close || 0)) / (data[1]?.close || 1)) * 100).toFixed(2)}%
                  </span>
                  <span className="text-xs text-neutral-400 ml-1">24h</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start">
            <div 
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-md"
              style={{ backgroundColor: 'rgba(55, 55, 58, 0.4)' }}
            >
              <span className="text-sm text-neutral-400">Volume:</span>
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--ghost-secondary)' }}
              >
                ${data[0]?.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: windowWidth < 640 ? 10 : 30,
                left: windowWidth < 640 ? 0 : 10,
                bottom: 0
              }}
              className="animate-ghostAppear"
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentBlockchain?.color || 'var(--ghost-primary)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentBlockchain?.color || 'var(--ghost-primary)'} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ghost-secondary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--ghost-secondary)" stopOpacity={0.02} />
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
                fontSize={10}
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
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={windowWidth < 640 ? 35 : 45}
                dx={windowWidth < 640 ? -5 : 0}
              />
              <YAxis
                yAxisId="volume"
                orientation="left"
                domain={['auto', 'auto']}
                tickFormatter={formatTooltip}
                stroke={windowWidth < 640 ? "#495057" : "#666"}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={windowWidth < 640 ? 35 : 45}
                dx={windowWidth < 640 ? 5 : 0}
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
              <Area
                yAxisId="volume"
                type="monotone"
                dataKey="volume"
                name="Volume"
                stroke="var(--ghost-secondary)"
                strokeWidth={windowWidth < 640 ? 0.5 : 1}
                fill="url(#colorVolume)"
                animationDuration={300}
                isAnimationActive={true}
                dot={false}
                activeDot={{
                  r: windowWidth < 640 ? 2 : 3,
                  stroke: 'var(--ghost-secondary)',
                  strokeWidth: 1,
                  fill: '#fff'
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 10
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BaseChart;