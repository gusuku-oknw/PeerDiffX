import { createClient } from '@supabase/supabase-js';

// Check for environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

console.log('Supabase client initialized');