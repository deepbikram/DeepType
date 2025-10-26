// Supabase Client Configuration for DeepType
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug: Log configuration status (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Config Check:');
  console.log('  URL:', supabaseUrl || '❌ NOT SET');
  console.log('  Key:', supabaseAnonKey ? '✅ Set (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ NOT SET');
}

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing! Check your .env.local file.');
  console.error('Required variables:');
  console.error('  - REACT_APP_SUPABASE_URL');
  console.error('  - REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10 // Rate limiting for updates
      }
    }
  }
);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));
};

export default supabase;
