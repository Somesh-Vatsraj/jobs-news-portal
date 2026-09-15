import { json, html, parseIntSafe, paginate, esc } from '../utils.js';
import { getSettings, listJobs, countJobs, getJobBySlug, listCategories } from '../db.js';
import { jobsListPage } from '../views/jobs.js';
import { jobDetailPage, applyRedirectPage } from '../views/job-detail.js';
import { notFoundPage } from './public.js';

export async function jobsListRoute(request, env) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const params = url.searchParams;

  const page = parseIntSafe(params.get('page'), 1);
  const perPage = 12;
  const category = params.get('category') || null;
  const location = params.get('location') || null;
  const jobType = params.get('job_type') || null;
  const experience = params.get('experience') || null;
  const wfhParam = params.get('wfh');
  const wfh = wfhParam === '1' ? 1 : null;
  const featuredParam = params.get('featured');
  const featured = featuredParam === '1' ? 1 : null;

  const filters = { category, location, jobType, experience, wfh };
  const total = await countJobs(env, { status: 'published', category, location, jobType, experience, wfh });
  const pg = paginate(page, perPage, total);
  const jobs = await listJobs(env, {
    status: 'published', category, location, jobType, experience, wfh, featured,
    limit: perPage, offset: pg.offset
  });
  const categories = await listCategories(env, 'job');

  const qp = new URLSearchParams();
  for (const [k, v] of params.entries()) if (k !== 'page') qp.set(k, v);
  const queryString = qp.toString();

  const body = jobsListPage({ settings, jobs, filters, categories, pagination: pg, baseUrl, queryString });
  return html(body, 200, { 'cache-control': 'public, max-age=120, s-maxage=300' });
}

export async function jobDetailRoute(request, env, slug) {
  const settings = await getSettings(env);
  const baseUrl = new URL(request.url).origin;
  const job = await getJobBySlug(env, slug);
  if (!job || job.status !== 'published') return notFoundPage(env);

  const { results: related } = await env.DB.prepare(
    `SELECT * FROM jobs WHERE status='published' AND id != ? AND (category = ? OR work_from_home = ?)
     ORDER BY published_at DESC LIMIT 3`
  ).bind(job.id, job.category || '', job.work_from_home ? 1 : 0).all();

  // Fetch ALL categories (job + news) for sidebar
  const jobCats = await listCategories(env, 'job');
  const newsCats = await listCategories(env, 'news');
  const categories = [...jobCats, ...newsCats];

  const body = jobDetailPage({ settings, job, related: related || [], categories, baseUrl });
  return html(body, 200, { 'cache-control': 'public, max-age=300, s-maxage=1800' });
}

export async function applyRedirectRoute(request, env, slug) {
  const settings = await getSettings(env);
  const job = await getJobBySlug(env, slug);
  if (!job || !job.apply_url) return notFoundPage(env);
  let host = '';
  try { host = new URL(job.apply_url).hostname; } catch {}
  const body = applyRedirectPage({ settings, job, applyUrl: job.apply_url, applyHost: host });
  return html(body, 200, { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });
}

export async function jobsApiList(request, env) {
  const url = new URL(request.url);
  const page = parseIntSafe(url.searchParams.get('page'), 1);
  const perPage = 12;
  const filters = {
    category: url.searchParams.get('category') || null,
    location: url.searchParams.get('location') || null,
    jobType: url.searchParams.get('job_type') || null,
    experience: url.searchParams.get('experience') || null,
    wfh: url.searchParams.get('wfh') === '1' ? 1 : null,
    q: url.searchParams.get('q') || null
  };
  const total = await countJobs(env, { status: 'published', ...filters });
  const pg = paginate(page, perPage, total);
  const jobs = await listJobs(env, { status: 'published', ...filters, limit: perPage, offset: pg.offset });
  return json({ jobs, page: pg.page, totalPages: pg.totalPages, total });
}

export async function jobsApiGet(request, env, slug) {
  const job = await getJobBySlug(env, slug);
  if (!job || job.status !== 'published') return json({ error: 'Not found' }, 404);
  return json({ job });
}
