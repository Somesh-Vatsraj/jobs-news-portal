import { json, slugify, esc, isValidHttpUrl, parseBool, sanitizeHtml } from '../utils.js';
import { checkCsrf, validateExternalUrl } from '../security.js';
import {
  getSettings, setSetting, listJobs, listNews, getJobById, getJobBySlug, createJob, updateJob, deleteJob,
  getNewsById, createNews, updateNews, deleteNews, listSubmissions, getSubmission,
  updateSubmissionStatus, deleteSubmission, listCategories, createCategory, deleteCategory,
  getDashboardStats
} from '../db.js';
import {
  adminDashboardPage, adminJobsListPage, adminJobEditPage,
  adminNewsListPage, adminNewsEditPage, adminSubmissionsPage,
  adminCategoriesPage, adminSettingsPage
} from '../views/admin.js';
import { adminLoginPage } from '../views/admin-login.js';
import { html, redirect } from '../utils.js';

function requireSession(session, request) {
  // GET pages: just require session. POST/PUT/DELETE: also require CSRF.
  if (!session) return json({ error: 'Unauthorized' }, 401);
  const method = request.method.toUpperCase();
  if (method !== 'GET' && !checkCsrf(request, session)) {
    return json({ error: 'Invalid CSRF token' }, 403);
  }
  return null;
}

// --- HTML pages ---

export async function adminLoginPageRoute(request, env) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  // setup mode if no admin exists
  const count = await env.DB.prepare('SELECT COUNT(*) AS c FROM admins').first();
  if (!count || count.c === 0) {
    return html(adminLoginPage({ settings, baseUrl: url.origin, setupMode: true }));
  }
  return html(adminLoginPage({ settings, baseUrl: url.origin }));
}

export async function adminSetupPost(request, env) {
  const count = await env.DB.prepare('SELECT COUNT(*) AS c FROM admins').first();
  if (count && count.c > 0) return json({ error: 'Setup already complete' }, 403);
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const name = String(form.get('name') || '').trim();
  if (!email || password.length < 8) return json({ error: 'Invalid email or password (min 8 chars)' }, 400);
  const { hashPassword } = await import('../security.js');
  const hash = await hashPassword(password);
  await env.DB.prepare('INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)').bind(email, hash, name).run();
  return redirect('/admin/login');
}

export async function adminDashboardRoute(request, env, session) {
  const settings = await getSettings(env);
  const stats = await getDashboardStats(env);
  return html(adminDashboardPage({ settings, session, stats }));
}

export async function adminJobsListRoute(request, env, session) {
  const settings = await getSettings(env);
  const jobs = await listJobs(env, { status: null, limit: 500, orderBy: 'created_at DESC' });
  return html(adminJobsListPage({ settings, session, jobs }));
}

export async function adminJobEditRoute(request, env, session, id) {
  const settings = await getSettings(env);
  const job = id === 'new' ? null : await getJobById(env, parseInt(id, 10));
  return html(adminJobEditPage({ settings, session, job }));
}

export async function adminNewsListRoute(request, env, session) {
  const settings = await getSettings(env);
  const articles = await listNews(env, { status: null, limit: 500, orderBy: 'created_at DESC' });
  return html(adminNewsListPage({ settings, session, articles }));
}

export async function adminNewsEditRoute(request, env, session, id) {
  const settings = await getSettings(env);
  const article = id === 'new' ? null : await getNewsById(env, parseInt(id, 10));
  return html(adminNewsEditPage({ settings, session, article }));
}

export async function adminSubmissionsRoute(request, env, session) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  const status = ['pending','approved','rejected'].includes(url.searchParams.get('status'))
    ? url.searchParams.get('status') : 'pending';
  const submissions = await listSubmissions(env, status);
  return html(adminSubmissionsPage({ settings, session, submissions, status }));
}

export async function adminCategoriesRoute(request, env, session) {
  const settings = await getSettings(env);
  const cats = (await listCategories(env, 'job')).concat(await listCategories(env, 'news'));
  return html(adminCategoriesPage({ settings, session, categories: cats }));
}

export async function adminSettingsRoute(request, env, session) {
  const settings = await getSettings(env);
  return html(adminSettingsPage({ settings, session }));
}

