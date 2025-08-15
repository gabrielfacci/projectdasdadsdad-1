import { blockchains } from './blockchains';

// Ranges realistas para cada blockchain
const STATS_RANGES = {
  bitcoin: {
    growth: { min: 15, max: 45 },
    wallets: { min: 3, max: 11 },
    potential: { min: 0.00145, max: 0.00545 },
    success: { min: 22, max: 48 }
  },
  ethereum: {
    growth: { min: 18, max: 52 },
    wallets: { min: 3, max: 11 },
    potential: { min: 0.0128, max: 0.0288 },
    success: { min: 25, max: 55 }
  },
  bsc: {
    growth: { min: 25, max: 58 },
    wallets: { min: 3, max: 11 },
    potential: { min: 0.0645, max: 0.1245 },
    success: { min: 28, max: 58 }
  },
  cardano: {
    growth: { min: 28, max: 62 },
    wallets: { min: 3, max: 11 },
    potential: { min: 8.45, max: 18.45 },
    success: { min: 32, max: 62 }
  },
  polkadot: {
    growth: { min: 22, max: 55 },
    wallets: { min: 3, max: 11 },
    potential: { min: 0.645, max: 1.245 },
    success: { min: 25, max: 52 }
  },
  solana: {
    growth: { min: 20, max: 50 },
    wallets: { min: 3, max: 11 },
    potential: { min: 0.785, max: 1.485 },
    success: { min: 28, max: 54 }
  }
};

// Gera um número aleatório dentro de um intervalo com flutuação suave
function generateSmoothValue(min: number, max: number, previousValue?: number): number {
  const range = max - min;
  const maxChange = range * 0.15; // Máximo de 15% de variação por vez
  
  if (previousValue === undefined) {
    return min + Math.random() * range;
  }
  
  const minChange = Math.max(min - previousValue, -maxChange);
  const maxAllowedChange = Math.min(max - previousValue, maxChange);
  const change = minChange + Math.random() * (maxAllowedChange - minChange);
  
  return previousValue + change;
}

// Gera estatísticas dinâmicas para uma blockchain
export function generateBlockchainStats(chainId: string, previousStats?: any) {
  const ranges = STATS_RANGES[chainId as keyof typeof STATS_RANGES];
  if (!ranges) return null;

  // Parse previous growth value, removing '%' and '+' characters
  let previousGrowth: number | undefined;
  if (previousStats?.growth) {
    const growthStr = previousStats.growth.replace(/[+%]/g, '');
    previousGrowth = parseFloat(growthStr);
  }

  const growth = generateSmoothValue(ranges.growth.min, ranges.growth.max, 
    previousGrowth);
  
  const wallets = Math.round(generateSmoothValue(ranges.wallets.min, ranges.wallets.max,
    previousStats?.walletsFound));
  
  const potential = generateSmoothValue(ranges.potential.min, ranges.potential.max, 
    parseFloat(previousStats?.potentialDaily || '0'));
  
  const success = generateSmoothValue(ranges.success.min, ranges.success.max, 
    parseFloat(previousStats?.successRate || '0'));

  return {
    growth: `+${growth.toFixed(1)}%`,
    walletsFound: wallets, // Will be between 3-11
    potentialDaily: potential.toFixed(potential > 1 ? 2 : 5),
    successRate: success.toFixed(1)
  };
}

// Cache para armazenar as últimas estatísticas geradas
let statsCache: Record<string, any> = {};
let lastUpdateTime = 0;

// Gera estatísticas para todas as blockchains
export function generateAllStats() {
  const now = Date.now();
  const UPDATE_INTERVAL = 30000; // Atualiza a cada 30 segundos

  // Retorna cache se ainda for válido
  if (now - lastUpdateTime < UPDATE_INTERVAL) {
    return statsCache;
  }

  // Gera novas estatísticas
  const newStats: Record<string, any> = {};
  Object.keys(STATS_RANGES).forEach(chainId => {
    newStats[chainId] = generateBlockchainStats(chainId, statsCache[chainId]);
  });

  // Atualiza cache
  statsCache = newStats;
  lastUpdateTime = now;

  return newStats;
}