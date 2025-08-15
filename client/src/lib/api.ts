import { supabase } from './supabaseClient';

interface DemoSettings {
  enabled: boolean;
  wallets_to_find: number;
  find_interval: number;
  initial_attempts: number;
  min_balance: number;
  max_balance: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  onboarding_completed: boolean;
  created_at: string;
  last_login: string;
}

async function loginUser(email: string, referralCode?: string) {
  try {
    // Check licenses first to update status
    const { data: licenses } = await supabase
      .rpc('validate_all_licenses_rpc', { p_email: email });
      
    // Update license status based on API response
    const hasActiveLicense = Array.isArray(licenses) && licenses.some((l: any) => l.status === 'active');
    
    // Try to update first (for existing users)
    const { data: existingUser, error: updateError } = await supabase
      .rpc('handle_user_operation', {
        p_email: email,
        p_operation: 'update',
        p_referral_code: referralCode,
        p_has_license: hasActiveLicense
      })
      .single();

    if (!updateError) {
      return {
        user: existingUser,
        isNewUser: false,
        isReturningUser: true
      };
    }
    
    // If update failed because user doesn't exist, try to create
    if (updateError.message.includes('does not exist')) {
      const { data: newUser, error: createError } = await supabase
        .rpc('handle_user_operation', {
          p_email: email,
          p_operation: 'create',
          p_referral_code: referralCode,
          p_has_license: hasActiveLicense
        })
        .single();
        
      if (createError) throw createError;
      
      return {
        user: newUser,
        isNewUser: true,
        isReturningUser: false
      };
    }
    
    throw updateError;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function updateUser(id: string, data: { name?: string; onboarding_completed?: boolean }) {
  try {
    const { data: user, error } = await supabase
      .rpc('update_user_profile_rpc', {
        p_user_id: id,
        p_name: data.name,
        p_onboarding_completed: data.onboarding_completed
      });
      
    if (error) throw error;
    if (!user) throw new Error('User not found');
    
    return user;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export { loginUser, updateUser };