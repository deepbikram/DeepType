// Supabase Client Configuration for DeepType
import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10 // Rate limiting for updates
    }
  }
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && 
         supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
         supabaseUrl.includes('supabase.co');
};

export default supabase;
