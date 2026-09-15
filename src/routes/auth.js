import { json } from '../utils.js';
import { authenticateAdmin, createSession, buildSessionCookie, buildLogoutCookie, destroySession, getSession, isHttpsRequest } from '../auth.js';
import { rateLimit } from '../security.js';

export async function authLoginPost(request, env, settings) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(`login:${ip}`, 15, 60000)) {
    return json({ error: 'Too many attempts. Try again in a minute.' }, 429);
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
  if (!admin) {
    // अगर JSON request है → JSON error, form request है → redirect with error
    if (ct.includes('application/json') || (request.headers.get('accept') || '').includes('application/json')) {
      return json({ error: 'Invalid email or password.' }, 401);
    }
    return new Response(null, { status: 302, headers: { location: '/admin/login?error=invalid' } });
  }

  const { token, csrf, expires } = await createSession(env, admin.id);
  const isHttps = isHttpsRequest(request);
  const cookie = buildSessionCookie(token, expires, isHttps);

  const accept = request.headers.get('accept') || '';
  if (ct.includes('application/json') || accept.includes('application/json')) {
    return new Response(
      JSON.stringify({ ok: true, csrf, admin: { id: admin.id, email: admin.email, name: admin.name } }),
      { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'set-cookie': cookie } }
    );
  }
  return new Response(null, { status: 302, headers: { 'set-cookie': cookie, location: '/admin' } });
}

export async function authLogoutPost(request, env) {
  await destroySession(request, env);
  const isHttps = isHttpsRequest(request);
  const headers = { 'set-cookie': buildLogoutCookie(isHttps) };
  const accept = request.headers.get('accept') || '';
  if (accept.includes('application/json')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'content-type': 'application/json', ...headers }
    });
  }
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
