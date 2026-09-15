import { layout } from './layout.js';
import { NewsCard } from '../components/news-card.js';
import { Pagination } from '../components/pagination.js';
import { AdSlot } from '../components/ads.js';
import { esc } from '../utils.js';

export function newsListPage({ settings, articles, category, categories, pagination, baseUrl, queryString }) {
  const cats = categories.filter(c => c.type === 'news');
  const catPills = `<a class="chip ${!category ? 'active' : ''}" href="/news">All</a>` +
    cats.map(c => `<a class="chip ${category === c.name ? 'active' : ''}" href="/news?category=${encodeURIComponent(c.name)}">${esc(c.name)}</a>`).join('');

  const body = `
<div class="container page-head">
  <h1>Latest News</h1>
  <p class="muted">Career, technology, jobs and education updates.</p>
  <div class="chips-row">${catPills}</div>
</div>

<div class="container">
  ${articles.length
    ? `<div class="grid-news">${articles.map(n => NewsCard({ article: n })).join('')}</div>`
    : `<div class="empty-state"><h3>No articles yet</h3><p>Check back soon.</p></div>`}
  ${AdSlot({ position: 'in-content', settings })}
  ${Pagination({ page: pagination.page, totalPages: pagination.totalPages, baseUrl: '/news' + (queryString ? '?' + queryString : '') })}
</div>`;
  return layout({
    settings,
    title: 'News',
    description: 'Latest news about jobs, careers, technology and education in India.',
    canonical: baseUrl + '/news' + (queryString ? '?' + queryString : ''),
    active: 'news',
    body
  });
}
