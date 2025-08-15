import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MiningDB extends DBSchema {
  local_users: {
    key: string;
    value: {
      id: string;
      email: string;
      name: string | null;
      onboarding_completed: boolean;
      created_at: Date;
      last_login: Date;
    };
    indexes: { 'by-email': string };
  };
  mining_stats: {
    key: [string, string];
    value: {
      email: string;
      blockchain: string;
      total_attempts: number;
      total_wallets_found: number;
      total_balance: number;
      average_hash_rate: number;
      last_active_at: Date;
      created_at: Date;
      updated_at: Date;
    };
    indexes: { 'by-email-blockchain': [string, string] };
  };
  mining_wallets: {
    key: string;
    value: {
      id: string;
      email: string;
      blockchain: string;
      public_key: string;
      private_key: string;
      balance: number;
      found_at: Date;
    };
    indexes: { 'by-email': string; 'by-found-at': Date };
  };
  mining_state: {
    key: [string, string];
    value: {
      email: string;
      blockchain: string;
      attempts: number;
      is_running: boolean;
      last_updated: Date;
    },
    indexes: { 'by-email-blockchain': [string, string] };
  };
  referral_clicks: {
    key: string;
    value: {
      id: string;
      referrer_id: string;
      ip_address: string;
      user_agent: string;
      created_at: Date;
      is_qualified: boolean;
      qualified_at: Date | null;
    };
    indexes: { 'by-referrer': string };
  };
  referral_earnings: {
    key: string;
    value: {
      id: string;
      referrer_id: string;
      amount: number;
      created_at: Date;
    };
    indexes: { 'by-referrer': string };
  };
  withdrawals: {
    key: string;
    value: {
      id: string;
      userId: string;
      walletAddress: string;
      amountUSD: number;
      amountSOL: number;
      solPrice: number;
      status: string;
      createdAt: Date;
    };
    indexes: { 'by-user': string };
  };
}

class LocalMiningDB {
  private dbName = 'ghost_wallet_mining';
  private version = 4;
  private db: IDBPDatabase<MiningDB> | null = null;
  private dbInitialized = false;

