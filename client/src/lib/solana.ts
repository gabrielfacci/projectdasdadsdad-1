import { Connection, type Commitment } from '@solana/web3.js';

interface RPCEndpoint {
  url: string;
  weight: number;
  failureCount: number;
  lastUsed: number;
  isHealthy: boolean;
  rateLimitHits: number;
}

class SolanaRPCManager {
  private endpoints: RPCEndpoint[];
  private currentIndex: number;
  private healthCheckInterval: NodeJS.Timeout | null;

  constructor() {
    this.endpoints = [
      // Premium RPCs - maior prioridade
      {
        url: 'https://mainnet.helius-rpc.com/?api-key=16939dbc-062f-4779-8a39-6f0c46ebe0f2',
        weight: 10,
        failureCount: 0,
        lastUsed: 0,
        isHealthy: true,
        rateLimitHits: 0
      },
      {
        url: 'https://solana-mainnet.g.alchemy.com/v2/PHPpO2qmCqlVYzbl5-EsVSLSrTXeV6Dc',
        weight: 10,
        failureCount: 0,
        lastUsed: 0,
        isHealthy: true,
        rateLimitHits: 0
      },
      {
        url: 'https://dawn-misty-wish.solana-mainnet.quiknode.pro/1bd5cb2d7c8ba70e985f9f5ecb4a9b0e2d1fda78/',
        weight: 10,
        failureCount: 0,
        lastUsed: 0,
        isHealthy: true,
        rateLimitHits: 0
      },
      // Backup RPCs
      {
        url: 'https://api.mainnet-beta.solana.com',
        weight: 5,
        failureCount: 0,
        lastUsed: 0,
        isHealthy: true,
        rateLimitHits: 0
      },
      {
        url: 'https://solana-api.projectserum.com',
        weight: 5,
        failureCount: 0,
        lastUsed: 0,
        isHealthy: true,
        rateLimitHits: 0
      }
    ];

    this.currentIndex = 0;
    this.healthCheckInterval = null;
    this.startHealthCheck();
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      for (const endpoint of this.endpoints) {
        try {
          const connection = new Connection(endpoint.url);
          await connection.getSlot();
          
          endpoint.isHealthy = true;
          endpoint.failureCount = 0;
          endpoint.rateLimitHits = Math.max(0, endpoint.rateLimitHits - 1);
          
        } catch (error) {
          endpoint.failureCount++;
          
          if (error.toString().includes('429') || error.toString().includes('rate limit')) {
            endpoint.rateLimitHits++;
          }
          
          if (endpoint.failureCount >= 3 || endpoint.rateLimitHits >= 5) {
            endpoint.isHealthy = false;
            console.warn(`RPC ${endpoint.url} marked as unhealthy`);
          }
        }
      }

      // Log status if any endpoints are unhealthy
      const unhealthyCount = this.endpoints.filter(e => !e.isHealthy).length;
      if (unhealthyCount > 0) {
        console.warn(`${unhealthyCount} unhealthy RPCs detected`);
      }
    }, 30000);
  }

  public stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private getNextEndpoint(): RPCEndpoint {
    // Filter healthy endpoints
    const healthyEndpoints = this.endpoints.filter(e => e.isHealthy);
    
    // If no healthy endpoints, reset all and use first
    if (healthyEndpoints.length === 0) {
      console.warn('No healthy endpoints available, resetting all endpoints');
      this.endpoints.forEach(e => {
        e.isHealthy = true;
        e.failureCount = 0;
        e.rateLimitHits = 0;
      });
      return this.endpoints[0];
    }

    // Sort endpoints by priority
    const sortedEndpoints = healthyEndpoints.sort((a, b) => {
      // Prioritize endpoints with fewer rate limit hits
      if (a.rateLimitHits !== b.rateLimitHits) {
        return a.rateLimitHits - b.rateLimitHits;
      }
      
      // Then by weight
      if (a.weight !== b.weight) {
        return b.weight - a.weight;
      }
      
      // Then by last used time
      return a.lastUsed - b.lastUsed;
    });

    const endpoint = sortedEndpoints[0];
    endpoint.lastUsed = Date.now();
    return endpoint;
  }

  public getConnection(commitment: Commitment = 'confirmed'): Connection {
    const endpoint = this.getNextEndpoint();
    
    return new Connection(endpoint.url, {
      commitment,
      confirmTransactionInitialTimeout: 60000,
      wsEndpoint: endpoint.url.replace('https', 'wss')
    });
  }

  public async executeWithFallback<T>(
    operation: (connection: Connection) => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    const maxRetries = this.endpoints.length * 2;
    
    try {
      const connection = this.getConnection();
      return await operation(connection);
    } catch (error: any) {
      const isRateLimitError = 
        error?.message?.includes('429') || 
        error?.message?.includes('rate limit') ||
        error?.message?.includes('too many requests');

      const currentEndpoint = this.getNextEndpoint();

      if (isRateLimitError) {
        currentEndpoint.rateLimitHits++;
        console.warn(`Rate limit hit on ${currentEndpoint.url} (${currentEndpoint.rateLimitHits} times)`);
      }

      if (error?.message?.includes('403')) {
        currentEndpoint.failureCount++;
        console.warn(`Access denied on ${currentEndpoint.url}`);
      }

      // Mark endpoint as unhealthy if too many failures
      if (currentEndpoint.failureCount >= 3 || currentEndpoint.rateLimitHits >= 5) {
        currentEndpoint.isHealthy = false;
        console.warn(`Marking ${currentEndpoint.url} as unhealthy`);
      }

      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithFallback(operation, retryCount + 1);
      }

      throw error;
    }
  }
}

export const solanaRPC = new SolanaRPCManager();