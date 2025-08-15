import React from 'react';
import { Bitcoin } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/btc-bitcoin',
  'https://api.kraken.com/0/public/Ticker?pair=BTCUSD'
];

const BitcoinChart: React.FC = () => {
  return <BaseChart coinId="bitcoin" endpoints={ENDPOINTS} icon={Bitcoin} />;
};

export default BitcoinChart;