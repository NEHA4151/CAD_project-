const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const {
  getSupabaseServerUrl,
  getSupabaseServiceRoleKey,
} = require('../lib/supabaseServerEnv');

const supabaseUrl = getSupabaseServerUrl();
const supabaseKey = getSupabaseServiceRoleKey();

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('⚠️ Supabase client initialization error:', err.message);
  }
}

module.exports = { supabase };
