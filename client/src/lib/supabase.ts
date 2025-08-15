import { createClient } from '@supabase/supabase-js';
import { loginUser } from './api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'ghost-wallet'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  created_at: string | null;
}

export interface Session {
  user: User;
  expires_at: number;
}

class LocalAuth {
  private storageKey = 'ghost-wallet-auth';
  private sessionKey = 'ghost-wallet-session';
  private profileKey = 'ghost-wallet-profile';
  private blockchainKey = 'selected_blockchain';
  private referralKey = 'referral_code';

  async signInWithEmail(email: string, referralCode?: string, name?: string): Promise<{ 
    data: { user: User; session: Session } | null; 
    error: Error | null;
  }> {
    try {
      // Get current SOL price for reward calculations
      let solPrice = 20; // Default fallback price
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          solPrice = priceData.solana?.usd || solPrice;
        }
      } catch (err) {
        console.warn('Failed to fetch SOL price, using default:', err);
      }

      // Verificar se o usuário tem licenças ativas antes de criar
      let hasActiveLicense = false;
      try {
        const { data: licenseResult, error: licenseError } = await supabase
          .rpc('validate_all_licenses_rpc', { p_email: email });
          
        if (!licenseError && licenseResult?.licenses) {
          hasActiveLicense = licenseResult.licenses.some((license: any) => license.status === 'active');
          console.log(`Usuário ${email} tem licença ativa: ${hasActiveLicense}`);
        }
      } catch (licenseErr) {
        console.error('Erro ao verificar licenças:', licenseErr);
      }

      // Try to handle user operation
      const { data: userResult, error: userError } = await supabase
        .rpc('handle_user_operation', { 
          p_email: email,
          p_operation: 'create', // Always try create, function handles existing users
          p_referral_code: referralCode,
          p_has_license: hasActiveLicense, // Use detected license status
          p_sol_price: solPrice
        });

      if (userError) {
        throw userError;
      }

      // Ensure email is present in user result
      const fixedUserResult = {
        ...userResult,
        email // Use provided email if not returned from RPC
      };
      
      // Se um nome foi fornecido, salve-o diretamente na tabela users
      if (name) {
        const { error: nameUpdateError } = await supabase
          .from('users')
          .update({ 
            name: name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('email', email);
          
        if (nameUpdateError) {
          console.warn('Erro ao salvar nome do usuário:', nameUpdateError);
        }
      }
      
      // Create user and session objects
      const user = this.createUserFromResponse(fixedUserResult);
      const session = this.createSession(user);
      
      // Save auth data with license status
      this.saveAuthData(user, session, fixedUserResult, hasActiveLicense);
      
      return { data: { user, session }, error: null };
    } catch (error) {
      console.error('Auth error:', error);
      return { data: null, error: error as Error };
    }
  }

  private createUserFromResponse(response: any): User {
    if (!response?.email) {
      throw new Error('Invalid user response: missing email');
    }

    let createdAt: string | null = null;
    if (response.created_at) {
      const parsedDate = new Date(response.created_at);
      if (!isNaN(parsedDate.getTime())) {
        createdAt = parsedDate.toISOString();
      }
    }

    return {
      id: response.id,
      email: response.email,
      role: response.role || 'user',
      email_verified: false,
      created_at: createdAt
    };
  }

  private createSession(user: User): Session {
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    return {
      user,
      expires_at: Math.floor(expiresAt / 1000)
    };
  }

  private saveAuthData(user: User, session: Session, responseData: any, hasActiveLicense: boolean) {
    // Store session in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify({ user, session }));
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
      hasLicense: hasActiveLicense,
      checkedAt: Date.now()
    }));

    // Store initial profile
    localStorage.setItem(this.profileKey, JSON.stringify({
      name: responseData.name,
      adminMode: responseData.role === 'admin' ? true : undefined,
      onboarding_completed: responseData.onboarding_completed || responseData.role === 'admin',
      hasActiveLicense: hasActiveLicense
    }));
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (!stored) {
        return { data: { session: null }, error: null };
      }

      const session = JSON.parse(stored) as Session;

      // Validate session has required fields
      if (!session?.user?.email || !session?.expires_at) {
        console.warn('Invalid session data found:', session);
        localStorage.removeItem(this.sessionKey);
        return { data: { session: null }, error: null };
      }

      // Check expiration
      if (session.expires_at * 1000 < Date.now()) {
        localStorage.removeItem(this.sessionKey);
        return { data: { session: null }, error: null };
      }

      return { 
        data: { session },
        error: null 
      };
    } catch (error) {
      console.error('Session error:', error);
      return { data: { session: null }, error: null };
    }
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.blockchainKey);
  }
}

export const auth = new LocalAuth();

export async function signInWithEmail(email: string, referralCode?: string) {
  return auth.signInWithEmail(email, referralCode);
}

export async function checkSessionHealth() {
  const { data } = await auth.getSession();
  return !!data.session?.user?.email;
}

export function clearSessionData() {
  auth.signOut();
}