import { matchRoute } from './router.js';
import { html } from './utils.js';
import { getSession } from './auth.js';
import { getSettings } from './db.js';

import {
  homeRoute, staticPageRoute, categoriesRoute, sitemapRoute, robotsRoute,
  notFoundPage, errorPage
} from './routes/public.js';
import { jobsListRoute, jobDetailRoute, applyRedirectRoute, jobsApiList, jobsApiGet } from './routes/jobs.js';
import { newsListRoute, newsDetailRoute, newsApiList, newsApiGet } from './routes/news.js';
import { searchRoute } from './routes/search.js';
import { authLoginPost, authLogoutPost, authMeGet } from './routes/auth.js';
import {
  adminLoginPageRoute, adminSetupPost, adminDashboardRoute,
  adminJobsListRoute, adminJobEditRoute, adminNewsListRoute, adminNewsEditRoute,
  adminSubmissionsRoute, adminCategoriesRoute, adminSettingsRoute,
  adminJobsPost, adminJobsPut, adminJobsDelete, adminNewsPost, adminNewsPut, adminNewsDelete,
  adminSubmissionAction, adminCategoryPost, adminCategoryDelete, adminSettingsPost
} from './routes/admin.js';
import { submitPageRoute, submissionCreateApi } from './routes/submissions.js';
import { debugStatus } from './routes/debug.js';

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};

function withSecurity(res) {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!h.has(k)) h.set(k, v);
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return withSecurity(await handle(request, env, ctx));
    } catch (err) {
      console.error('Worker error', err && err.stack || err);
      try {
        return withSecurity(await errorPage(env, 500));
      } catch {
        return new Response('Internal server error', { status: 500 });
      }
    }
  }
};

async function handle(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Static assets
  if (path.startsWith('/css/') || path.startsWith('/js/') || path.startsWith('/images/')) {
    if (env.ASSETS) return env.ASSETS.fetch(request);
  }

  // Debug (safe, read-only)
  if (method === 'GET' && path === '/api/debug/status') return debugStatus(request, env);

  // PUBLIC PAGES
  if (method === 'GET' && path === '/') return homeRoute(request, env, ctx);
  if (method === 'GET' && path === '/sitemap.xml') return sitemapRoute(request, env);
  if (method === 'GET' && path === '/robots.txt') return robotsRoute(request, env);
  if (method === 'GET' && path === '/categories') return categoriesRoute(request, env);

  const staticPages = ['about', 'contact', 'privacy-policy', 'terms', 'disclaimer', 'cookie-policy'];
  if (method === 'GET' && staticPages.includes(path.slice(1))) {
    return staticPageRoute(request, env, ctx, path.slice(1));
  }

  if (method === 'GET' && path === '/jobs') return jobsListRoute(request, env);
  { const m = matchRoute('/jobs/:slug', path); if (m && method === 'GET') return jobDetailRoute(request, env, m.slug); }
  { const m = matchRoute('/apply/:slug', path); if (m && method === 'GET') return applyRedirectRoute(request, env, m.slug); }

  if (method === 'GET' && path === '/news') return newsListRoute(request, env);
  { const m = matchRoute('/news/:slug', path); if (m && method === 'GET') return newsDetailRoute(request, env, m.slug); }

  if (method === 'GET' && path === '/search') return searchRoute(request, env);
  if (method === 'GET' && path === '/submit') return submitPageRoute(request, env);

  // PUBLIC API
  if (method === 'GET' && path === '/api/jobs') return jobsApiList(request, env);
  { const m = matchRoute('/api/jobs/:slug', path); if (m && method === 'GET') return jobsApiGet(request, env, m.slug); }
  if (method === 'GET' && path === '/api/news') return newsApiList(request, env);
  { const m = matchRoute('/api/news/:slug', path); if (m && method === 'GET') return newsApiGet(request, env, m.slug); }
  if (method === 'POST' && path === '/api/submissions') return submissionCreateApi(request, env);

  // AUTH
  if (path === '/api/auth/login' && method === 'POST') {
    const settings = await getSettings(env);
    return authLoginPost(request, env, settings);
  }
  if (path === '/api/auth/logout' && method === 'POST') return authLogoutPost(request, env);
  if (path === '/api/auth/me' && method === 'GET') return authMeGet(request, env);

  // ADMIN LOGIN / SETUP
  if (path === '/admin/login' && method === 'GET') return adminLoginPageRoute(request, env);
  if (path === '/admin/setup' && method === 'POST') return adminSetupPost(request, env);

  // ADMIN ROOT
  if (path === '/admin' && method === 'GET') {
    const c = await env.DB.prepare('SELECT COUNT(*) AS c FROM admins').first();
    if (!c || c.c === 0) return adminLoginPageRoute(request, env);
    const session = await getSession(request, env);
    if (!session) return Response.redirect(url.origin + '/admin/login', 302);
    return adminDashboardRoute(request, env, session);
  }

  // ADMIN PAGES
  if (path.startsWith('/admin/')) {
    if (path === '/admin/login') return adminLoginPageRoute(request, env);
    const session = await getSession(request, env);
    if (!session) return Response.redirect(url.origin + '/admin/login', 302);

    if (path === '/admin/jobs' && method === 'GET') return adminJobsListRoute(request, env, session);
    { const m = matchRoute('/admin/jobs/:id', path); if (m && method === 'GET') return adminJobEditRoute(request, env, session, m.id); }
    if (path === '/admin/news' && method === 'GET') return adminNewsListRoute(request, env, session);
    { const m = matchRoute('/admin/news/:id', path); if (m && method === 'GET') return adminNewsEditRoute(request, env, session, m.id); }
    if (path === '/admin/submissions' && method === 'GET') return adminSubmissionsRoute(request, env, session);
    if (path === '/admin/categories' && method === 'GET') return adminCategoriesRoute(request, env, session);
    if (path === '/admin/settings' && method === 'GET') return adminSettingsRoute(request, env, session);
  }

  // ADMIN APIs
  if (path.startsWith('/api/admin/')) {
    const session = await getSession(request, env);
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'content-type': 'application/json' }
    });

    if (path === '/api/admin/jobs' && method === 'POST') return adminJobsPost(request, env, session);
    { const m = matchRoute('/api/admin/jobs/:id', path);
      if (m && method === 'PUT') return adminJobsPut(request, env, session, m.id);
      if (m && method === 'DELETE') return adminJobsDelete(request, env, session, m.id); }
    if (path === '/api/admin/news' && method === 'POST') return adminNewsPost(request, env, session);
    { const m = matchRoute('/api/admin/news/:id', path);
      if (m && method === 'PUT') return adminNewsPut(request, env, session, m.id);
      if (m && method === 'DELETE') return adminNewsDelete(request, env, session, m.id); }
    { const m = matchRoute('/api/admin/submissions/:id/:action', path);
      if (m && method === 'POST') return adminSubmissionAction(request, env, session, m.id, m.action); }
    if (path === '/api/admin/categories' && method === 'POST') return adminCategoryPost(request, env, session);
    { const m = matchRoute('/api/admin/categories/:id', path);
      if (m && method === 'DELETE') return adminCategoryDelete(request, env, session, m.id); }
    if (path === '/api/admin/settings' && method === 'POST') return adminSettingsPost(request, env, session);
  }

  if (path.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'content-type': 'application/json' }
    });
  }
  return notFoundPage(env);
}
