/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialConfig = () => {
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('arv_tech_supabase_url') : null;
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('arv_tech_supabase_key') : null;
  
  return {
    url: savedUrl || (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    key: savedKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder'
  };
};

const config = getInitialConfig();

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient => {
  if (url && key) {
    // If specific credentials are provided, we create a new one (usually for testing)
    // but we disable persistence to avoid the "Multiple GoTrueClient instances" warning
    return createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.key);
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
