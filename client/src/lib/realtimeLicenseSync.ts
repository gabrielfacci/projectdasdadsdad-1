import { syncLicenseStatus } from './licenseCheck';
import { getAuthorizedBlockchains } from './productLicenses';

interface LicenseStatus {
  hasLicense: boolean;
  productCodes: string[];
  authorizedBlockchains: string[];
  lastSync: string;
  syncInProgress: boolean;
}

class RealtimeLicenseSync {
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: LicenseStatus) => void> = [];
  private currentStatus: LicenseStatus = {
    hasLicense: false,
    productCodes: [],
    authorizedBlockchains: [],
    lastSync: '',
    syncInProgress: false
  };
  
  // Intervalo de sincronização (30 segundos para responsividade)
  private readonly SYNC_INTERVAL = 30000;
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;

  constructor() {
    // Carregar status inicial do localStorage
    this.loadCachedStatus();
    console.log('[RealtimeLicenseSync] Inicializado com status:', this.currentStatus);
  }

  private loadCachedStatus() {
    try {
      const cached = localStorage.getItem('ghost-wallet-license-status');
      if (cached) {
        const data = JSON.parse(cached);
        this.currentStatus = {
          hasLicense: data.hasLicense || false,
          productCodes: data.productCodes || [],
          authorizedBlockchains: getAuthorizedBlockchains(data.productCodes || []),
          lastSync: data.checkedAt || '',
          syncInProgress: false
        };
      }
    } catch (error) {
      console.warn('[RealtimeLicenseSync] Erro ao carregar cache:', error);
    }
  }

  private saveCachedStatus() {
    try {
      localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
        hasLicense: this.currentStatus.hasLicense,
        productCodes: this.currentStatus.productCodes,
        checkedAt: this.currentStatus.lastSync
      }));
    } catch (error) {
      console.warn('[RealtimeLicenseSync] Erro ao salvar cache:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.currentStatus });
      } catch (error) {
        console.error('[RealtimeLicenseSync] Erro ao notificar listener:', error);
      }
    });
  }

  public subscribe(listener: (status: LicenseStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Enviar status atual imediatamente de forma assíncrona para evitar problemas de rendering
    setTimeout(() => {
      listener({ ...this.currentStatus });
    }, 0);
    
    // Retornar função de unsubscribe
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async syncNow(userEmail: string): Promise<LicenseStatus> {
    if (this.currentStatus.syncInProgress) {
      return this.currentStatus;
    }

    // Cache por 15 segundos para máxima responsividade
    const now = new Date().getTime();
    const lastSyncTime = this.currentStatus.lastSync ? new Date(this.currentStatus.lastSync).getTime() : 0;
    const timeDiff = now - lastSyncTime;
    
    if (timeDiff < 15000 && this.currentStatus.hasLicense) {
      return this.currentStatus;
    }

    this.currentStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      const licenses = await syncLicenseStatus(userEmail);
      const activeLicenses = licenses.filter(license => license.status === 'active');
      
      const hasLicense = activeLicenses.length > 0;
      const productCodes = activeLicenses
        .map(license => license.product_code)
        .filter(code => code && code.trim()) as string[];
      
      const planNames = activeLicenses
        .map(license => license.plan)
        .filter(plan => plan && plan.trim()) as string[];
      
      const authorizedBlockchains = getAuthorizedBlockchains(productCodes, planNames);

      const newStatus: LicenseStatus = {
        hasLicense,
        productCodes: [...productCodes, ...planNames], // Combinar códigos e planos
        authorizedBlockchains,
        lastSync: new Date().toISOString(),
        syncInProgress: false
      };
      


      // Verificar se houve mudanças significativas
      const statusChanged = 
        this.currentStatus.hasLicense !== newStatus.hasLicense ||
        JSON.stringify(this.currentStatus.productCodes.sort()) !== JSON.stringify(newStatus.productCodes.sort()) ||
        JSON.stringify(this.currentStatus.authorizedBlockchains.sort()) !== JSON.stringify(newStatus.authorizedBlockchains.sort());

      this.currentStatus = newStatus;
      this.saveCachedStatus();
      this.retryCount = 0; // Reset retry count on success

      if (statusChanged) {
        this.notifyListeners();
      } else {
        // Sempre notificar para manter UI atualizada
        this.currentStatus.lastSync = newStatus.lastSync;
        this.currentStatus.syncInProgress = false;
        this.notifyListeners();
      }

      return newStatus;

    } catch (error) {
      console.error('[RealtimeLicenseSync] Erro na sincronização:', error);
      this.retryCount++;
      
      this.currentStatus.syncInProgress = false;
      this.notifyListeners();
      
      throw error;
    }
  }

  public startAutoSync(userEmail: string) {
    if (this.syncInterval) {
      console.log('[RealtimeLicenseSync] Auto-sync já ativo, ignorando nova tentativa');
      return;
    }

    console.log('[RealtimeLicenseSync] Iniciando auto-sync a cada', this.SYNC_INTERVAL / 1000, 'segundos');
    
    // Sync inicial
    this.syncNow(userEmail).catch(error => {
      console.error('[RealtimeLicenseSync] Erro no sync inicial:', error);
    });

    // Configurar interval com verificação de página ativa
    this.syncInterval = setInterval(async () => {
      try {
        // Verificar se a página está ativa para evitar sync desnecessário
        if (document.hidden) {
          return;
        }

        if (this.retryCount >= this.MAX_RETRIES) {
          console.warn('[RealtimeLicenseSync] Máximo de tentativas atingido, pausando sync automático');
          this.stopAutoSync();
          return;
        }

        await this.syncNow(userEmail);
      } catch (error) {
        console.error('[RealtimeLicenseSync] Erro no sync automático:', error);
      }
    }, this.SYNC_INTERVAL);
  }

  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[RealtimeLicenseSync] Auto-sync interrompido');
    }
  }

  public getCurrentStatus(): LicenseStatus {
    return { ...this.currentStatus };
  }

  public hasBlockchainAccess(blockchain: string): boolean {
    return this.currentStatus.authorizedBlockchains.includes(blockchain);
  }

  public destroy() {
    this.stopAutoSync();
    this.listeners = [];
  }
}

// Instância singleton
export const realtimeLicenseSync = new RealtimeLicenseSync();

// Hook para React
import { useState, useEffect, useCallback } from 'react';

export function useRealtimeLicenseSync(userEmail: string | null) {
  const [status, setStatus] = useState<LicenseStatus>(() => 
    realtimeLicenseSync.getCurrentStatus()
  );

  useEffect(() => {
    if (!userEmail) return;

    // Inscrever-se para atualizações
    const unsubscribe = realtimeLicenseSync.subscribe(setStatus);

    // Iniciar auto-sync apenas uma vez
    realtimeLicenseSync.startAutoSync(userEmail);

    return () => {
      unsubscribe();
      // Não parar o auto-sync aqui para evitar re-inicializações
      // realtimeLicenseSync.stopAutoSync();
    };
  }, [userEmail]);

  const syncNow = useCallback(async () => {
    if (userEmail) {
      return await realtimeLicenseSync.syncNow(userEmail);
    }
  }, [userEmail]);

  return {
    status,
    syncNow,
    hasBlockchainAccess: (blockchain: string) => 
      realtimeLicenseSync.hasBlockchainAccess(blockchain)
  };
}

// Para uso sem React
export { RealtimeLicenseSync };