import { json, html, esc } from '../utils.js';
import { getSettings, listCategories, listJobs, listNews, countJobs, countNews } from '../db.js';
import { homePage } from '../views/home.js';
import {
  aboutPage, contactPage, privacyPage, termsPage,
  disclaimerPage, cookiePage, categoriesPage
} from '../views/static-pages.js';
import { layout } from '../views/layout.js';

export async function homeRoute(request, env, ctx) {
  const settings = await getSettings(env);
  const baseUrl = new URL(request.url).origin;
  const [latestJobs, wfhJobs, featuredJobs, latestNews, trendingNews, categories] = await Promise.all([
    listJobs(env, { status: 'published', limit: 6 }),
    listJobs(env, { status: 'published', wfh: 1, limit: 6 }),
    listJobs(env, { status: 'published', featured: 1, limit: 3 }),
    listNews(env, { status: 'published', limit: 6 }),
    listNews(env, { status: 'published', trending: 1, limit: 3 }),
    listCategories(env, 'job')
  ]);
  const allCats = (await listCategories(env, 'job')).concat(await listCategories(env, 'news'));
  const body = homePage({
    settings,
    latestJobs, wfhJobs, featuredJobs, latestNews, trendingNews,
    categories: allCats,
    baseUrl
  });
  return html(body, 200, { 'cache-control': 'public, max-age=120, s-maxage=600' });
}

export async function staticPageRoute(request, env, ctx, which) {
  const settings = await getSettings(env);
  const baseUrl = new URL(request.url).origin;
  let body;
  switch (which) {
    case 'about': body = aboutPage({ settings, baseUrl }); break;
    case 'contact': body = contactPage({ settings, baseUrl }); break;
    case 'privacy-policy': body = privacyPage({ settings, baseUrl }); break;
    case 'terms': body = termsPage({ settings, baseUrl }); break;
    case 'disclaimer': body = disclaimerPage({ settings, baseUrl }); break;
    case 'cookie-policy': body = cookiePage({ settings, baseUrl }); break;
    default: return null;
  }
  return html(body, 200, { 'cache-control': 'public, max-age=600, s-maxage=3600' });
}

export async function categoriesRoute(request, env) {
  const settings = await getSettings(env);
  const baseUrl = new URL(request.url).origin;
  const cats = (await listCategories(env, 'job')).concat(await listCategories(env, 'news'));
  const body = categoriesPage({ settings, baseUrl, categories: cats });
  return html(body, 200, { 'cache-control': 'public, max-age=300' });
}

export async function sitemapRoute(request, env) {
  const baseUrl = new URL(request.url).origin;
  const { results: jobs } = await env.DB.prepare(
    "SELECT slug, updated_at FROM jobs WHERE status='published' ORDER BY published_at DESC LIMIT 5000"
  ).all();
  const { results: news } = await env.DB.prepare(
    "SELECT slug, updated_at FROM news WHERE status='published' ORDER BY published_at DESC LIMIT 5000"
  ).all();

  const urls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/jobs', changefreq: 'hourly', priority: '0.9' },
    { loc: '/news', changefreq: 'hourly', priority: '0.9' },
    { loc: '/categories', changefreq: 'weekly', priority: '0.6' },
    { loc: '/about', changefreq: 'monthly', priority: '0.4' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.4' },
    { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
    { loc: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
    { loc: '/cookie-policy', changefreq: 'yearly', priority: '0.3' }
  ];
  for (const j of jobs || []) urls.push({ loc: '/jobs/' + j.slug, changefreq: 'weekly', priority: '0.8', lastmod: j.updated_at });
  for (const n of news || []) urls.push({ loc: '/news/' + n.slug, changefreq: 'weekly', priority: '0.8', lastmod: n.updated_at });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${esc(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${esc(u.lastmod.slice(0, 10))}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
}

export async function robotsRoute(request, env) {
  const baseUrl = new URL(request.url).origin;
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/private
Disallow: /apply/
Disallow: /search

Sitemap: ${baseUrl}/sitemap.xml
`;
  return new Response(txt, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

export async function notFoundPage(env) {
  const settings = await getSettings(env);
  const body = layout({
    settings,
    title: 'Page not found',
    description: '',
    canonical: '',
    noindex: true,
    body: `<div class="container error-page"><h1>404</h1><p>We couldn't find that page.</p><p><a class="btn btn-primary" href="/">Go Home</a></p></div>`
  });
  return html(body, 404);
}

export async function errorPage(env, status = 500) {
  const settings = await getSettings(env);
  const body = layout({
    settings,
    title: 'Something went wrong',
    description: '',
    noindex: true,
    body: `<div class="container error-page"><h1>${status}</h1><p>Something went wrong. Please try again.</p><p><a class="btn btn-primary" href="/">Go Home</a></p></div>`
  });
  return html(body, status);
}
