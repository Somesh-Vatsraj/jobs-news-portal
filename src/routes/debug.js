import { json } from '../utils.js';
import { getSession, getCookie, authenticateAdmin } from '../auth.js';

export async function debugStatus(request, env) {
  const url = new URL(request.url);
  const out = {
    timestamp: new Date().toISOString(),
    url: url.href,
    protocol: url.protocol,
    env: { hasDB: !!env.DB, hasASSETS: !!env.ASSETS },
    db: {}
  };
  try {
    const admins = await env.DB.prepare('SELECT id, email, name, created_at FROM admins').all();
    out.db.adminsCount = (admins.results || []).length;
    out.db.admins = (admins.results || []).map(a => ({ id: a.id, email: a.email, name: a.name }));
    const sessions = await env.DB.prepare(
      'SELECT id, admin_id, expires_at, created_at FROM sessions ORDER BY id DESC LIMIT 10'
    ).all();
    out.db.sessionsCount = (sessions.results || []).length;
    out.db.sessions = sessions.results || [];
    const settings = await env.DB.prepare('SELECT COUNT(*) AS c FROM site_settings').first();
    out.db.settingsCount = settings ? settings.c : 0;
    const cookieToken = getCookie(request, 'sess');
    out.cookie = { hasSessCookie: !!cookieToken };
    const session = await getSession(request, env);
    out.session = session ? { found: true, adminId: session.admin_id, email: session.admin_email } : { found: false };
  } catch (err) {
    out.db.error = String(err && err.message || err);
  }
  return json(out);
}

export async function debugVerify(request, env) {
  let body = {};
  try { body = await request.json(); } catch {}
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return json({ error: 'email and password required' }, 400);

  const allAdmins = await env.DB.prepare('SELECT id, email, name FROM admins').all();
  const out = {
    input: { email, passwordLength: password.length },
    adminsInDb: (allAdmins.results || []).map(a => a.email),
    emailMatch: null,
    passwordMatch: null,
    matchReason: ''
  };

  const found = (allAdmins.results || []).find(a => a.email.toLowerCase() === email);
  if (!found) {
    out.matchReason = 'No admin with this exact email.';
    return json(out);
  }
  out.emailMatch = true;
  const admin = await authenticateAdmin(env, email, password);
  out.passwordMatch = !!admin;
  out.matchReason = admin ? '✅ Credentials correct — login should work.' : '❌ Email exists but password is wrong.';
  return json(out);
}

export async function debugResetAdmin(request, env) {
  const url = new URL(request.url);
  let body = {};
  try { body = await request.json(); } catch {}
  const secret = url.searchParams.get('secret') || body.secret || '';
  if (secret !== 'jobs-news-db-reset') return json({ error: 'Forbidden' }, 403);

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = String(body.name || 'Admin');
  if (!email || password.length < 8) return json({ error: 'email + password (min 8) required' }, 400);

  const { hashPassword } = await import('../security.js');
  const hash = await hashPassword(password);
  await env.DB.prepare('DELETE FROM sessions').run();
  await env.DB.prepare('DELETE FROM admins').run();
  await env.DB.prepare('INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)')
    .bind(email, hash, name).run();
  return json({ ok: true, admin: { email, name } });
}
