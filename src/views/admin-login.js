import { layout } from './layout.js';

export function adminLoginPage({ settings, baseUrl, error = '', setupMode = false }) {
  const title = setupMode ? 'Create Admin Account' : 'Admin Login';
  const action = setupMode ? '/admin/setup' : '/admin/login';
  return layout({
    settings,
    title,
    noindex: true,
    canonical: baseUrl + action,
    body: `
<div class="admin-auth container">
  <div class="auth-card">
    <h1>${title}</h1>
    ${error ? `<div class="alert alert-error">${error}</div>` : ''}
    ${setupMode ? '<p class="muted small">No admin exists yet. Create the first admin account.</p>' : ''}
    <form method="post" action="${action}" class="auth-form" autocomplete="off">
      ${setupMode ? `
      <label>Name
        <input type="text" name="name" required maxlength="120">
      </label>` : ''}
      <label>Email
        <input type="email" name="email" required maxlength="200" autocomplete="username">
      </label>
      <label>Password
        <input type="password" name="password" required minlength="8" maxlength="200" autocomplete="${setupMode ? 'new-password' : 'current-password'}">
      </label>
      <button class="btn btn-primary btn-block" type="submit">${setupMode ? 'Create Admin' : 'Sign In'}</button>
    </form>
  </div>
</div>`
  });
}

export function adminShell({ settings, session, body, active = '' }) {
  const csrf = session ? session.csrf_token : '';
  const nav = (href, label, key) => `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
  const content = `
<div class="admin-layout">
  <aside class="admin-sidebar">
    <div class="admin-brand">${settings.site_name || 'Admin'}</div>
    <nav class="admin-nav">
      ${nav('/admin', 'Dashboard', 'dashboard')}
      ${nav('/admin/jobs', 'Jobs', 'jobs')}
      ${nav('/admin/news', 'News', 'news')}
      ${nav('/admin/submissions', 'Submissions', 'submissions')}
      ${nav('/admin/categories', 'Categories', 'categories')}
      ${nav('/admin/settings', 'Settings', 'settings')}
      <a href="/" target="_blank">View Site ↗</a>
      <a href="#" id="adminLogout">Logout</a>
    </nav>
  </aside>
  <section class="admin-main">
    <div data-csrf="${csrf}"></div>
    ${body}
  </section>
</div>`;
  return layout({
    settings,
    title: 'Admin',
    noindex: true,
    canonical: '',
    body: content
  }).replace('</body>', '<script src="/js/admin.js" defer></script></body>');
}
