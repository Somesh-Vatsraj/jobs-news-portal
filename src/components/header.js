import { esc } from '../utils.js';

export function header({ settings, active = '' }) {
  const siteName = settings.site_name || 'Jobs & News';
  const logo = settings.logo_url;
  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${esc(label)}</a>`;

  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(siteName)}">
      ${logo
        ? `<img src="${esc(logo)}" alt="${esc(siteName)} logo" class="brand-logo" height="36">`
        : `<span class="brand-mark">JN</span>`}
      <span class="brand-name">${esc(siteName)}</span>
    </a>

    <nav class="main-nav" id="mainNav" aria-label="Primary">
      ${link('/', 'Home', 'home')}
      ${link('/jobs', 'Jobs', 'jobs')}
      ${link('/jobs?category=work-from-home', 'Work From Home', 'wfh')}
      ${link('/news', 'News', 'news')}
      ${link('/categories', 'Categories', 'categories')}
      ${link('/about', 'About', 'about')}
      ${link('/contact', 'Contact', 'contact')}
    </nav>

    <div class="header-actions">
      <form class="header-search" action="/search" method="get" role="search">
        <input type="search" name="q" placeholder="Search jobs..." aria-label="Search">
        <button type="submit" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
      </form>
      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" id="menuToggle">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
`;
}
