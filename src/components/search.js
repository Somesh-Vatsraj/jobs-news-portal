import { esc } from '../utils.js';

export function SearchHero({ q = '', popular = [] }) {
  return `
<section class="hero">
  <div class="container hero-inner">
    <h1 class="hero-title">Find Jobs. <span class="accent">Build Your Career.</span></h1>
    <p class="hero-sub">Discover the latest Work From Home, Remote, Freshers, Private and Customer Support jobs across India. Fresh opportunities added daily.</p>
    <form class="hero-search" action="/search" method="get" role="search">
      <input type="search" name="q" value="${esc(q)}" placeholder="Search jobs, companies, skills..." aria-label="Search jobs">
      <button type="submit" class="btn btn-primary">Search Jobs</button>
    </form>
    ${popular.length ? `
      <div class="popular">
        <span class="popular-label">Popular:</span>
        ${popular.map(p => `<a class="chip" href="/search?q=${encodeURIComponent(p)}">${esc(p)}</a>`).join('')}
      </div>` : ''}
  </div>
</section>`;
}
