
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, TrendingUp, Info } from 'lucide-react';

interface StatsOverviewProps {
  data?: {
    totalMined: number;
    dailyAverage: number;
    trend: number;
    chartData: { date: string; value: number }[];
  };
  currency?: string;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  data = {
    totalMined: 0,
    dailyAverage: 0,
    trend: 0,
    chartData: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 0.5 + 0.1
    }))
  }, 
  currency = 'SOL' 
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  // Calculate chart min/max values for proper scaling
  const maxValue = useMemo(() => Math.max(...data.chartData.map(d => d.value)) * 1.1, [data.chartData]);
  const minValue = useMemo(() => Math.min(...data.chartData.map(d => d.value)) * 0.9, [data.chartData]);
  const valueRange = maxValue - minValue;

  // Convert data point to y-coordinate
  const getYPosition = (value: number): number => {
    if (valueRange === 0) return 50; // Default mid-height if all values are the same
    return 100 - ((value - minValue) / valueRange) * 80;
  };

  // Animation variants
  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05
      }
    }
  };

  const pointVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="bg-background-light/20 rounded-xl p-4 border border-white/5 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative">
        {/* Header with title and total amount */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-neutral-400">
              Desempenho de Mineração
            </h3>
            <div className="flex items-center mt-1">
              <p className="text-xl font-bold text-white">
                {data.totalMined.toFixed(4)} {currency}
              </p>
              <span className="flex items-center ml-2 text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                {data.trend.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="text-right">
              <div className="text-xs text-neutral-400">Média Diária</div>
              <div className="text-sm font-medium text-white">{data.dailyAverage.toFixed(4)} {currency}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Info className="w-4 h-4 text-primary/70" />
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-40 relative">
          {/* Chart background grid */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={`grid-${i}`}
                className="w-full h-px bg-white/5"
              />
            ))}
          </div>
          
          {/* Chart lines and points */}
          <motion.div 
            className="absolute inset-0" 
            initial="hidden"
            animate="visible"
            variants={chartVariants}
          >
            {/* Generate SVG lines between points */}
            <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none">
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(123, 104, 238, 0.6)" />
                <stop offset="100%" stopColor="rgba(123, 104, 238, 0)" />
              </linearGradient>
              
              {/* Line connecting points */}
              <polyline
                points={data.chartData.map((point, index) => 
                  `${(index / (data.chartData.length - 1)) * 100}% ${getYPosition(point.value)}%`
                ).join(' ')}
                fill="none"
                stroke="rgba(123, 104, 238, 0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Area under the line */}
              <path
                d={`
                  M 0 ${getYPosition(data.chartData[0].value)}
                  ${data.chartData.map((point, index) => 
                    `L ${(index / (data.chartData.length - 1)) * 100} ${getYPosition(point.value)}`
                  ).join(' ')}
                  L 100 ${getYPosition(data.chartData[data.chartData.length - 1].value)}
                  L 100 100
                  L 0 100
                  Z
                `}
                fill="url(#lineGradient)"
                opacity="0.2"
              />
            </svg>
            
            {/* Points and hover effects */}
            <div className="w-full h-full absolute inset-0 flex items-end justify-between">
              {data.chartData.map((point, index) => (
                <React.Fragment key={`point-${index}`}>
                  {/* Linhas verticais (sombras das velas) */}
                  <motion.div
                    className="relative h-full flex-1"
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <div className={`h-full w-full ${hoverIndex === index ? 'bg-white/5' : ''}`}></div>
                    
                    {/* Data point */}
                    <motion.div
                      className={`absolute w-2 h-2 rounded-full ${
                        index === data.chartData.length - 1 ? 'bg-primary' : 'bg-primary/50'
                      } transform -translate-x-1 -translate-y-1`}
                      style={{ 
                        left: '50%', 
                        top: `${getYPosition(point.value)}%`,
                        boxShadow: index === data.chartData.length - 1 
                          ? '0 0 8px rgba(123, 104, 238, 0.8)' 
                          : 'none'
                      }}
                      variants={pointVariants}
                    />
                    
                    {/* Tooltip on hover */}
                    {hoverIndex === index && (
                      <div 
                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background-card border border-white/10 rounded-md px-2 py-1 text-xs z-20"
                        style={{ 
                          minWidth: '80px',
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                        }}
                      >
                        <div className="font-medium">{point.date}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span>{point.value.toFixed(4)}</span>
                          <span className="text-primary">{currency}</span>
                        </div>
                        
                        {/* Arrow pointing down */}
                        <div className="absolute w-2 h-2 bg-background-card border-r border-b border-white/10 transform rotate-45 left-1/2 -bottom-1 -ml-1"></div>
                      </div>
                    )}
                  </motion.div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Date labels */}
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <div>{data.chartData[0].date.split('-').slice(1).join('/')}</div>
          <div>{data.chartData[Math.floor(data.chartData.length / 2)].date.split('-').slice(1).join('/')}</div>
          <div>{data.chartData[data.chartData.length - 1].date.split('-').slice(1).join('/')}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