// --- JSON APIs ---

function normalizeJobData(body) {
  const title = String(body.title || '').trim().slice(0, 200);
  let slug = String(body.slug || '').trim();
  if (!slug) slug = slugify(title);
  slug = slugify(slug);
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? (body.published_at || new Date().toISOString()) : null;
  return {
    title,
    slug,
    company: String(body.company || '').trim().slice(0, 200),
    location: String(body.location || '').trim().slice(0, 120),
    salary: String(body.salary || '').trim().slice(0, 120),
    experience: String(body.experience || '').trim().slice(0, 120),
    job_type: String(body.job_type || '').trim().slice(0, 60),
    category: String(body.category || '').trim().slice(0, 100),
    work_from_home: parseBool(body.work_from_home) ? 1 : 0,
    thumbnail: String(body.thumbnail || '').trim().slice(0, 500),
    thumbnail_alt: String(body.thumbnail_alt || '').trim().slice(0, 200),
    content: sanitizeHtml(String(body.content || '').slice(0, 200000)),
    responsibilities: sanitizeHtml(String(body.responsibilities || '').slice(0, 200000)),
    requirements: sanitizeHtml(String(body.requirements || '').slice(0, 200000)),
    qualifications: sanitizeHtml(String(body.qualifications || '').slice(0, 200000)),
    benefits: sanitizeHtml(String(body.benefits || '').slice(0, 200000)),
    apply_url: validateExternalUrl(String(body.apply_url || '').trim()).slice(0, 500),
    seo_title: String(body.seo_title || '').trim().slice(0, 200),
    seo_description: String(body.seo_description || '').trim().slice(0, 300),
    tags: String(body.tags || '').trim().slice(0, 300),
    status,
    featured: parseBool(body.featured) ? 1 : 0,
    trending: parseBool(body.trending) ? 1 : 0,
    published_at: publishedAt
  };
}

function normalizeNewsData(body) {
  const title = String(body.title || '').trim().slice(0, 240);
  let slug = String(body.slug || '').trim();
  if (!slug) slug = slugify(title);
  slug = slugify(slug);
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? (body.published_at || new Date().toISOString()) : null;
  return {
    title,
    slug,
    subtitle: String(body.subtitle || '').trim().slice(0, 300),
    excerpt: String(body.excerpt || '').trim().slice(0, 600),
    content: sanitizeHtml(String(body.content || '').slice(0, 300000)),
    category: String(body.category || '').trim().slice(0, 100),
    featured_image: String(body.featured_image || '').trim().slice(0, 500),
    featured_image_alt: String(body.featured_image_alt || '').trim().slice(0, 200),
    author: String(body.author || '').trim().slice(0, 120),
    tags: String(body.tags || '').trim().slice(0, 300),
    seo_title: String(body.seo_title || '').trim().slice(0, 240),
    seo_description: String(body.seo_description || '').trim().slice(0, 320),
    canonical_url: String(body.canonical_url || '').trim().slice(0, 500),
    status,
    featured: parseBool(body.featured) ? 1 : 0,
    trending: parseBool(body.trending) ? 1 : 0,
    published_at: publishedAt
  };
}

export async function adminJobsPost(request, env, session) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const data = normalizeJobData(body);
  if (!data.title || !data.company) return json({ error: 'Title and company are required' }, 400);
  // Prevent slug collision
  const existing = await getJobBySlug(env, data.slug);
  if (existing && String(existing.id) !== String(body.id || '')) {
    data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
  }
  const id = await createJob(env, data);
  return json({ ok: true, id });
}

export async function adminJobsPut(request, env, session, id) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const data = normalizeJobData(body);
  if (!data.title || !data.company) return json({ error: 'Title and company are required' }, 400);
  const existing = await getJobBySlug(env, data.slug);
  if (existing && String(existing.id) !== String(id)) {
    data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
  }
  await updateJob(env, parseInt(id, 10), data);
  return json({ ok: true });
}

export async function adminJobsDelete(request, env, session, id) {
  const auth = requireSession(session, request); if (auth) return auth;
  await deleteJob(env, parseInt(id, 10));
  return json({ ok: true });
}

