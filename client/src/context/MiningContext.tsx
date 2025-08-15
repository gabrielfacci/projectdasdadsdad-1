import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useBlockchain } from './BlockchainContext';
import { useAuth } from './AuthContext';
import { blockchains } from '../lib/blockchains';

export interface MiningContextType {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
  demoSettings: {
    walletsToFind: number;
    findInterval: number;
    initialAttempts: number;
    minBalance: number;
    maxBalance: number;
    findAfterAttempts: number;
  };
  setDemoSettings: (settings: MiningContextType['demoSettings']) => void;
  turboMode: boolean;
  setTurboMode: (value: boolean) => void;
  attempts: number;
  hashRate: number;
  foundWallets: Array<{ publicKey: string; privateKey: string; balance: number }>;
  recentFoundWallets: Array<{ publicKey: string; privateKey: string; balance: number }>;
  logs: Array<{ timestamp: number; hash: string; balance: number; privateKey: string; publicKey: string }>;
  lastFoundWallet: { publicKey: string; privateKey: string; balance: number } | null;
  clearLastFoundWallet: () => void;
  publicKey: string | null;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export function useMining() {
  const context = useContext(MiningContext);
  if (!context) {
    throw new Error('useMining must be used within MiningProvider');
  }
  return context;
}

export function MiningProvider({ children }: { children: React.ReactNode }) {
  const { blockchain } = useBlockchain();
  const { user } = useAuth();

  const [turboMode, setTurboMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const [demoSettings, setDemoSettings] = useState(() => {
    const stored = localStorage.getItem('demo_settings');
    return stored ? JSON.parse(stored) : {
      walletsToFind: 5,
      findInterval: 30,
      initialAttempts: 1000,
      minBalance: 0.1,
      maxBalance: 2.5,
      findAfterAttempts: 15
    };
  });

  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [foundWallets, setFoundWallets] = useState<Array<{ publicKey: string; privateKey: string; balance: number }>>([]);
  const [recentFoundWallets, setRecentFoundWallets] = useState<Array<{ publicKey: string; privateKey: string; balance: number }>>([]);
  const [logs, setLogs] = useState<Array<{ timestamp: number; hash: string; balance: number; privateKey: string; publicKey: string }>>([]);
  const [hashRate, setHashRate] = useState(0);
  const [lastFoundWallet, setLastFoundWallet] = useState<{ publicKey: string; privateKey: string; balance: number } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    const stored = localStorage.getItem('ghost_wallet_public_key');
    if (stored) return stored;
    
    const newKey = `GW${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('ghost_wallet_public_key', newKey);
    return newKey;
  });

  // Initialize and manage Web Worker
  useEffect(() => {
    const initializeWorker = () => {
      if (typeof Worker === 'undefined' || !blockchain || !blockchains[blockchain]) {
        return;
      }

      // Create appropriate worker
      const worker = demoMode && user?.role === 'admin'
        ? new Worker(new URL('../workers/demo.worker.ts', import.meta.url), { type: 'module' })
        : new Worker(new URL('../workers/mining.worker.ts', import.meta.url), { type: 'module' });

      // Set up message handler
      worker.onmessage = (e) => {
        const { type, data } = e.data;
        
        switch (type) {
          case 'walletFound':
            const wallet = data.wallet;
            setFoundWallets(prev => [...prev, wallet]);
            setRecentFoundWallets([wallet]);
            setLastFoundWallet(wallet);
            
            const symbol = blockchains[blockchain].symbol;
            // Log wallet found instead of showing notification
            console.log(`🎉 Nova carteira encontrada! ${wallet.balance.toFixed(4)} ${symbol}`);
            break;
            
          case 'stats':
            setAttempts(data.attempts || 0);
            setHashRate(data.hashRate || 0);
            break;
            
          case 'log':
            setLogs(prev => [data.log, ...prev].slice(0, 100));
            break;
        }
      };

      // Store worker reference
      workerRef.current = worker;

      // Start mining if needed
      if (isRunning) {
        worker.postMessage({
          type: 'start',
          currentAttempts: attempts,
          turbo: turboMode,
          settings: demoMode ? demoSettings : undefined
        });
      }

      // Cleanup function
      return () => {
        if (isRunning) {
          worker.postMessage({ type: 'stop' });
        }
        worker.terminate();
      };
    };

    return initializeWorker();
  }, [blockchain, demoMode, user?.role]); // Only re-create worker when these change

  const handleSetTurboMode = (value: boolean) => {
    setTurboMode(value);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'setTurbo',
        turbo: value
      });
    }
  };

  // Handle mining state changes
  useEffect(() => {
    if (!workerRef.current) return;

    if (isRunning) {
      // Verifica se o usuário tem licença - para usuários sem licença, sempre usa configurações de demonstração
      const useDemoMode = demoMode || (!user?.email || (user && blockchain && !blockchains[blockchain]?.licenseRequired));
      
      workerRef.current.postMessage({
        type: 'start',
        currentAttempts: attempts,
        turbo: turboMode,
        settings: useDemoMode ? demoSettings : undefined
      });
    } else {
      workerRef.current.postMessage({ type: 'stop' });
    }
  }, [isRunning]); // Only react to isRunning changes

  // Reset state when blockchain changes
  useEffect(() => {
    if (blockchain) {
      setAttempts(0);
      setHashRate(0);
      setFoundWallets([]);
      setRecentFoundWallets([]);
      setLogs([]);
      setLastFoundWallet(null);
      if (isRunning) {
        setIsRunning(false);
      }
    }
  }, [blockchain]);

  const clearLastFoundWallet = () => {
    setLastFoundWallet(null);
  };
  
  return (
    <MiningContext.Provider 
      value={{
        isRunning,
        setIsRunning,
        demoMode: user?.role === 'admin' ? demoMode : false,
        setDemoMode: (value: boolean) => {
          if (user?.role === 'admin') {
            setDemoMode(value);
          }
        },
        demoSettings,
        setDemoSettings: (settings: typeof demoSettings) => {
          if (user?.role === 'admin') {
            setDemoSettings(settings);
            localStorage.setItem('demo_settings', JSON.stringify(settings));
          }
        },
        attempts,
        hashRate,
        foundWallets,
        recentFoundWallets,
        logs,
        lastFoundWallet,
        clearLastFoundWallet,
        publicKey,
        turboMode,
        setTurboMode: handleSetTurboMode
      }}
    >
      {children}
    </MiningContext.Provider>
  );
}