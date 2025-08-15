import { supabase } from './supabaseClient';
import fetch from 'cross-fetch';

// Interface for license
interface License {
  id: string;
  product_code: string;
  license_status: string;
  created_at: string;
  updated_at: string;
}

export class LicenseDb {
  private static readonly TIMEOUT = 5000; // 5 seconds

  private static async fetchWithTimeout(promise: Promise<any>) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out'));
      }, this.TIMEOUT);
    });

    try {
      return await Promise.race([promise, timeout]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timed out') {
        console.warn('Request timed out');
        return { data: null, error: { message: 'timeout' } };
      }
      throw error;
    }
  }

  // Verifica licenças do usuário
  static async checkUserLicenses(email: string): Promise<License[]> {
    try {
      const { data, error } = await this.fetchWithTimeout(
        supabase.rpc('validate_all_licenses', { p_email: email })
      );

      if (error) {
        if (error.message === 'timeout') {
          console.warn('License check timed out, returning empty array');
          return [];
        }
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error checking user licenses:', error);
      return [];
    }
  }

  // Verifica acesso a uma blockchain específica
  static async checkBlockchainAccess(email: string, blockchain: string): Promise<boolean> {
    try {
      // First check local cache
      const cacheKey = `blockchain_access:${email}:${blockchain}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { hasAccess, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return hasAccess;
        }
      }

      // Try up to 3 times with increasing delays
      for (let i = 0; i < 3; i++) {
        try {
          const { data, error } = await supabase.rpc('check_blockchain_access', { 
            p_email: email,
            p_blockchain: blockchain 
          }, {
            // Set shorter timeout for each attempt
            abortSignal: AbortSignal.timeout((i + 1) * 2000)
          });

          if (error) throw error;
          
          // Cache successful result
          localStorage.setItem(cacheKey, JSON.stringify({
            hasAccess: data,
            timestamp: Date.now()
          }));
          
          return data || false;
          
        } catch (err) {
          if (i === 2) throw err; // Last attempt failed
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
          continue;
        }
      }

      return false;

    } catch (error) {
      console.error('Error checking blockchain access:', error);
      return false;
    }
  }

  // Verifica acesso ao Turbo
  static async checkTurboAccess(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.fetchWithTimeout(
        supabase.rpc('check_turbo_access', { p_email: email })
      );

      if (error) {
        if (error.message === 'timeout') {
          console.warn('Turbo access check timed out, defaulting to false');
          return false;
        }
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking turbo access:', error);
      return false;
    }
  }
}