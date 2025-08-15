// Base worker class with common mining functionality
abstract class BaseMiningWorker {
  protected isRunning = false;
  protected attempts = 0;
  protected successfulRequests = 0;
  protected totalLatency = 0;
  protected startTime = Date.now();
  protected lastRequestTime = Date.now();
  protected currentRpcIndex = 0;
  protected consecutiveErrors = 0;
  protected rateLimitHits = new Map<string, number>();

  // Constants
  protected readonly MIN_REQUEST_INTERVAL = 2000;
  protected readonly MAX_CONSECUTIVE_ERRORS = 3;
  protected readonly MAX_RATE_LIMIT_HITS = 5;
  protected readonly RATE_LIMIT_RESET_INTERVAL = 60000;
  protected readonly BASE_BACKOFF_DELAY = 5000;
  protected readonly MAX_BACKOFF_DELAY = 30000;
  protected readonly STATS_UPDATE_INTERVAL = 1000;
  protected readonly MAX_REQUESTS_PER_MINUTE = 10;

  // Abstract methods that must be implemented by each blockchain
  abstract generateWallet(): { publicKey: string; privateKey: string };

  protected calculateHashRate(): number {
    const now = Date.now();
    const timeElapsed = (now - this.startTime) / 1000;
    
    if (timeElapsed < 1 || this.successfulRequests === 0) return 0;
    
    const baseRate = 7;
    const maxVariation = 52;
    const frequency = 0.001;
    const wave = Math.sin(now * frequency);
    const normalizedWave = (wave + 1) / 2;
    
    return Math.round(baseRate + (normalizedWave * maxVariation));
  }

  protected updateStats() {
    const hashRate = this.calculateHashRate();
    
    self.postMessage({
      type: 'stats',
      data: {
        attempts: this.attempts,
        hashRate
      }
    });
  }

  protected async mine() {
    if (!this.isRunning) return;
    
    try {
      const wallet = this.generateWallet();
      this.attempts++;

      if (!this.isRunning) return;

      this.successfulRequests++;

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

      setTimeout(() => this.mine(), this.MIN_REQUEST_INTERVAL);

    } catch (error) {
      console.error('Mining error:', error);

      const backoffDelay = Math.min(
        this.BASE_BACKOFF_DELAY * Math.pow(2, this.consecutiveErrors),
        this.MAX_BACKOFF_DELAY
      );
      setTimeout(() => this.mine(), backoffDelay);
    }
  }

  public start(currentAttempts?: number) {
    this.isRunning = true;
    this.attempts = currentAttempts || 0;
    this.startTime = Date.now();
    this.lastRequestTime = Date.now();
    this.successfulRequests = 0;
    this.totalLatency = 0;
    this.currentRpcIndex = 0;
    this.consecutiveErrors = 0;
    this.rateLimitHits.clear();
    
    setInterval(() => this.updateStats(), this.STATS_UPDATE_INTERVAL);
    this.mine();
  }

  public stop() {
    this.isRunning = false;
  }
}