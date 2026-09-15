import { layout } from './layout.js';
import { JobCard } from '../components/job-card.js';
import { Pagination } from '../components/pagination.js';
import { AdSlot } from '../components/ads.js';
import { esc } from '../utils.js';

export function jobsListPage({ settings, jobs, filters, categories, pagination, baseUrl, queryString }) {
  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
  const experiences = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'];

  const catOptions = categories.filter(c => c.type === 'job')
    .map(c => `<option value="${esc(c.name)}" ${filters.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const typeOptions = jobTypes.map(t => `<option value="${esc(t)}" ${filters.jobType === t ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const expOptions = experiences.map(t => `<option value="${esc(t)}" ${filters.experience === t ? 'selected' : ''}>${esc(t)}</option>`).join('');

  const body = `
<div class="container page-head">
  <h1>Browse Jobs</h1>
  <p class="muted">${pagination.total} job${pagination.total === 1 ? '' : 's'} found</p>
</div>

<div class="container jobs-layout">
  <aside class="filters" id="filtersPanel">
    <form method="get" action="/jobs">
      <div class="filter-head">
        <h3>Filters</h3>
        <button type="button" class="filter-toggle" id="filtersToggle">Show/Hide</button>
      </div>
      <div class="filter-group">
        <label>Category</label>
        <select name="category">
          <option value="">All categories</option>
          ${catOptions}
        </select>
      </div>
      <div class="filter-group">
        <label>Job Type</label>
        <select name="job_type">
          <option value="">Any type</option>
          ${typeOptions}
        </select>
      </div>
      <div class="filter-group">
        <label>Experience</label>
        <select name="experience">
          <option value="">Any experience</option>
          ${expOptions}
        </select>
      </div>
      <div class="filter-group">
        <label>Location</label>
        <input type="text" name="location" value="${esc(filters.location || '')}" placeholder="e.g. Bangalore">
      </div>
      <div class="filter-group checkbox">
        <label><input type="checkbox" name="wfh" value="1" ${filters.wfh ? 'checked' : ''}> Work From Home only</label>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" type="submit">Apply Filters</button>
        <a class="btn btn-ghost" href="/jobs">Reset</a>
      </div>
    </form>
  </aside>

  <section class="jobs-list">
    ${jobs.length ? `<div class="grid-cards">${jobs.map(j => JobCard({ job: j })).join('')}</div>` :
      `<div class="empty-state"><h3>No jobs match your filters</h3><p>Try removing some filters.</p></div>`}
    ${AdSlot({ position: 'in-content', settings })}
    ${Pagination({ page: pagination.page, totalPages: pagination.totalPages, baseUrl: '/jobs' + (queryString ? '?' + queryString : '') })}
  </section>
</div>
`;
  return layout({
    settings,
    title: 'Browse Jobs',
    description: 'Browse the latest jobs across India — work from home, remote, freshers, IT, BPO and more.',
    canonical: baseUrl + '/jobs' + (queryString ? '?' + queryString : ''),
    active: 'jobs',
    body
  });
}
