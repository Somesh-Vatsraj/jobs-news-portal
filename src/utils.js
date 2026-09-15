// Small utility helpers used everywhere

export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
  return formatDate(dateStr);
}

export function readingTime(content) {
  if (!content) return '1 min read';
  const text = String(content).replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return mins + ' min read';
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra }
  });
}

export function html(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...extra }
  });
}

export function redirect(location, status = 302) {
  return new Response(null, { status, headers: { location } });
}

export function parseIntSafe(v, fallback = 1, max = 10000) {
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// Parse booleans from strings, numbers, booleans.
// Treats "1", "true", "on", "yes", true, 1 as true; everything else false.
export function parseBool(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'on' || s === 'yes';
}

export function isValidHttpUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
}

export function isValidHttpsUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === 'https:';
  } catch { return false; }
}

// Very small HTML sanitizer that strips dangerous tags/attributes.
// Not a substitute for a full library, but blocks common XSS vectors.
export function sanitizeHtml(input) {
  if (!input) return '';
  let s = String(input);
  // Remove dangerous block tags entirely (open+close with content)
  s = s.replace(/<\s*(script|style|iframe|object|embed|form|link|meta|base|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  // Remove self-closing / unclosed dangerous tags
  s = s.replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|link|meta|base|svg|math)\b[^>]*>/gi, '');
  // Remove event handler attributes
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');
  // Remove javascript: and vbscript: URLs
  s = s.replace(/(href|src|xlink:href)\s*=\s*"(?:\s*javascript:|\s*vbscript:)[^"]*"/gi, '$1="#"');
  s = s.replace(/(href|src|xlink:href)\s*=\s*'(?:\s*javascript:|\s*vbscript:)[^']*'/gi, "$1='#'");
  // Remove style attribute (safer default)
  s = s.replace(/\sstyle\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\sstyle\s*=\s*'[^']*'/gi, '');
  return s;
}

export async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function paginate(page, perPage, total) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  page = Math.min(Math.max(1, page), totalPages);
  return { page, totalPages, total, perPage, offset: (page - 1) * perPage };
}
