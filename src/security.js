import { sanitizeHtml, isValidHttpsUrl, isValidHttpUrl } from './utils.js';

// Password hashing (PBKDF2-SHA256, 100k iterations)
const PBKDF2_ITER = 100000;

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}
function b64ToBuf(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return `pbkdf2$${PBKDF2_ITER}$${bufToB64(salt)}$${bufToB64(bits)}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, iterStr, saltB64, hashB64] = String(stored).split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = parseInt(iterStr, 10);
    const salt = b64ToBuf(saltB64);
    const expected = b64ToBuf(hashB64);
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial, expected.length * 8
    );
    const derived = new Uint8Array(bits);
    if (derived.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
    return diff === 0;
  } catch { return false; }
}

// Sanitize an object of body fields (strings only)
export function sanitizeFields(obj, htmlFields = []) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[k] = htmlFields.includes(k) ? sanitizeHtml(v) : v.trim();
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Validate external apply URL — must be http/https
export function validateExternalUrl(url) {
  if (!url) return '';
  if (!isValidHttpUrl(url)) return '';
  return url;
}

// CSRF protection — compare header token to session token
export function checkCsrf(request, session) {
  const header = request.headers.get('x-csrf-token') || '';
  if (!session || !session.csrf_token) return false;
  // constant-time compare
  if (header.length !== session.csrf_token.length) return false;
  let diff = 0;
  for (let i = 0; i < header.length; i++) diff |= header.charCodeAt(i) ^ session.csrf_token.charCodeAt(i);
  return diff === 0;
}

// Simple in-memory rate limiter (per isolate). For multi-instance robust limiting use KV/DO.
const buckets = new Map();
export function rateLimit(key, max = 20, windowMs = 60000) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.reset) { b = { count: 0, reset: now + windowMs }; buckets.set(key, b); }
  b.count++;
  return b.count <= max;
}
