import { layout } from './layout.js';
import { JobCard } from '../components/job-card.js';
import { ShareButtons } from '../components/share.js';
import { AdSlot } from '../components/ads.js';
import { esc, formatDate } from '../utils.js';
import { jobPostingJsonLd, breadcrumbJsonLd } from '../seo.js';

function safeHtml(html) {
  return html || '';
}

export function jobDetailPage({ settings, job, related, baseUrl }) {
  const url = `${baseUrl}/jobs/${job.slug}`;
  const jsonLd = jobPostingJsonLd(job, baseUrl) + breadcrumbJsonLd([
    { name: 'Home', url: baseUrl + '/' },
    { name: 'Jobs', url: baseUrl + '/jobs' },
    { name: job.title, url }
  ]);

  const applyUrl = job.apply_url || '';
  const hasExternalApply = applyUrl && /^https?:\/\//i.test(applyUrl);
  let applyHost = '';
  try { if (hasExternalApply) applyHost = new URL(applyUrl).hostname; } catch {}

  const body = `
<article class="job-detail container">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> <span>/</span> <a href="/jobs">Jobs</a> <span>/</span> <span>${esc(job.title)}</span>
  </nav>

  <header class="job-header">
    <div class="job-header-top">
      ${job.thumbnail ? `<img class="job-thumb-lg" src="${esc(job.thumbnail)}" alt="${esc(job.thumbnail_alt || job.title)}" loading="lazy" width="140" height="140">` : ''}
      <div>
        <h1>${esc(job.title)}</h1>
        <p class="company-lg">${esc(job.company)}</p>
      </div>
    </div>
    <div class="job-tags">
      ${job.category ? `<span class="tag">${esc(job.category)}</span>` : ''}
      ${job.job_type ? `<span class="tag">${esc(job.job_type)}</span>` : ''}
      ${job.work_from_home ? `<span class="tag tag-wfh">Work From Home</span>` : ''}
      ${job.featured ? `<span class="tag tag-featured">Featured</span>` : ''}
    </div>
  </header>

  <div class="job-info-grid">
    ${job.location ? `<div><span>Location</span><strong>${esc(job.location)}</strong></div>` : ''}
    ${job.salary ? `<div><span>Salary</span><strong>${esc(job.salary)}</strong></div>` : ''}
    ${job.experience ? `<div><span>Experience</span><strong>${esc(job.experience)}</strong></div>` : ''}
    ${job.job_type ? `<div><span>Type</span><strong>${esc(job.job_type)}</strong></div>` : ''}
    <div><span>Posted</span><strong>${esc(formatDate(job.published_at || job.created_at))}</strong></div>
  </div>

  <div class="job-apply-top">
    ${hasExternalApply
      ? `<a class="btn btn-primary btn-lg" href="/apply/${esc(job.slug)}" rel="noopener noreferrer">Apply Now</a>
         <p class="muted small">You will be redirected to <strong>${esc(applyHost)}</strong></p>`
      : `<p class="muted">Application link not provided.</p>`}
  </div>

  ${job.thumbnail ? `
  <figure class="featured-image job-featured-image">
    <img src="${esc(job.thumbnail)}"
         alt="${esc(job.thumbnail_alt || job.title)}"
         loading="lazy"
         width="1200"
         height="675">
  </figure>` : ''}

  ${AdSlot({ position: 'in-content', settings })}

  <section class="content-section">
    <h2>Job Description</h2>
    <div class="rich-content">${safeHtml(job.content)}</div>
  </section>
  ${job.responsibilities ? `<section class="content-section"><h2>Responsibilities</h2><div class="rich-content">${safeHtml(job.responsibilities)}</div></section>` : ''}
  ${job.requirements ? `<section class="content-section"><h2>Requirements</h2><div class="rich-content">${safeHtml(job.requirements)}</div></section>` : ''}
  ${job.qualifications ? `<section class="content-section"><h2>Qualifications</h2><div class="rich-content">${safeHtml(job.qualifications)}</div></section>` : ''}
  ${job.benefits ? `<section class="content-section"><h2>Benefits</h2><div class="rich-content">${safeHtml(job.benefits)}</div></section>` : ''}

  <section class="content-section">
    <h2>How to Apply</h2>
    <p>Click the button below to open the official application page. You will be redirected to an external website.</p>
    ${hasExternalApply
      ? `<a class="btn btn-primary btn-lg" href="/apply/${esc(job.slug)}" rel="noopener noreferrer">Apply Now on ${esc(applyHost)}</a>`
      : ''}
    <p class="small muted">We do not guarantee the accuracy or genuineness of any listing. Always verify before applying.</p>
  </section>

  <section class="content-section">
    <h2>Share this job</h2>
    ${ShareButtons({ url, title: job.title })}
  </section>

  ${related.length ? `
  <section class="content-section">
    <h2>Related Jobs</h2>
    <div class="grid-cards">${related.map(j => JobCard({ job: j })).join('')}</div>
  </section>` : ''}
</article>
`;
  return layout({
    settings,
    title: job.seo_title || job.title,
    description: job.seo_description || (job.content || '').replace(/<[^>]+>/g,' ').slice(0, 160),
    canonical: url,
    image: job.thumbnail || '',
    type: 'article',
    jsonLd,
    active: 'jobs',
    body
  });
}

export function applyRedirectPage({ settings, job, applyUrl, applyHost }) {
  const body = `
<div class="container apply-page">
  <h1>Redirecting to ${esc(applyHost)}</h1>
  <p>You are leaving <strong>${esc(settings.site_name)}</strong> and going to an external website:</p>
  <p class="apply-url">${esc(applyUrl)}</p>
  <p class="muted small">We are not affiliated with the destination website. Please verify details before applying.</p>
  <p><a class="btn btn-primary" href="${esc(applyUrl)}" rel="noopener noreferrer">Continue to apply</a></p>
  <p><a href="/jobs/${esc(job.slug)}" class="link-more">← Go back</a></p>
  <script>setTimeout(function(){window.location.replace(${JSON.stringify(applyUrl)});}, 2500);</script>
</div>`;
  return layout({
    settings,
    title: 'Redirecting…',
    description: '',
    canonical: '',
    noindex: true,
    body
  });
}
