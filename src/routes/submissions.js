import { json, html } from '../utils.js';
import { getSettings, createSubmission } from '../db.js';
import { layout } from '../views/layout.js';
import { sanitizeHtml, isValidHttpUrl } from '../utils.js';
import { rateLimit } from '../security.js';

export async function submitPageRoute(request, env) {
  const settings = await getSettings(env);
  const url = new URL(request.url);
  const success = url.searchParams.get('ok') === '1';
  const body = layout({
    settings,
    title: 'Submit a Job or News',
    description: 'Submit a job or news tip for review.',
    canonical: url.origin + '/submit',
    noindex: true,
    body: `
<div class="container static-page">
  <h1>Submit a Job or News</h1>
  <p>Submissions are reviewed by our team before publishing. Please provide accurate information.</p>
  ${success ? '<div class="alert alert-success">Thanks! Your submission is pending review.</div>' : ''}
  <form method="post" action="/api/submissions" class="admin-form" data-submit-form>
    <label>Type
      <select name="type" required>
        <option value="job">Job</option>
        <option value="news">News</option>
      </select>
    </label>
    <label>Title <input type="text" name="title" required maxlength="200"></label>
    <label>Company / Source <input type="text" name="company" maxlength="200"></label>
    <label>Category <input type="text" name="category" maxlength="100"></label>
    <label>Location <input type="text" name="location" maxlength="120"></label>
    <label>Apply URL / Source URL <input type="url" name="apply_url" placeholder="https://..."></label>
    <label>Thumbnail URL <input type="url" name="thumbnail" placeholder="https://..."></label>
    <label>Your email <input type="email" name="contact_email" required maxlength="200"></label>
    <label>Description / Content
      <textarea name="description" rows="8" required maxlength="20000"></textarea>
    </label>
    <div class="form-actions"><button class="btn btn-primary" type="submit">Submit for Review</button></div>
    <div class="form-status" data-status></div>
  </form>
</div>`
  });
  return html(body);
}

export async function submissionCreateApi(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(`submit:${ip}`, 5, 600000)) {
    return json({ error: 'Too many submissions. Please try again later.' }, 429);
  }
  let data = {};
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await request.json().catch(() => ({}));
  else {
    const form = await request.formData();
    data = Object.fromEntries(form.entries());
  }
  const type = data.type === 'news' ? 'news' : 'job';
  const title = String(data.title || '').trim().slice(0, 200);
  if (!title) return json({ error: 'Title required' }, 400);
  const applyUrl = String(data.apply_url || '').trim();
  if (applyUrl && !isValidHttpUrl(applyUrl)) return json({ error: 'Invalid URL' }, 400);

  await createSubmission(env, {
    type,
    title,
    company: String(data.company || '').trim().slice(0, 200),
    description: sanitizeHtml(String(data.description || '').slice(0, 50000)),
    content: sanitizeHtml(String(data.description || '').slice(0, 50000)),
    apply_url: applyUrl,
    source_url: applyUrl,
    category: String(data.category || '').trim().slice(0, 100),
    location: String(data.location || '').trim().slice(0, 120),
    contact_email: String(data.contact_email || '').trim().slice(0, 200),
    thumbnail: String(data.thumbnail || '').trim().slice(0, 500)
  });

  if (ct.includes('application/json')) return json({ ok: true });
  return new Response(null, { status: 302, headers: { location: '/submit?ok=1' } });
}
