/// <reference lib="webworker" />

import { BaseMiningWorker } from './base.worker';

class CardanoMiningWorker extends BaseMiningWorker {
  generateWallet() {
    // Using same logic as Solana for demo
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const privateKey = Array(98).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const publicKey = 'addr1' + Array(58).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    return {
      publicKey,
      privateKey
    };
  }
}

// Initialize worker
const worker = new CardanoMiningWorker();

// Handle messages
self.onmessage = (e: MessageEvent<{
  type: 'start' | 'stop';
  currentAttempts?: number;
}>) => {
  const { type, currentAttempts } = e.data;

  if (type === 'start') {
    worker.start(currentAttempts);
  } else if (type === 'stop') {
    worker.stop();
  }
};