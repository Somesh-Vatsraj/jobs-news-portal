import { layout } from './layout.js';
import { JobCard } from '../components/job-card.js';
import { NewsCard } from '../components/news-card.js';
import { SearchHero } from '../components/search.js';
import { AdSlot } from '../components/ads.js';
import { esc } from '../utils.js';

export function homePage({ settings, latestJobs, wfhJobs, featuredJobs, latestNews, trendingNews, categories, baseUrl }) {
  const jobCats = categories.filter(c => c.type === 'job').slice(0, 10);
  const popular = ['Work From Home', 'Freshers', 'Customer Support', 'BPO', 'IT Jobs', 'Remote Jobs'];

  const section = (title, href, cards, emptyMsg) => `
<section class="section">
  <div class="container">
    <div class="section-head">
      <h2>${esc(title)}</h2>
      <a href="${esc(href)}" class="link-more">View all →</a>
    </div>
    ${cards.length ? `<div class="grid-cards">${cards.join('')}</div>` : `<p class="empty">${esc(emptyMsg)}</p>`}
  </div>
</section>`;

  const catButtons = jobCats.map(c =>
    `<a class="cat-tile" href="/jobs?category=${encodeURIComponent(c.name)}">
      <span class="cat-icon">${esc(c.name.charAt(0))}</span>
      <span class="cat-name">${esc(c.name)}</span>
    </a>`
  ).join('');

  const body = `
${SearchHero({ popular })}

<section class="section section-cats">
  <div class="container">
    <div class="section-head"><h2>Popular Categories</h2><a href="/categories" class="link-more">All →</a></div>
    <div class="cat-grid">${catButtons}</div>
  </div>
</section>

${AdSlot({ position: 'header', settings })}

${section('Latest Jobs', '/jobs', latestJobs.map(j => JobCard({ job: j })), 'No jobs yet.')}

${section('Work From Home Jobs', '/jobs?category=Work+From+Home', wfhJobs.map(j => JobCard({ job: j })), 'No WFH jobs yet.')}

${AdSlot({ position: 'in-content', settings })}

${section('Featured Jobs', '/jobs?featured=1', featuredJobs.map(j => JobCard({ job: j })), 'No featured jobs yet.')}

${section('Latest News', '/news', latestNews.map(n => NewsCard({ article: n })), 'No news yet.')}

${section('Trending News', '/news?trending=1', trendingNews.map(n => NewsCard({ article: n })), 'No trending news yet.')}

<section class="section cta">
  <div class="container cta-inner">
    <h2>Have a job or news tip?</h2>
    <p>Submit it and we'll review it for publication.</p>
    <a class="btn btn-primary" href="/submit">Submit Now</a>
  </div>
</section>
`;

  return layout({
    settings,
    title: '',
    description: settings.site_description,
    canonical: baseUrl + '/',
    active: 'home',
    body
  });
}
