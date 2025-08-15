// Sistema de validação de licenças para produção
import fetch from 'cross-fetch';

export interface LicenseCheckResult {
  productCode: string;
  status: 'active' | 'inactive' | 'error';
  rawResponse?: string;
  error?: string;
  timestamp: number;
}

export interface LicenseValidationResult {
  success: boolean;
  hasActiveLicense: boolean;
  allowedBlockchains: string[];
  activeLicense: {
    productCode: string;
    status: string;
  } | null;
  turboModeEnabled: boolean;
  verificationResults: LicenseCheckResult[];
  message: string;
  cacheExpiration?: number;
}

class LicenseValidator {
  private apiUrl: string;
  private productCodes: string[];
  private cache: Map<string, { result: LicenseValidationResult; expiration: number }>;
  private cacheTimeout: number;

  constructor() {
    this.apiUrl = process.env.LICENSE_API_URL || 'https://api.ghostwallet.cloud/verify_license.php';
    this.productCodes = [
      'PPPBC295', // Enterprise: Todas as blockchains
      'PPPBC293', // Premium: Solana, Bitcoin, Ethereum  
      'PPPBC229', // Basic: Apenas Solana
      'PPPBAHKJ'  // Turbo Mode: Ativação do modo turbo
    ];
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos de cache
  }

  private getCacheKey(email: string): string {
    return `license_${email.toLowerCase()}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkSingleLicense(email: string, productCode: string, retries = 2): Promise<LicenseCheckResult> {
    const timestamp = Date.now();
    
    if (!this.isValidEmail(email)) {
      return {
        productCode,
        status: 'error',
        error: 'Invalid email format',
        timestamp
      };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const payload = {
          email: email.toLowerCase().trim(),
          product_code: productCode
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout para produção

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'GhostWallet-Production/1.0',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          return {
            productCode,
            status: 'error',
            error: `HTTP ${response.status}`,
            timestamp
          };
        }

        const textResponse = await response.text();
        
        if (!textResponse || textResponse.trim() === '') {
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          return {
            productCode,
            status: 'inactive',
            rawResponse: textResponse,
            timestamp
          };
        }

        try {
          const jsonResponse = JSON.parse(textResponse);
          const status = jsonResponse.license_status === 'active' ? 'active' : 'inactive';
          
          return {
            productCode,
            status,
            rawResponse: textResponse,
            timestamp
          };
        } catch (parseError) {
          return {
            productCode,
            status: 'inactive',
            rawResponse: textResponse,
            error: 'Invalid JSON response',
            timestamp
          };
        }
      } catch (error: any) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        return {
          productCode,
          status: 'error',
          error: error.message || 'Network error',
          timestamp
        };
      }
    }

    return {
      productCode,
      status: 'error',
      error: 'Maximum retries exceeded',
      timestamp
    };
  }

  private determineBlockchainAccess(results: LicenseCheckResult[]): {
    allowedBlockchains: string[];
    activeLicense: { productCode: string; status: string } | null;
    turboModeEnabled: boolean;
    message: string;
  } {
    // Verificar modo turbo
    const turboLicense = results.find(r => r.productCode === 'PPPBAHKJ' && r.status === 'active');
    const turboModeEnabled = !!turboLicense;

    // Verificar em ordem de prioridade para blockchains
    const fullAccess = results.find(r => r.productCode === 'PPPBC295' && r.status === 'active');
    const midTier = results.find(r => r.productCode === 'PPPBC293' && r.status === 'active');
    const solanaOnly = results.find(r => r.productCode === 'PPPBC229' && r.status === 'active');

    let baseMessage = '';
    let allowedBlockchains: string[] = [];
    let activeLicense: { productCode: string; status: string } | null = null;

    if (fullAccess) {
      allowedBlockchains = ['solana', 'bitcoin', 'ethereum', 'bsc', 'cardano', 'polkadot'];
      activeLicense = { productCode: fullAccess.productCode, status: fullAccess.status };
      baseMessage = 'Licença ENTERPRISE ativa - Todas as blockchains liberadas';
    } else if (midTier) {
      allowedBlockchains = ['solana', 'bitcoin', 'ethereum'];
      activeLicense = { productCode: midTier.productCode, status: midTier.status };
      baseMessage = 'Licença PREMIUM ativa - Sol/BTC/ETH liberadas';
    } else if (solanaOnly) {
      allowedBlockchains = ['solana'];
      activeLicense = { productCode: solanaOnly.productCode, status: solanaOnly.status };
      baseMessage = 'Licença BASIC ativa - Apenas Solana liberada';
    } else {
      allowedBlockchains = [];
      activeLicense = null;
      baseMessage = 'Nenhuma licença ativa encontrada';
    }

    // Adicionar informação sobre modo turbo se ativo
    const finalMessage = turboModeEnabled ? `${baseMessage} + MODO TURBO ATIVO` : baseMessage;

    return {
      allowedBlockchains,
      activeLicense,
      turboModeEnabled,
      message: finalMessage
    };
  }

  public async validateLicense(email: string, forceRefresh = false): Promise<LicenseValidationResult> {
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        hasActiveLicense: false,
        allowedBlockchains: [],
        activeLicense: null,
        turboModeEnabled: false,
        verificationResults: [],
        message: 'Email é obrigatório'
      };
    }

    const cacheKey = this.getCacheKey(email);
    const now = Date.now();

    // Verificar cache se não for refresh forçado
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now < cached.expiration) {
        console.log('🔄 [LicenseValidator] Retornando resultado do cache para:', email);
        return cached.result;
      }
    }

    console.log('🔄 [LicenseValidator] Iniciando verificação de licenças para:', email);

    try {
      // Fazer verificações em paralelo
      const results = await Promise.all(
        this.productCodes.map(productCode => 
          this.checkSingleLicense(email, productCode)
        )
      );

      console.log('🔄 [LicenseValidator] Resultados completos:', results);

      const { allowedBlockchains, activeLicense, turboModeEnabled, message } = this.determineBlockchainAccess(results);

      const validationResult: LicenseValidationResult = {
        success: true,
        hasActiveLicense: !!activeLicense,
        allowedBlockchains,
        activeLicense,
        turboModeEnabled,
        verificationResults: results,
        message,
        cacheExpiration: now + this.cacheTimeout
      };

      // Salvar no cache
      this.cache.set(cacheKey, {
        result: validationResult,
        expiration: now + this.cacheTimeout
      });

      // Limpar cache expirado
      this.cleanExpiredCache();

      console.log(`🔄 [LicenseValidator] ${activeLicense ? '✅' : '❌'} ${message}`);

      return validationResult;

    } catch (error: any) {
      console.error('🔄 [LicenseValidator] Erro no sistema de verificação:', error);
      
      return {
        success: false,
        hasActiveLicense: false,
        allowedBlockchains: [],
        activeLicense: null,
        turboModeEnabled: false,
        verificationResults: [],
        message: 'Erro no sistema de verificação de licenças'
      };
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now >= value.expiration) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  public clearCache(email?: string): void {
    if (email) {
      const cacheKey = this.getCacheKey(email);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  public getCacheStats(): { totalEntries: number; validEntries: number } {
    const now = Date.now();
    let validEntries = 0;
    
    this.cache.forEach((value) => {
      if (now < value.expiration) {
        validEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries
    };
  }
}

// Instância singleton para uso em produção
export const licenseValidator = new LicenseValidator();