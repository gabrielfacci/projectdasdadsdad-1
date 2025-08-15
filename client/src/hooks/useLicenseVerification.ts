import { useState, useCallback, useEffect } from 'react';
import { syncLicenseStatus } from '../lib/licenseCheck';
import { getAuthorizedBlockchains } from '../lib/productLicenses';

export interface LicenseVerificationState {
  isVerifying: boolean;
  hasLicense: boolean;
  authorizedBlockchains: string[];
  productCodes: string[];
  turboModeEnabled: boolean;
  lastVerification: string | null;
  error: string | null;
}

export function useLicenseVerification(userEmail: string | null) {
  const [state, setState] = useState<LicenseVerificationState>({
    isVerifying: false,
    hasLicense: false,
    authorizedBlockchains: [],
    productCodes: [],
    turboModeEnabled: false,
    lastVerification: null,
    error: null
  });

  const verifyLicenses = useCallback(async (isManual = false) => {
    if (!userEmail) return null;

    setState(prev => ({
      ...prev,
      isVerifying: true,
      error: null
    }));

    try {
      console.log(`[useLicenseVerification] Iniciando verificação ${isManual ? 'MANUAL (força refresh)' : 'automática'} para:`, userEmail);
      
      // Fazer verificação direta via API - se for manual, força refresh
      const response = await fetch('/api/license-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          forceRefresh: isManual // Força refresh quando clicado manualmente
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na verificação: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useLicenseVerification] Dados recebidos:', data);

      if (data.success && data.hasActiveLicense) {
        // Usar dados diretos da API que já processou as 4 verificações (incluindo turbo)
        setState({
          isVerifying: false,
          hasLicense: true,
          authorizedBlockchains: data.allowedBlockchains || [],
          productCodes: [data.activeLicense.productCode],
          turboModeEnabled: data.turboModeEnabled || false,
          lastVerification: new Date().toISOString(),
          error: null
        });

        // Salvar no localStorage com nova estrutura incluindo turbo
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: true,
          productCode: data.activeLicense.productCode,
          allowedBlockchains: data.allowedBlockchains,
          turboModeEnabled: data.turboModeEnabled || false,
          verificationResults: data.verificationResults,
          checkedAt: new Date().toISOString()
        }));

        return {
          hasLicense: true,
          authorizedBlockchains: data.allowedBlockchains || [],
          turboModeEnabled: data.turboModeEnabled || false,
          productCodes: [data.activeLicense.productCode]
        };
      } else {
        // NENHUMA licença ativa - BLOQUEAR TODAS AS BLOCKCHAINS
        setState({
          isVerifying: false,
          hasLicense: false,
          authorizedBlockchains: [], // ARRAY VAZIO - NENHUM ACESSO
          productCodes: [],
          turboModeEnabled: false,
          lastVerification: new Date().toISOString(),
          error: 'no_license' // Flag para redirecionamento
        });

        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: false,
          turboModeEnabled: false,
          checkedAt: new Date().toISOString()
        }));

        return {
          hasLicense: false,
          authorizedBlockchains: [],
          productCodes: [],
          turboModeEnabled: false,
          shouldRedirect: true // Flag para redirecionamento
        };
      }

    } catch (err) {
      console.error('[useLicenseVerification] Erro na verificação:', err);
      
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: err instanceof Error ? err.message : 'Erro na verificação de licenças'
      }));
      
      return null;
    }
  }, [userEmail]);

  // Verificação automática inicial
  useEffect(() => {
    if (userEmail && !state.lastVerification) {
      verifyLicenses(false);
    }
  }, [userEmail, verifyLicenses, state.lastVerification]);

  // Função para verificação manual (sempre força nova verificação real no servidor)
  const manualVerify = useCallback(() => {
    console.log('[useLicenseVerification] ⚡ VERIFICAÇÃO MANUAL SOLICITADA - Forçando verificação real no servidor externo');
    return verifyLicenses(true);
  }, [verifyLicenses]);

  return {
    ...state,
    verifyLicenses: manualVerify,
    hasBlockchainAccess: (blockchain: string) => 
      state.authorizedBlockchains.includes(blockchain)
  };
}