import { esc, timeAgo } from '../utils.js';

export function JobCard({ job }) {
  const hasImage = !!job.thumbnail;
  const imageHtml = hasImage
    ? `<img src="${esc(job.thumbnail)}" alt="${esc(job.thumbnail_alt || job.title)}" loading="lazy" width="600" height="375">`
    : `<div class="job-thumb placeholder">${esc((job.company || '?').charAt(0))}</div>`;

  const descText = (job.content || '').replace(/<[^>]+>/g, ' ').trim();
  const shortDesc = descText.length > 140 ? descText.slice(0, 140) + '…' : descText;

  return `
<article class="job-card">
  <a href="/jobs/${esc(job.slug)}" class="job-card-link" aria-label="${esc(job.title)}">

    <div class="job-card-image${hasImage ? '' : ' is-placeholder'}">
      ${imageHtml}
      ${job.work_from_home ? '<span class="image-badge badge-wfh">WFH</span>' : ''}
      ${job.featured ? '<span class="image-badge badge-featured">★ Featured</span>' : ''}
    </div>

    <div class="job-card-body">
      ${job.category ? `<span class="job-cat">${esc(job.category)}</span>` : ''}
      <h3 class="job-title">${esc(job.title)}</h3>
      <p class="job-company">${esc(job.company)}</p>

      <div class="job-meta">
        ${job.location ? `<span class="meta"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(job.location)}</span>` : ''}
        ${job.job_type ? `<span class="meta">${esc(job.job_type)}</span>` : ''}
        ${job.salary ? `<span class="meta">${esc(job.salary)}</span>` : ''}
        ${job.experience ? `<span class="meta">${esc(job.experience)}</span>` : ''}
      </div>

      ${shortDesc ? `<p class="job-desc">${esc(shortDesc)}</p>` : ''}

      <div class="job-card-foot">
        <span class="posted">${esc(timeAgo(job.published_at || job.created_at))}</span>
        <span class="btn btn-sm btn-primary">View Details</span>
      </div>
    </div>
  </a>
</article>`;
}
