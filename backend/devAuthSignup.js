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

async function devSignupConfirmedUser(supabase, { username, email, password }) {
  const existingId = await findAuthUserIdByEmail(supabase, email);
  if (existingId) {
    const error = new Error('User already exists');
    error.code = 'USER_EXISTS';
    throw error;
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

  return data?.user || null;
}

module.exports = {
  devSignupConfirmedUser,
};
