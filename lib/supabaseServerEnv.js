/**
 * Resolve Supabase URL + service key for server-side code (Vercel Functions, Express).
 * Accepts the same names as Vercel/CRA so REACT_APP_* vars work on the server.
 */
function getSupabaseServerUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');
}

function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.REACT_APP_SUPABASE_KEY ||
    ''
  ).trim();
}

module.exports = {
  getSupabaseServerUrl,
  getSupabaseServiceRoleKey,
};
