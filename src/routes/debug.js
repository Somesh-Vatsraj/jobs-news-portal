import { json } from '../utils.js';
import { getSession, getCookie } from '../auth.js';

export async function debugStatus(request, env) {
  const url = new URL(request.url);
  const out = {
    timestamp: new Date().toISOString(),
    url: url.href,
    protocol: url.protocol,
    host: url.host,
    method: request.method,
    headers: {
      cookie: request.headers.get('cookie') || '(none)',
      'user-agent': (request.headers.get('user-agent') || '').slice(0, 80),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip') || '(none)'
    },
    env: {
      hasDB: !!env.DB,
      hasASSETS: !!env.ASSETS
    },
    db: {}
  };

  try {
    // Check admins
    const admins = await env.DB.prepare('SELECT id, email, name, created_at FROM admins').all();
    out.db.adminsCount = (admins.results || []).length;
    out.db.admins = (admins.results || []).map(a => ({
      id: a.id, email: a.email, name: a.name, created_at: a.created_at
    }));

    // Check sessions
    const sessions = await env.DB.prepare(
      'SELECT id, admin_id, expires_at, created_at, length(token_hash) AS hash_len FROM sessions ORDER BY id DESC LIMIT 10'
    ).all();
    out.db.sessionsCount = (sessions.results || []).length;
    out.db.sessions = sessions.results || [];

    // Check settings count
    const settings = await env.DB.prepare('SELECT COUNT(*) AS c FROM site_settings').first();
    out.db.settingsCount = settings ? settings.c : 0;

    // Check current session
    const cookieToken = getCookie(request, 'sess');
    out.cookie = {
      hasSessCookie: !!cookieToken,
      tokenPreview: cookieToken ? cookieToken.slice(0, 8) + '…' : null
    };

    const session = await getSession(request, env);
    out.session = session ? {
      found: true,
      adminId: session.admin_id,
      email: session.admin_email,
      expiresAt: session.expires_at,
      hasCsrf: !!session.csrf_token
    } : { found: false };

  } catch (err) {
    out.db.error = String(err && err.message || err);
    out.db.stack = String(err && err.stack || '').split('\n').slice(0, 5);
  }

  return json(out);
}
