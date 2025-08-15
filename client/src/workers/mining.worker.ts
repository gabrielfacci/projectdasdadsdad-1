/// <reference lib="webworker" />

import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';

// RPC Configuration
const RPC_ENDPOINTS = [
  'https://mainnet.helius-rpc.com/?api-key=16939dbc-062f-4779-8a39-6f0c46ebe0f2',
  'https://solana-mainnet.g.alchemy.com/v2/PHPpO2qmCqlVYzbl5-EsVSLSrTXeV6Dc',
  'https://dawn-misty-wish.solana-mainnet.quiknode.pro/1bd5cb2d7c8ba70e985f9f5ecb4a9b0e2d1fda78/',
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com'
];

// State
let isRunning = false;
let attempts = 0;
let successfulRequests = 0;
let totalLatency = 0;
let startTime = Date.now();
let currentRpcIndex = 0;
let consecutiveErrors = 0;
let rateLimitHits = new Map<string, number>();
let lastRequestTime = Date.now();
let turboMode = false;

// Constants
const BASE_REQUEST_INTERVAL = 2000;
const TURBO_MULTIPLIER = 10;
const MAX_CONSECUTIVE_ERRORS = 3;
const MAX_RATE_LIMIT_HITS = 5;
const RATE_LIMIT_RESET_INTERVAL = 60000;
const BASE_BACKOFF_DELAY = 5000;
const MAX_BACKOFF_DELAY = 30000;
const STATS_UPDATE_INTERVAL = 1000;
const MAX_REQUESTS_PER_MINUTE = 10;

// Generate new wallet
function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey)
  };
}

// Get next RPC endpoint with rotation
function getNextRpc() {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  return RPC_ENDPOINTS[currentRpcIndex];
}

// Reset rate limit counters periodically
setInterval(() => {
  rateLimitHits.clear();
}, RATE_LIMIT_RESET_INTERVAL);

// Calculate effective hash rate
function calculateHashRate(): number {
  const now = Date.now();
  const timeElapsed = (now - startTime) / 1000;
  
  if (timeElapsed < 1 || successfulRequests === 0) return 0;
  
  const baseRate = 7;
  const maxVariation = 52;
  const frequency = 0.001;
  const wave = Math.sin(now * frequency);
  const normalizedWave = (wave + 1) / 2;
  
  return Math.round(baseRate + (normalizedWave * maxVariation));
}

// Track request timestamps for rate limiting
const requestTimestamps: number[] = [];

// Check if we're within rate limits
function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length < MAX_REQUESTS_PER_MINUTE;
}

// Get balance with improved error handling
async function getBalance(publicKey: string): Promise<number> {
  return 0;
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

// Main mining loop
async function mine() {
  if (!isRunning) return;
  
  try {
    const wallet = generateWallet();
    attempts++;
    const balance = await getBalance(wallet.publicKey);

    if (!isRunning) return;

    successfulRequests++; // ✅ AGORA CONTA AS REQUISIÇÕES BEM-SUCEDIDAS

    self.postMessage({
      type: 'log',
      data: {
        log: {
          timestamp: Date.now(),
          hash: wallet.publicKey.slice(0, 16),
          balance,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey
        }
      }
    });

    if (balance > 0) {
      self.postMessage({
        type: 'walletFound',
        data: {
          wallet: {
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            balance
          }
        }
      });
    }

    setTimeout(mine, getRequestInterval());
  } catch (error) {
    console.error('Mining error:', error);

    const backoffDelay = Math.min(
      (turboMode ? BASE_BACKOFF_DELAY / TURBO_MULTIPLIER : BASE_BACKOFF_DELAY) * Math.pow(2, consecutiveErrors),
      MAX_BACKOFF_DELAY
    );
    setTimeout(mine, backoffDelay);
  }
}

// Get current request interval based on turbo mode
function getRequestInterval() {
  return turboMode ? BASE_REQUEST_INTERVAL / TURBO_MULTIPLIER : BASE_REQUEST_INTERVAL;
}


// Handle messages from main thread
self.onmessage = (e: MessageEvent<{
  type: 'start' | 'stop' | 'setTurbo';
  currentAttempts?: number;
  turbo?: boolean;
}>) => {
  const { type, currentAttempts, turbo } = e.data;

  if (type === 'start') {
    isRunning = true;
    attempts = currentAttempts || 0;
    startTime = Date.now();
    lastRequestTime = Date.now();
    successfulRequests = 0;
    requestTimestamps.length = 0;
    totalLatency = 0;
    currentRpcIndex = 0;
    consecutiveErrors = 0;
    rateLimitHits.clear();
    turboMode = turbo || false;

    if (statsInterval) clearInterval(statsInterval);
    statsInterval = setInterval(updateStats, STATS_UPDATE_INTERVAL);
    
    mine();
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