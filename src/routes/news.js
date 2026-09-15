import { json, html, parseIntSafe, paginate } from '../utils.js';
import { getSettings, listNews, countNews, getNewsBySlug, listCategories, listJobs } from '../db.js';
import { newsListPage } from '../views/news.js';
import { newsDetailPage } from '../views/news-detail.js';
import { notFoundPage } from './public.js';

export async function newsListRoute(request, env) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const params = url.searchParams;
  const page = parseIntSafe(params.get('page'), 1);
  const perPage = 12;
  const category = params.get('category') || null;
  const trending = params.get('trending') === '1' ? 1 : null;

  const total = await countNews(env, { status: 'published', category });
  const pg = paginate(page, perPage, total);
  const articles = await listNews(env, { status: 'published', category, trending, limit: perPage, offset: pg.offset });
  const categories = await listCategories(env, 'news');

  const qp = new URLSearchParams();
  for (const [k, v] of params.entries()) if (k !== 'page') qp.set(k, v);
  const queryString = qp.toString();

  const body = newsListPage({ settings, articles, category, categories, pagination: pg, baseUrl, queryString });
  return html(body, 200, { 'cache-control': 'public, max-age=180, s-maxage=600' });
}

export async function newsDetailRoute(request, env, slug) {
  const settings = await getSettings(env);
  const baseUrl = new URL(request.url).origin;
  const article = await getNewsBySlug(env, slug);
  if (!article || article.status !== 'published') return notFoundPage(env);

  const { results: relatedNews } = await env.DB.prepare(
    `SELECT * FROM news WHERE status='published' AND id != ? AND category = ? ORDER BY published_at DESC LIMIT 3`
  ).bind(article.id, article.category || '').all();

  const relatedJobs = await listJobs(env, { status: 'published', limit: 3 });

  // Fetch ALL categories for sidebar
  const jobCats = await listCategories(env, 'job');
  const newsCats = await listCategories(env, 'news');
  const categories = [...jobCats, ...newsCats];

  const body = newsDetailPage({ settings, article, relatedNews: relatedNews || [], relatedJobs, categories, baseUrl });
  return html(body, 200, { 'cache-control': 'public, max-age=300, s-maxage=1800' });
}

export async function newsApiList(request, env) {
  const url = new URL(request.url);
  const page = parseIntSafe(url.searchParams.get('page'), 1);
  const perPage = 12;
  const category = url.searchParams.get('category') || null;
  const q = url.searchParams.get('q') || null;
  const total = await countNews(env, { status: 'published', category, q });
  const pg = paginate(page, perPage, total);
  const articles = await listNews(env, { status: 'published', category, q, limit: perPage, offset: pg.offset });
  return json({ articles, page: pg.page, totalPages: pg.totalPages, total });
}

export async function newsApiGet(request, env, slug) {
  const article = await getNewsBySlug(env, slug);
  if (!article || article.status !== 'published') return json({ error: 'Not found' }, 404);
  return json({ article });
}
