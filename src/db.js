// D1 access helpers. All queries are parameterized.

export async function getSettings(env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all();
  const s = {};
  for (const r of results || []) s[r.key] = r.value;
  return s;
}

export async function getSetting(env, key, fallback = '') {
  const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key = ?').bind(key).first();
  return row ? row.value : fallback;
}

export async function setSetting(env, key, value) {
  await env.DB.prepare(
    `INSERT INTO site_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).bind(key, value).run();
}

export async function listCategories(env, type) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories WHERE type = ? ORDER BY name'
  ).bind(type).all();
  return results || [];
}

export async function getCategoryBySlug(env, slug) {
  return env.DB.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first();
}

export async function createCategory(env, name, slug, type) {
  await env.DB.prepare('INSERT INTO categories (name, slug, type) VALUES (?, ?, ?)').bind(name, slug, type).run();
}

export async function deleteCategory(env, id) {
  await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
}

// -------- JOBS --------

export async function listJobs(env, opts = {}) {
  const {
    status = 'published',
    category = null,
    location = null,
    jobType = null,
    experience = null,
    wfh = null,
    q = null,
    featured = null,
    trending = null,
    limit = 12,
    offset = 0,
    orderBy = 'published_at DESC'
  } = opts;

  const where = [];
  const binds = [];
  if (status) { where.push('status = ?'); binds.push(status); }
  if (category) { where.push('category = ?'); binds.push(category); }
  if (location) { where.push('location LIKE ?'); binds.push('%' + location + '%'); }
  if (jobType) { where.push('job_type = ?'); binds.push(jobType); }
  if (experience) { where.push('experience LIKE ?'); binds.push('%' + experience + '%'); }
  if (wfh !== null && wfh !== undefined && wfh !== '') { where.push('work_from_home = ?'); binds.push(wfh ? 1 : 0); }
  if (featured !== null) { where.push('featured = ?'); binds.push(featured ? 1 : 0); }
  if (trending !== null) { where.push('trending = ?'); binds.push(trending ? 1 : 0); }
  if (q) {
    where.push('(title LIKE ? OR company LIKE ? OR category LIKE ? OR location LIKE ? OR tags LIKE ? OR content LIKE ?)');
    const like = '%' + q + '%';
    binds.push(like, like, like, like, like, like);
  }

  const sql = `SELECT * FROM jobs ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
  return results || [];
}

export async function countJobs(env, opts = {}) {
  const {
    status = 'published', category = null, location = null, jobType = null,
    experience = null, wfh = null, q = null
  } = opts;
  const where = [];
  const binds = [];
  if (status) { where.push('status = ?'); binds.push(status); }
  if (category) { where.push('category = ?'); binds.push(category); }
  if (location) { where.push('location LIKE ?'); binds.push('%' + location + '%'); }
  if (jobType) { where.push('job_type = ?'); binds.push(jobType); }
  if (experience) { where.push('experience LIKE ?'); binds.push('%' + experience + '%'); }
  if (wfh !== null && wfh !== undefined && wfh !== '') { where.push('work_from_home = ?'); binds.push(wfh ? 1 : 0); }
  if (q) {
    where.push('(title LIKE ? OR company LIKE ? OR category LIKE ? OR location LIKE ? OR tags LIKE ? OR content LIKE ?)');
    const like = '%' + q + '%';
    binds.push(like, like, like, like, like, like);
  }
  const sql = `SELECT COUNT(*) AS c FROM jobs ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
  const row = await env.DB.prepare(sql).bind(...binds).first();
  return row ? row.c : 0;
}

export async function getJobBySlug(env, slug) {
  return env.DB.prepare('SELECT * FROM jobs WHERE slug = ?').bind(slug).first();
}
export async function getJobById(env, id) {
  return env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
}

export async function createJob(env, data) {
  const cols = [
    'title','slug','company','location','salary','experience','job_type','category',
    'work_from_home','thumbnail','thumbnail_alt','content','responsibilities',
    'requirements','qualifications','benefits','apply_url','seo_title','seo_description',
    'tags','status','featured','trending','published_at'
  ];
  const placeholders = cols.map(() => '?').join(',');
  const values = cols.map(c => data[c] ?? null);
  const res = await env.DB.prepare(
    `INSERT INTO jobs (${cols.join(',')}) VALUES (${placeholders})`
  ).bind(...values).run();
  return res.meta.last_row_id;
}

export async function updateJob(env, id, data) {
  const cols = [
    'title','slug','company','location','salary','experience','job_type','category',
    'work_from_home','thumbnail','thumbnail_alt','content','responsibilities',
    'requirements','qualifications','benefits','apply_url','seo_title','seo_description',
    'tags','status','featured','trending','published_at'
  ];
  const setSql = cols.map(c => `${c} = ?`).join(', ');
  const values = cols.map(c => data[c] ?? null);
  await env.DB.prepare(
    `UPDATE jobs SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(...values, id).run();
}

export async function deleteJob(env, id) {
  await env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
}

// -------- NEWS --------

export async function listNews(env, opts = {}) {
  const {
    status = 'published', category = null, q = null, featured = null, trending = null,
    limit = 12, offset = 0, orderBy = 'published_at DESC'
  } = opts;
  const where = [];
  const binds = [];
  if (status) { where.push('status = ?'); binds.push(status); }
  if (category) { where.push('category = ?'); binds.push(category); }
  if (featured !== null) { where.push('featured = ?'); binds.push(featured ? 1 : 0); }
  if (trending !== null) { where.push('trending = ?'); binds.push(trending ? 1 : 0); }
  if (q) {
    where.push('(title LIKE ? OR category LIKE ? OR content LIKE ? OR tags LIKE ? OR excerpt LIKE ?)');
    const like = '%' + q + '%';
    binds.push(like, like, like, like, like);
  }
  const sql = `SELECT * FROM news ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
  return results || [];
}

export async function countNews(env, opts = {}) {
  const { status = 'published', category = null, q = null } = opts;
  const where = [];
  const binds = [];
  if (status) { where.push('status = ?'); binds.push(status); }
  if (category) { where.push('category = ?'); binds.push(category); }
  if (q) {
    where.push('(title LIKE ? OR category LIKE ? OR content LIKE ? OR tags LIKE ? OR excerpt LIKE ?)');
    const like = '%' + q + '%';
    binds.push(like, like, like, like, like);
  }
  const sql = `SELECT COUNT(*) AS c FROM news ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
  const row = await env.DB.prepare(sql).bind(...binds).first();
  return row ? row.c : 0;
}

export async function getNewsBySlug(env, slug) {
  return env.DB.prepare('SELECT * FROM news WHERE slug = ?').bind(slug).first();
}
export async function getNewsById(env, id) {
  return env.DB.prepare('SELECT * FROM news WHERE id = ?').bind(id).first();
}

export async function createNews(env, data) {
  const cols = [
    'title','slug','subtitle','excerpt','content','category','featured_image','featured_image_alt',
    'author','tags','seo_title','seo_description','canonical_url','status','featured','trending','published_at'
  ];
  const placeholders = cols.map(() => '?').join(',');
  const values = cols.map(c => data[c] ?? null);
  const res = await env.DB.prepare(
    `INSERT INTO news (${cols.join(',')}) VALUES (${placeholders})`
  ).bind(...values).run();
  return res.meta.last_row_id;
}

export async function updateNews(env, id, data) {
  const cols = [
    'title','slug','subtitle','excerpt','content','category','featured_image','featured_image_alt',
    'author','tags','seo_title','seo_description','canonical_url','status','featured','trending','published_at'
  ];
  const setSql = cols.map(c => `${c} = ?`).join(', ');
  const values = cols.map(c => data[c] ?? null);
  await env.DB.prepare(
    `UPDATE news SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(...values, id).run();
}

export async function deleteNews(env, id) {
  await env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
}

// -------- SUBMISSIONS --------

export async function createSubmission(env, data) {
  const cols = ['type','title','company','description','content','apply_url','source_url','category','location','contact_email','thumbnail'];
  const placeholders = cols.map(() => '?').join(',');
  const values = cols.map(c => data[c] ?? null);
  const res = await env.DB.prepare(
    `INSERT INTO submissions (${cols.join(',')}) VALUES (${placeholders})`
  ).bind(...values).run();
  return res.meta.last_row_id;
}

export async function listSubmissions(env, status = 'pending') {
  const { results } = await env.DB.prepare(
    'SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC LIMIT 200'
  ).bind(status).all();
  return results || [];
}

export async function getSubmission(env, id) {
  return env.DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first();
}

export async function updateSubmissionStatus(env, id, status) {
  await env.DB.prepare('UPDATE submissions SET status = ? WHERE id = ?').bind(status, id).run();
}

export async function deleteSubmission(env, id) {
  await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
}

// -------- DASHBOARD STATS --------

export async function getDashboardStats(env) {
  const q = async (sql, ...binds) => {
    const row = await env.DB.prepare(sql).bind(...binds).first();
    return row ? Object.values(row)[0] : 0;
  };
  return {
    jobsTotal: await q('SELECT COUNT(*) FROM jobs'),
    jobsPublished: await q("SELECT COUNT(*) FROM jobs WHERE status='published'"),
    jobsDraft: await q("SELECT COUNT(*) FROM jobs WHERE status='draft'"),
    newsTotal: await q('SELECT COUNT(*) FROM news'),
    newsPublished: await q("SELECT COUNT(*) FROM news WHERE status='published'"),
    newsDraft: await q("SELECT COUNT(*) FROM news WHERE status='draft'"),
    pendingSubmissions: await q("SELECT COUNT(*) FROM submissions WHERE status='pending'"),
    recentJobs: (await env.DB.prepare('SELECT id,title,slug,status,created_at FROM jobs ORDER BY created_at DESC LIMIT 5').all()).results || [],
    recentNews: (await env.DB.prepare('SELECT id,title,slug,status,created_at FROM news ORDER BY created_at DESC LIMIT 5').all()).results || []
  };
}
