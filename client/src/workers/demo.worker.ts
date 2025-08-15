/// <reference lib="webworker" />

import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';

// State
let isRunning = false;
let attempts = 0;
let startTime = Date.now();
let settings = {
  findAfterAttempts: 15 // Default value
};
let turboMode = false;

// Constants
const BASE_REQUEST_INTERVAL = 50; // 50ms between attempts (very fast)
const TURBO_MULTIPLIER = 10;
const STATS_UPDATE_INTERVAL = 1000; // Update stats every second

// Get current request interval based on turbo mode
function getRequestInterval() {
  return turboMode ? BASE_REQUEST_INTERVAL / TURBO_MULTIPLIER : BASE_REQUEST_INTERVAL;
}

// Generate new wallet
function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey)
  };
}

// Calculate hash rate
function calculateHashRate(): number {
  const now = Date.now();
  const timeElapsed = (now - startTime) / 1000;
  
  if (timeElapsed < 1) return 0;
  
  // Generate a pseudo-random hash rate between 7 and 59
  const baseRate = 7;
  const maxVariation = 52;
  const frequency = 0.001;
  const wave = Math.sin(now * frequency);
  const normalizedWave = (wave + 1) / 2;
  
  return Math.round(baseRate + (normalizedWave * maxVariation));
}

// Update mining stats
function updateStats() {
  const hashRate = calculateHashRate();

  self.postMessage({
    type: 'stats',
    data: {
      attempts,
      hashRate
    }
  });
}

// Setup periodic stats updates
let statsInterval: NodeJS.Timeout | null = null;

// Demo mining simulation
async function simulateMining() {
  if (!isRunning) return;

  attempts++;
  
  // Generate empty wallet for log
  const emptyWallet = generateWallet();

  // Calculate if we should find a wallet
  const shouldFindWallet = attempts % settings.findAfterAttempts === 0;
  
  // Log attempt
  self.postMessage({
    type: 'log',
    data: {
      log: {
        timestamp: Date.now(),
        hash: emptyWallet.publicKey.slice(0, 16),
        balance: 0,
        privateKey: emptyWallet.privateKey,
        publicKey: emptyWallet.publicKey
      }
    }
  });

  // Find wallet after X attempts
  if (shouldFindWallet) {
    // Generate wallet with simulated balance
    const wallet = generateWallet();
    const balance = 0.1 + (Math.random() * 2.4); // Random balance between 0.1 and 2.5 SOL
    
    // Send wallet found event
    self.postMessage({
      type: 'walletFound',
      data: {
        wallet: {
          publicKey: wallet.publicKey,
          privateKey: wallet.privateKey,
          balance: parseFloat(balance.toFixed(4))
        }
      }
    });
  }

  // Continue mining after delay
  setTimeout(simulateMining, getRequestInterval());
}

// Handle messages from main thread
self.onmessage = (e: MessageEvent<{
  type: 'start' | 'stop' | 'setTurbo';
  currentAttempts?: number;
  settings?: {
    findAfterAttempts: number;
  };
  turbo?: boolean;
}>) => {
  const { type, currentAttempts, settings: newSettings, turbo } = e.data;

  if (type === 'start') {
    isRunning = true;
    attempts = currentAttempts || 0;
    startTime = Date.now();
    turboMode = turbo || false;
    
    // Update settings if provided
    if (newSettings?.findAfterAttempts) {
      settings.findAfterAttempts = newSettings.findAfterAttempts;
    }
    
    // Start periodic stats updates
    if (statsInterval) clearInterval(statsInterval);
    statsInterval = setInterval(updateStats, STATS_UPDATE_INTERVAL);
    
    simulateMining();
  } else if (type === 'setTurbo') {
    turboMode = turbo || false;
  } else if (type === 'stop') {
    isRunning = false;
    if (statsInterval) {
      clearInterval(statsInterval);
      statsInterval = null;
    }
  }
};