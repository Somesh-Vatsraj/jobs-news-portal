import { layout } from './layout.js';

function wrap(settings, baseUrl, title, description, slug, body) {
  return layout({
    settings,
    title,
    description,
    canonical: `${baseUrl}/${slug}`,
    active: '',
    body: `<div class="container static-page"><h1>${title}</h1>${body}</div>`
  });
}

export function aboutPage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'About Us', 'About our jobs and news portal.', 'about', `
<p>This portal is a curated jobs and career news platform focused on helping Indian job seekers discover genuine opportunities — including work from home, remote, freshers, private, part-time, customer support, BPO and IT roles.</p>
<h2>Our Mission</h2>
<p>To make job discovery simpler, faster and more transparent for every Indian job seeker.</p>
<h2>What We Do</h2>
<ul>
  <li>Aggregate job listings from company career portals and verified sources</li>
  <li>Publish career, technology and education news</li>
  <li>Provide easy apply redirects to official employer pages</li>
  <li>Allow anyone to submit opportunities for review</li>
</ul>
<p class="muted">Content on this site is for informational purposes. We are not a recruitment agency.</p>
`);
}

export function contactPage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'Contact Us', 'Get in touch with us.', 'contact', `
<p>Have a question, feedback, or want to submit a job or news tip? Reach out.</p>
<p><strong>Email:</strong> <a href="mailto:${settings.contact_email || ''}">${settings.contact_email || ''}</a></p>
<p>We typically respond within 2–3 working days.</p>
<h2>Submit a Job or News</h2>
<p>Use our <a href="/submit">submission form</a> to send us a job or news tip.</p>
`);
}

export function privacyPage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'Privacy Policy', 'How we handle your data.', 'privacy-policy', `
<p>We respect your privacy and are committed to protecting your personal data.</p>
<h2>What We Collect</h2>
<ul>
  <li>Anonymous analytics data (pages visited, time on site)</li>
  <li>Information you voluntarily provide through the submission form (name, email, content)</li>
  <li>Cookies for basic site functionality</li>
</ul>
<h2>How We Use It</h2>
<ul>
  <li>To operate and improve the website</li>
  <li>To publish user-submitted content after review</li>
  <li>To serve relevant advertising where applicable</li>
</ul>
<h2>Third Parties</h2>
<p>We may use services like Google Analytics and Google AdSense. These services may set their own cookies. See Google's Privacy Policy for details.</p>
<h2>Your Rights</h2>
<p>You can request deletion of your data by emailing us.</p>
`);
}

export function termsPage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'Terms of Service', 'Terms governing the use of this website.', 'terms', `
<p>By using this website you agree to the following terms.</p>
<h2>Use of Content</h2>
<p>All content is for informational purposes. You may not reproduce content without permission.</p>
<h2>Job Listings</h2>
<p>Jobs shown are aggregated from external sources. We do not guarantee accuracy, availability or genuineness. Always verify with the employer.</p>
<h2>User Submissions</h2>
<p>By submitting content you grant us permission to publish and edit it. We reserve the right to reject any submission.</p>
<h2>Limitation of Liability</h2>
<p>We are not liable for any loss arising from use of this website or reliance on its content.</p>
`);
}

export function disclaimerPage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'Disclaimer', 'Important disclaimers.', 'disclaimer', `
<p>All information on this website is published in good faith and for general information purposes only.</p>
<ul>
  <li>We are not a recruitment agency and do not charge any fee from job seekers.</li>
  <li>We do not guarantee any job. Always verify before applying.</li>
  <li>Never pay money to any employer for a job offer.</li>
  <li>News content is original or properly sourced. Report any inaccuracies and we will correct them.</li>
  <li>External links go to third-party sites we do not control.</li>
</ul>
<p>If you find any issue with our content, please <a href="/contact">contact us</a>.</p>
`);
}

export function cookiePage({ settings, baseUrl }) {
  return wrap(settings, baseUrl, 'Cookie Policy', 'How we use cookies.', 'cookie-policy', `
<p>This site uses minimal cookies required for core functionality.</p>
<h2>Types of Cookies</h2>
<ul>
  <li><strong>Essential:</strong> session cookies for admin login</li>
  <li><strong>Analytics:</strong> optional, anonymised usage data</li>
  <li><strong>Advertising:</strong> set by third-party ad networks when AdSense is enabled</li>
</ul>
<h2>Managing Cookies</h2>
<p>You can disable cookies in your browser settings at any time.</p>
`);
}

export function categoriesPage({ settings, baseUrl, categories }) {
  const jobs = categories.filter(c => c.type === 'job');
  const news = categories.filter(c => c.type === 'news');
  const list = (arr, base) => `<div class="cat-grid">${arr.map(c => `
    <a class="cat-tile" href="${base}?category=${encodeURIComponent(c.name)}">
      <span class="cat-icon">${c.name.charAt(0)}</span>
      <span class="cat-name">${c.name}</span>
    </a>`).join('')}</div>`;
  return layout({
    settings,
    title: 'Categories',
    description: 'Browse all job and news categories.',
    canonical: baseUrl + '/categories',
    active: 'categories',
    body: `
<div class="container page-head"><h1>All Categories</h1></div>
<div class="container">
  <section class="section"><h2>Job Categories</h2>${list(jobs, '/jobs')}</section>
  <section class="section"><h2>News Categories</h2>${list(news, '/news')}</section>
</div>`
  });
}
