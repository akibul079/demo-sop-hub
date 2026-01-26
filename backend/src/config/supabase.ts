// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Export for testing
export { supabaseUrl };
// Test connection
console.log('✅ Supabase client created');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Has API key:', !!supabaseAnonKey);

// Test a simple query
supabase.from('users').select('count').then(result => {
  console.log('🧪 Test query result:', result);
}).catch(err => {
  console.error('❌ Test query failed:', err);
});
