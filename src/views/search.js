import { layout } from './layout.js';
import { JobCard } from '../components/job-card.js';
import { NewsCard } from '../components/news-card.js';
import { Pagination } from '../components/pagination.js';
import { esc } from '../utils.js';

export function searchPage({ settings, q, tab, jobs, articles, jobsPag, newsPag, baseUrl }) {
  const tabLink = (t, label) => {
    const params = new URLSearchParams({ q, tab: t });
    return `<a class="tab ${tab === t ? 'active' : ''}" href="/search?${params.toString()}">${esc(label)}</a>`;
  };
  const showJobs = tab === 'all' || tab === 'jobs';
  const showNews = tab === 'all' || tab === 'news';

  const body = `
<div class="container page-head">
  <h1>Search results for “${esc(q)}”</h1>
  <form class="search-bar" action="/search" method="get" role="search">
    <input type="search" name="q" value="${esc(q)}" placeholder="Search jobs and news..." aria-label="Search">
    <button class="btn btn-primary" type="submit">Search</button>
  </form>
  <div class="tabs">
    ${tabLink('all', 'All')}
    ${tabLink('jobs', 'Jobs')}
    ${tabLink('news', 'News')}
  </div>
</div>

<div class="container">
  ${showJobs && jobs.length ? `
  <section class="section">
    <h2>Jobs (${jobsPag.total})</h2>
    <div class="grid-cards">${jobs.map(j => JobCard({ job: j })).join('')}</div>
    ${tab === 'jobs' ? Pagination({ page: jobsPag.page, totalPages: jobsPag.totalPages, baseUrl: `/search?q=${encodeURIComponent(q)}&tab=jobs` }) : ''}
  </section>` : ''}

  ${showNews && articles.length ? `
  <section class="section">
    <h2>News (${newsPag.total})</h2>
    <div class="grid-news">${articles.map(n => NewsCard({ article: n })).join('')}</div>
    ${tab === 'news' ? Pagination({ page: newsPag.page, totalPages: newsPag.totalPages, baseUrl: `/search?q=${encodeURIComponent(q)}&tab=news` }) : ''}
  </section>` : ''}

  ${(!jobs.length && !articles.length) ? `
  <div class="empty-state">
    <h3>No results found</h3>
    <p>Try different keywords or browse <a href="/jobs">all jobs</a>.</p>
  </div>` : ''}
</div>`;

  return layout({
    settings,
    title: `Search: ${q}`,
    description: `Search results for ${q}`,
    canonical: baseUrl + '/search?q=' + encodeURIComponent(q),
    noindex: true,
    active: '',
    body
  });
}
