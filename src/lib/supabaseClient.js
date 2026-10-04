import { createClient } from '@supabase/supabase-js';

const url = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const key = (process.env.REACT_APP_SUPABASE_KEY || '').trim();

/** Dev/testing only: dummy redirect target for Supabase auth URL flows (no server listens here). */
export const DEV_SUPABASE_DUMMY_REDIRECT = 'http://127.0.0.1:1/__dev_supabase_redirect';

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;
