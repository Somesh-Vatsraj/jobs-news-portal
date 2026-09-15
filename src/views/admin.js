import { adminShell } from './admin-login.js';
import { esc, formatDate } from '../utils.js';

export function adminDashboardPage({ settings, session, stats }) {
  const body = `
<h1>Dashboard</h1>
<div class="stat-grid">
  <div class="stat-card"><span class="stat-label">Total Jobs</span><strong>${stats.jobsTotal}</strong></div>
  <div class="stat-card"><span class="stat-label">Published Jobs</span><strong>${stats.jobsPublished}</strong></div>
  <div class="stat-card"><span class="stat-label">Draft Jobs</span><strong>${stats.jobsDraft}</strong></div>
  <div class="stat-card"><span class="stat-label">Total News</span><strong>${stats.newsTotal}</strong></div>
  <div class="stat-card"><span class="stat-label">Published News</span><strong>${stats.newsPublished}</strong></div>
  <div class="stat-card"><span class="stat-label">Draft News</span><strong>${stats.newsDraft}</strong></div>
  <div class="stat-card highlight"><span class="stat-label">Pending Submissions</span><strong>${stats.pendingSubmissions}</strong></div>
</div>

<div class="admin-cols">
  <section class="panel">
    <h2>Recent Jobs</h2>
    <ul class="list">
      ${stats.recentJobs.map(j => `<li><a href="/admin/jobs/${j.id}">${esc(j.title)}</a> <span class="badge badge-${esc(j.status)}">${esc(j.status)}</span></li>`).join('') || '<li class="muted">None yet</li>'}
    </ul>
  </section>
  <section class="panel">
    <h2>Recent News</h2>
    <ul class="list">
      ${stats.recentNews.map(n => `<li><a href="/admin/news/${n.id}">${esc(n.title)}</a> <span class="badge badge-${esc(n.status)}">${esc(n.status)}</span></li>`).join('') || '<li class="muted">None yet</li>'}
    </ul>
  </section>
</div>
`;
  return adminShell({ settings, session, body, active: 'dashboard' });
}

function jobForm(job = {}) {
  const v = (k) => esc(job[k] ?? '');
  return `
<form class="admin-form" data-form="job" data-id="${job.id || ''}">
  <div class="row">
    <label>Title <input type="text" name="title" required value="${v('title')}" maxlength="200"></label>
    <label>Slug <input type="text" name="slug" value="${v('slug')}" maxlength="200" placeholder="auto from title"></label>
  </div>
  <div class="row">
    <label>Company <input type="text" name="company" required value="${v('company')}" maxlength="200"></label>
    <label>Category <input type="text" name="category" value="${v('category')}" maxlength="100"></label>
  </div>
  <div class="row">
    <label>Location <input type="text" name="location" value="${v('location')}" maxlength="120"></label>
    <label>Job Type <input type="text" name="job_type" value="${v('job_type')}" maxlength="60" placeholder="Full Time / Part Time..."></label>
  </div>
  <div class="row">
    <label>Salary <input type="text" name="salary" value="${v('salary')}" maxlength="120"></label>
    <label>Experience <input type="text" name="experience" value="${v('experience')}" maxlength="120"></label>
  </div>
  <div class="row">
    <label class="inline"><input type="checkbox" name="work_from_home" ${job.work_from_home ? 'checked' : ''}> Work From Home</label>
    <label class="inline"><input type="checkbox" name="featured" ${job.featured ? 'checked' : ''}> Featured</label>
    <label class="inline"><input type="checkbox" name="trending" ${job.trending ? 'checked' : ''}> Trending</label>
  </div>
  <div class="row">
    <label>Thumbnail URL <input type="url" name="thumbnail" value="${v('thumbnail')}" placeholder="https://..."></label>
    <label>Thumbnail Alt <input type="text" name="thumbnail_alt" value="${v('thumbnail_alt')}" maxlength="200"></label>
  </div>
  <label>Apply URL (external official URL) <input type="url" name="apply_url" value="${v('apply_url')}" placeholder="https://company.com/careers/..."></label>

  <label>Description</label>
  <textarea name="content" rows="10" data-editor="rich">${esc(job.content || '')}</textarea>
  <label>Responsibilities</label>
  <textarea name="responsibilities" rows="6" data-editor="rich">${esc(job.responsibilities || '')}</textarea>
  <label>Requirements</label>
  <textarea name="requirements" rows="6" data-editor="rich">${esc(job.requirements || '')}</textarea>
  <label>Qualifications</label>
  <textarea name="qualifications" rows="5" data-editor="rich">${esc(job.qualifications || '')}</textarea>
  <label>Benefits</label>
  <textarea name="benefits" rows="5" data-editor="rich">${esc(job.benefits || '')}</textarea>

  <div class="row">
    <label>SEO Title <input type="text" name="seo_title" value="${v('seo_title')}" maxlength="200"></label>
    <label>SEO Description <input type="text" name="seo_description" value="${v('seo_description')}" maxlength="300"></label>
  </div>
  <div class="row">
    <label>Tags (comma separated) <input type="text" name="tags" value="${v('tags')}" maxlength="300"></label>
    <label>Status
      <select name="status">
        <option value="draft" ${job.status === 'draft' ? 'selected' : ''}>Draft</option>
        <option value="published" ${job.status === 'published' ? 'selected' : ''}>Published</option>
      </select>
    </label>
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" type="submit">Save</button>
    <a class="btn btn-ghost" href="/admin/jobs">Cancel</a>
  </div>
  <div class="form-status" data-status></div>
</form>`;
}