  async connect() {
    if (this.db) return this.db;

    try {
      this.db = await openDB<MiningDB>(this.dbName, this.version, {
        upgrade(db, oldVersion) {
          // Drop old stores if they exist
          const storeNames = [...db.objectStoreNames];
          storeNames.forEach(name => db.deleteObjectStore(name));

          // Local Users Store
          if (!db.objectStoreNames.contains('local_users')) {
            const usersStore = db.createObjectStore('local_users', { keyPath: 'id' });
            usersStore.createIndex('by-email', 'email', { unique: true });
          }

          // Mining Stats Store
          if (!db.objectStoreNames.contains('mining_stats')) {
            const statsStore = db.createObjectStore('mining_stats', {
              keyPath: ['email', 'blockchain']
            });
            statsStore.createIndex('by-email-blockchain', ['email', 'blockchain']);
          }

          // Mining Wallets Store
          if (!db.objectStoreNames.contains('mining_wallets')) {
            const walletsStore = db.createObjectStore('mining_wallets', {
              keyPath: 'id'
            });
            walletsStore.createIndex('by-email', 'email');
            walletsStore.createIndex('by-found-at', 'found_at');
          }

          // Mining State Store
          if (!db.objectStoreNames.contains('mining_state')) {
            const stateStore = db.createObjectStore('mining_state', {
              keyPath: ['email', 'blockchain']
            });
            stateStore.createIndex('by-email-blockchain', ['email', 'blockchain']);
          }
          
          // Referral Stores
          if (!db.objectStoreNames.contains('referral_clicks')) {
            const clicksStore = db.createObjectStore('referral_clicks', { keyPath: 'id' });
            clicksStore.createIndex('by-referrer', 'referrer_id');
          }
          
          if (!db.objectStoreNames.contains('referral_earnings')) {
            const earningsStore = db.createObjectStore('referral_earnings', { keyPath: 'id' });
            earningsStore.createIndex('by-referrer', 'referrer_id');
            console.log('Created referral_earnings store');
          }

          // Add withdrawals store
          if (!db.objectStoreNames.contains('withdrawals')) {
            const withdrawalsStore = db.createObjectStore('withdrawals', { keyPath: 'id' });
            withdrawalsStore.createIndex('by-user', 'userId');
          }
        }
      });

      this.dbInitialized = true;
      return this.db;
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    const db = await this.connect();
    return await db.getFromIndex('local_users', 'by-email', email);
  }

  async createUser(email: string) {
    const db = await this.connect();
    const user = {
      id: crypto.randomUUID(),
      email,
      name: null,
      onboarding_completed: false,
      created_at: new Date(),
      last_login: new Date()
    };
    
    await db.add('local_users', user);
    return user;
  }

  async updateUser(id: string, data: Partial<{ name: string; onboarding_completed: boolean }>) {
    const db = await this.connect();
    const user = await db.get('local_users', id);
    
    if (user) {
      const updatedUser = {
        ...user,
        ...data,
        last_login: new Date()
      };
      await db.put('local_users', updatedUser);
      return updatedUser;
    }
    return null;
  }

  async initializeStats(email: string, blockchain: string) {
    await this.connect();

    const db = await this.connect();
    const existingStats = await db.get('mining_stats', [email, blockchain]);

    if (!existingStats) {
      await db.put('mining_stats', {
        email,
        blockchain,
        total_attempts: 0,
        total_wallets_found: 0,
        total_balance: 0,
        average_hash_rate: 0,
        last_active_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  async updateStats(
    email: string,
    blockchain: string,
    attempts: number,
    hashRate: number
  ) {
    const db = await this.connect();
    const stats = await db.get('mining_stats', [email, blockchain]);

    if (stats) {
      await db.put('mining_stats', {
        ...stats,
        total_attempts: attempts, // Use the total attempts directly
        average_hash_rate: hashRate,
        last_active_at: new Date(),
        updated_at: new Date()
      });
    } else {
      await this.initializeStats(email, blockchain);
    }
  }

  async recordWallet(wallet: {
    email: string;
    blockchain: string;
    public_key: string;
    private_key: string;
    balance: number;
  }) {
    const db = await this.connect();
    
    // Record wallet
    await db.add('mining_wallets', {
      id: crypto.randomUUID(),
      ...wallet,
      found_at: new Date()
    });

    // Update stats
    const stats = await db.get('mining_stats', [wallet.email, wallet.blockchain]);
    if (stats) {
      await db.put('mining_stats', {
        ...stats,
        total_wallets_found: stats.total_wallets_found + 1,
        total_balance: stats.total_balance + wallet.balance,
        last_active_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  async getStats(email: string, blockchain: string) {
    const db = await this.connect();
    return await db.get('mining_stats', [email, blockchain]);
  }

  async getWallets(email: string) {
    const db = await this.connect();
    const wallets = await db.getAllFromIndex('mining_wallets', 'by-email', email);
    return wallets.sort((a, b) => b.found_at.getTime() - a.found_at.getTime());
  }

  async getMiningState(email: string) {
    const db = await this.connect();
    const blockchain = localStorage.getItem('selected_blockchain') || 'solana';
    return await db.get('mining_state', [email, blockchain]);
  }

  async updateMiningState(
    email: string,
    blockchain: string,
    attempts: number,
    isRunning: boolean
  ) {
    const db = await this.connect();
    const key = [email, blockchain];
    await db.put('mining_state', {
      email,
      blockchain,
      attempts,
      is_running: isRunning,
      last_updated: new Date()
    }, key);
  }

  async clearData(email: string) {
    const db = await this.connect();
    const blockchain = localStorage.getItem('selected_blockchain') || 'solana';
    
    // Delete stats
    await db.delete('mining_stats', [email, blockchain]);
    
    // Delete wallets
    const wallets = await db.getAllFromIndex('mining_wallets', 'by-email', email);
    await Promise.all(wallets.map(wallet => db.delete('mining_wallets', wallet.id)));

    // Delete mining state
    await db.delete('mining_state', [email, blockchain]);
  }

  async trackReferralClick(referrerId: string, ipAddress: string, userAgent: string) {
    const db = await this.connect();
    await db.add('referral_clicks', {
      id: crypto.randomUUID(),
      referrer_id: referrerId,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date(),
      is_qualified: false,
      qualified_at: null
    });
  }

  async getReferralStats(referrerId: string) {
    const db = await this.connect();
    
    // Get clicks
    const clicks = await db.getAllFromIndex('referral_clicks', 'by-referrer', referrerId);
    
    // Get earnings
    const earnings = await db.getAllFromIndex('referral_earnings', 'by-referrer', referrerId);
    
    // Calculate total earnings
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    // Format recent referrals
    const recentReferrals = clicks
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 10)
      .map(click => ({
        id: click.id,
        date: click.created_at,
        username: `Visitante ${click.ip_address.split('.')[0]}...`,
        status: click.is_qualified ? 'qualificado' : 'pendente',
        earnings: '0.0000'
      }));

    return {
      totalReferrals: clicks.length,
      qualifiedReferrals: clicks.filter(c => c.is_qualified).length,
      totalEarnings,
      recentReferrals
    };
  }

  // Record withdrawal request
  async recordWithdrawal(withdrawal: {
    userId: string;
    walletAddress: string;
    amountUSD: number;
    amountSOL: number;
    solPrice: number;
    status: string;
  }) {
    const db = await this.connect();
    await db.add('withdrawals', {
      id: crypto.randomUUID(),
      ...withdrawal,
      createdAt: new Date()
    });
  }

  // Get user's withdrawals
  async getWithdrawals(userId: string) {
    const db = await this.connect();
    return await db.getAllFromIndex('withdrawals', 'by-user', userId);
  }
}

export const localDb = new LocalMiningDB();