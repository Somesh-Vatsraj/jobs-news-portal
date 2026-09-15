import { esc } from '../utils.js';

export function footer({ settings }) {
  const year = new Date().getFullYear();
  const footerText = settings.footer_text || `© ${year} All rights reserved.`;
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col">
      <h4>${esc(settings.site_name || 'Jobs & News India')}</h4>
      <p>${esc(settings.site_description || '')}</p>
    </div>
    <div class="footer-col">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/jobs">Browse Jobs</a></li>
        <li><a href="/news">Latest News</a></li>
        <li><a href="/search">Search</a></li>
        <li><a href="/submit">Submit Job/News</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/terms">Terms</a></li>
        <li><a href="/disclaimer">Disclaimer</a></li>
        <li><a href="/cookie-policy">Cookie Policy</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <p>${esc(footerText)}</p>
    </div>
  </div>
</footer>
<button id="backToTop" class="back-to-top" aria-label="Back to top">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
</button>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
`;
}
