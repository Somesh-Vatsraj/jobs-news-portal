import { sha256Hex, randomToken } from './utils.js';
import { verifyPassword } from './security.js';

const COOKIE_NAME = 'sess';
const SESSION_DAYS = 7;

export async function createSession(env, adminId) {
  const token = randomToken(32);
  const csrf = randomToken(24);
  const tokenHash = await sha256Hex(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO sessions (admin_id, token_hash, csrf_token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(adminId, tokenHash, csrf, expires).run();
  // Cleanup old sessions
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  return { token, csrf, expires };
}

// isHttps: Secure flag सिर्फ HTTPS पर लगाओ
// (localhost HTTP dev में Secure cookie browser reject कर देता है)
export function buildSessionCookie(token, expires, isHttps = true) {
  const exp = new Date(expires).toUTCString();
  const secure = isHttps ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Expires=${exp}`;
}

export function buildLogoutCookie(isHttps = true) {
  const secure = isHttps ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`;
}

export function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const parts = cookie.split(/;\s*/);
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx > -1 && p.slice(0, idx) === name) return decodeURIComponent(p.slice(idx + 1));
  }
  return null;
}

export async function getSession(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT s.*, a.email AS admin_email, a.name AS admin_name
     FROM sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first();
  return row || null;
}

export async function destroySession(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}

export async function authenticateAdmin(env, email, password) {
  const admin = await env.DB.prepare('SELECT * FROM admins WHERE email = ?').bind(email).first();
  if (!admin) return null;
  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) return null;
  return admin;
}

export async function requireAdmin(request, env) {
  const session = await getSession(request, env);
  if (!session) return null;
  return session;
}

// Helper: check if request came over HTTPS
export function isHttpsRequest(request) {
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return true;
  }
}
