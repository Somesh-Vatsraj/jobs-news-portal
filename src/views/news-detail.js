import { layout } from './layout.js';
import { NewsCard } from '../components/news-card.js';
import { JobCard } from '../components/job-card.js';
import { ShareButtons } from '../components/share.js';
import { AdSlot } from '../components/ads.js';
import { esc, formatDate, readingTime } from '../utils.js';
import { articleJsonLd, breadcrumbJsonLd } from '../seo.js';

function sidebar({ categories }) {
  const jobCats = categories.filter(c => c.type === 'job');
  const newsCats = categories.filter(c => c.type === 'news');
  return `
<aside class="detail-sidebar">
  <div class="sidebar-card">
    <h3 class="sidebar-title">Job Categories</h3>
    <ul class="sidebar-list">
      ${jobCats.map(c => `
        <li>
          <a href="/jobs?category=${encodeURIComponent(c.name)}">
            <span class="sidebar-icon">${esc(c.name.charAt(0))}</span>
            <span>${esc(c.name)}</span>
          </a>
        </li>`).join('')}
    </ul>
  </div>

  <div class="sidebar-card">
    <h3 class="sidebar-title">News Categories</h3>
    <ul class="sidebar-list">
      ${newsCats.map(c => `
        <li>
          <a href="/news?category=${encodeURIComponent(c.name)}">
            <span class="sidebar-icon">${esc(c.name.charAt(0))}</span>
            <span>${esc(c.name)}</span>
          </a>
        </li>`).join('')}
    </ul>
  </div>
</aside>`;
}

export function newsDetailPage({ settings, article, relatedNews, relatedJobs, categories = [], baseUrl }) {
  const url = `${baseUrl}/news/${article.slug}`;
  const jsonLd = articleJsonLd(article, baseUrl) + breadcrumbJsonLd([
    { name: 'Home', url: baseUrl + '/' },
    { name: 'News', url: baseUrl + '/news' },
    { name: article.title, url }
  ]);

  const body = `
<div class="container">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> <span>/</span> <a href="/news">News</a> <span>/</span> <span>${esc(article.title)}</span>
  </nav>
</div>

<div class="container detail-layout">
  <article class="news-detail">

    <header class="news-header">
      ${article.category ? `<span class="news-cat">${esc(article.category)}</span>` : ''}
      <h1>${esc(article.title)}</h1>
      ${article.subtitle ? `<p class="subtitle">${esc(article.subtitle)}</p>` : ''}
      <div class="news-meta">
        <span>By ${esc(article.author || 'Editorial Team')}</span>
        <span>·</span>
        <span>${esc(formatDate(article.published_at || article.created_at))}</span>
        <span>·</span>
        <span>${esc(readingTime(article.content))}</span>
      </div>
    </header>

    ${article.featured_image ? `
    <figure class="featured-image">
      <img src="${esc(article.featured_image)}" alt="${esc(article.featured_image_alt || article.title)}" loading="lazy" width="1200" height="675">
    </figure>` : ''}

    ${AdSlot({ position: 'in-content', settings })}

    <div class="rich-content">
      ${article.content || ''}
    </div>

    ${(article.tags || '').trim() ? `<div class="tags-row">${article.tags.split(',').map(t => `<span class="tag">#${esc(t.trim())}</span>`).join('')}</div>` : ''}

    <section class="content-section">
      <h2>Share this article</h2>
      ${ShareButtons({ url, title: article.title })}
    </section>

    ${relatedNews.length ? `
    <section class="content-section">
      <h2>Related News</h2>
      <div class="grid-news">${relatedNews.map(n => NewsCard({ article: n })).join('')}</div>
    </section>` : ''}

    ${relatedJobs.length ? `
    <section class="content-section">
      <h2>Related Jobs</h2>
      <div class="grid-cards">${relatedJobs.map(j => JobCard({ job: j })).join('')}</div>
    </section>` : ''}
  </article>

  ${sidebar({ categories })}
</div>
`;
  return layout({
    settings,
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || '',
    canonical: article.canonical_url || url,
    image: article.featured_image || '',
    type: 'article',
    jsonLd,
    active: 'news',
    body,
    bodyClass: 'detail-page'
  });
}
