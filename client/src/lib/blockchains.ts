import { Bitcoin, Hexagon, Wallet, CircleDot, Hash, Ghost } from 'lucide-react';

export interface Blockchain {
  id: 'solana' | 'bitcoin' | 'ethereum' | 'bsc' | 'cardano' | 'polkadot';
  name: string;
  symbol: string;
  icon: typeof Ghost;
  color: string;
  gradient: string;
  available: boolean;
  licenseRequired: boolean;
  trending?: boolean; // Added trending property
}

export const blockchains: Record<string, Blockchain> = {
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: Ghost,
    color: '#7B68EE',
    gradient: 'from-[#7B68EE] to-[#9370DB]',
    available: true,
    licenseRequired: true, // SECURITY: Solana agora requer licença válida
    trending: true //Added trending: true
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: Bitcoin,
    color: '#F7931A',
    gradient: 'from-[#F7931A] to-[#FBB03B]',
    available: true,
    licenseRequired: true,
    trending: true //Added trending: true
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: Hexagon,
    color: '#627EEA',
    gradient: 'from-[#627EEA] to-[#8299EC]',
    available: true,
    licenseRequired: true,
    trending: true //Added trending: true
  },
  bsc: {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    icon: Wallet,
    color: '#F3BA2F',
    gradient: 'from-[#F3BA2F] to-[#F8D33A]',
    available: true,
    licenseRequired: true
  },
  cardano: {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    icon: CircleDot,
    color: '#0033AD',
    gradient: 'from-[#0033AD] to-[#2456F5]',
    available: true,
    licenseRequired: true
  },
  polkadot: {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    icon: Hash,
    color: '#E6007A',
    gradient: 'from-[#E6007A] to-[#FF4AA9]',
    available: true,
    licenseRequired: true
  }
};