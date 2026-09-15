import { html, parseIntSafe, paginate } from '../utils.js';
import { getSettings, listJobs, countJobs, listNews, countNews } from '../db.js';
import { searchPage } from '../views/search.js';

export async function searchRoute(request, env) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const q = (url.searchParams.get('q') || '').trim().slice(0, 120);
  const tab = ['all', 'jobs', 'news'].includes(url.searchParams.get('tab')) ? url.searchParams.get('tab') : 'all';
  const page = parseIntSafe(url.searchParams.get('page'), 1);
  const perPage = 12;

  let jobs = [], articles = [];
  let jobsPag = { page: 1, totalPages: 1, total: 0 };
  let newsPag = { page: 1, totalPages: 1, total: 0 };

  if (q) {
    if (tab === 'all' || tab === 'jobs') {
      const total = await countJobs(env, { status: 'published', q });
      jobsPag = paginate(page, perPage, total);
      jobs = await listJobs(env, { status: 'published', q, limit: tab === 'all' ? 6 : perPage, offset: tab === 'all' ? 0 : jobsPag.offset });
    }
    if (tab === 'all' || tab === 'news') {
      const total = await countNews(env, { status: 'published', q });
      newsPag = paginate(page, perPage, total);
      articles = await listNews(env, { status: 'published', q, limit: tab === 'all' ? 6 : perPage, offset: tab === 'all' ? 0 : newsPag.offset });
    }
  }

  const body = searchPage({ settings, q, tab, jobs, articles, jobsPag, newsPag, baseUrl });
  return html(body, 200, { 'cache-control': 'public, max-age=60' });
}
