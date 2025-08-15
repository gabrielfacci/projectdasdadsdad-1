import React from 'react';
import { Wallet } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/bnb-binance-coin',
  'https://api.kraken.com/0/public/Ticker?pair=BNBUSD'
];

const BSCChart: React.FC = () => {
  return <BaseChart coinId="binancecoin" endpoints={ENDPOINTS} icon={Wallet} />;
};

export default BSCChart;