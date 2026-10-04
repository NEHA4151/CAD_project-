const { createClient } = require('@supabase/supabase-js');
const {
  getSupabaseServerUrl,
  getSupabaseServiceRoleKey,
} = require('../lib/supabaseServerEnv');

async function findAuthUserIdByEmail(adminClient, email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;

  let page = 1;
  const perPage = 1000;
  while (page <= 50) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }
    const users = data?.users || [];
    const match = users.find((u) => String(u.email || '').toLowerCase() === normalized);
    if (match) {
      return match.id;
    }
    if (users.length < perPage) {
      break;
    }
    page += 1;
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Dev-Supabase-Redirect'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = getSupabaseServerUrl();
  const serviceKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error:
        'Server missing Supabase URL or key. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_KEY) in Vercel project env for Functions.',
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'X-Client-Info': 'finance-tracker-dev-signup' },
    },
  });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      body = {};
    }
  }

  const { username, email, password } = body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingId = await findAuthUserIdByEmail(supabase, email);
    if (existingId) {
      return res.status(409).json({
        error: 'User already exists',
      });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: String(email).trim(),
      password,
      email_confirm: true,
      user_metadata: { username },
      app_metadata: { dev_testing: true },
    });

    if (error) {
      throw error;
    }

    return res.status(201).json({
      ok: true,
      userId: data?.user?.id || null,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Signup failed',
      details: err?.message || String(err),
    });
  }
};
