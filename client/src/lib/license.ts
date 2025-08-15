import { supabase } from './supabaseClient';
import { syncLicenseStatus } from './licenseCheck';

// Types
export interface License {
  product_code: string;
  status: 'active' | 'inactive';
}

// Product to blockchain mapping
export const PRODUCT_TO_BLOCKCHAIN = {
  PPPBC229: ["solana"],                    // Basic Plan
  PPPBC293: ["solana", "bitcoin", "ethereum"], // Black Plan
  PPPBC295: ["solana", "bitcoin", "ethereum", "bsc", "cardano", "polkadot"], // Diamond Plan
  PPPBC2F9: ["bitcoin"],                   // Bitcoin Individual
  PPPBC2FD: ["bsc"],                       // BSC Individual
  PPPBC2FF: ["cardano"],                   // Cardano Individual
  PPPBC2FC: ["ethereum"],                  // Ethereum Individual
  PPPBC2FH: ["polkadot"]                   // Polkadot Individual
} as const;

// Cache for blockchain access checks
const accessCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check user licenses with retry mechanism
export async function checkLicenses(email: string): Promise<License[]> {
  if (!email) {
    throw new Error('Email is required for license check');
  }

  try {
    // First sync with external API
    await syncLicenseStatus(email);

    // Then get updated licenses from database
    const { data: result, error } = await supabase
      .rpc('validate_all_licenses_rpc', { p_email: email });

    if (error) throw error;

    if (!result?.success) {
      console.warn('License validation failed:', result?.error);
      return [];
    }

    return result.licenses || [];
  } catch (error) {
    console.error('Error checking licenses:', error);
    return [];
  }
}

// Get available blockchains for a user based on active licenses
export function getAvailableBlockchains(licenses: License[]): string[] {
  const blockchains = new Set<string>();

  licenses
    .filter(license => license.status === 'active')
    .forEach(license => {
      const chains = PRODUCT_TO_BLOCKCHAIN[license.product_code as keyof typeof PRODUCT_TO_BLOCKCHAIN];
      if (chains) {
        chains.forEach(chain => blockchains.add(chain));
      }
    });

  return Array.from(blockchains);
}

// Verify blockchain access with retry mechanism and caching
export async function checkBlockchainAccess(blockchain: string, email: string): Promise<boolean> {
  if (!email) return false;

  // Check cache first
  const cacheKey = `${email}:${blockchain}`;
  const now = Date.now();
  const cached = accessCache.get(cacheKey);
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    const { data, error } = await supabase
      .rpc('check_blockchain_access_rpc', { 
        p_email: email,
        p_blockchain: blockchain 
      });

    if (error) throw error;

    const hasAccess = data?.has_access || false;

    // Cache the result
    accessCache.set(cacheKey, {
      result: hasAccess,
      timestamp: now
    });

    return hasAccess;
  } catch (err) {
    console.error('Error checking blockchain access:', err);
    return false;
  }
}

// Verify turbo access
export async function checkTurboAccess(licenses: License[], email: string | undefined): Promise<boolean> {
  if (!email) return false;

  try {
    // First check external API
    try {
      const response = await fetch('https://api.ghostwallet.cloud/check_license.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        // Check if user has PPPBAHKJ (Turbo Feature) license
        const hasExternalTurbo = data.licenses?.some(
          (license: any) => license.product_code === 'PPPBAHKJ' && license.status === 'active'
        );
        
        if (hasExternalTurbo) {
          return true;
        }
      }
    } catch (err) {
      // Silently fail - external API is handled by new system
    }

    // Fallback to database check
    const { data, error } = await supabase
      .rpc('check_turbo_access_rpc', { p_email: email });

    if (error) throw error;
    return data?.has_access || false;
  } catch (err) {
    console.error('Error checking turbo access:', err);
    return false;
  }
}