export function adminJobsListPage({ settings, session, jobs }) {
  const body = `
<div class="page-actions">
  <h1>Jobs</h1>
  <a class="btn btn-primary" href="/admin/jobs/new">+ New Job</a>
</div>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Featured</th><th>Created</th><th></th></tr></thead>
  <tbody>
  ${jobs.map(j => `
    <tr>
      <td><a href="/admin/jobs/${j.id}">${esc(j.title)}</a></td>
      <td>${esc(j.category || '')}</td>
      <td><span class="badge badge-${esc(j.status)}">${esc(j.status)}</span></td>
      <td>${j.featured ? '★' : ''}</td>
      <td>${esc(formatDate(j.created_at))}</td>
      <td><button class="btn btn-sm btn-danger" data-delete="job" data-id="${j.id}">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="6" class="muted">No jobs yet</td></tr>'}
  </tbody>
</table>`;
  return adminShell({ settings, session, body, active: 'jobs' });
}

export function adminJobEditPage({ settings, session, job }) {
  const body = `
<div class="page-actions">
  <h1>${job ? 'Edit Job' : 'New Job'}</h1>
  <a class="btn btn-ghost" href="/admin/jobs">← Back</a>
</div>
${jobForm(job || {})}`;
  return adminShell({ settings, session, body, active: 'jobs' });
}

function newsForm(a = {}) {
  const v = (k) => esc(a[k] ?? '');
  return `
<form class="admin-form" data-form="news" data-id="${a.id || ''}">
  <div class="row">
    <label>Title <input type="text" name="title" required value="${v('title')}" maxlength="240"></label>
    <label>Slug <input type="text" name="slug" value="${v('slug')}" maxlength="240"></label>
  </div>
  <label>Subtitle <input type="text" name="subtitle" value="${v('subtitle')}" maxlength="300"></label>
  <label>Excerpt <textarea name="excerpt" rows="3" maxlength="600">${v('excerpt')}</textarea></label>
  <div class="row">
    <label>Category <input type="text" name="category" value="${v('category')}" maxlength="100"></label>
    <label>Author <input type="text" name="author" value="${v('author')}" maxlength="120"></label>
  </div>
  <div class="row">
    <label>Featured Image URL <input type="url" name="featured_image" value="${v('featured_image')}"></label>
    <label>Image Alt <input type="text" name="featured_image_alt" value="${v('featured_image_alt')}" maxlength="200"></label>
  </div>
  <label>Content</label>
  <textarea name="content" rows="18" data-editor="rich">${esc(a.content || '')}</textarea>

  <div class="row">
    <label>SEO Title <input type="text" name="seo_title" value="${v('seo_title')}" maxlength="240"></label>
    <label>SEO Description <input type="text" name="seo_description" value="${v('seo_description')}" maxlength="320"></label>
  </div>
  <div class="row">
    <label>Canonical URL <input type="url" name="canonical_url" value="${v('canonical_url')}"></label>
    <label>Tags (comma separated) <input type="text" name="tags" value="${v('tags')}" maxlength="300"></label>
  </div>
  <div class="row">
    <label class="inline"><input type="checkbox" name="featured" ${a.featured ? 'checked' : ''}> Featured</label>
    <label class="inline"><input type="checkbox" name="trending" ${a.trending ? 'checked' : ''}> Trending</label>
    <label>Status
      <select name="status">
        <option value="draft" ${a.status === 'draft' ? 'selected' : ''}>Draft</option>
        <option value="published" ${a.status === 'published' ? 'selected' : ''}>Published</option>
      </select>
    </label>
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" type="submit">Save</button>
    <a class="btn btn-ghost" href="/admin/news">Cancel</a>
  </div>
  <div class="form-status" data-status></div>
</form>`;
}

export function adminNewsListPage({ settings, session, articles }) {
  const body = `
<div class="page-actions">
  <h1>News</h1>
  <a class="btn btn-primary" href="/admin/news/new">+ New Article</a>
</div>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Created</th><th></th></tr></thead>
  <tbody>
  ${articles.map(n => `
    <tr>
      <td><a href="/admin/news/${n.id}">${esc(n.title)}</a></td>
      <td>${esc(n.category || '')}</td>
      <td><span class="badge badge-${esc(n.status)}">${esc(n.status)}</span></td>
      <td>${esc(formatDate(n.created_at))}</td>
      <td><button class="btn btn-sm btn-danger" data-delete="news" data-id="${n.id}">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="5" class="muted">No news yet</td></tr>'}
  </tbody>
</table>`;
  return adminShell({ settings, session, body, active: 'news' });
}

export function adminNewsEditPage({ settings, session, article }) {
  const body = `
<div class="page-actions">
  <h1>${article ? 'Edit Article' : 'New Article'}</h1>
  <a class="btn btn-ghost" href="/admin/news">← Back</a>
</div>
${newsForm(article || {})}`;
  return adminShell({ settings, session, body, active: 'news' });
}

export function adminSubmissionsPage({ settings, session, submissions, status }) {
  const body = `
<div class="page-actions">
  <h1>Submissions</h1>
  <div class="tabs">
    <a class="tab ${status === 'pending' ? 'active' : ''}" href="/admin/submissions?status=pending">Pending</a>
    <a class="tab ${status === 'approved' ? 'active' : ''}" href="/admin/submissions?status=approved">Approved</a>
    <a class="tab ${status === 'rejected' ? 'active' : ''}" href="/admin/submissions?status=rejected">Rejected</a>
  </div>
</div>
<table class="admin-table">
  <thead><tr><th>Type</th><th>Title</th><th>Contact</th><th>Created</th><th></th></tr></thead>
  <tbody>
  ${submissions.map(s => `
    <tr>
      <td>${esc(s.type)}</td>
      <td><strong>${esc(s.title)}</strong><br><small class="muted">${esc((s.description || s.content || '').slice(0, 140))}</small></td>
      <td>${esc(s.contact_email || '')}</td>
      <td>${esc(formatDate(s.created_at))}</td>
      <td class="row-actions">
        ${status === 'pending' ? `
          <button class="btn btn-sm" data-sub-action="approve" data-id="${s.id}">Approve</button>
          <button class="btn btn-sm btn-danger" data-sub-action="reject" data-id="${s.id}">Reject</button>
        ` : ''}
        <button class="btn btn-sm btn-ghost" data-sub-action="delete" data-id="${s.id}">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="muted">None</td></tr>'}
  </tbody>
</table>`;
  return adminShell({ settings, session, body, active: 'submissions' });
}

export function adminCategoriesPage({ settings, session, categories }) {
  const jobs = categories.filter(c => c.type === 'job');
  const news = categories.filter(c => c.type === 'news');
  const row = (c) => `<li>${esc(c.name)} <span class="muted">(${esc(c.slug)})</span> <button class="btn btn-sm btn-danger" data-cat-delete="${c.id}">×</button></li>`;
  const body = `
<h1>Categories</h1>
<div class="admin-cols">
  <section class="panel">
    <h2>Job Categories</h2>
    <ul class="list">${jobs.map(row).join('')}</ul>
    <form class="inline-form" data-cat-add data-type="job">
      <input type="text" name="name" placeholder="New job category" required>
      <button class="btn btn-primary" type="submit">Add</button>
    </form>
  </section>
  <section class="panel">
    <h2>News Categories</h2>
    <ul class="list">${news.map(row).join('')}</ul>
    <form class="inline-form" data-cat-add data-type="news">
      <input type="text" name="name" placeholder="New news category" required>
      <button class="btn btn-primary" type="submit">Add</button>
    </form>
  </section>
</div>`;
  return adminShell({ settings, session, body, active: 'categories' });
}

export function adminSettingsPage({ settings, session }) {
  const keys = [
    ['site_name', 'Website Name'],
    ['site_description', 'Website Description'],
    ['logo_url', 'Logo URL'],
    ['favicon_url', 'Favicon URL'],
    ['contact_email', 'Contact Email'],
    ['social_twitter', 'Twitter / X URL'],
    ['social_facebook', 'Facebook URL'],
    ['social_linkedin', 'LinkedIn URL'],
    ['default_seo_title', 'Default SEO Title'],
    ['default_seo_description', 'Default SEO Description'],
    ['google_analytics_id', 'Google Analytics ID (G-XXXXXXX)'],
    ['adsense_publisher_id', 'AdSense Publisher ID (ca-pub-XXXX)'],
    ['footer_text', 'Footer Text']
  ];
  const body = `
<h1>Settings</h1>
<form class="admin-form" data-form="settings">
  ${keys.map(([k, label]) => `
    <label>${esc(label)}
      <input type="text" name="${esc(k)}" value="${esc(settings[k] || '')}">
    </label>`).join('')}
  <label class="inline">
    <input type="checkbox" name="adsense_enabled" ${String(settings.adsense_enabled) === 'true' ? 'checked' : ''}>
    Enable AdSense
  </label>
  <div class="form-actions"><button class="btn btn-primary" type="submit">Save Settings</button></div>
  <div class="form-status" data-status></div>
</form>`;
  return adminShell({ settings, session, body, active: 'settings' });
}
