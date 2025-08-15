/// <reference lib="webworker" />

import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { BaseMiningWorker } from './base.worker';

class SolanaMiningWorker extends BaseMiningWorker {
  generateWallet() {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey)
    };
  }
}

// Initialize worker
const worker = new SolanaMiningWorker();

// Handle messages
self.onmessage = (e: MessageEvent<{
  type: 'start' | 'stop';
  currentAttempts?: number;
}>) => {
  const { type, currentAttempts } = e.data;

if (type === "start") {
  console.log("🚀 SolanaMiningWorker recebeu comando START!");
  worker.start(currentAttempts);
} else if (type === 'stop') {
    worker.stop();
  }
};