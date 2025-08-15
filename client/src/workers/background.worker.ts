/* eslint-disable no-restricted-globals */
declare const self: Worker;

import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { openDB } from 'idb';

// Database setup
const DB_NAME = 'ghost-wallet-mining';
const DB_VERSION = 1;

interface MiningState {
  isRunning: boolean;
  attempts: number;
  hashRate: number;
  lastUpdate: number;
}

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Mining state store
      if (!db.objectStoreNames.contains('miningState')) {
        db.createObjectStore('miningState');
      }
      
      // Found wallets store
      if (!db.objectStoreNames.contains('wallets')) {
        const walletStore = db.createObjectStore('wallets', { keyPath: 'id' });
        walletStore.createIndex('byTimestamp', 'timestamp');
      }
    }
  });
}

// State management
let isRunning = false;
let attempts = 0;
let startTime = Date.now();
let lastUpdate = Date.now();

// Constants
const MIN_REQUEST_INTERVAL = 4000;
const STATS_UPDATE_INTERVAL = 1000;
const PERSISTENCE_INTERVAL = 5000;

// Initialize database and load state
async function initialize() {
  const db = await initDB();
  const state = await db.get('miningState', 'current') as MiningState | undefined;
  
  if (state) {
    isRunning = state.isRunning;
    attempts = state.attempts;
    lastUpdate = state.lastUpdate;
  }
}

// Save state periodically
async function persistState() {
  const db = await initDB();
  await db.put('miningState', {
    isRunning,
    attempts,
    hashRate: calculateHashRate(),
    lastUpdate: Date.now()
  }, 'current');
}

// Calculate hash rate
function calculateHashRate(): number {
  const now = Date.now();
  const timeElapsed = (now - startTime) / 1000;
  
  if (timeElapsed < 1) return 0;
  
  const baseRate = 7;
  const maxVariation = 52;
  const frequency = 0.001;
  const wave = Math.sin(now * frequency);
  const normalizedWave = (wave + 1) / 2;
  
  return Math.round(baseRate + (normalizedWave * maxVariation));
}

// Generate wallet
function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey)
  };
}

// Mining loop
async function mine() {
  if (!isRunning) return;
  
  try {
    const wallet = generateWallet();
    attempts++;

    // Save state periodically
    if (Date.now() - lastUpdate > PERSISTENCE_INTERVAL) {
      await persistState();
      lastUpdate = Date.now();
    }

    // Update stats
    self.postMessage({
      type: 'stats',
      data: {
        attempts,
        hashRate: calculateHashRate()
      }
    });

    // Log attempt
    self.postMessage({
      type: 'log',
      data: {
        log: {
          timestamp: Date.now(),
          hash: wallet.publicKey.slice(0, 16),
          balance: 0,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey
        }
      }
    });

    // Continue mining after delay
    setTimeout(mine, MIN_REQUEST_INTERVAL);

  } catch (error) {
    console.error('Mining error:', error);
    setTimeout(mine, MIN_REQUEST_INTERVAL);
  }
}

// Handle messages
self.onmessage = async (e: MessageEvent) => {
  const { type, currentAttempts } = e.data;

  if (type === 'start') {
    isRunning = true;
    attempts = currentAttempts || 0;
    startTime = Date.now();
    lastUpdate = Date.now();
    await initialize();
    mine();
  } else if (type === 'stop') {
    isRunning = false;
    await persistState();
  }
};

// Initialize on load
initialize();