export async function adminNewsPost(request, env, session) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const data = normalizeNewsData(body);
  if (!data.title) return json({ error: 'Title is required' }, 400);
  const dup = await env.DB.prepare('SELECT id FROM news WHERE slug = ?').bind(data.slug).first();
  if (dup) data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
  const id = await createNews(env, data);
  return json({ ok: true, id });
}

export async function adminNewsPut(request, env, session, id) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const data = normalizeNewsData(body);
  if (!data.title) return json({ error: 'Title is required' }, 400);
  const dup = await env.DB.prepare('SELECT id FROM news WHERE slug = ?').bind(data.slug).first();
  if (dup && String(dup.id) !== String(id)) {
    data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
  }
  await updateNews(env, parseInt(id, 10), data);
  return json({ ok: true });
}

export async function adminNewsDelete(request, env, session, id) {
  const auth = requireSession(session, request); if (auth) return auth;
  await deleteNews(env, parseInt(id, 10));
  return json({ ok: true });
}

export async function adminSubmissionAction(request, env, session, id, action) {
  const auth = requireSession(session, request); if (auth) return auth;
  if (action === 'approve') {
    const sub = await getSubmission(env, parseInt(id, 10));
    if (!sub) return json({ error: 'Not found' }, 404);
    if (sub.type === 'job') {
      const data = normalizeJobData({
        title: sub.title,
        company: sub.company,
        location: sub.location,
        category: sub.category,
        apply_url: sub.apply_url,
        content: sub.content || sub.description,
        thumbnail: sub.thumbnail,
        status: 'draft'
      });
      if (data.title) {
        const dup = await env.DB.prepare('SELECT id FROM jobs WHERE slug = ?').bind(data.slug).first();
        if (dup) data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
        await createJob(env, data);
      }
    } else {
      const data = normalizeNewsData({
        title: sub.title,
        category: sub.category,
        content: sub.content || sub.description,
        excerpt: (sub.description || '').slice(0, 300),
        featured_image: sub.thumbnail,
        author: sub.contact_email,
        status: 'draft'
      });
      if (data.title) {
        const dup = await env.DB.prepare('SELECT id FROM news WHERE slug = ?').bind(data.slug).first();
        if (dup) data.slug = data.slug + '-' + Date.now().toString(36).slice(-4);
        await createNews(env, data);
      }
    }
    await updateSubmissionStatus(env, parseInt(id, 10), 'approved');
    return json({ ok: true });
  }
  if (action === 'reject') {
    await updateSubmissionStatus(env, parseInt(id, 10), 'rejected');
    return json({ ok: true });
  }
  if (action === 'delete') {
    await deleteSubmission(env, parseInt(id, 10));
    return json({ ok: true });
  }
  return json({ error: 'Unknown action' }, 400);
}

export async function adminCategoryPost(request, env, session) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 80);
  const type = body.type === 'news' ? 'news' : 'job';
  if (!name) return json({ error: 'Name required' }, 400);
  let slug = slugify(name);
  const dup = await env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(slug).first();
  if (dup) slug = slug + '-' + Date.now().toString(36).slice(-4);
  await createCategory(env, name, slug, type);
  return json({ ok: true });
}

export async function adminCategoryDelete(request, env, session, id) {
  const auth = requireSession(session, request); if (auth) return auth;
  await deleteCategory(env, parseInt(id, 10));
  return json({ ok: true });
}

export async function adminSettingsPost(request, env, session) {
  const auth = requireSession(session, request); if (auth) return auth;
  const body = await request.json().catch(() => ({}));
  const allowed = [
    'site_name','site_description','logo_url','favicon_url','contact_email',
    'social_twitter','social_facebook','social_linkedin',
    'default_seo_title','default_seo_description','google_analytics_id',
    'adsense_publisher_id','footer_text'
  ];
  for (const k of allowed) {
    if (k in body) await setSetting(env, k, String(body[k] ?? '').slice(0, 500));
  }
  if ('adsense_enabled' in body) {
    await setSetting(env, 'adsense_enabled', parseBool(body.adsense_enabled) ? 'true' : 'false');
  }
  return json({ ok: true });
}
