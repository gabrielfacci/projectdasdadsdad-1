import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { checkLicenses, checkBlockchainAccess, checkTurboAccess, type License } from '../lib/license';
import { syncLicenseStatus } from '../lib/licenseCheck';
import { blockchains } from '../lib/blockchains';
import { supabase } from '../lib/supabaseClient';

interface LicenseContextType {
  licenses: License[];
  loading: boolean;
  error: string | null;
  checkBlockchainAccess: (blockchain: string) => Promise<boolean>;
  hasTurboAccess: () => Promise<boolean>;
  refreshLicenses: () => Promise<void>;
  syncLicenses: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within LicenseProvider');
  }
  return context;
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache for blockchain access checks
  const accessCache = useRef<Record<string, { result: boolean; timestamp: number }>>({});
  const CACHE_DURATION = 60000; // 1 minute cache

  // Refresh licenses from API
  const refreshLicenses = async () => {
    if (!user?.email) {
      setLicenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get user ID
      const { data: userResult, error: userError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: user.email });

      if (userError || !userResult?.success || !userResult?.id) {
        throw new Error('Usuário não encontrado');
      }

      const userId = userResult.id;

      // 2. Sync with external API and update licenses table
      const licenseStatus = await syncLicenseStatus(user.email);

      // 3. Get updated licenses
      const { data: licenseResult, error: licenseError } = await supabase
        .rpc('validate_all_licenses_rpc', { p_email: user.email });

      if (licenseError) throw licenseError;

      if (!licenseResult?.success) {
        throw new Error(licenseResult?.error || 'Failed to validate licenses');
      }

      setLicenses(licenseResult.licenses || []);
      setError(null);

    } catch (err: any) {
      console.error('Error refreshing licenses:', err);
      setError('Erro ao verificar licenças. Tente novamente mais tarde.');
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Check licenses when user changes
  useEffect(() => {
    if (user?.email) {
      refreshLicenses();
    }
  }, [user?.email]);

  const checkBlockchainAccess = useCallback(async (blockchain: string) => {
    if (!user?.email) return false;

    const now = Date.now();
    const cached = accessCache.current[blockchain];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }

    try {
      const { data: hasAccess, error } = await supabase.rpc('check_blockchain_access_rpc', {
        p_email: user.email,
        p_blockchain: blockchain
      });

      if (error) throw error;

      const result = hasAccess?.[0]?.has_access || false;
      accessCache.current[blockchain] = { result, timestamp: now };

      // 🔍 Log
      console.log(`[GhostWallet] Blockchain: ${blockchain} | Access: ${result}`);

      return result;
    } catch (err) {
      console.error('Error checking blockchain access:', err);
      return false;
    }
  }, [user?.email]);

  return (
    <LicenseContext.Provider value={{
      licenses,
      loading,
      error,
      checkBlockchainAccess,
      hasTurboAccess: () => checkTurboAccess(licenses, user?.email),
      refreshLicenses,
      syncLicenses: () => syncLicenseStatus(user?.email || '')
    }}>
      {children}
    </LicenseContext.Provider>
  );
}
