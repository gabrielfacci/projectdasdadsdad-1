import React from 'react';
import { Hexagon } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/eth-ethereum',
  'https://api.kraken.com/0/public/Ticker?pair=ETHUSD'
];

const EthereumChart: React.FC = () => {
  return <BaseChart coinId="ethereum" endpoints={ENDPOINTS} icon={Hexagon} />;
};

export default EthereumChart;