import { json, html, redirect } from '../utils.js';
import { authenticateAdmin, createSession, buildSessionCookie, buildLogoutCookie, destroySession, getSession } from '../auth.js';
import { rateLimit } from '../security.js';
import { adminLoginPage } from '../views/admin-login.js';

export async function authLoginPost(request, env, settings) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(`login:${ip}`, 15, 60000)) {
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  }
  let data = {};
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await request.json().catch(() => ({}));
  } else {
    const form = await request.formData();
    data = Object.fromEntries(form.entries());
  }
  const email = String(data.email || '').trim().toLowerCase();
  const password = String(data.password || '');
  if (!email || !password) return json({ error: 'Email and password are required.' }, 400);
  const admin = await authenticateAdmin(env, email, password);
  if (!admin) return json({ error: 'Invalid credentials' }, 401);
  const { token, csrf, expires } = await createSession(env, admin.id);
  const headers = { 'set-cookie': buildSessionCookie(token, expires) };
  // If form POST, redirect to /admin
  if (ct.includes('application/json') || request.headers.get('accept')?.includes('application/json')) {
    return json({ ok: true, csrf, admin: { id: admin.id, email: admin.email, name: admin.name } }, 200, headers);
  }
  return new Response(null, { status: 302, headers: { ...headers, location: '/admin' } });
}

export async function authLogoutPost(request, env) {
  await destroySession(request, env);
  const headers = { 'set-cookie': buildLogoutCookie() };
  const accept = request.headers.get('accept') || '';
  if (accept.includes('application/json')) return json({ ok: true }, 200, headers);
  return new Response(null, { status: 302, headers: { ...headers, location: '/admin/login' } });
}

export async function authMeGet(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ authenticated: false }, 401);
  return json({
    authenticated: true,
    admin: { id: session.admin_id, email: session.admin_email, name: session.admin_name },
    csrf: session.csrf_token
  });
}
