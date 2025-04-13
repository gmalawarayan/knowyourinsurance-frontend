
import { createClient } from '@supabase/supabase-js';

// Default values for development - replace these with your actual Supabase project details
// In production, these should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-public-anon-key';

// Log environment variable status - helpful for debugging
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not found. Using fallback values for development. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('contacts').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    console.error('Error connecting to Supabase:', e);
    return false;
  }
};
