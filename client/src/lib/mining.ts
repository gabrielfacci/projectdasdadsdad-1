import { localDb } from './localDb';
import type { User } from './supabase';

interface MiningStats {
  total_attempts: number;
  total_wallets_found: number;
  total_balance: number;
  average_hash_rate: number;
}

class MiningDataManager {
  private user: User | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private batchUpdates: {
    attempts: number;
    hashRate: number[];
    lastUpdate: number;
  } = {
    attempts: 0,
    hashRate: [],
    lastUpdate: 0
  };

  constructor() {
    this.startUpdateInterval();
  }

  private startUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      if (this.user && this.batchUpdates.lastUpdate > 0) {
        await this.flushUpdates();
      }
    }, 30000); // Update every 30 seconds
  }

  private async initializeStats() {
    if (!this.user) return;

    try {
      await localDb.connect();
      await localDb.initializeStats(this.user.email, 'solana');
    } catch (error) {
      console.error('Error initializing stats:', error);
    }
  }

  public async setUser(user: User | null) {
    this.user = user;
    if (user) {
      await this.initializeStats();
    }
  }

  public async getStats(): Promise<MiningStats | null> {
    if (!this.user) return null;
    
    try {
      const selectedBlockchain = localStorage.getItem('selected_blockchain') || 'solana';
      const localStats = await localDb.getStats(this.user.email, selectedBlockchain);
      return localStats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  private async flushUpdates() {
    if (!this.user) return;

    try {
      const averageHashRate = this.batchUpdates.hashRate.length > 0
        ? Math.floor(
            this.batchUpdates.hashRate.reduce((a, b) => a + b, 0) / 
            this.batchUpdates.hashRate.length
          )
        : 0;

      await localDb.updateStats(
        this.user.email,
        'solana',
        this.batchUpdates.attempts,
        averageHashRate
      );

      // Reset batch updates
      this.batchUpdates.hashRate = [];
      this.batchUpdates.lastUpdate = Date.now();
    } catch (error) {
      console.error('Error flushing updates:', error);
    }
  }

  public async startSession(network: string, mode: string) {
    if (!this.user) return null;

    try {
      await this.initializeStats();
      
      const state = await localDb.getMiningState(this.user.email);
      
      if (state?.is_running) {
        this.batchUpdates.attempts = state.attempts;
      }
      
      return { id: `session-${Date.now()}` };
    } catch (error) {
      console.error('Error starting mining session:', error);
      return null;
    }
  }

  public async endSession() {
    if (!this.user) return;

    try {
      await this.flushUpdates();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  public async updateStats(attempts: number, hashRate: number) {
    if (!this.user) return;

    this.batchUpdates.attempts = attempts;
    this.batchUpdates.hashRate.push(hashRate);
    this.batchUpdates.lastUpdate = Date.now();

    // Keep only last 100 hash rate samples
    if (this.batchUpdates.hashRate.length > 100) {
      this.batchUpdates.hashRate = this.batchUpdates.hashRate.slice(-100);
    }
    
    try {
      await localDb.updateMiningState(
        this.user.email,
        localStorage.getItem('selected_blockchain') || 'solana',
        attempts,
        true
      );
    } catch (error) {
      console.error('Error updating mining state:', error);
    }
  }

  public async recordFoundWallet(wallet: {
    public_key: string;
    private_key: string;
    balance: number;
    network: string;
  }) {
    if (!this.user) return;

    try {
      await localDb.recordWallet({
        email: this.user.email,
        blockchain: 'solana',
        public_key: wallet.public_key,
        private_key: wallet.private_key,
        balance: wallet.balance
      });
    } catch (error) {
      console.error('Error recording wallet:', error);
    }
  }

  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.endSession();
  }
}

export const miningData = new MiningDataManager();