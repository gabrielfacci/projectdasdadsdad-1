import React from 'react';
import { CircleDot } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/ada-cardano',
  'https://api.kraken.com/0/public/Ticker?pair=ADAUSD'
];

const CardanoChart: React.FC = () => {
  return <BaseChart coinId="cardano" endpoints={ENDPOINTS} icon={CircleDot} />;
};

export default CardanoChart;