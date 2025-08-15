import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL?.includes('supabase') 
  ? process.env.DATABASE_URL.split('@')[1].split('/')[0] 
  : 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateUserLanguage(req: Request, res: Response) {
  try {
    const { email, language } = req.body;

    if (!email || !language) {
      return res.status(400).json({
        success: false,
        error: 'Email and language are required'
      });
    }

    // Validate language code
    const validLanguages = ['pt-BR', 'en-US', 'es-ES'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    // Update user language in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update({ language })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('[API] Error updating user language:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update language'
      });
    }

    console.log(`[API] Language updated for ${email}: ${language}`);

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('[API] Unexpected error updating user language:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}