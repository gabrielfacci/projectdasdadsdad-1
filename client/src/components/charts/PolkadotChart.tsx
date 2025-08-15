import React from 'react';
import { Hash } from 'lucide-react';
import BaseChart from './BaseChart';

const ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd&include_market_cap=true',
  'https://api.coinpaprika.com/v1/tickers/dot-polkadot',
  'https://api.kraken.com/0/public/Ticker?pair=DOTUSD'
];

const PolkadotChart: React.FC = () => {
  return <BaseChart coinId="polkadot" endpoints={ENDPOINTS} icon={Hash} />;
};

export default PolkadotChart;