import React from 'react';
import { Ghost } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/sol-solana',
  'https://api.kraken.com/0/public/Ticker?pair=SOLUSD'
];

const SolanaChart: React.FC = () => {
  return <BaseChart coinId="solana" endpoints={ENDPOINTS} icon={Ghost} />;
};

export default SolanaChart;