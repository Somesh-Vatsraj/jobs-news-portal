import { esc, timeAgo, readingTime } from '../utils.js';

export function NewsCard({ article }) {
  const img = article.featured_image
    ? `<img src="${esc(article.featured_image)}" alt="${esc(article.featured_image_alt || article.title)}" loading="lazy" width="400" height="225">`
    : `<div class="news-thumb placeholder"></div>`;
  return `
<article class="news-card">
  <a href="/news/${esc(article.slug)}" class="news-card-link">
    <div class="news-thumb-wrap">${img}</div>
    <div class="news-card-body">
      ${article.category ? `<span class="news-cat">${esc(article.category)}</span>` : ''}
      <h3>${esc(article.title)}</h3>
      ${article.excerpt ? `<p>${esc(article.excerpt.slice(0, 160))}${article.excerpt.length > 160 ? '…' : ''}</p>` : ''}
      <div class="news-meta">
        <span>${esc(timeAgo(article.published_at || article.created_at))}</span>
        <span>·</span>
        <span>${esc(readingTime(article.content))}</span>
      </div>
    </div>
  </a>
</article>`;
}
